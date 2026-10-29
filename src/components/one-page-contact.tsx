"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  CheckCircle2,
  Instagram,
  Facebook,
  Globe,
  Film,
  Youtube,
  FileText,
} from "lucide-react";
import {
  getStoredInquiries,
  saveStoredInquiries,
  getStoredContactInfo,
} from "@/data/storage";
import { ContactInfo, InquiryItem, inquiryTypes, contactMeta } from "@/data/contact";

export interface ContactSectionProps {
  id?: string;
}

function TikTokIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.89.14V9.04a6.28 6.28 0 0 0-.89-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z" />
    </svg>
  );
}

function WikipediaIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h4M10 5h4M17 5h4M4 7l4.5 12L12 9l3.5 10L20 7" />
    </svg>
  );
}

export function OnePageContact({ id = "contact" }: ContactSectionProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "Film & Acting Project",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState("");

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPress, setCopiedPress] = useState(false);

  useEffect(() => {
    const loadContactInfo = () => {
      fetch("/api/contact", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.info) {
            setContactInfo(data.info);
          } else {
            setContactInfo(getStoredContactInfo());
          }
        })
        .catch(() => setContactInfo(getStoredContactInfo()));
    };

    loadContactInfo();

    const handleUpdate = () => {
      loadContactInfo();
    };

    const handlePrefill = (e: any) => {
      if (e && e.detail) {
        setForm((prev) => ({
          ...prev,
          inquiryType: e.detail.inquiryType || prev.inquiryType,
          message: e.detail.message || prev.message,
        }));
        const el = document.getElementById("contact");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("shirin_shila_contact_info_updated", handleUpdate);
    window.addEventListener("shirin_shila_reset", handleUpdate);
    window.addEventListener("shirin_shila_prefill_inquiry", handlePrefill);
    window.addEventListener("storage", (e) => {
      if (e.key === "shirin_shila_sync_contact") loadContactInfo();
    });
    return () => {
      window.removeEventListener("shirin_shila_contact_info_updated", handleUpdate);
      window.removeEventListener("shirin_shila_reset", handleUpdate);
      window.removeEventListener("shirin_shila_prefill_inquiry", handlePrefill);
    };
  }, []);

  const handleCopyEmail = (emailStr: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(emailStr);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleCopyPress = (emailStr: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(emailStr);
      setCopiedPress(true);
      setTimeout(() => setCopiedPress(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setIsSubmitting(true);
    const newId = "inq-" + Date.now().toString().slice(-6);

    const newInquiry: InquiryItem = {
      id: newId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      inquiryType: form.inquiryType as any,
      subject: `${form.inquiryType} from ${form.name.trim()}`,
      message: form.message.trim(),
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    try {
      // 1. Post to Server File Store CRM
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry),
      });

      if (!res.ok) {
        console.warn("Server API returned error, saving locally fallback");
      }
    } catch (err) {
      console.warn("Could not post inquiry to server API:", err);
    }

    // 2. Also keep in client storage for offline reliability
    const existing = getStoredInquiries();
    saveStoredInquiries([newInquiry, ...existing]);

    setIsSubmitting(false);
    setIsSubmitted(true);
    setInquiryId(newId);
    setForm({
      name: "",
      email: "",
      phone: "",
      inquiryType: "Film & Acting Project",
      message: "",
    });
  };

  return (
    <section id={id || "contact"} className="section one-page-contact-section">
      <motion.div
        className="section-head"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <div className="section-kicker">{contactMeta.kicker}</div>
          <h2 className="serif">
            {contactMeta.titlePrefix} <span className="pink">{contactMeta.titleHighlight}</span><br />{contactMeta.titleSuffix}
          </h2>
        </div>
        <p className="muted max-copy">
          {contactMeta.subtitle}
        </p>
      </motion.div>

      <div className="contact-split-grid">
        {/* Left Side: Agency Management Info & Official Verified Channels */}
        <motion.div
          className="contact-info-col"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="management-card">
            <div className="section-kicker" style={{ marginBottom: 8 }}>
              Talent Management Desk
            </div>
            <h3 className="serif management-card-title">Direct Representation</h3>
            <p className="muted management-card-desc">
              Dedicated to managing schedule bookings, Dhallywood feature film contracts, international appearances, and commercial brand campaigns.
            </p>

            <div className="management-details-list">
              <div className="management-detail-row">
                <div className="detail-icon-circle">
                  <Mail size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="detail-label">
                      Management Team: {contactInfo?.agencyName || "Tune Soul Ocean"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(contactInfo?.managementEmail || "support@trytso.com")}
                      className="contact-copy-btn"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <a
                    href={`mailto:${contactInfo?.managementEmail || "support@trytso.com"}`}
                    className="detail-value"
                  >
                    {contactInfo?.managementEmail || "support@trytso.com"}
                  </a>
                </div>
              </div>

              <div className="management-detail-row">
                <div className="detail-icon-circle">
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="detail-label">Press & Media Desk</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPress(contactInfo?.pressEmail || "press@shirinshila.com")}
                      className="contact-copy-btn"
                      title="Copy press email to clipboard"
                    >
                      {copiedPress ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <a
                    href={`mailto:${contactInfo?.pressEmail || "press@shirinshila.com"}`}
                    className="detail-value"
                  >
                    {contactInfo?.pressEmail || "press@shirinshila.com"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Official Social Channels */}
          <div className="channels-card">
            <h4 className="serif channels-card-title">Official Channels & Portals</h4>
            <div className="channels-grid">
              <a
                href={contactInfo?.socials?.facebookProfile || "https://www.facebook.com/shirin.shila.5"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <Facebook size={16} color="var(--pink)" />
                <span>Facebook ID</span>
              </a>

              <a
                href={contactInfo?.socials?.facebookPage || "https://www.facebook.com/shirinshilaofficial"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <Facebook size={16} color="var(--pink)" />
                <span>Facebook Page</span>
              </a>

              <a
                href={contactInfo?.socials?.instagram || "https://www.instagram.com/shirin_shila"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <Instagram size={16} color="var(--pink)" />
                <span>Instagram Profile</span>
              </a>

              <a
                href={contactInfo?.socials?.youtube || "https://www.youtube.com/@shirinshilaofficial"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <Youtube size={16} color="var(--pink)" />
                <span>YouTube Channel</span>
              </a>

              <a
                href={contactInfo?.socials?.tiktok || "https://www.tiktok.com/@shirinshilaofficial"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <TikTokIcon size={16} color="var(--pink)" />
                <span>TikTok Profile</span>
              </a>

              <a
                href={contactInfo?.socials?.imdb || "https://www.imdb.com/name/nm6897284/"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <Film size={16} color="var(--pink)" />
                <span>IMDb Filmography</span>
              </a>

              <a
                href={contactInfo?.socials?.wikipedia || "https://bn.wikipedia.org/wiki/%E0%A6%B6%E0%A6%BF%E0%A6%B0%E0%A6%BF%E0%A6%A8_%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A6%BE"}
                target="_blank"
                rel="noreferrer"
                className="channel-link-box"
              >
                <WikipediaIcon size={16} color="var(--pink)" />
                <span>Wikipedia Article</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Interactive Booking Inquiry Form */}
        <motion.div
          className="contact-form-col"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="booking-form-box">
            <h3 className="serif form-box-title">Send a Booking Inquiry</h3>
            <p className="muted form-box-subtitle">
              Please provide details about your project, tentative shooting timeline, and organization. Submissions route directly to Shirin Shila's management desk.
            </p>

            {isSubmitted ? (
              <div className="form-success-card">
                <CheckCircle2 size={46} color="var(--pink)" className="success-icon" />
                <h4 className="serif success-title">
                  Inquiry Received <span className="pink">#{inquiryId}</span>
                </h4>
                <p className="muted success-text">
                  Thank you. Your message has been routed to Shirin Shila&apos;s talent management desk with tracking reference{" "}
                  <strong className="pink">#{inquiryId}</strong>. Our representative will get back to you within 24–48 business hours.
                </p>
                <div className="success-actions-row">
                  <button
                    type="button"
                    className="button"
                    onClick={() => setIsSubmitted(false)}
                  >
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="booking-form-fields">
                <div className="form-field-group">
                  <label className="field-lbl">Your Name / Production House *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Bangladesh Film Development Corp / Brand Agency"
                    className="field-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field-group">
                    <label className="field-lbl">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="producer@studio.com"
                      className="field-input"
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="field-lbl">Contact Phone (Optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+880 1..."
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="field-lbl">Project / Inquiry Type *</label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    className="field-select"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="field-lbl">Project Details, Role & Scope *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Please include project background, director credentials, anticipated timeline, and character or campaign scope..."
                    className="field-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button form-submit-btn"
                >
                  <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Project Inquiry"}</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { OnePageContact as ContactSection };
export default OnePageContact;

