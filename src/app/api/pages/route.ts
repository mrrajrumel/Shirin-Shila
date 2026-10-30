import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { PagesRegistry, defaultPagesRegistry, ManagedPageData } from '@/data/pages';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { getPageRevisions, savePageRevision } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): { authenticated: boolean; user?: string } {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const decoded = verifySessionToken(token);
  if (decoded && decoded.username) {
    return { authenticated: true, user: decoded.username };
  }
  return { authenticated: false };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const historyParam = searchParams.get('history');
    const pageIdParam = searchParams.get('pageId');

    // If client requested revision history for a specific page
    if (historyParam === 'true' && pageIdParam) {
      const revisions = await getPageRevisions(pageIdParam, 20);
      return NextResponse.json(
        { success: true, pageId: pageIdParam, revisions },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    const storedPages = await readStore<PagesRegistry>('pages');
    const merged: PagesRegistry = {
      ...defaultPagesRegistry,
      ...(storedPages || {}),
    };

    return NextResponse.json(
      { success: true, pages: merged },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const current = (await readStore<PagesRegistry>('pages')) || defaultPagesRegistry;

    // Handle rollback action
    if (body.action === 'rollback' && body.pageId && body.revisionId) {
      const pageId = body.pageId as keyof PagesRegistry;
      if (!current[pageId]) {
        return NextResponse.json({ error: `Invalid pageId: ${body.pageId}` }, { status: 400 });
      }

      const revisions = await getPageRevisions(String(pageId), 50);
      const targetRev = revisions.find((r) => String(r.id) === String(body.revisionId));

      if (!targetRev) {
        return NextResponse.json({ error: 'Target revision not found' }, { status: 404 });
      }

      const updatedPage: ManagedPageData = {
        ...current[pageId],
        title: targetRev.title,
        navLabel: targetRev.navLabel || targetRev.title,
        isPublished: targetRev.isPublished,
        content: targetRev.content,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.user || 'admin',
      };

      const updatedPages: PagesRegistry = {
        ...current,
        [pageId]: updatedPage,
      };

      await writeStore('pages', updatedPages);

      // Record rollback as a new revision
      await savePageRevision(
        String(pageId),
        {
          title: updatedPage.title,
          navLabel: updatedPage.navLabel,
          isPublished: updatedPage.isPublished,
          content: updatedPage.content,
        },
        `${auth.user || 'admin'} (rollback to rev #${targetRev.revisionNum})`
      ).catch(() => {});

      // Revalidate affected routes
      revalidateAllPages(String(pageId));

      return NextResponse.json({
        success: true,
        message: `Rolled back ${pageId} to revision #${targetRev.revisionNum}`,
        pages: updatedPages,
      });
    }

    // Handle updating multiple pages or single page
    let updatedPages: PagesRegistry = { ...current };

    if (body.pageId && body.data) {
      const pId = body.pageId as keyof PagesRegistry;
      if (!current[pId]) {
        return NextResponse.json({ error: `Invalid pageId: ${body.pageId}` }, { status: 400 });
      }

      const pData = body.data;
      updatedPages[pId] = {
        ...current[pId],
        ...pData,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.user || 'admin',
      };

      await savePageRevision(
        String(pId),
        {
          title: updatedPages[pId].title,
          navLabel: updatedPages[pId].navLabel,
          isPublished: updatedPages[pId].isPublished,
          content: updatedPages[pId].content,
        },
        auth.user || 'admin'
      ).catch(() => {});
    } else if (body.pages && typeof body.pages === 'object') {
      // Full pages registry update
      const validKeys: (keyof PagesRegistry)[] = ['about', 'contact', 'privacy', 'terms', 'llms'];
      for (const k of validKeys) {
        if (body.pages[k]) {
          updatedPages[k] = {
            ...current[k],
            ...body.pages[k],
            updatedAt: new Date().toISOString(),
            updatedBy: auth.user || 'admin',
          };

          await savePageRevision(
            String(k),
            {
              title: updatedPages[k].title,
              navLabel: updatedPages[k].navLabel,
              isPublished: updatedPages[k].isPublished,
              content: updatedPages[k].content,
            },
            auth.user || 'admin'
          ).catch(() => {});
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid payload: provide pageId and data, or pages' }, { status: 400 });
    }

    await writeStore('pages', updatedPages);

    // Revalidate paths
    revalidateAllPages();

    return NextResponse.json({
      success: true,
      message: 'Pages saved successfully',
      pages: updatedPages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function revalidateAllPages(singlePageId?: string) {
  try {
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');

    if (!singlePageId || singlePageId === 'about') revalidatePath('/about');
    if (!singlePageId || singlePageId === 'contact') revalidatePath('/contact');
    if (!singlePageId || singlePageId === 'privacy') revalidatePath('/privacy');
    if (!singlePageId || singlePageId === 'terms') revalidatePath('/terms');
    if (!singlePageId || singlePageId === 'llms') revalidatePath('/llms.txt');
  } catch (err) {
    console.warn('[Pages API] Revalidation notice:', err);
  }
}

