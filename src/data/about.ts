import { careerTimeline, timeline, TimelineMilestone } from './timeline';

export interface ProfileFact {
  label: string;
  value: string;
  isHighlight?: boolean;
}

export const profileFacts: ProfileFact[] = [
  { label: 'Screen Name', value: 'Shirin Shila (Shirin Akter)' },
  { label: 'Origin', value: 'Dhaka, Bangladesh' },
  { label: 'Career', value: '10+ Years in Cinema & TV' },
  { label: 'Silver Screen Debut', value: 'Hitman (2014)' },
  { label: 'Key Award', value: 'Babisas Best Actress (Begum Jaan)', isHighlight: true },
  { label: 'Languages', value: 'Bengali, English, Hindi' },
  { label: 'Representation', value: 'management@shirinshila.com' },
];

export const compCardData = {
  title: 'Official Comp Card (2026)',
  fileName: 'Shirin_Shila_Comp_Card_2026.pdf',
  fileSize: 'PDF Document',
  lastUpdated: 'Season 2026',
  downloadUrl: '/documents/Shirin_Shila_Comp_Card_2026.pdf',
};

export const aboutMeta = {
  sectionTitle: 'About',
  sectionHighlight: 'Shirin Shila',
  portraitSrc: '/images/gallery-3.jpg',
  portraitAlt: 'Shirin Shila Portrait',
  cardTitle: 'Profile Highlights',
  compCardDownloadText: 'Download Comp Card (PDF)',
};

export const biography = {
  heading: "From Dhaka's Stages to the Heart of Dhallywood Cinema",
  paragraphs: [
    "Shirin Shila (Shirin Akter) was born and raised in Dhaka, discovering her love for performing arts and dance at a very young age. With natural expressive charm and dedicated training, she first connected with families across Bangladesh through beloved television drama serials including Gulshan Avenue, Ronger Songsar, and Bonbala.",
    "Her journey onto the big screen began in 2014 with the hit Eid release 'Hitman', starring opposite superstar Shakib Khan. The film's warm reception established her as one of Dhallywood's most exciting young talents, earning her a Best Newcomer nomination at the Meril-Prothom Alo Awards.",
    "In 2019, Shirin reached a defining milestone with 'Begum Jaan', where her powerful, deeply emotional lead performance won her the prestigious Babisas Award for Best Actress. She followed this with the historical liberation war drama 'Birangona 71', portraying courage and sacrifice with solemn grace.",
    "Whether headlining psychological crime thrillers like 'Shesh Bazi', commercial cinema features like 'Ghor Vanga Songsar' and 'Jimmi', or graceful musical visuals like 'Kanya Tomare' with Asif Akbar, Shirin brings dedication, energy, and authentic warmth to every character she brings to life.",
    "Beyond feature films, Shirin has served as an honored celebrity judge (বিচারক) and jury panelist on premier national dance reality shows, talent hunt competitions, and cultural grand finales across Bangladesh's leading television networks."
  ]
};

export const aboutData = {
  meta: aboutMeta,
  biography,
  profileFacts,
  compCardData,
  timeline,
};

export default aboutData;
export { careerTimeline, timeline };
export type { TimelineMilestone };
