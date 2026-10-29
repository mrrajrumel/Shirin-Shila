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

export const footerData: FooterData = {
  brandName: "SHIRIN SHILA",
  brandHighlight: ".",
  tagline: "Dhallywood Film Actress • Fashion Model • Screen Performer",
  copyright: "© 2026 Shirin Shila. All rights reserved.",
  backToTopText: "Back to top",
  adminPortalTitle: "Management Portal",
  links: [
    { label: "Home", href: "#home" },
    { label: "Showreel", href: "#showreel" },
    { label: "About", href: "#about" },
    { label: "Filmography", href: "#filmography" },
    { label: "Gallery", href: "#gallery" },
    { label: "Timeline", href: "#timeline" },
    { label: "Press", href: "#press" },
    { label: "Contact", href: "#contact" },
  ],
};

export default footerData;
