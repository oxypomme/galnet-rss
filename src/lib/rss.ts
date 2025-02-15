import { z } from "zod";
import { stringify as stringifyXML } from "@libs/xml";

import type { OriginRSS } from "./galnet.ts";

const GALNET_BASE_URL = "https://community.elitedangerous.com/galnet";

const GalNetRSSItemSchema = z.object({
  guid: z.object({
    "#text": z.string(),
    "@isPermaLink": z.coerce.boolean(),
  }),
  link: z.object({
    "#text": z.string().url(),
  }),
  title: z.string(),
  description: z.string(),
  pubDate: z.string(),
});

const GalNetRSSChannelSchema = z.object({
  "atom:link": z.object({
    "@href": z.string().url(),
    "@rel": z.string(),
    "@type": z.string(),
  }),
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  language: z.string(),
  item: z.array(GalNetRSSItemSchema),
});

const GalNetRSSSchema = z.object({
  rss: z.object({
    "@version": z.string(),
    "@xmlns:atom": z.string().url(),
    channel: GalNetRSSChannelSchema,
  }),
});

export type GalNetRSS = z.infer<typeof GalNetRSSSchema>;

export function transformOriginToGalnet(origin: OriginRSS): GalNetRSS {
  const { rss } = origin;

  const item = rss.channel.item.map((
    item,
  ): z.infer<typeof GalNetRSSItemSchema> => ({
    ...item,
    guid: {
      ...item.guid,
      "#text": `${GALNET_BASE_URL}/uid/${item.guid["#text"]}`,
    },
    link: { "#text": `${GALNET_BASE_URL}/uid/${item.guid["#text"]}` },
    pubDate: item.pubDate.toISOString(),
  }));

  return GalNetRSSSchema.parse({
    rss: {
      ...rss,
      channel: {
        ...rss.channel,
        item,
      },
    },
  });
}

export function galnetToXML(feed: GalNetRSS) {
  return stringifyXML(feed);
}
