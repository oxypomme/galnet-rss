import { assertEquals, assertExists } from "jsr:@std/assert";

import { getRSS, getXML } from "./galnet.ts";
import { galnetToXML, transformOriginToGalnet } from "./rss.ts";

const document = await getXML();
const origin = await getRSS(document);
const feed = transformOriginToGalnet(origin);
const output = galnetToXML(feed);

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
  assertExists(output);
  assertEquals(typeof output, "string");
});
