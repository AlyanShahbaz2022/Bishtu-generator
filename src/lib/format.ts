/** Formatting helpers shared across the app. */

const PKR = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

/** Format a number as Pakistani Rupees, e.g. 950000 → "PKR 950,000". */
export function formatPrice(value: number): string {
  return PKR.format(value);
}
