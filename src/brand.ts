// Charte graphique "Moto Décode" : flat design, palette « Huile & acier ».
// Toutes les couleurs passent par ici (garder synchro avec hyperframes/templates/_shared.css).
// Règles flat : aplats, pas de dégradé, pas de contour épais, ombre = une teinte plus foncée.
export const BRAND = {
  name: "MOTO DÉCODE",
  author: "Fazerr", // nom de la chaîne TikTok, affiché « by Fazerr »
  tagline: "Ta moto, expliquée en 1 minute",
  colors: {
    bg: "#0F2A3D", // bleu pétrole : fond
    deco: "#16384F", // formes de fond (une teinte au-dessus du fond)
    text: "#EEF2F4", // blanc froid : textes sur le fond
    ink: "#071824", // bleu très sombre : pneus, détails, texte sur ambre
    orange: "#F2A20C", // ambre huile : couleur principale, mots clés
    yellow: "#FFD166", // ambre clair : astuces, lumières, étincelles
    blue: "#3E7CA6", // bleu moteur : carénage
    blueDk: "#2F6185", // ombre du carénage
    cream: "#0F2A3D", // ancien fond crème = fond pétrole
    sky: "#6EC1E4", // air / admission
    red: "#E4572E", // rouge chaud : danger / combustion
    grey: "#7D8E9E", // acier sombre : gaz d'échappement, ombres métal
    metal: "#A9B8C6", // acier
    inside: "#DCE3EA", // intérieur des vues en coupe (cylindre, carter)
    green: "#3FB68B", // OK / niveau bon
    white: "#FFFFFF",
  },
  stroke: 0, // flat : pas de contour
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
