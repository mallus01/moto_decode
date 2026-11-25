import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Polices embarquées (licence OFL) : pas besoin d'internet pour le rendu.
// Rubik ExtraBold pour les titres, Inter pour les textes et sous-titres (polices variables).
export const TITLE_FONT = "Rubik";
export const BODY_FONT = "Inter";
export const TITLE_WEIGHT = 800;

loadFont({ family: TITLE_FONT, url: staticFile("fonts/Rubik.woff2"), weight: "300 900" });
loadFont({ family: BODY_FONT, url: staticFile("fonts/Inter.woff2"), weight: "100 900" });
