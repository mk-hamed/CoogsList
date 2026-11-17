
import { getJSON, makeResult } from "./types.ts";

export async function searchSerpApi(product: string) {
  const key = Deno.env.get("SERPAPI_KEY");
  if (!key) throw new Error("SERPAPI_KEY missing");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", product);
  url.searchParams.set("api_key", key);
  url.searchParams.set("gl", "us");
  url.searchParams.set("hl", "en");

  const data = await getJSON(url.toString());
  if (data.error) throw new Error(data.error);

  return (data.shopping_results ?? [])
    .slice(0, 5)
    .map((item: any) =>
      makeResult(
        item.title,
        item.source ?? "Unknown",
        item.extracted_price ?? null,
        item.extracted_old_price ?? null,
        item.product_link ?? null
      )
    );
}
