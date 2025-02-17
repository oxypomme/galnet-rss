import config from "../config.ts";
import { parse as parseXML } from "@libs/xml";
import { DOMParser, type HTMLDocument } from "@b-fuze/deno-dom";

import { createLogger } from "./logger.ts";

const domParser = new DOMParser();
const logger = createLogger("galnet");
export type BaseGalNetRSSItem = {
  guid: {
    "#text": string;
    "@isPermaLink": boolean;
  };
  title: string;
  description: string;
  pubDate: Date;
};

export type BaseGalNetRSSChannel = {
  "atom:link": {
    "@href": string;
    "@rel": string;
    "@type": string;
  };
  title: string;
  description: string;
  link: string;
  language: string;
  item: BaseGalNetRSSItem[];
};

export type BaseGalNetRSS = {
  rss: {
    "@version": string;
    "@xmlns:atom": string;
    channel: BaseGalNetRSSChannel;
  };
};

export async function fetchGalNetRSS(): Promise<BaseGalNetRSS> {
  logger.debug("Fetching GalNet RSS", { url: config.galnet.rssUrl });
  const response = await fetch(config.galnet.rssUrl);
  logger.trace("Fetched GalNet RSS", {
    url: config.galnet.rssUrl,
    status: response.status,
  });
  const text = await response.text();

  return parseXML(text) as unknown as BaseGalNetRSS;
}

async function fetchGalNetEntry(guid: string): Promise<HTMLDocument> {
  const url = `${config.galnet.webUrl}/uid/${guid}`;
  logger.debug("Fetching GalNet entry", { url });
  const response = await fetch(url);
  logger.trace("Fetched GalNet entry", { url, status: response.status });
  const text = await response.text();

  return domParser.parseFromString(text, "text/html");
}

const dateCache = new Map<string, Date>();
export async function getDateFromGalNetEntry(guid: string): Promise<Date> {
  if (!dateCache.has(guid)) {
    const entry = await fetchGalNetEntry(guid);
    const dateEl = entry.querySelector(
      "div.article > h3.galnetNewsArticleTitle+div > p",
    );
    if (!dateEl) {
      throw new Error("No date element found in entry");
    }
    const date = new Date(dateEl.textContent);
    date.setFullYear(date.getFullYear() - config.galnet.yearOffset);
    dateCache.set(guid, date);
  }
  return dateCache.get(guid)!;
}
