import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '@/lib/server-storage';
import { filmography as defaultFilmography } from '@/data/filmography';
import { aboutData as defaultAbout } from '@/data/about';
import { initialContactInfo } from '@/data/contact';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      name: 'shirin-shila-portfolio-mcp',
      version: '1.0.0',
      protocol: 'jsonrpc-2.0',
      status: 'active',
      endpoints: {
        rpc: '/api/mcp',
        serverCard: '/.well-known/mcp/server-card.json',
      },
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    // Check JSON-RPC version
    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        { jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' } },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 1. initialize
    if (method === 'initialize') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false },
            },
            serverInfo: {
              name: 'shirin-shila-portfolio-mcp',
              version: '1.0.0',
            },
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // 2. tools/list
    if (method === 'tools/list') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'get_filmography',
                description: 'Retrieve verified filmography of Dhallywood actress Shirin Shila',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Filter by movie title or co-star' },
                  },
                },
              },
              {
                name: 'get_bio_and_awards',
                description: 'Retrieve biographical summary, acting honors, and awards',
                inputSchema: { type: 'object', properties: {} },
              },
              {
                name: 'submit_inquiry',
                description: 'Submit a casting or booking inquiry to Shirin Shila talent desk',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    service: { type: 'string' },
                    message: { type: 'string' },
                  },
                  required: ['name', 'email', 'message'],
                },
              },
            ],
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // 3. tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (toolName === 'get_filmography') {
        const works = (await readStore<any[]>('filmography').catch(() => defaultFilmography)) || defaultFilmography;
        let filtered = works;
        if (toolArgs.query) {
          const q = toolArgs.query.toLowerCase();
          filtered = works.filter(
            (w) =>
              w.title?.toLowerCase().includes(q) ||
              w.coStar?.toLowerCase().includes(q) ||
              w.role?.toLowerCase().includes(q)
          );
        }
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(filtered, null, 2) }],
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      if (toolName === 'get_bio_and_awards') {
        const about = (await readStore<any>('about').catch(() => defaultAbout)) || defaultAbout;
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(about, null, 2) }],
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      if (toolName === 'submit_inquiry') {
        const { name, email, service, message, phone } = toolArgs;
        if (!name || !email || !message) {
          return NextResponse.json(
            {
              jsonrpc: '2.0',
              id,
              error: { code: -32602, message: 'Invalid params: name, email, message are required' },
            },
            { status: 400, headers: CORS_HEADERS }
          );
        }

        const inquiries = (await readStore<any[]>('inquiries').catch(() => [])) || [];
        const newInquiry = {
          id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          email,
          phone: phone || '',
          service: service || 'General Casting',
          message,
          createdAt: new Date().toISOString(),
          status: 'unread',
        };

        const { writeStore } = await import('@/lib/server-storage');
        await writeStore('inquiries', [newInquiry, ...inquiries]);

        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Inquiry successfully recorded with reference ID: ${newInquiry.id}`,
                },
              ],
            },
          },
          { headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        { jsonrpc: '2.0', id, error: { code: -32601, message: `Tool not found: ${toolName}` } },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } },
      { status: 404, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: err.message || 'Internal RPC error' } },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
