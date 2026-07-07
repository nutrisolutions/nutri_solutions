/** Parse display strings like "240+", "4.9", or "4+" into count-up parts. */
export function parseStatValue(value) {
  const str = String(value ?? "").trim();
  const match = str.match(/^([\d.]+)(.*)$/);
  if (!match) {
    return { target: 0, suffix: str, decimals: 0 };
  }

  const numStr = match[1];
  const target = parseFloat(numStr);
  const suffix = match[2] || "";
  const decimalPart = numStr.split(".")[1];
  const decimals = decimalPart ? decimalPart.length : 0;

  return { target: Number.isFinite(target) ? target : 0, suffix, decimals };
}

export function formatStatValue(n, decimals, suffix) {
  const rounded = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
  return `${rounded}${suffix}`;
}
