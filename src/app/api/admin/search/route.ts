import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken, getAllAdminUsers } from '@/lib/auth';
import { readStore, TimelineStoreData } from '@/lib/server-storage';
import { getMediaManifest } from '@/lib/media-service';
import { ProjectItem } from '@/data/filmography';
import { PressItem } from '@/data/press';
import { InquiryItem } from '@/data/contact';
import { JourneyItem } from '@/data/timeline';

export const dynamic = 'force-dynamic';

export interface AdminSearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  image?: string;
  type: 'record';
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({
      success: true,
      query: q,
      count: 0,
      items: [],
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  }

  const results: AdminSearchResultItem[] = [];

  try {
    // 1. Search Works / Filmography
    try {
      const works = (await readStore<ProjectItem[]>('filmography')) || [];
      const matchedWorks = works.filter((w) => {
        return (
          w.title?.toLowerCase().includes(q) ||
          w.banglaTitle?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q) ||
          w.year?.includes(q) ||
          w.director?.toLowerCase().includes(q) ||
          w.coStar?.toLowerCase().includes(q) ||
          w.role?.toLowerCase().includes(q)
        );
      }).slice(0, 5);

      for (const w of matchedWorks) {
        results.push({
          id: `work-${w.id}`,
          title: w.title,
          subtitle: `${w.category} • ${w.year}${w.director ? ` • Dir: ${w.director}` : ''}`,
          category: 'Notable Works',
          url: `/admin/works?q=${encodeURIComponent(w.title)}`,
          image: w.image,
          type: 'record',
        });
      }
    } catch (err) {
      console.error('Search works error:', err);
    }

    // 2. Search Timeline / Awards & Honors
    try {
      const store = (await readStore<TimelineStoreData>('timeline')) || { top: [], bottom: [], milestones: [] };
      const rawTimeline: JourneyItem[] = [
        ...(Array.isArray(store.top) ? store.top : []),
        ...(Array.isArray(store.bottom) ? store.bottom : []),
      ];
      const deletedSet = new Set(Array.isArray(store.deletedIds) ? store.deletedIds : []);
      const matchedTimeline = rawTimeline
        .filter((t) => t && t.id && !deletedSet.has(t.id))
        .filter((t) => {
          return (
            t.title?.toLowerCase().includes(q) ||
            t.content?.toLowerCase().includes(q) ||
            t.year?.includes(q) ||
            t.month?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5);

      for (const t of matchedTimeline) {
        results.push({
          id: `timeline-${t.id}`,
          title: t.title || t.content,
          subtitle: `${t.month} ${t.year} • Award / Honor`,
          category: 'Awards & Honors',
          url: `/admin/timeline?q=${encodeURIComponent(t.title || t.year)}`,
          image: t.image,
          type: 'record',
        });
      }
    } catch (err) {
      console.error('Search timeline error:', err);
    }

    // 3. Search Media Library
    try {
      const manifest = (await getMediaManifest()) || [];
      const matchedMedia = manifest.filter((m) => {
        return (
          m.filename?.toLowerCase().includes(q) ||
          m.originalName?.toLowerCase().includes(q) ||
          m.folder?.toLowerCase().includes(q)
        );
      }).slice(0, 5);

      for (const m of matchedMedia) {
        results.push({
          id: `media-${m.id}`,
          title: m.originalName || m.filename,
          subtitle: `Folder: ${m.folder} • ${(m.size / 1024).toFixed(0)} KB`,
          category: 'Media Library',
          url: `/admin/media?q=${encodeURIComponent(m.filename)}`,
          image: m.url,
          type: 'record',
        });
      }
    } catch (err) {
      console.error('Search media error:', err);
    }

    // 4. Search CRM Inquiries
    try {
      const inquiries = (await readStore<InquiryItem[]>('inquiries')) || [];
      const matchedInquiries = inquiries.filter((inq) => {
        return (
          inq.name?.toLowerCase().includes(q) ||
          inq.email?.toLowerCase().includes(q) ||
          inq.phone?.includes(q) ||
          inq.inquiryType?.toLowerCase().includes(q) ||
          inq.subject?.toLowerCase().includes(q) ||
          inq.message?.toLowerCase().includes(q)
        );
      }).slice(0, 5);

      for (const inq of matchedInquiries) {
        results.push({
          id: `inquiry-${inq.id}`,
          title: inq.name,
          subtitle: `${inq.inquiryType} • ${inq.email} • Status: ${inq.status}`,
          category: 'Inquiries CRM',
          url: `/admin/inquiries?q=${encodeURIComponent(inq.name)}`,
          type: 'record',
        });
      }
    } catch (err) {
      console.error('Search inquiries error:', err);
    }

    // 5. Search Press & Media
    try {
      const press = (await readStore<PressItem[]>('press')) || [];
      const matchedPress = press.filter((p) => {
        return (
          p.headline?.toLowerCase().includes(q) ||
          p.publication?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.kind?.toLowerCase().includes(q)
        );
      }).slice(0, 5);

      for (const p of matchedPress) {
        results.push({
          id: `press-${p.id}`,
          title: p.headline,
          subtitle: `${p.publication} • ${p.date}`,
          category: 'Press & Media',
          url: `/admin/press?q=${encodeURIComponent(p.headline)}`,
          image: p.image,
          type: 'record',
        });
      }
    } catch (err) {
      console.error('Search press error:', err);
    }

    // 6. Search Users & Roles (Admins only)
    if (user.role === 'admin') {
      try {
        const users = await getAllAdminUsers();
        const matchedUsers = users.filter((u) => {
          return (
            u.username?.toLowerCase().includes(q) ||
            u.displayName?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
          );
        }).slice(0, 4);

        for (const u of matchedUsers) {
          results.push({
            id: `user-${u.id}`,
            title: `${u.displayName} (@${u.username})`,
            subtitle: `Role: ${u.role.toUpperCase()}`,
            category: 'Users & Roles',
            url: `/admin/users?q=${encodeURIComponent(u.username)}`,
            type: 'record',
          });
        }
      } catch (err) {
        console.error('Search users error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      query: q,
      count: results.length,
      items: results,
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

