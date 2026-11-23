import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Polices embarquées (licence OFL) : pas besoin d'internet pour le rendu.
export const TITLE_FONT = "Lilita One";
export const BODY_FONT = "Nunito";

loadFont({ family: TITLE_FONT, url: staticFile("fonts/LilitaOne.woff2") });
loadFont({ family: BODY_FONT, url: staticFile("fonts/Nunito-Black.woff2"), weight: "900" });
