"use client";

import { useEffect } from "react";

/**
 * WebMCP Provider
 * Complies with Phase 11 requirements:
 * Only registers in-browser WebMCP tools when the native or agent browser runtime
 * actually exposes navigator.modelContext. Does not mock or inject artificial
 * properties into unsupported standard consumer browsers.
 */
export function WebMcpProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator as any;

    // Only register tools when native or agent browser support exists
    if (!nav || !nav.modelContext || typeof nav.modelContext.registerTool !== "function") {
      // Browser does not support navigator.modelContext - graceful exit
      return;
    }

    try {
      // 1. Tool: submit_booking_inquiry
      nav.modelContext.registerTool({
        name: "submit_booking_inquiry",
        description:
          "Submit a casting, media appearance, or acting booking inquiry to Shirin Shila talent management desk",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Full name of producer, director, or brand agent" },
            email: { type: "string", description: "Contact email address" },
            phone: { type: "string", description: "Contact telephone or WhatsApp number" },
            service: { type: "string", description: "Type of engagement (Feature Film, Commercial, Reality Show Judge)" },
            message: { type: "string", description: "Project brief or casting scope" },
          },
          required: ["name", "email", "message"],
        },
        execute: async (params: any) => {
          const res = await fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });
          return await res.json();
        },
      });

      // 2. Tool: search_filmography
      nav.modelContext.registerTool({
        name: "search_filmography",
        description:
          "Search movies, co-stars, release years, and character roles performed by actress Shirin Shila",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword e.g. Hitman, Begum Jaan, Shakib Khan" },
          },
        },
        execute: async (params: { query?: string }) => {
          const res = await fetch("/api/works");
          const data = await res.json();
          if (!params.query) return data.items;
          const q = params.query.toLowerCase();
          return (data.items || []).filter(
            (item: any) =>
              item.title?.toLowerCase().includes(q) ||
              item.coStar?.toLowerCase().includes(q) ||
              item.role?.toLowerCase().includes(q)
          );
        },
      });
    } catch (err) {
      console.warn("[WebMCP] Tool registration skipped or failed:", err);
    }
  }, []);

  return null;
}

export default WebMcpProvider;
