import { getRSS, getXML } from "./lib/galnet.ts";
import { galnetToXML, transformOriginToGalnet } from "./lib/rss.ts";

Deno.serve(async (_req) => {
  const document = await getXML();
  const origin = await getRSS(document);
  const feed = transformOriginToGalnet(origin);
  const output = galnetToXML(feed);
  return new Response(
    output,
    { headers: { "Content-Type": origin.rss.channel["atom:link"]["@type"] } },
  );
});
