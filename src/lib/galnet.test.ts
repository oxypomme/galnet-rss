import { assertExists, assertGreaterOrEqual } from "jsr:@std/assert";

import { getRSS, getXML } from "./galnet.ts";

const document = await getXML();

Deno.test("should able to get document", () => {
  assertExists(document);
});

Deno.test("is an rss feed", async () => {
  const { rss } = await getRSS(document);
  assertExists(rss);
  assertExists(rss.channel);
});

Deno.test("has items", async () => {
  const { rss } = await getRSS(document);
  assertExists(rss.channel.item);
  assertGreaterOrEqual(rss.channel.item.length, 1);
});
