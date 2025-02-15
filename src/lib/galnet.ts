import { parse as parseXML, type xml_document } from "@libs/xml";
import { z } from "zod";

import { createLogger } from "./logger.ts";

const GALNET_URL = "https://community.elitedangerous.com/galnet-rss";

const logger = createLogger("galnet");

const OriginRSSItemSchema = z.object({
  guid: z.object({
    "#text": z.string(),
    "@isPermaLink": z.coerce.boolean(),
  }),
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
});

const OriginRSSChannelSchema = z.object({
  "atom:link": z.object({
    "@href": z.string().url(),
    "@rel": z.string(),
    "@type": z.string(),
  }),
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  language: z.string(),
  item: z.array(OriginRSSItemSchema),
});

const OriginRSSSchema = z.object({
  rss: z.object({
    "@version": z.string(),
    "@xmlns:atom": z.string().url(),
    channel: OriginRSSChannelSchema,
  }),
});

export type OriginRSS = z.infer<typeof OriginRSSSchema>;

export async function getXML(): Promise<xml_document> {
  logger.debug("Fetching GalNet", { url: GALNET_URL });
  const response = await fetch(
    "https://community.elitedangerous.com/galnet-rss",
  );

  logger.trace("Fetched GalNet", { url: GALNET_URL, status: response.status });
  const text = await response.text();

  return parseXML(text);
}

export function getRSS(xml: xml_document): Promise<OriginRSS> {
  return OriginRSSSchema.parseAsync(xml);
}
