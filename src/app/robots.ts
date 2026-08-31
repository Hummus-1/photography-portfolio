import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Comprehensive list of known AI scrapers, crawler bots, and automated dataset collectors
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "CCBot",              // Common Crawl
    "Google-Extended",     // Google Gemini / Vertex AI dataset crawler
    "ClaudeBot",          // Anthropic Claude
    "anthropic-ai",
    "Bytespider",          // ByteDance / TikTok AI
    "Diffbot",
    "ImagesiftBot",
    "PerplexityBot",
    "cohere-ai",
    "Omgilibot",
    "FacebookBot",         // Meta AI
    "meta-externalagent",
    "Scrapy",
    "Amazonbot",
    "Applebot-Extended",
    "Timpibot",
    "VelenPublicWebCrawler",
    "YouBot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/limonada", "/api/"],
      },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        disallow: "/",
      })),
    ],
  };
}
