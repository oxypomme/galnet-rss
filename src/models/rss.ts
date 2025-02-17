import { z } from "zod";
import { stringify as stringifyXML } from "@libs/xml";

import config from "../config.ts";
import {
  type BaseGalNetRSSItem,
  fetchGalNetRSS,
  getDateFromGalNetEntry,
} from "../lib/galnet.ts";

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

export type GalNetRSSItem = z.infer<typeof GalNetRSSItemSchema>;

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

const transformRSSItem = async (
  item: BaseGalNetRSSItem,
): Promise<GalNetRSSItem> => ({
  guid: {
    "#text": `${config.galnet.webUrl}/uid/${item.guid["#text"]}`,
    "@isPermaLink": item.guid["@isPermaLink"],
  },
  link: { "#text": `${config.galnet.webUrl}/uid/${item.guid["#text"]}` },
  title: item.title,
  description: item.description,
  pubDate: (await getDateFromGalNetEntry(item.guid["#text"])).toUTCString(),
});

export async function fetchRSS(): Promise<GalNetRSS> {
  const { rss } = await fetchGalNetRSS();

  return GalNetRSSSchema.parseAsync({
    rss: {
      ...rss,
      channel: {
        ...rss.channel,
        link: config.galnet.rssUrl,
        item: await Promise.all(
          rss.channel.item.map((i) => transformRSSItem(i)),
        ),
      },
    },
  });
}

export function RSSAsXML(rss: GalNetRSS): string {
  return stringifyXML(rss);
}
