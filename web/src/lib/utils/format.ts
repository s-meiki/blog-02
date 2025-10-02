import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

export const formatDate = (iso: string, pattern = "yyyy年M月d日") => {
  try {
    return format(parseISO(iso), pattern, { locale: ja });
  } catch {
    console.warn("Failed to format date", iso);
    return iso;
  }
};

export const estimateReadingTime = (body: unknown, fallback = 5) => {
  if (typeof body === "string") {
    const words = body.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 400));
  }
  return fallback;
};
