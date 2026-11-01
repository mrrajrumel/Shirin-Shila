export const monthOrder = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
} as const;

export type Month = keyof typeof monthOrder;

export interface JourneyItem {
  id: string;
  year: string;
  month: Month;
  content: string;
  title?: string;
  image?: string;
}

export const topJourneyData: JourneyItem[] = [
  {
    id: "2014-july",
    year: "2014",
    month: "July",
    title: "Meril-Prothom Alo Nominee",
    content: "Meril-Prothom Alo Awards Nominee — Best Newcomer for silver-screen debut Hitman",
    image: "/images/poster-hitman.jpg",
  },
  {
    id: "2019-november",
    year: "2019",
    month: "November",
    title: "Babisas Best Actress Award",
    content: "Babisas Award Winner — Best Actress in a Leading Role for Begum Jaan",
    image: "/images/award-trophy-stage.jpg",
  },
  {
    id: "2024-january",
    year: "2024",
    month: "January",
    title: "DIFF Best Actress Trophy",
    content: "Dhaka International Film Festival (DIFF) — Best Actress Trophy & Honors Presentation",
    image: "/images/award-diff-stage.jpg",
  },
  {
    id: "2025-december",
    year: "2025",
    month: "December",
    title: "National Star Excellence Crest",
    content: "National Star Excellence Crest — Celebrating 15 Years of Dhallywood Cinema & Acting",
    image: "/images/award-trophy-gala.jpg",
  },
];

export const bottomJourneyData: JourneyItem[] = [
  {
    id: "2016-april",
    year: "2016",
    month: "April",
    title: "Box Office Hit Laurel",
    content: "Commercial Box Office Laurel — Mainstream theatrical success in Miya Bibi Raji",
    image: "/images/gallery-1.jpg",
  },
  {
    id: "2022-december",
    year: "2022",
    month: "December",
    title: "1971 Liberation War Acclaim",
    content: "Liberation War Heritage Cinema Acclaim — Acclaimed lead role as 1971 war heroine in Birangona 71",
    image: "/images/poster-birangona71.jpg",
  },
  {
    id: "2024-march",
    year: "2024",
    month: "March",
    title: "Film Artistes' Guild Crest",
    content: "Bangladesh Film Artistes' Guild Crest — Honored for continuous artistic dedication & industry support",
    image: "/images/gallery-2.jpg",
  },
  {
    id: "2024-november",
    year: "2024",
    month: "November",
    title: "Crystal Trophy & Star of Year",
    content: "Crystal Trophy & Star of the Year — Gala red-carpet felicitation & cultural excellence crest",
    image: "/images/gallery-4.jpg",
  },
];

export const allJourneyItems: JourneyItem[] = [...topJourneyData, ...bottomJourneyData].sort(
  (a, b) => {
    const yearDiff = Number(a.year) - Number(b.year);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder[a.month] - monthOrder[b.month];
  }
);

export const defaultTopJourneyData = topJourneyData;
export const defaultBottomJourneyData = bottomJourneyData;

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export const careerTimeline: TimelineMilestone[] = [
  {
    year: '2010–2013',
    title: 'Television Serials & Early Recognition',
    description: 'Began acting career in landmark television mega-serials including Gulshan Avenue, Ronger Songsar, Bonbala, and Ponditer Mela, gaining nationwide household recognition.'
  },
  {
    year: '2014',
    title: 'Dhallywood Debut in "Hitman"',
    description: 'Made big-screen debut alongside Shakib Khan and Apu Biswas in the Eid-ul-Fitr commercial hit, receiving a nomination for Best Newcomer at the Meril-Prothom Alo Awards.'
  },
  {
    year: '2016–2018',
    title: 'Commercial Cinema & National Campaigns',
    description: 'Headlined mainstream theatrical releases including Miya Bibi Raji and Mon Janena Moner Thikana, while leading television commercials for Pran Fruto and Brittle Biscuit.'
  },
  {
    year: '2019',
    title: 'Babisas Best Actress Award for "Begum Jaan"',
    description: 'Won the prestigious Babisas Award for Best Actress for her lead performance in director Mohammad Aslam\'s feature film Begum Jaan.'
  },
  {
    year: '2022',
    title: 'Historic Period Drama "Birangona 71"',
    description: 'Delivered an emotionally powerful performance as a liberation war heroine in M. S. Rana\'s feature drama honoring 1971 freedom fighters.'
  },
  {
    year: '2023–2024',
    title: 'Theatrical Releases: Ghor Vanga Songsar & Sesh Bazi',
    description: 'Starred alongside Monowar Hossain Dipjol in family drama Ghor Vanga Songsar, followed by action film Jimmi and psychological thriller Sesh Bazi across Bangladesh theaters.'
  },
  {
    year: '2025–Present',
    title: 'Upcoming Feature Productions',
    description: 'Filming and scheduled releases including Bachelor in Trip and Nodir Jole Shapla Bhashe, alongside cultural events and commercial endorsements.'
  }
];

export function computeTimelinePeriodLabel(items?: JourneyItem[]): string {
  const currentYear = new Date().getFullYear();
  if (!items || items.length === 0) {
    return `2014 — ${currentYear}`;
  }
  const years = items
    .map((item) => parseInt(item.year, 10))
    .filter((y) => !isNaN(y) && y >= 1990);
  const startYear = years.length > 0 ? Math.min(...years) : 2014;
  const maxItemYear = years.length > 0 ? Math.max(...years) : currentYear;
  const endYear = Math.max(currentYear, maxItemYear);
  return startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`;
}

export interface TimelineMetaConfig {
  kicker: string;
  title: string;
  sectionSubtitle?: string;
  periodLabel: string;
  image: string;
  imageAlt: string;
  badge?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  images?: string[];
  autoRotate?: boolean;
  rotationInterval?: number; // seconds
}

export const defaultTimelineMeta: TimelineMetaConfig = {
  kicker: "Honors & Accolades",
  title: "Awards & Honors",
  sectionSubtitle: "Chronological journey of prestigious Dhallywood awards, television honors, and film industry recognitions from 2014 to present.",
  periodLabel: computeTimelinePeriodLabel([...topJourneyData, ...bottomJourneyData]),
  image: "/images/award-diff-stage.jpg",
  imageAlt: "Shirin Shila receiving Awards & Trophies",
  badge: "Dhallywood Honors",
  cardTitle: "Recognized Excellence",
  cardSubtitle: "Honoring a decade of memorable cinematic performances across television, mainstream film, and cultural festivals.",
  images: [
    "/images/award-diff-stage.jpg",
    "/images/award-trophy-stage.jpg",
    "/images/award-trophy-gala.jpg",
  ],
  autoRotate: true,
  rotationInterval: 4,
};

export const timelineMeta = defaultTimelineMeta;

export const timeline = careerTimeline;
export default timeline;

