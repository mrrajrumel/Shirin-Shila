export interface PageRevisionItem {
  id: number | string;
  pageId: string;
  revisionNum: number;
  title: string;
  navLabel?: string;
  subheading?: string;
  content: string;
  isPublished: boolean;
  savedBy: string;
  createdAt: string;
}

export interface ManagedPageData {
  id: string; // 'about' | 'contact' | 'privacy' | 'terms' | 'llms'
  slug: string;
  title: string;
  navLabel: string;
  subheading?: string;
  isPublished: boolean;
  content: string; // Full markdown or rich text
  seoTitle?: string;
  seoDescription?: string;
  meta?: Record<string, any>;
  updatedAt?: string;
  updatedBy?: string;
  revisionCount?: number;
}

export interface PagesRegistry {
  about: ManagedPageData;
  contact: ManagedPageData;
  privacy: ManagedPageData;
  terms: ManagedPageData;
  llms: ManagedPageData;
}

export const defaultPrivacyContent = `## 1. Information We Collect
When casting agents, producers, brand sponsors, or media partners submit inquiries through our contact and booking desk, we collect identity and professional contact details (name, corporate email, telephone, production house, and project specifications). This information is utilized strictly to evaluate casting offers and coordinate professional appointments.

## 2. Confidentiality of Screenplays & Treatments
We treat all artistic treatments, screenplays, concept pitches, and commercial storyboards transmitted through this portal with strict non-disclosure confidentiality. Unreleased creative materials are never shared beyond authorized talent representation personnel.

## 3. Data Protection & Secure Storage
Inquiry submissions and client communication records are stored securely in encrypted databases protected by parameterized queries, access control policies, and rate-limiting safeguards. We do not sell, rent, or lease contact information to third parties.

## 4. Machine Agent & Crawler Policies
Autonomous search crawlers and AI agents interacting with this website are granted access to public biographical indices, structured schema representations, and our declared Content-Signals. Submissions via automated inquiry forms must include legitimate production identity.

## 5. Contact Regarding Privacy
For inquiries regarding our data handling or confidentiality policies, inquiries may be submitted through the official talent representation desk.`;

export const defaultTermsContent = `## 1. Scope & Official Representation
This website serves as the sole official digital portfolio and primary representation contact desk for Bangladeshi silver-screen actress and model Shirin Shila. All casting inquiries, commercial endorsements, event appearances, and television reality show appointments must be confirmed in writing by authorized talent management.

## 2. Talent Booking & Contractual Commitments
Preliminary inquiries submitted through this website do not constitute a binding legal agreement until formal contracts specifying production schedules, remuneration, travel logistics, and credit billing are mutually executed. A standard booking retainer is required to lock production dates on the artist's schedule.

## 3. Intellectual Property & Media Usage Rights
All promotional photography, showreels, movie posters, press clippings, and brand marks displayed on this portfolio are the exclusive intellectual property of Shirin Shila, production houses, and respective copyright holders. Unauthorized scraping, commercial exploitation, or reproduction without prior written consent is strictly prohibited.

## 4. Artificial Intelligence & Digital Likeness Protection
In alignment with international creative rights standards and our declared Content-Signal: search=yes, ai-train=no policy: the voice, biometric face likeness, performance recordings, and video showreels of Shirin Shila may not be ingested or trained upon for synthetic generative voice/video models (deepfakes or uncredited generative AI clones) without an explicit licensed talent contract.

## 5. Governing Law
All professional representation agreements and digital operations of this portfolio are governed by and construed in accordance with the laws of the People's Republic of Bangladesh.`;

export const defaultLlmsContent = `# Shirin Shila — Dhallywood Film Actress & Casting Portfolio

> Official, verified portfolio of Bangladeshi silver-screen cinema actress, model, and television reality show judge Shirin Shila (Shirin Akter).

## Core Pages
- [Home]({siteUrl}/): Official portfolio homepage featuring silver-screen showreels, career highlights, and news archive.
- [About Us]({siteUrl}/#about): Comprehensive biography, acting background, feature filmography, and major industry awards.
- [Contact and Book]({siteUrl}/#contact): Direct talent management desk for casting directors, filmmakers, brand endorsement agencies, and press requests.
- [Terms of Representation]({siteUrl}/terms): Professional representation terms, casting guidelines, intellectual property, and AI voice/likeness usage protection.
- [Privacy Policy]({siteUrl}/privacy): Data protection, script confidentiality, and inquiry handling standards.
- [Full LLM Content Profile]({siteUrl}/llms-full.txt): Detailed factual biography, full filmography credits, and accolades index.
- [MCP Server Card]({siteUrl}/.well-known/mcp/server-card.json): Machine-readable Model Context Protocol (MCP) server manifest declaring portfolio query tools.

## Content Usage & AI Policy
- **Content-Signal Directive**: search=yes, ai-train=no
- **Search & Discovery**: Authorized for search indexing, conversational discovery, factual summaries, and knowledge queries.
- **Likeness Protection**: Synthetic voice cloning, biometric generative facial likeness models, and uncredited generative replicas are strictly prohibited without an explicit licensed talent agreement.

## Verified Accolades & Accreditations
- **Babisas Best Actress Award (2019)**: Awarded by Bangladesh Binodon Sangbadik Samity for lead role in "Begum Jaan".
- **Meril-Prothom Alo Awards Nominee (2014)**: Nominated for Best Debut Performance in "Hitman".
- **Dhaka International Film Festival (DIFF) Honor (2024)**: Trophy presentation recognizing contribution to cinema.
- **National Star Excellence Crest (2025)**: Honored for artistic excellence across cinema and television.

## Talent Desk Contact
- **Email**: support@trytso.com
- **Website**: {siteUrl}
- **Representation Base**: Dhaka, Bangladesh (Available for Worldwide Productions)`;

export const defaultPagesRegistry: PagesRegistry = {
  about: {
    id: 'about',
    slug: '/#about',
    title: 'About Us',
    navLabel: 'About Us',
    subheading: 'Silver-Screen Dhallywood Actress, Television Reality Judge & Cultural Fashion Icon',
    isPublished: true,
    content: 'Shirin Shila (born Shirin Akter) is a celebrated Bangladeshi film actress who captured nationwide attention with her silver-screen debut in the 2014 blockbuster hit "Hitman" alongside Shakib Khan. With classic expressive range, commanding screen presence, and dedication to challenging roles, she has built an enduring catalog across romantic dramas, action thrillers, and patriotic cinema.',
    seoTitle: 'About Us | Shirin Shila Official Biography & Honors',
    seoDescription: 'Biographical overview of Bangladeshi silver-screen film actress, television reality show judge, and model Shirin Shila (Shirin Akter).',
    meta: {
      featureFilms: '10+',
      babisasYear: '2019',
      diffYear: '2024',
      nationalCrestYear: '2025',
      portraitImage: '/images/hero.jpg',
      accolades: [
        'Babisas Best Actress Award (2019) — Awarded for leading role in "Begum Jaan"',
        'Meril-Prothom Alo Awards Nominee (2014) — Best Debut Performance for "Hitman"',
        'DIFF Best Actress Trophy (2024) — International Film Festival recognition',
        'National Star Excellence Honor (2025) — Television & Cinema Contribution Crest',
      ],
    },
    updatedAt: new Date().toISOString(),
  },
  contact: {
    id: 'contact',
    slug: '/#contact',
    title: 'Contact and Book',
    navLabel: 'Contact and Book',
    subheading: 'Official Booking Desk & Talent Management Representation',
    isPublished: true,
    content: 'Direct point of contact for directors, producers, brand advertising agencies, and television networks worldwide.',
    seoTitle: 'Contact and Book | Shirin Shila Official Talent Management Desk',
    seoDescription: 'Official representation, casting inquiries, brand endorsement, and talent booking desk for Bangladeshi film actress Shirin Shila.',
    meta: {
      managementEmail: 'support@trytso.com',
      pressEmail: 'press@shirinshila.com',
      phone: '+880 1711-000000',
      representationBase: 'Dhaka, Bangladesh (Available for Worldwide Shoots)',
      turnaroundTime: 'All verified casting inquiries answered within 24-48 business hours',
      inquiryGuidelines: 'To expedite review by the talent management desk, please specify: project title & genre, production house, proposed shooting schedule, and character brief.',
      verificationNotice: 'This portal is the sole official digital booking and media representation outlet for Shirin Shila. Unsolicited intermediaries are not authorized to contract on behalf of the artist.',
    },
    updatedAt: new Date().toISOString(),
  },
  privacy: {
    id: 'privacy',
    slug: '/privacy',
    title: 'Privacy Policy',
    navLabel: 'Privacy Policy',
    subheading: 'Official Data Protection & Talent Desk Confidentiality Policy',
    isPublished: true,
    content: defaultPrivacyContent,
    seoTitle: 'Privacy Policy | Shirin Shila Official Portfolio',
    seoDescription: 'Data protection and confidentiality policy for casting inquiries, talent management desk, and website communications for Shirin Shila.',
    meta: {
      lastUpdated: 'October 2026',
    },
    updatedAt: new Date().toISOString(),
  },
  terms: {
    id: 'terms',
    slug: '/terms',
    title: 'Terms of Representation',
    navLabel: 'Terms of Representation',
    subheading: 'Official Legal & Representation Guidelines for Film Productions, Endorsements & Live Engagements',
    isPublished: true,
    content: defaultTermsContent,
    seoTitle: 'Terms of Representation & Booking | Shirin Shila',
    seoDescription: 'Official talent booking terms, media appearance policies, intellectual property, and representation guidelines for Bangladeshi film actress Shirin Shila.',
    meta: {
      governingLaw: "People's Republic of Bangladesh",
      lastUpdated: 'October 2026',
    },
    updatedAt: new Date().toISOString(),
  },
  llms: {
    id: 'llms',
    slug: '/llms.txt',
    title: 'llms.txt Machine Manifest',
    navLabel: 'llms.txt',
    subheading: 'Factual Plaintext Profile for AI Systems, Search Crawlers & LLM Agents',
    isPublished: true, // Published as requested by user & analyzer!
    content: defaultLlmsContent,
    seoTitle: 'llms.txt Machine Manifest | Shirin Shila',
    seoDescription: 'Machine-readable factual context profile for AI systems, automated agents, and LLMs.',
    meta: {
      contentSignal: 'search=yes, ai-train=no',
      format: 'text/plain; charset=utf-8',
    },
    updatedAt: new Date().toISOString(),
  },
};

export default defaultPagesRegistry;
