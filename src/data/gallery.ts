export interface GalleryImage {
  src: string;
  label: string;
  category: string;
  year: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  alt: string;
  title: string;
  category: string;
  year: string;
}

export const galleryMeta = {
  kicker: 'Visual Archive',
  title: 'Gallery',
  subtitle: 'Scroll to explore red carpet moments, cinematic stills, and exclusive editorial captures.',
};

export const galleryImages: GalleryImage[] = [
  {
    src: '/images/award-diff-stage.jpg',
    label: 'DIFF Best Actress Trophy',
    category: 'International Film Honor',
    year: '2024',
  },
  {
    src: '/images/award-trophy-gala.jpg',
    label: 'Crystal Trophy & Star of the Year',
    category: 'Red Carpet Gala',
    year: '2024',
  },
  {
    src: '/images/award-trophy-stage.jpg',
    label: 'Babisas Best Actress Honor',
    category: 'National Recognition',
    year: '2019',
  },
  {
    src: '/images/gallery-1.jpg',
    label: 'Dhaka Film Festival Red Carpet',
    category: 'Award Ceremony Gala',
    year: '2023',
  },
  {
    src: '/images/award-diff-stage.jpg',
    label: 'Podium Address & Best Actress',
    category: 'Stage Presentation',
    year: '2024',
  },
  {
    src: '/images/gallery-2.jpg',
    label: "Film Artistes' Guild Crest",
    category: 'Industry Recognition',
    year: '2024',
  },
  {
    src: '/images/poster-begum-jaan.jpg',
    label: 'Begum Jaan (Best Actress Winner)',
    category: 'Award-Winning Feature',
    year: '2019',
  },
  {
    src: '/images/award-trophy-gala.jpg',
    label: 'Photocall with Golden Crest',
    category: 'Awards Red Carpet',
    year: '2024',
  },
  {
    src: '/images/gallery-3.jpg',
    label: 'Gala Traditional Honors',
    category: 'Award Night Presence',
    year: '2025',
  },
  {
    src: '/images/award-trophy-stage.jpg',
    label: 'Stage Felicitation & Trophy',
    category: 'Film Awards Gala',
    year: '2019',
  },
  {
    src: '/images/gallery-4.jpg',
    label: 'Cultural Crest & Media Recognition',
    category: 'Cultural Award',
    year: '2024',
  },
  {
    src: '/images/award-diff-stage.jpg',
    label: 'Honors Presentation at DIFF',
    category: 'Festival Honors',
    year: '2024',
  },
];

// Re-map for any components expecting galleryItems format
export const galleryItems: GalleryItem[] = galleryImages.map((img, idx) => ({
  id: `gallery-item-${idx + 1}`,
  url: img.src,
  alt: img.label,
  title: img.label,
  category: img.category,
  year: img.year,
}));

export const galleryData = {
  meta: galleryMeta,
  images: galleryImages,
  items: galleryItems,
};

export default galleryImages;
