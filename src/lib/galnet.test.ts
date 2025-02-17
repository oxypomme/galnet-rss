import {
  assertExists,
  assertGreaterOrEqual,
  assertLess,
  assertNotEquals,
} from "jsr:@std/assert";

import { fetchGalNetRSS, getDateFromGalNetEntry } from "./galnet.ts";

const document = await fetchGalNetRSS();

Deno.test("should able to get document", () => {
  assertExists(document);
});

Deno.test("is an rss feed", () => {
  assertExists(document.rss);
  assertExists(document.rss.channel);
});

Deno.test("has items", () => {
  assertExists(document.rss.channel.item);
  assertGreaterOrEqual(document.rss.channel.item.length, 1);
});

Deno.test("should able to get valid date", async () => {
  const date = await getDateFromGalNetEntry(
    document.rss.channel.item[0].guid["#text"],
  );
  assertExists(date);
  assertNotEquals(date.getTime(), Number.NaN);
  assertLess(date.getTime(), Date.now());
});
