export interface SocialChannels {
  facebookProfile: string;
  facebookPage: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  imdb: string;
  wikipedia: string;
  googleKnowledgePanel?: string;
}

export interface ContactInfo {
  managementEmail: string;
  pressEmail: string;
  agencyName?: string;
  socials: SocialChannels;
  representationNotes: string;
}

export const inquiryTypes = [
  { value: "Film & Acting Project", label: "Film & Acting Project" },
  { value: "Brand Endorsement", label: "Brand Endorsement & Commercials" },
  { value: "Television Drama", label: "Television / OTT Mega-Serial" },
  { value: "Press & Interview", label: "Press, Interview & Media Feature" },
  { value: "Red Carpet & Event", label: "Event Appearance & Stage Performance" },
  { value: "General Inquiry", label: "General Inquiry" },
] as const;

export type InquiryType = (typeof inquiryTypes)[number]['value'];

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: InquiryType;
  subject?: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
  notes?: string;
}

export const initialContactInfo: ContactInfo = {
  managementEmail: 'support@trytso.com',
  pressEmail: 'press@shirinshila.com',
  agencyName: 'Tune Soul Ocean',
  socials: {
    facebookProfile: 'https://www.facebook.com/shirin.shila.5',
    facebookPage: 'https://www.facebook.com/shirinshilaofficial',
    instagram: 'https://www.instagram.com/shirin_shila',
    youtube: 'https://www.youtube.com/@shirinshilaofficial',
    tiktok: 'https://www.tiktok.com/@shirinshilaofficial',
    imdb: 'https://www.imdb.com/name/nm6897284/',
    wikipedia: 'https://bn.wikipedia.org/wiki/%E0%A6%B6%E0%A6%BF%E0%A6%B0%E0%A6%BF%E0%A6%A8_%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A6%BE',
    googleKnowledgePanel: 'https://share.google/t32VCGGg4i72ZQ1nq',
  },
  representationNotes: 'For feature film contracts, commercial endorsements, television appearances, and festival screenings, please send inquiries with detailed project outlines and schedules.',
};

export const initialInquiries: InquiryItem[] = [
  {
    id: 'inq-101',
    name: 'Mustafizur Rahman',
    email: 'm.rahman@dhakafilms.com',
    phone: '+880 1712-345678',
    inquiryType: 'Film & Acting Project',
    subject: 'Lead Role Casting for Upcoming Dhallywood Feature (2026)',
    message: 'We are in pre-production for a mainstream psychological drama directed by a National Film Award-winning director. We would like to send the script and schedule a meeting with Shirin Shila for the female lead character.',
    date: '2026-10-24',
    status: 'New',
  },
  {
    id: 'inq-102',
    name: 'Farhana Hossain',
    email: 'farhana@creativewave.agency',
    phone: '+880 1819-987654',
    inquiryType: 'Brand Endorsement',
    subject: 'Nationwide Commercial Campaign - Premium Jamdani Sarees',
    message: 'Seeking Shirin Shila as the brand ambassador for our upcoming Eid-ul-Fitr TV commercial and national billboard campaign. Two-day shoot in Dhaka.',
    date: '2026-10-22',
    status: 'Read',
    notes: 'Requested rate card and availability window.',
  },
  {
    id: 'inq-103',
    name: 'Kamal Ahmed',
    email: 'entertainment@dailystar.net',
    phone: '+880 1911-223344',
    inquiryType: 'Press & Interview',
    subject: 'Exclusive Feature Interview: "A Decade in Dhallywood"',
    message: 'The Daily Star Showbiz section requests an in-depth retrospective interview discussing her transition from TV serials to landmark films like Begum Jaan and Sesh Bazi.',
    date: '2026-10-18',
    status: 'Replied',
    notes: 'Interview scheduled for next Thursday at 3 PM.',
  },
];

export const contactMeta = {
  kicker: "Professional Inquiries",
  titlePrefix: "Representation",
  titleHighlight: "&",
  titleSuffix: "Bookings.",
  subtitle: "For feature film casting, commercial endorsements, television projects, red carpet appearances, and press interviews, connect directly with Shirin Shila's talent management desk.",
};

export const contactData = {
  meta: contactMeta,
  info: initialContactInfo,
  inquiries: initialInquiries,
  inquiryTypes,
};

export default contactData;

