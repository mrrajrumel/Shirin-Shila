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
import { readStore, TimelineStoreData } from "@/lib/server-storage";
import { heroProfile, HeroProfile } from "@/data/hero";
import { aboutData } from "@/data/about";
import { showreelVideos, ShowreelItem } from "@/data/showreel";
import { filmography, ProjectItem } from "@/data/filmography";
import { galleryImages, GalleryImage } from "@/data/gallery";
import { defaultTopJourneyData, defaultBottomJourneyData, careerTimeline } from "@/data/timeline";
import { pressItems, PressItem } from "@/data/press";
import { initialContactInfo, ContactInfo } from "@/data/contact";
import { defaultMediaPartners, MediaPartner } from "@/data/media-partners";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [
    hero,
    about,
    showreels,
    works,
    gallery,
    timeline,
    press,
    contact,
    mediaPartners,
  ] = await Promise.all([
    readStore<HeroProfile>("hero").catch(() => heroProfile),
    readStore<any>("about").catch(() => aboutData),
    readStore<ShowreelItem[]>("showreels").catch(() => showreelVideos),
    readStore<ProjectItem[]>("filmography").catch(() => filmography),
    readStore<GalleryImage[]>("gallery").catch(() => galleryImages),
    readStore<TimelineStoreData>("timeline").catch(() => ({
      top: defaultTopJourneyData,
      bottom: defaultBottomJourneyData,
      milestones: careerTimeline,
    })),
    readStore<PressItem[]>("press").catch(() => pressItems),
    readStore<ContactInfo>("contactInfo").catch(() => initialContactInfo),
    readStore<MediaPartner[]>("mediaPartners").catch(() => defaultMediaPartners),
  ]);

  return (
    <main className="one-page-portfolio-main">
      {/* 1. Sticky header with smooth scroll anchor links */}
      <Navbar />

      {/* 2. Cinematic introduction, name, tags, and primary CTAs */}
      <HeroSection id="home" initialProfile={hero || heroProfile} />

      {/* 3. Biographical journey & profile highlights */}
      <AboutSection id="about" initialData={about || aboutData} />

      {/* 4. Pure Video Gallery Showreel (Under About) */}
      <ShowreelSection id="showreel" initialVideos={showreels && showreels.length > 0 ? showreels : showreelVideos} />

      {/* 5. Poster carousel with category tabs (including TV Show Judge) */}
      <FilmographySection id="filmography" initialItems={works && works.length > 0 ? works : filmography} />

      {/* 6. Visual Parallax Gallery */}
      <GallerySection id="gallery" initialImages={gallery && gallery.length > 0 ? gallery : galleryImages} />

      {/* 7. Awards & Honors Milestone Timeline */}
      <TimelineSection
        id="timeline"
        topData={timeline?.top && timeline.top.length > 0 ? timeline.top : defaultTopJourneyData}
        bottomData={timeline?.bottom && timeline.bottom.length > 0 ? timeline.bottom : defaultBottomJourneyData}
      />

      {/* 8. Media coverage, newspaper clippings, and interviews */}
      <PressSection id="press" initialItems={press && press.length > 0 ? press : pressItems} />

      {/* 9. Talent management desk, official social portals, and inquiry form */}
      <ContactSection id="contact" initialInfo={contact || initialContactInfo} />

      {/* 10. Auto Ticker: Television Channels, Broadcasters & Film Studios */}
      <MediaTickerSection id="broadcasters" initialPartners={mediaPartners && mediaPartners.length > 0 ? mediaPartners : defaultMediaPartners} />

      {/* 11. Copyright and back to top */}
      <Footer />
    </main>
  );
}
