"use client";

import { useEffect } from "react";

export function WebMcpProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Polyfill container if browser agent provides or expects modelContext
    const nav = window.navigator as any;

    if (!nav.modelContext) {
      nav.modelContext = {
        tools: new Map(),
        registerTool(tool: {
          name: string;
          description: string;
          inputSchema: any;
          execute: (params: any) => Promise<any>;
        }) {
          this.tools.set(tool.name, tool);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("webmcp_tool_registered", { detail: { name: tool.name } })
            );
          }
        },
        getTools() {
          return Array.from(this.tools.values());
        },
      };
    }

    try {
      // 1. Tool: submit_booking_inquiry
      nav.modelContext.registerTool({
        name: "submit_booking_inquiry",
        description:
          "Submit a casting, media appearance, or acting booking inquiry to Shirin Shila management desk",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Full name of producer or casting director" },
            email: { type: "string", description: "Contact email address" },
            phone: { type: "string", description: "Contact telephone or WhatsApp" },
            service: { type: "string", description: "Type of engagement (Feature Film, Commercial, Reality Show Judge)" },
            message: { type: "string", description: "Project brief or character description" },
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
          "Search movies, co-stars, release years, and roles performed by actress Shirin Shila",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search term e.g. Hitman, Begum Jaan, Shakib Khan" },
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

      // 3. Tool: get_biography_and_awards
      nav.modelContext.registerTool({
        name: "get_biography_and_awards",
        description:
          "Retrieve verified biographical background, accolades, and honors for actress Shirin Shila",
        inputSchema: {
          type: "object",
          properties: {},
        },
        execute: async () => {
          const res = await fetch("/api/about");
          return await res.json();
        },
      });
    } catch (err) {
      console.warn("[WebMCP] Tool registration notice:", err);
    }
  }, []);

  return null;
}
