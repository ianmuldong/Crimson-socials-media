import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fonts are bundled locally in public/brand/fonts so rendering never depends
 * on a network connection. Remotion waits for these before capturing frames.
 */
export const fontsLoaded = Promise.all([
  loadFont({
    family: "Anton",
    url: staticFile("brand/fonts/Anton-Regular.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("brand/fonts/Inter-400.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("brand/fonts/Inter-600.woff2"),
    weight: "600",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("brand/fonts/Inter-800.woff2"),
    weight: "800",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("brand/fonts/Inter-900.woff2"),
    weight: "900",
  }),
]);
