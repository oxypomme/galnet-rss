import { assertEquals, assertExists } from "jsr:@std/assert";

import { fetchRSS, RSSAsXML } from "./rss.ts";

const feed = await fetchRSS();
const rss = RSSAsXML(feed);

Deno.test("should be able to add missing fields", () => {
  assertExists(feed);

  const item = feed.rss.channel.item.find((item) => item.link);
  assertExists(item);
  assertExists(item.link["#text"]);
  assertEquals(item.link["#text"].startsWith("https"), true);
  assertEquals(item.guid["#text"].startsWith("https"), true);
  assertEquals(typeof item.guid["@isPermaLink"], "boolean");
  assertEquals(typeof item.pubDate, "string");
});

Deno.test("should output string", () => {
  assertExists(rss);
  assertEquals(typeof rss, "string");
});
