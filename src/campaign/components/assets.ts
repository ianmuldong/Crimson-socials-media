import { getStaticFiles } from "remotion";

/** True if a file exists in public/ (so missing logos/footage show a labelled placeholder). */
export const hasAsset = (path: string | null | undefined): path is string => {
  if (!path) return false;
  try {
    return getStaticFiles().some(
      (f) => f.name === path || f.name === path.replace(/^\//, ""),
    );
  } catch {
    return false;
  }
};
