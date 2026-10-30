import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'llms.txt');
  let content = '';

  try {
    if (fs.existsSync(filePath)) {
      content = await fs.promises.readFile(filePath, 'utf-8');
    }
  } catch {
    content = `# Shirin Shila — Official Cinema Portfolio & Casting Desk\n> Official portfolio of Bangladeshi silver-screen film actress Shirin Shila.`;
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
