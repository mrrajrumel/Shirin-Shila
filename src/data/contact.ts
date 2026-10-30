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

export const initialInquiries: InquiryItem[] = [];

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

