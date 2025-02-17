import config from "./config.ts";

import { createErrorResponse, createSuccessResponse } from "./lib/http.ts";
import { createLogger } from "./lib/logger.ts";

import { fetchRSS, RSSAsXML } from "./models/rss.ts";

const logger = createLogger("main");

Deno.serve(
  { port: config.port },
  async (req) => {
    const start = Date.now();

    let rss;
    try {
      rss = await fetchRSS();
    } catch (error) {
      logger.error("Failed to fetch RSS", { error });
      return createErrorResponse("Failed to fetch RSS", start, req);
    }

    let xml;
    try {
      xml = RSSAsXML(rss);
    } catch (error) {
      logger.error("Failed to generate RSS", { error });
      return createErrorResponse("Failed to generate RSS", start, req);
    }

    return createSuccessResponse(xml, "application/rss+xml", start, req);
  },
);
