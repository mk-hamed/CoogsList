
/*
 * CoogsList - SerpApi Price Lookup
 *
 * Active API:
 * - SerpApi (Google Shopping)
 *
 * This endpoint searches Google Shopping for products
 * and returns pricing information through SerpApi.
 */

import { searchSerpApi } from "../_shared/serpapi.ts";

// Start the Deno HTTP server.
Deno.serve(async (request: Request): Promise<Response> => {

  // Only allow POST requests.
  if (request.method !== "POST") {
    return Response.json(
      { error: "Only POST requests are supported." },
      { status: 405 }
    );
  }

  try {
    // Read the JSON request body.
    const body = await request.json();

    // Extract the requested product name.
    const product = body?.product;

    // Validate the product name.
    if (
      typeof product !== "string" ||
      !product.trim() ||
      product.length > 100
    ) {
      return Response.json(
        { error: "A valid product name is required." },
        { status: 400 }
      );
    }

    // Remove leading and trailing whitespace.
    const searchProduct = product.trim();

    console.log(`[SerpApi] Searching for: ${searchProduct}`);

    // Search Google Shopping through SerpApi.
    const products = await searchSerpApi(searchProduct);

    console.log(
      `[SerpApi] Found ${products.length} products.`
    );

    // Return the search results.
    return Response.json({
      search: searchProduct,
      timestamp: new Date().toISOString(),
      provider: "SerpApi",
      count: products.length,
      products: products,
    });

  } catch (error) {

    // Log the error for debugging.
    console.error("[SerpApi] Search failed:", error);

    // Return an error without exposing credentials.
    return Response.json(
      { error: "Product search failed." },
      { status: 500 }
    );
  }
});
