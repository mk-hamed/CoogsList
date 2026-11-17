
export interface ShoppingResult {
  title: string;
  source: string;
  isOnSale: boolean | null;
  originalPrice: number | null;
  currentPrice: number | null;
  discountPercentage: number | null;
  url: string | null;
  currency: string;
}

export function makeResult(
  title: string,
  source: string,
  currentPrice: number | null,
  originalPrice: number | null,
  url: string | null,
  currency = "USD"
): ShoppingResult {
  const valid =
    currentPrice !== null &&
    originalPrice !== null &&
    originalPrice > 0;

  const isOnSale = valid
    ? originalPrice > currentPrice!
    : null;

  const discountPercentage =
    isOnSale === true
      ? Math.round(
          ((originalPrice! - currentPrice!) /
            originalPrice!) * 100
        )
      : null;

  return {
    title,
    source,
    isOnSale,
    originalPrice,
    currentPrice,
    discountPercentage,
    url,
    currency,
  };
}

export async function getJSON(
  url: string,
  options?: RequestInit
): Promise<any> {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
