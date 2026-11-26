import { loadFont as loadHead } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Atelier's own tokens (frontend/css/app.css): terracotta primary, moss secondary, warm off-white surfaces.
export const C = {
  bg: "#f6f2ea",
  surface: "#ede7dc",
  panel: "#ffffff",
  ink: "#24251f",
  inkSoft: "#5e5a52",
  line: "#d9d1c3",
  primary: "#9f3c16",
  primaryBright: "#bf542c",
  primaryTint: "#f3dccf",
  moss: "#4f6b3a",
  mossTint: "#dfe8d3",
  night: "#1d1c19",
};

export const F = {
  head: loadHead("normal", { weights: ["600", "700", "800"] }).fontFamily,
  body: loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "500"] }).fontFamily,
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
