export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterData {
  brandName: string;
  brandHighlight: string;
  tagline: string;
  copyright: string;
  backToTopText: string;
  adminPortalTitle: string;
  links: FooterLink[];
}

export const defaultFooterLinks: FooterLink[] = [
  { label: "About Actor", href: "/about" },
  { label: "Contact and Book", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Representation", href: "/terms" },
  { label: "llms.txt", href: "/llms.txt" },
];

export const footerData: FooterData = {
  brandName: "SHIRIN SHILA",
  brandHighlight: ".",
  tagline: "Dhallywood Film Actress • Fashion Model • Screen Performer",
  copyright: "© 2026 Shirin Shila. All rights reserved.",
  backToTopText: "Back to top",
  adminPortalTitle: "Management Portal",
  links: defaultFooterLinks,
};

export default footerData;
