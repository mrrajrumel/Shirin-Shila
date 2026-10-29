import React from "react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ShowreelSection from "@/components/showreel-section";
import FilmographySection from "@/components/filmography-section";
import GallerySection from "@/components/gallery-section";
import TimelineSection from "@/components/timeline-section";
import PressSection from "@/components/press-section";
import ContactSection from "@/components/contact-section";
import MediaTickerSection from "@/components/media-ticker-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="one-page-portfolio-main">
      {/* 1. Sticky header with smooth scroll anchor links */}
      <Navbar />

      {/* 2. Cinematic introduction, name, tags, and primary CTAs */}
      <HeroSection id="home" />

      {/* 3. Biographical journey & profile highlights */}
      <AboutSection id="about" />

      {/* 4. Pure Video Gallery Showreel (Under About) */}
      <ShowreelSection id="showreel" />

      {/* 5. Poster carousel with category tabs (including TV Show Judge) */}
      <FilmographySection id="filmography" />

      {/* 6. Visual Parallax Gallery */}
      <GallerySection id="gallery" />

      {/* 7. Awards & Honors Milestone Timeline */}
      <TimelineSection id="timeline" />

      {/* 8. Media coverage, newspaper clippings, and interviews */}
      <PressSection id="press" />

      {/* 9. Talent management desk, official social portals, and inquiry form */}
      <ContactSection id="contact" />

      {/* 10. Auto Ticker: Television Channels, Broadcasters & Film Studios */}
      <MediaTickerSection id="broadcasters" />

      {/* 11. Copyright and back to top */}
      <Footer />
    </main>
  );
}
