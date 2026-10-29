import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function cleanHtmlText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts YouTube video ID from various URL formats or direct 11-char ID
 */
function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;
      const paths = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'v', 'shorts', 'watch'].includes(paths[0])) {
        return paths[1] || paths[0] === 'shorts' ? paths[1] : null;
      }
    } else if (parsed.hostname === 'youtu.be') {
      const paths = parsed.pathname.split('/').filter(Boolean);
      if (paths[0] && paths[0].length === 11) return paths[0];
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    if (match && match[1]) return match[1];
  }

  return null;
}

/**
 * Extracts IMDb Title ID (e.g. tt4049876) from URL or string
 */
function extractImdbId(input: string): string | null {
  const match = input.match(/\b(tt\d{6,10})\b/i);
  return match ? match[1].toLowerCase() : null;
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
    videoUrl?: string;
    youtubeId?: string;
    imdbUrl?: string;
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
    imdbUrl: 'https://www.imdb.com/title/tt4049876/',
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
    awards: 'Bangladesh Film Journalists Association (Babisas) Best Actress Winner',
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
    productionHouse: 'Rongdhonu Films',
    role: 'Protagonist Lead',
    description:
      'High-stakes psychological mystery thriller exploring betting rings, fate, and redemption released nationally in 2024.',
    image: '/images/poster-seshbazi.jpg',
  },
  'sesh baji': {
    title: 'Shesh Baji',
    banglaTitle: 'শেষ বাজি',
    category: 'Film',
    year: '2024',
    director: 'Mehedi Hasan',
    coStar: 'Symon Sadik',
    productionHouse: 'Rongdhonu Films',
    role: 'Protagonist Lead',
    description:
      'High-stakes psychological mystery thriller exploring betting rings, fate, and redemption released nationally in 2024.',
    image: '/images/poster-seshbazi.jpg',
  },
  'birangona 71': {
    title: 'Birangona 71',
    banglaTitle: 'বীরাঙ্গনা ৭১',
    category: 'Film',
    year: '2022',
    director: 'M. S. Rana',
    coStar: 'Shahed Ali, Fazlur Rahman Babu',
    productionHouse: 'Green Entertainment',
    role: 'Heroine of 1971',
    description:
      'Historical feature film dramatizing the wartime courage and sacrifices of female freedom fighters during the 1971 Bangladesh Liberation War.',
    awards: 'Special Acclaim - Liberation War Cinema',
    image: '/images/poster-birangona71.jpg',
  },
  'ghor vanga songsar': {
    title: 'Ghor Vanga Songsar',
    banglaTitle: 'ঘর ভাঙা সংসার',
    category: 'Film',
    year: '2023',
    director: 'Montazur Rahman Akbar',
    coStar: 'Monowar Hossain Dipjol',
    productionHouse: 'Amiya Production',
    role: 'Lead Protagonist',
    description:
      'Theatrical family drama co-starring veteran actor Monowar Hossain Dipjol, released in premier cineplexes nationwide.',
    image: '/images/poster-ghor-vanga.jpg',
  },
  jimmi: {
    title: 'Jimmi',
    banglaTitle: 'জিম্মি',
    category: 'Film',
    year: '2023',
    director: 'Montazur Rahman Akbar',
    coStar: 'Monowar Hossain Dipjol',
    productionHouse: 'Dipjol Chalachitra',
    role: 'Lead Action Cast',
    description:
      'Mainstream action thriller starring alongside Monowar Hossain Dipjol, released across 55 cinema halls in Bangladesh.',
    image: '/images/poster-jimmi.jpg',
  },
  'nodir jole shapla': {
    title: 'Nodir Jole Shapla Bhashe',
    banglaTitle: 'নদীর জলে শাপলা ভাসে',
    category: 'Film',
    year: '2024',
    director: 'Mehedi Hasan',
    coStar: 'Anisur Rahman Milon',
    productionHouse: 'Chitrabani Films',
    role: 'Shapla (Lead)',
    description:
      'Riverine rural romance set in southern Bangladesh, co-starring Anisur Rahman Milon.',
    image: '/images/gallery-3.jpg',
  },
  'kanya tomare': {
    title: 'Kanya Tomare',
    banglaTitle: 'কন্যা তোমারে (মিউজিক ভিডিও)',
    category: 'Music Video',
    year: '2020',
    director: 'Soumitra Ghosh Emon',
    coStar: 'Asif Akbar',
    productionHouse: 'ARB Entertainment / National TV',
    role: 'Lead Screen Visual Performer',
    description:
      'Blockbuster music video starring opposite iconic singer Asif Akbar, reaching millions of views across Bangladesh.',
    image: '/images/gallery-1.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=dZ9K1n4s8aM',
  },
  bicharok: {
    title: 'Celebrity Dance Reality Show Grand Finale',
    banglaTitle: 'সেলিব্রিটি ড্যান্স রিয়েলিটি শো (গ্র্যান্ড ফিনালে বিচারক)',
    category: 'TV Show Judge',
    year: '2023',
    director: 'Broadcast Production Team',
    coStar: 'Eminent Choreographers & Artists',
    productionHouse: 'Channel i / ATN Bangla Special',
    role: 'Celebrity Grand Finale Judge (প্রধান বিচারক)',
    description:
      'Served as premier celebrity judge evaluating nationwide dance contestants, artistic choreography, and theatrical expression in the televised grand finale.',
    awards: 'Guest Celebrity Jury Honors',
    image: '/images/award-diff-stage.jpg',
  },
  'dancing star': {
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
    image: '/images/award-diff-stage.jpg',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = (searchParams.get('query') || searchParams.get('url') || '').trim();

  if (!input) {
    return NextResponse.json({ error: 'Project name, YouTube URL, or IMDb link is required' }, { status: 400 });
  }

  // ==========================================
  // CASE 1: YOUTUBE VIDEO LINK OR VIDEO ID
  // ==========================================
  const ytId = extractYoutubeId(input);
  if (ytId) {
    try {
      const targetUrl = `https://www.youtube.com/watch?v=${ytId}`;
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

      const oembedRes = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(6000),
      });

      let rawTitle = 'Music Video & Performance Reel';
      let authorName = 'Dhallywood Media';
      let oembedThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        rawTitle = oembedData.title || rawTitle;
        authorName = oembedData.author_name || authorName;
        if (oembedData.thumbnail_url) {
          oembedThumbnail = oembedData.thumbnail_url;
        }
      }

      // Clean YouTube Title (strip common clutter)
      let cleanedTitle = rawTitle
        .replace(/\|\s*(?:Official\s*(?:Music\s*)?Video|Full\s*Video|4K|HD|1080p|G-Series|Anupam).*$/gi, '')
        .replace(/\[\s*(?:Official\s*(?:Music\s*)?Video|4K|HD).*?\]/gi, '')
        .replace(/\(\s*(?:Official\s*(?:Music\s*)?Video|4K|HD).*?\)/gi, '')
        .trim();
      if (!cleanedTitle) cleanedTitle = rawTitle;

      // Smart Category Detection
      const lowerComb = `${rawTitle} ${authorName}`.toLowerCase();
      let detectedCategory: 'Film' | 'Television Drama' | 'TV Show Judge' | 'Music Video' | 'Commercial & Modelling' = 'Music Video';
      let detectedRole = 'Lead Screen Performer';

      if (/judge|bicharok|reality|audition|jury|বিচারক|ড্যান্স/i.test(lowerComb)) {
        detectedCategory = 'TV Show Judge';
        detectedRole = 'Celebrity Judge / Jury Panelist (বিচারক)';
      } else if (/natok|telefilm|drama serial|episode|নাটক|টেলিফিল্ম/i.test(lowerComb)) {
        detectedCategory = 'Television Drama';
        detectedRole = 'Featured Lead';
      } else if (/tvc|commercial|advertisement|brand|ad|বিজ্ঞাপন/i.test(lowerComb)) {
        detectedCategory = 'Commercial & Modelling';
        detectedRole = 'Brand Ambassador & Model';
      } else if (/movie|film|cinema|trailer|teaser|সিনেমা|চলচ্চিত্র/i.test(lowerComb)) {
        detectedCategory = 'Film';
        detectedRole = 'Lead Protagonist';
      }

      // Use YouTube high quality thumbnail
      const ytThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

      // Extract Co-Star from title if "with" or "ft" or "featuring" is found
      let coStar = '';
      const coStarMatch = cleanedTitle.match(/(?:feat\.?|ft\.?|with|duet|opposite)\s+([^|\-–()]+)/i);
      if (coStarMatch && coStarMatch[1]) {
        coStar = coStarMatch[1].trim();
      }

      return NextResponse.json({
        success: true,
        source: 'youtube',
        data: {
          title: cleanedTitle,
          banglaTitle: '',
          category: detectedCategory,
          year: new Date().getFullYear().toString(),
          director: '',
          coStar,
          productionHouse: authorName,
          role: detectedRole,
          description: `Official ${detectedCategory.toLowerCase()} presentation featuring Shirin Shila. Broadcast and released on ${authorName}.`,
          image: ytThumbnail,
          videoUrl: targetUrl,
          youtubeId: ytId,
        },
      });
    } catch (ytErr) {
      // Fallback with YouTube ID thumbnail even if oembed fails
      return NextResponse.json({
        success: true,
        source: 'youtube-fallback',
        data: {
          title: 'YouTube Video Work',
          banglaTitle: '',
          category: 'Music Video',
          year: new Date().getFullYear().toString(),
          director: '',
          coStar: '',
          productionHouse: 'YouTube Broadcast',
          role: 'Lead Performer',
          description: 'Official screen appearance starring Shirin Shila.',
          image: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
          youtubeId: ytId,
        },
      });
    }
  }

  // ==========================================
  // CASE 2: IMDB URL OR IMDB ID (e.g. tt4049876)
  // ==========================================
  const imdbId = extractImdbId(input);
  if (imdbId) {
    try {
      const imdbApiUrl = `https://v3.sg.media-imdb.com/suggestion/t/${imdbId}.json`;
      const imdbRes = await fetch(imdbApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (imdbRes.ok) {
        const json = await imdbRes.json();
        const item = json.d && json.d[0];
        if (item) {
          const rawTitle = item.l || 'Dhallywood Film';
          const releaseYear = item.y ? item.y.toString() : new Date().getFullYear().toString();
          const stars = item.s || '';
          const poster = item.i?.imageUrl || '/images/poster-begum-jaan.jpg';

          let category: 'Film' | 'Television Drama' | 'TV Show Judge' | 'Music Video' | 'Commercial & Modelling' = 'Film';
          if (item.q && /tv|series|episode/i.test(item.q)) {
            category = 'Television Drama';
          }

          return NextResponse.json({
            success: true,
            source: 'imdb',
            data: {
              title: rawTitle,
              banglaTitle: '',
              category,
              year: releaseYear,
              director: '',
              coStar: stars,
              productionHouse: 'Cinema Production',
              role: 'Lead Role',
              description: `Theatrical ${category.toLowerCase()} starring Shirin Shila, officially cataloged on IMDb.`,
              image: poster,
              imdbUrl: `https://www.imdb.com/title/${imdbId}/`,
            },
          });
        }
      }
    } catch {}
  }

  // ==========================================
  // CASE 3: CHECK KNOWN SHIRIN SHILA CATALOGUE
  // ==========================================
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

  // ==========================================
  // CASE 4: GENERIC WEB URL (Article / Portal / Wiki)
  // ==========================================
  const isUrl = /^(https?:\/\/)/i.test(input) || (!/\s/.test(input) && /\.[a-z]{2,}/i.test(input));
  if (isUrl) {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      const res = await fetch(urlObj.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const html = await res.text();
        const titleMatch =
          html.match(/<meta[^>]+property=["'](?:og:)?title["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const imgMatch =
          html.match(/<meta[^>]+property=["'](?:og:)?image["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
        const descMatch =
          html.match(/<meta[^>]+property=["'](?:og:)?description["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

        let rawTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : input;
        const rawDesc = descMatch ? cleanHtmlText(descMatch[1]) : '';
        let image = imgMatch ? imgMatch[1].trim() : '';

        // Clean website title suffixes
        if (rawTitle.includes(' - ')) {
          rawTitle = rawTitle.split(' - ')[0].trim();
        } else if (rawTitle.includes(' | ')) {
          rawTitle = rawTitle.split(' | ')[0].trim();
        }

        // Resolve relative image URL to absolute
        if (image && !image.startsWith('http') && !image.startsWith('//')) {
          try {
            image = new URL(image, urlObj.origin).href;
          } catch {}
        }

        const lowerPage = `${rawTitle} ${rawDesc}`.toLowerCase();
        let cat: 'Film' | 'Television Drama' | 'TV Show Judge' | 'Music Video' | 'Commercial & Modelling' = 'Film';
        if (/judge|bicharok|jury|reality|বিচারক/i.test(lowerPage)) {
          cat = 'TV Show Judge';
        } else if (/music video|song|গান/i.test(lowerPage)) {
          cat = 'Music Video';
        } else if (/drama|natok|telefilm|নাটক/i.test(lowerPage)) {
          cat = 'Television Drama';
        } else if (/tvc|ad|commercial|বিজ্ঞাপন/i.test(lowerPage)) {
          cat = 'Commercial & Modelling';
        }

        return NextResponse.json({
          success: true,
          source: 'scraped',
          data: {
            title: rawTitle || 'Notable Media Work',
            banglaTitle: '',
            category: cat,
            year: new Date().getFullYear().toString(),
            director: '',
            coStar: '',
            productionHouse: urlObj.hostname.replace('www.', ''),
            role: cat === 'TV Show Judge' ? 'Grand Jury / Judge (বিচারক)' : 'Lead Performer',
            description: rawDesc || `Production work starring Bangladeshi film actress Shirin Shila.`,
            image: image || '/images/poster-begum-jaan.jpg',
            videoUrl: input.startsWith('http') ? input : `https://${input}`,
          },
        });
      }
    } catch {}
  }

  // ==========================================
  // CASE 5: SEARCH IMDB BY TITLE (if not a URL)
  // ==========================================
  try {
    const searchImdbUrl = `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(input)}.json`;
    const searchRes = await fetch(searchImdbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.d && data.d.length > 0) {
        // Pick first entry with an image or title match
        const match = data.d.find((d: any) => d.i?.imageUrl) || data.d[0];
        if (match && match.l) {
          const isTv = match.q && /tv|series|episode/i.test(match.q);
          return NextResponse.json({
            success: true,
            source: 'imdb-search',
            data: {
              title: match.l,
              banglaTitle: '',
              category: isTv ? 'Television Drama' : 'Film',
              year: match.y ? match.y.toString() : new Date().getFullYear().toString(),
              director: '',
              coStar: match.s || '',
              productionHouse: 'Cinema Production',
              role: 'Lead Role',
              description: `Cinema production starring Shirin Shila, officially cataloged on IMDb.`,
              image: match.i?.imageUrl || '/images/poster-hitman.jpg',
              imdbUrl: match.id ? `https://www.imdb.com/title/${match.id}/` : undefined,
            },
          });
        }
      }
    }
  } catch {}

  // ==========================================
  // CASE 6: INTELLIGENT FALLBACK FOR ANY TITLE
  // ==========================================
  const cleanTitle = input
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const isJudge = /judge|bicharok|reality|show|বিচারক/i.test(input);
  const isMusic = /song|music|video|audio|গান/i.test(input);
  const isDrama = /drama|natok|serial|নাটক/i.test(input);

  let finalCategory: 'Film' | 'Television Drama' | 'TV Show Judge' | 'Music Video' | 'Commercial & Modelling' = 'Film';
  let finalRole = 'Lead Protagonist';
  let defaultImg = '/images/poster-begum-jaan.jpg';

  if (isJudge) {
    finalCategory = 'TV Show Judge';
    finalRole = 'Celebrity Grand Jury / Judge (বিচারক)';
    defaultImg = '/images/award-diff-stage.jpg';
  } else if (isMusic) {
    finalCategory = 'Music Video';
    finalRole = 'Lead Screen Performer';
    defaultImg = '/images/gallery-1.jpg';
  } else if (isDrama) {
    finalCategory = 'Television Drama';
    finalRole = 'Lead Female Role';
    defaultImg = '/images/gallery-2.jpg';
  }

  return NextResponse.json({
    success: true,
    source: 'generated',
    data: {
      title: cleanTitle,
      banglaTitle: '',
      category: finalCategory,
      year: new Date().getFullYear().toString(),
      director: '',
      coStar: '',
      productionHouse: 'Dhallywood Media Production',
      role: finalRole,
      description: isJudge
        ? `Presided as an official television show judge and panelist evaluating performance arts and cultural talents.`
        : `Featured production starring Bangladeshi film actress Shirin Shila.`,
      image: defaultImg,
    },
  });
}
