import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', '.well-known', 'mcp', 'server-card.json');
  let data: any = null;

  try {
    if (fs.existsSync(filePath)) {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      data = JSON.parse(raw);
    }
  } catch {}

  if (!data) {
    data = {
      $schema: 'https://modelcontextprotocol.io/schemas/server-card/v1.json',
      name: 'shirin-shila-portfolio-mcp',
      version: '1.0.0',
      description: 'Model Context Protocol (MCP) server for querying Dhallywood film actress Shirin Shila official portfolio.',
      endpoint: 'https://cornflowerblue-wildcat-675604.hostingersite.com/api/mcp',
      capabilities: { tools: { listChanged: false } },
    };
  }

  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
