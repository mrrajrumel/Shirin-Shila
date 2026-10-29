export interface ShowreelItem {
  id: string;
  title: string;
  banglaTitle?: string;
  category: string;
  duration: string;
  youtubeId: string;
  thumbnail: string;
  year: string;
  director?: string;
  coStar?: string;
  description: string;
  sceneHighlight: string;
}

export const showreelVideos: ShowreelItem[] = [
  {
    id: "showreel-master",
    title: "Official Acting Showreel (2026)",
    banglaTitle: "অফিসিয়াল অভিনয় শোরিল",
    category: "Master Acting Reel",
    duration: "3:42",
    youtubeId: "81k39lq5g7M", // Cinematic Dhallywood performance reel
    thumbnail: "/images/gallery-3.jpg",
    year: "2026",
    director: "Curated Agency Reel",
    coStar: "Shakib Khan, Symon Sadik, Dipjol",
    description: "Curated performance montage featuring dramatic monologues, emotional climaxes, high-stakes romantic conflict, and marquee Dhallywood commercial cinema moments.",
    sceneHighlight: "Emotional range, dialogue delivery, and high-intensity dramatic expression."
  },
  {
    id: "showreel-sheshbazi",
    title: "Shesh Bazi — Crime Thriller Highlights",
    banglaTitle: "শেষ বাজি (থ্রিলার)",
    category: "Psychological Thriller",
    duration: "2:15",
    youtubeId: "0b4BwXqYFao",
    thumbnail: "/images/poster-seshbazi.jpg",
    year: "2024",
    director: "Mehedi Hasan",
    coStar: "Symon Sadik",
    description: "Tense confrontation scenes and neo-noir psychological suspense showcasing Shirin Shila's contemporary dramatic depth.",
    sceneHighlight: "Suspense, vulnerability, and sharp dialogue exchange."
  },
  {
    id: "showreel-begumjaan",
    title: "Begum Jaan — Award-Winning Lead Performance",
    banglaTitle: "বেগম জান (শ্রেষ্ঠ অভিনেত্রী পুরস্কার)",
    category: "Award-Winning Drama",
    duration: "2:48",
    youtubeId: "aU8N3rL6yZg",
    thumbnail: "/images/poster-begum-jaan.jpg",
    year: "2019",
    director: "Mohammad Aslam",
    coStar: "Emon",
    description: "Scenes from the Babisas Award-winning portrayal of titular protagonist Begum Jaan, illustrating transformative character dedication.",
    sceneHighlight: "Title role emotional breakdown and commanding presence."
  },
  {
    id: "showreel-birangona71",
    title: "Birangona 71 — Historical Liberation War Drama",
    banglaTitle: "বীরাঙ্গনা ৭১ (মুক্তিযুদ্ধ ভিত্তিক চলচ্চিত্র)",
    category: "Historical Period Drama",
    duration: "3:05",
    youtubeId: "vB7X5p8c2s0",
    thumbnail: "/images/poster-birangona71.jpg",
    year: "2022",
    director: "M. S. Rana",
    coStar: "Sumon Anwar, Fazlur Rahman Babu",
    description: "Acclaimed depiction of a 1971 liberation war heroine battling against oppression with raw realism and solemn historical gravity.",
    sceneHighlight: "Subtle tearful resistance and monumental historical dignity."
  },
  {
    id: "showreel-jimmi",
    title: "Jimmi — Action & High Stakes Drama",
    banglaTitle: "জিম্মি (অ্যাকশন থ্রিলার)",
    category: "Action & Drama",
    duration: "2:20",
    youtubeId: "jW7Z4v6p8eQ",
    thumbnail: "/images/poster-jimmi.jpg",
    year: "2024",
    director: "Manoar Hossain Dipjol",
    coStar: "Monowar Hossain Dipjol, Misha Sawdagar",
    description: "High-paced commercial entertainment, dynamic crowd scenes, and fast-moving screen staging in mainstream Dhallywood format.",
    sceneHighlight: "Screen charisma and high-energy situational timing."
  },
  {
    id: "showreel-music-visual",
    title: "Kanya Tomare — Musical Video Performance",
    banglaTitle: "কন্যা তোমারে (মিউজিক ভিডিও)",
    category: "Music & Dance Visual",
    duration: "4:12",
    youtubeId: "dZ9K1n4s8aM",
    thumbnail: "/images/gallery-1.jpg",
    year: "2023",
    director: "National TV Broadcast",
    coStar: "Asif Akbar",
    description: "Signature visual styling and graceful dance rhythm starring opposite legendary pop vocalist Asif Akbar.",
    sceneHighlight: "Expressive choreographic poise and vibrant screen glamour."
  }
];

export const showreelMeta = {
  kicker: "Silver Screen Performances",
  titlePrefix: "Show",
  titleHighlight: "reel",
};

export const showreelSpecs = {
  masterFormat: "4K UHD (3840 × 2160) • 24.000 fps",
  colorProfile: "DCI-P3 Cinematic Gamut",
  audioMix: "5.1 Surround / Stereo Mastered",
  languages: "Bengali (Native), English, Hindi",
  castingAgency: "Official Management Desk (Dhaka)",
  unionAffiliation: "Bangladesh Film Artistes' Association (BFAA)",
};

export default showreelVideos;

