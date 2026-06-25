/**
 * Currency formatting utilities for SuperLista
 */

export type CurrencyCode = "CLP" | "$" | "€" | "S/" | "Mex$" | "¢" | "R$";

const LOCALE_MAP: Record<CurrencyCode, string> = {
  "CLP": "es-CL",
  "$": "es-CL",
  "€": "de-DE",
  "S/": "es-PE",
  "Mex$": "es-MX",
  "¢": "es-CR",
  "R$": "pt-BR",
};

const CURRENCY_CODE_MAP: Record<CurrencyCode, string> = {
  "CLP": "CLP",
  "$": "USD",
  "€": "EUR",
  "S/": "PEN",
  "Mex$": "MXN",
  "¢": "CRC",
  "R$": "BRL",
};

/**
 * Format a number as currency string.
 * For CLP: no decimals (pounds don't have cents).
 * For others: 2 decimals.
 */
export function formatCurrency(value: number, currency: CurrencyCode = "CLP"): string {
  const locale = LOCALE_MAP[currency] || "es-CL";
  const code = CURRENCY_CODE_MAP[currency] || "CLP";
  const hasDecimals = currency !== "CLP";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(value);
  } catch {
    // Fallback
    return `${currency} ${value.toLocaleString("es-CL", { maximumFractionDigits: hasDecimals ? 2 : 0 })}`;
  }
}
