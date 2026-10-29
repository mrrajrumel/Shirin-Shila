import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function cleanHtmlText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Known Dhallywood & Shirin Shila database hints
const KNOWN_PROJECTS: Record<
  string,
  {
    title: string;
    banglaTitle: string;
    category: 'Film' | 'Television Drama' | 'TV Show Judge' | 'Music Video' | 'Commercial & Modelling';
    year: string;
    director: string;
    coStar: string;
    productionHouse: string;
    role: string;
    description: string;
    awards?: string;
    image: string;
  }
> = {
  hitman: {
    title: 'Hitman',
    banglaTitle: 'হিটম্যান',
    category: 'Film',
    year: '2014',
    director: 'Wazed Ali Sumon',
    coStar: 'Shakib Khan & Apu Biswas',
    productionHouse: 'Fatman Films',
    role: 'Bhabna (Debut)',
    description:
      'Commercial blockbuster Eid-ul-Fitr release across 120+ cinema halls in Bangladesh, starring opposite Shakib Khan and Apu Biswas.',
    awards: 'Meril-Prothom Alo Awards Nominee (Best Newcomer)',
    image: '/images/poster-hitman.jpg',
  },
  'begum jaan': {
    title: 'Begum Jaan',
    banglaTitle: 'বেগম জান',
    category: 'Film',
    year: '2019',
    director: 'Mohammad Aslam',
    coStar: 'Emon & Amit Hasan',
    productionHouse: 'Aslam Productions',
    role: 'Begum Jaan (Title Role)',
    description:
      'Critically acclaimed social action-drama featuring Shirin Shila in a ferocious titular role fighting systemic injustice.',
    awards: 'Bangladesh Film Journalists Association (CJFB) Best Actress Nominee',
    image: '/images/poster-begum-jaan.jpg',
  },
  'nodir shesh kotha': {
    title: 'Nodir Shesh Kotha',
    banglaTitle: 'নদীর শেষ কথা',
    category: 'Film',
    year: '2021',
    director: 'Rezaul Karim',
    coStar: 'Kazi Maruf',
    productionHouse: 'Dhaka Cinema Labs',
    role: 'Riverine Heroine',
    description:
      'Atmospheric riverine rural drama portraying the struggles of fishermen and coastal communities along the Padma river basin.',
    image: '/images/poster-nodir-shesh-kotha.jpg',
  },
  'shesh baji': {
    title: 'Shesh Baji',
    banglaTitle: 'শেষ বাজি',
    category: 'Film',
    year: '2024',
    director: 'Mehedi Hasan',
    coStar: 'Symon Sadik',
    productionHouse: 'G-Series Films',
    role: 'Protagonist Lead',
    description:
      'High-stakes psychological mystery thriller exploring betting rings, fate, and redemption released nationally in 2024.',
    image: '/images/poster-shesh-baji.jpg',
  },
  'bicharok': {
    title: 'Dancing Star Reality Show',
    banglaTitle: 'ড্যান্সিং স্টার বিচারক',
    category: 'TV Show Judge',
    year: '2025',
    director: 'NTV Production Team',
    coStar: 'Renowned Choreographers & Artists',
    productionHouse: 'NTV Bangladesh',
    role: 'Grand Jury / Judge (বিচারক)',
    description:
      'Distinguished grand judge evaluating nationwide dance prodigies and contestants through intense competitive rounds on national television.',
    awards: 'Special Honors for Cultural Mentorship',
    image: '/images/poster-hitman.jpg',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = (searchParams.get('query') || searchParams.get('url') || '').trim();

  if (!input) {
    return NextResponse.json({ error: 'Project name or URL is required' }, { status: 400 });
  }

  // 1. Check known database first
  const normalized = input.toLowerCase();
  for (const [key, item] of Object.entries(KNOWN_PROJECTS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return NextResponse.json({
        success: true,
        source: 'catalogue',
        data: item,
      });
    }
  }

  // 2. If it's a URL or arbitrary keyword, attempt metadata or search
  const isUrl = /^(https?:\/\/)/i.test(input) || (!/\s/.test(input) && /\.[a-z]{2,}/i.test(input));

  if (isUrl) {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      const res = await fetch(urlObj.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const html = await res.text();
        const titleMatch =
          html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const imgMatch =
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        const descMatch =
          html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

        const rawTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : input;
        const rawDesc = descMatch ? cleanHtmlText(descMatch[1]) : '';
        const image = imgMatch ? imgMatch[1] : '/images/poster-hitman.jpg';

        return NextResponse.json({
          success: true,
          source: 'scraped',
          data: {
            title: rawTitle,
            banglaTitle: '',
            category: 'Film',
            year: new Date().getFullYear().toString(),
            director: '',
            coStar: '',
            productionHouse: '',
            role: 'Lead',
            description: rawDesc || `Production starring Shirin Shila.`,
            image,
          },
        });
      }
    } catch {}
  }

  // 3. Fallback for any arbitrary project name / word
  const cleanTitle = input
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const isJudge = /judge|bicharok|reality|show/i.test(input);

  return NextResponse.json({
    success: true,
    source: 'generated',
    data: {
      title: cleanTitle,
      banglaTitle: '',
      category: isJudge ? 'TV Show Judge' : 'Film',
      year: new Date().getFullYear().toString(),
      director: '',
      coStar: '',
      productionHouse: 'Dhallywood Film Media',
      role: isJudge ? 'Grand Jury / Judge (বিচারক)' : 'Lead Protagonist',
      description: isJudge
        ? `Presided as an official television show judge and panelist evaluating performance arts and cultural talents.`
        : `Featured cinema presentation starring Shirin Shila, produced for national release across Bangladesh.`,
      image: '/images/poster-hitman.jpg',
    },
  });
}

