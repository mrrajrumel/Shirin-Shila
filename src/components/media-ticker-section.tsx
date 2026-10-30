"use client";

import React, { useState, useEffect } from "react";
import { defaultMediaPartners, MediaPartner, mediaPartnersMeta } from "@/data/media-partners";

export function MediaTickerSection({
  id = "media-ticker",
  initialPartners,
}: {
  id?: string;
  initialPartners?: MediaPartner[];
}) {
  const [partners, setPartners] = useState<MediaPartner[]>(
    initialPartners && initialPartners.length > 0 ? initialPartners : defaultMediaPartners
  );

  const loadPartners = () => {
    fetch("/api/media-partners", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setPartners(data.items);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!initialPartners || initialPartners.length === 0) {
      loadPartners();
    }

    const handleUpdate = () => {
      loadPartners();
    };

    window.addEventListener("shirin_shila_partners_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_partners") loadPartners();
    });

    return () => {
      window.removeEventListener("shirin_shila_partners_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
    };
  }, []);

  // Duplicate list to achieve continuous seamless loop
  const tickerItems = [...partners, ...partners];

  return (
    <section id={id} className="media-ticker-section">
      <div className="media-ticker-header">
        <div className="section-kicker">{mediaPartnersMeta.kicker}</div>
        <h3 className="serif media-ticker-title">
          {mediaPartnersMeta.title}
        </h3>
        <p className="muted media-ticker-desc">
          {mediaPartnersMeta.subtitle}
        </p>
      </div>

      <div className="media-ticker-track-wrapper">
        <div className="media-ticker-fade-left" />
        <div className="media-ticker-fade-right" />

        <div className="media-ticker-track">
          {tickerItems.map((partner, idx) => (
            <div
              key={`${partner.id}-${idx}`}
              className="media-logo-card"
              title={`${partner.name}${partner.banglaName ? ` (${partner.banglaName})` : ""}`}
            >
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noreferrer"
                  className="media-logo-link"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="media-logo-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/logos/channel-i.svg";
                    }}
                  />
                </a>
              ) : (
                <div className="media-logo-link">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="media-logo-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/logos/channel-i.svg";
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MediaTickerSection;
