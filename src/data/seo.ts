export interface SiteSeoData {
  siteTitle: string;
  tagline: string;
  description: string;
  keywords: string;
  author: string;
  siteUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterHandle: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  customHeadHtml: string;
}

export const defaultSeoData: SiteSeoData = {
  siteTitle: "Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio",
  tagline: "Dhallywood Cinema, Television Star & Fashion Model",
  description:
    "Official portfolio of Bangladeshi silver-screen film actress, television reality show judge, and model Shirin Shila (Shirin Akter). Explore filmography, video showreels, career milestones, awards, press coverage, and talent management booking representation.",
  keywords:
    "Shirin Shila, Shirin Akter, Dhallywood Actress, Bangladeshi Film Actress, Dhallywood Cinema, Begum Jaan Actress, Hitman Shakib Khan, Birangona 71, Shesh Baji Movie, Bangladeshi Celebrity Judge, Dhallywood Model",
  author: "Shirin Shila",
  siteUrl: "https://shirinshila.com",
  ogTitle: "Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio",
  ogDescription:
    "Explore official filmography, awards, press archive, and casting showreels of Bangladeshi film star Shirin Shila.",
  ogImage: "/images/hero.jpg",
  twitterHandle: "@shirin_shila",
  faviconUrl: "/icon.svg",
  appleTouchIconUrl: "/apple-icon.png",
  customHeadHtml: "",
};

export default defaultSeoData;

