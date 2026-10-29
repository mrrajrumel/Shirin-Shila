export interface NavigationItem {
  href: string;
  label: string;
  num: string;
  shape: string;
  targetId: string;
}

export const navigationItems: NavigationItem[] = [
  { href: "#home", label: "Home", num: "01", shape: "1", targetId: "home" },
  { href: "#about", label: "About", num: "02", shape: "2", targetId: "about" },
  { href: "#showreel", label: "Showreel", num: "03", shape: "3", targetId: "showreel" },
  { href: "#filmography", label: "Notable Works", num: "04", shape: "4", targetId: "filmography" },
  { href: "#gallery", label: "Gallery", num: "05", shape: "5", targetId: "gallery" },
  { href: "#timeline", label: "Awards", num: "06", shape: "1", targetId: "timeline" },
  { href: "#press", label: "Press", num: "07", shape: "2", targetId: "press" },
  { href: "#contact", label: "Contact", num: "08", shape: "3", targetId: "contact" },
];

export const navigationMeta = {
  brandName: "SHIRIN SHILA",
  representationEmail: "support@trytso.com",
  subtitle: "Navigation",
  status: "Dhallywood Cinema",
  directPortals: [
    { label: "Press Kit", href: "#press" },
    { label: "Showreel", href: "#showreel" },
  ],
};
