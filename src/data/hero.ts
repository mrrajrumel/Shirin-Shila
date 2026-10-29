export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroProfile {
  name: string;
  eyebrow: string;
  roles: string;
  intro: string;
  image: string;
  imageAlt: string;
  indexTag: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  scrollIndicatorText: string;
}

export const heroProfile: HeroProfile = {
  name: "SHIRIN SHILA",
  eyebrow: "Dhallywood Cinema & Fashion",
  roles: "Film Actress • Screen Performer • Fashion Model",
  intro: "A recognized screen presence in Dhallywood cinema, television drama serials, and commercial fashion.",
  image: "/images/shirin-akter.png",
  imageAlt: "Shirin Shila - Bangladeshi Film Actress & Model",
  indexTag: "OFFICIAL PORTFOLIO • 2026 • DHALLYWOOD",
  primaryCta: {
    label: "Watch Showreel",
    href: "#showreel",
  },
  secondaryCta: {
    label: "Get in Touch",
    href: "#contact",
  },
  scrollIndicatorText: "SCROLL TO EXPLORE",
};

export const heroData = heroProfile;
export default heroProfile;
