const COLORS = ["#6d63d6", "#3cba86", "#5b8def", "#e2a23b", "#e06b8a", "#62a37e", "#8b6fd4"];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const text = parts.map((part) => part[0]?.toUpperCase() || "").join("");
  return text || "?";
}

export function hue(name: string) {
  let index = 0;
  for (const char of name) index = (index + char.charCodeAt(0)) % COLORS.length;
  return COLORS[index] || COLORS[0];
}

export function when(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
