export type PressKind = "News article" | "Newspaper clipping" | "Interview" | "Feature";

export interface PressItem {
  id: string;
  publication: string;
  headline: string;
  date: string;
  kind: PressKind;
  image: string;
  url?: string;
  excerpt: string;
}

export interface PressCategoryItem {
  key: string;
  label: string;
}

export const pressCategories: PressCategoryItem[] = [
  { key: "All", label: "All" },
  { key: "News article", label: "News article" },
  { key: "Newspaper clipping", label: "Newspaper clipping" },
  { key: "Interview", label: "Interview" },
  { key: "Feature", label: "Feature" },
];

export const pressItems: PressItem[] = [
  {
    id: "press-cut-01",
    publication: "দৈনিক চিত্রালী",
    headline: "সেরা অভিনেত্রীর সম্মান পেলেন শিরীন শিলা",
    date: "মে ১৯৯৮",
    kind: "Newspaper clipping",
    image: "/images/newspaper-cut-1.jpg",
    excerpt: ""
  },
  {
    id: "press-cut-02",
    publication: "দৈনিক আনন্দবাজার",
    headline: "জমকালো প্রিমিয়ার শোতে নায়িকা শিরিন শিলা",
    date: "২৮ নভেম্বর ২০২৩",
    kind: "Newspaper clipping",
    image: "/images/newspaper-cut-2.jpg",
    excerpt: ""
  },
  {
    id: "press-01",
    publication: "Prothom Alo",
    headline: "Meril-Prothom Alo Awards: Shirin Shila Nominated for Best Newcomer in 'Hitman'",
    date: "14 May 2015",
    kind: "News article",
    image: "/images/hero.jpg",
    url: "https://www.prothomalo.com/entertainment",
    excerpt: ""
  },
  {
    id: "press-02",
    publication: "The Daily Star",
    headline: "Shirin Shila Named Best Actress at Babisas Awards for 'Begum Jaan'",
    date: "20 November 2019",
    kind: "News article",
    image: "/images/award-trophy-stage.jpg",
    url: "https://www.thedailystar.net/entertainment",
    excerpt: ""
  },
  {
    id: "press-04",
    publication: "Channel i Online",
    headline: "Dipjol and Shirin Shila Team Up for Family Drama 'Ghor Vanga Songsar'",
    date: "01 September 2023",
    kind: "News article",
    image: "/images/gallery-1.jpg",
    url: "https://www.channelionline.com/entertainment",
    excerpt: ""
  },
  {
    id: "press-06",
    publication: "Dhaka Tribune",
    headline: "Suspense Feature 'Sesh Bazi' Debuts Across Theaters Nationwide",
    date: "19 January 2024",
    kind: "News article",
    image: "/images/poster-seshbazi.jpg",
    url: "https://www.dhakatribune.com/showtime",
    excerpt: ""
  }
];

export const pressMeta = {
  kicker: "Press & Media",
  titlePrefix: "Media",
  titleHighlight: "&",
  titleSuffix: "Press Coverage",
  subtitle: "Featured news publications, online headlines, and authentic newspaper clippings.",
};

export const pressData = {
  meta: pressMeta,
  categories: pressCategories,
  items: pressItems,
};

export default pressItems;

