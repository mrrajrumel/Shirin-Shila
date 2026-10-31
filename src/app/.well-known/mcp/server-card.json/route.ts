import { NextResponse } from 'next/server';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const siteUrl = await resolveCanonicalSiteUrl();

  const serverCard = {
    $schema: 'https://modelcontextprotocol.io/schemas/server-card/v1.json',
    name: 'shirin-shila-portfolio-mcp',
    version: '1.0.0',
    description:
      'Official Model Context Protocol (MCP) server for querying Bangladeshi film actress Shirin Shila official portfolio, verified filmography, awards, and booking representations.',
    endpoint: `${siteUrl}/api/mcp`,
    homepage: siteUrl,
    transport: {
      type: 'http-post',
      url: `${siteUrl}/api/mcp`,
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
    tools: [
      {
        name: 'get_filmography',
        description: 'Retrieve verified filmography and silver-screen projects of actress Shirin Shila',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Optional filter by movie title, director, or co-star',
            },
          },
        },
      },
      {
        name: 'get_bio_and_awards',
        description: 'Retrieve verified biography, artistic honors, and career accolades of Shirin Shila',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'submit_inquiry',
        description: 'Submit an official casting, media appearance, or acting booking inquiry to the talent desk',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Full name of producer, director, or casting agent' },
            email: { type: 'string', description: 'Contact email address' },
            phone: { type: 'string', description: 'Contact telephone or WhatsApp number' },
            service: { type: 'string', description: 'Type of engagement (Feature Film, Commercial, Reality Show Judge)' },
            message: { type: 'string', description: 'Project overview and scheduling details' },
          },
          required: ['name', 'email', 'message'],
        },
      },
    ],
    contact: {
      email: 'booking@shirinshila.com',
      url: `${siteUrl}/#contact`,
    },
  };

  return NextResponse.json(serverCard, {
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
