export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
  order: number;
}

export const defaultFooterLinks: FooterLinkItem[] = [
  { id: 'about', label: 'About Us', href: '/about', isVisible: true, order: 1 },
  { id: 'contact', label: 'Contact and Book', href: '/contact', isVisible: true, order: 2 },
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy', isVisible: true, order: 3 },
  { id: 'terms', label: 'Terms of Representation', href: '/terms', isVisible: true, order: 4 },
  { id: 'llms', label: 'llms.txt', href: '/llms.txt', isVisible: false, order: 5 },
];

export interface SiteSeoData {
  siteTitle: string;
  tagline: string;
  description: string;
  keywords: string;
  author: string;
  siteUrl: string; // Canonical URL override or fallback
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterHandle: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  customHeadHtml: string;
  // AI Visibility & Agent Directives
  contentSignal: string; // Content-Signal policy (e.g. "search=yes, ai-train=no")
  llmsSummary: string; // Custom summary notes for /llms.txt
  footerLinks: FooterLinkItem[]; // Admin-managed approved footer links
}

export const defaultSeoData: SiteSeoData = {
  siteTitle: "Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio",
  tagline: "Dhallywood Cinema, Television Star & Fashion Model",
  description:
    "Official portfolio of Bangladeshi silver-screen film actress, television reality show judge, and model Shirin Shila (Shirin Akter). Explore filmography, video showreels, career milestones, awards, press coverage, and talent management booking representation.",
  keywords:
    "Shirin Shila, Shirin Akter, Dhallywood Actress, Bangladeshi Film Actress, Dhallywood Cinema, Begum Jaan Actress, Hitman Shakib Khan, Birangona 71, Shesh Baji Movie, Bangladeshi Celebrity Judge, Dhallywood Model",
  author: "Shirin Shila",
  siteUrl: "", // Empty by default; dynamically resolved from server configuration (SITE_URL) or temporary staging fallback
  ogTitle: "Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio",
  ogDescription:
    "Explore official filmography, awards, press archive, and casting showreels of Bangladeshi film star Shirin Shila.",
  ogImage: "/images/hero.jpg",
  twitterHandle: "@shirin_shila",
  faviconUrl: "/icon.svg",
  appleTouchIconUrl: "/apple-icon.png",
  customHeadHtml: "",
  contentSignal: "search=yes, ai-train=no",
  llmsSummary: "",
  footerLinks: defaultFooterLinks,
};

export default defaultSeoData;
