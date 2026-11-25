// Pipeline complet : script.json -> voix off -> vidéo Remotion -> outro HyperFrames -> MP4 final.
// La vidéo commence directement par l'accroche. Logo d'intro HyperFrames en option : --intro
// Usage : npm run make -- <slug> [--voice piper|clone] [--force-voice]
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);
if (!slug) {
  console.error("Usage : npm run make -- <slug>   (le dossier content/<slug>/script.json doit exister)");
  process.exit(1);
}
const engine = opt("voice", process.env.MOTO_VOICE || "piper");
const PY = process.env.MOTO_PYTHON || (process.platform === "win32" ? "python" : "python3");
const BROWSER = process.env.REMOTION_BROWSER; // chemin Chrome optionnel

const run = (cmd, cmdArgs, opts = {}) => {
  console.log(`\n$ ${cmd} ${cmdArgs.join(" ")}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", shell: process.platform === "win32", cwd: ROOT, ...opts });
  if (r.status !== 0) throw new Error(`Échec : ${cmd} ${cmdArgs.join(" ")}`);
};
const probe = (file) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf-8" });
  return parseFloat(r.stdout.trim());
};

const script = JSON.parse(fs.readFileSync(path.join(ROOT, "content", slug, "script.json"), "utf-8"));
const genRel = `gen/${slug}`;
const gen = path.join(ROOT, "public", genRel);
const outDir = path.join(ROOT, "out", slug);
fs.mkdirSync(path.join(gen, "voice"), { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

// ---------- 0. Bruitages (générés une fois si absents) ----------
if (!fs.existsSync(path.join(ROOT, "public", "sfx", "boom.wav"))) run(PY, [path.join("pipeline", "make_sfx.py")]);

// ---------- 1. Voix off ----------
console.log(`\n== 1/4 Voix off (${engine}) ==`);
const texts = [...script.scenes.map((s) => s.narration), script.outro?.narration].filter(Boolean);
// L'échantillon et les réglages font partie de la clé : en changer régénère la voix automatiquement.
const voiceSettings = ["MOTO_VOICE_REF", "MOTO_VOICE_EXAGGERATION", "MOTO_VOICE_CFG", "MOTO_VOICE_TEMP", "MOTO_VOICE_TEMPO", "MOTO_PIPER_SPEED"]
  .map((k) => `${k}=${process.env[k] ?? ""}`).join(";");
const cacheFile = path.join(gen, "voice", "cache.json");
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf-8")) : {};
const items = texts.map((text, i) => {
  const name = i < script.scenes.length ? `scene-${String(i + 1).padStart(2, "0")}` : "outro";
  const key = createHash("sha1").update(`${engine}|${voiceSettings}|${text}`).digest("hex");
  return { text, name, key, raw: path.join(gen, "voice", `${name}.raw.wav`), wav: path.join(gen, "voice", `${name}.wav`) };
});
const todo = items.filter((it) => flag("force-voice") || cache[it.name] !== it.key || !fs.existsSync(it.wav));
if (todo.length) {
  const jobsFile = path.join(gen, "voice", "jobs.json");
  fs.writeFileSync(jobsFile, JSON.stringify({ engine, jobs: todo.map((t) => ({ text: t.text, out: t.raw })) }, null, 2));
  run(PY, [path.join("pipeline", "voice.py"), jobsFile]);
  for (const t of todo) {
    // Nettoyage : coupe les silences de début/fin, niveau sonore homogène (-14 LUFS, standard réseaux sociaux), 44,1 kHz stéréo.
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", t.raw, "-af",
      "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-14:TP=-1.5:LRA=11",
      "-ar", "44100", "-ac", "2", t.wav]);
    cache[t.name] = t.key;
  }
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
} else console.log("Voix déjà à jour (cache).");

// ---------- 2. Vidéo principale (Remotion) ----------
console.log("\n== 2/4 Vidéo principale (Remotion) ==");
const props = {
  ...script,
  scenes: script.scenes.map((s, i) => ({ ...s, audio: `${genRel}/voice/${items[i].name}.wav`, durationSec: probe(items[i].wav) })),
};
const propsFile = path.join(gen, "props.json");
fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
const mainMp4 = path.join(outDir, "main.mp4");
run("npx", ["remotion", "render", "src/index.ts", "MotoVideo", mainMp4, `--props=${propsFile}`, ...(BROWSER ? [`--browser-executable=${BROWSER}`] : [])]);

// ---------- 3. Intro + outro (HyperFrames) ----------
console.log("\n== 3/4 Intro et outro (HyperFrames) ==");
const hfDir = path.join(outDir, "hyperframes");
fs.rmSync(hfDir, { recursive: true, force: true });
fs.mkdirSync(path.join(hfDir, "fonts"), { recursive: true });
fs.mkdirSync(path.join(hfDir, "vendor"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "hyperframes", "hyperframes.json"), path.join(hfDir, "hyperframes.json"));
fs.copyFileSync(path.join(ROOT, "hyperframes", "vendor", "gsap.min.js"), path.join(hfDir, "vendor", "gsap.min.js"));
fs.copyFileSync(path.join(ROOT, "hyperframes", "templates", "_shared.css"), path.join(hfDir, "_shared.css"));
for (const f of fs.readdirSync(path.join(ROOT, "public", "fonts"))) fs.copyFileSync(path.join(ROOT, "public", "fonts", f), path.join(hfDir, "fonts", f));
fs.mkdirSync(path.join(hfDir, "sfx"), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, "public", "sfx"))) fs.copyFileSync(path.join(ROOT, "public", "sfx", f), path.join(hfDir, "sfx", f));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fill = (tpl, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v), tpl);
const introDur = 1.6;
const outroItem = items.find((i) => i.name === "outro");
const outroVo = outroItem ? probe(outroItem.wav) : 0;
const outroDur = Math.max(3, +(outroVo + 0.9).toFixed(2));
if (outroItem) fs.copyFileSync(outroItem.wav, path.join(hfDir, "outro.wav"));
// Pistou rendu en PNG transparent par Remotion, réutilisée dans l'outro.
run("npx", ["remotion", "still", "src/index.ts", "MascotStill", path.join(hfDir, "mascot.png"), "--image-format=png",
  ...(BROWSER ? [`--browser-executable=${BROWSER}`] : [])]);
const read = (n) => fs.readFileSync(path.join(ROOT, "hyperframes", "templates", n), "utf-8");
const hf = path.join(ROOT, "node_modules", ".bin", "hyperframes");
const AUTHOR = esc(script.author ?? "Fazerr");
// Une seule composition racine (index.html) à la fois dans le dossier, sinon HyperFrames peut doubler l'audio.
const withIntro = flag("intro");
if (withIntro) {
  fs.writeFileSync(path.join(hfDir, "index.html"), fill(read("intro.html"), { AUTHOR, DUR: introDur, TITLE: esc(script.title.split("·").pop().trim()) }));
  run(hf, ["render", "-o", path.join(outDir, "intro.mp4")], { cwd: hfDir });
}
fs.writeFileSync(path.join(hfDir, "index.html"), fill(read("outro.html"), { AUTHOR, DUR: outroDur, VO_DUR: outroVo.toFixed(2), NEXT: esc(script.outro?.next ?? "") }));
run(hf, ["render", "-o", path.join(outDir, "outro.mp4")], { cwd: hfDir });

// ---------- 4. Assemblage ----------
console.log("\n== 4/4 Assemblage final ==");
const parts = [...(withIntro ? ["intro.mp4"] : []), "main.mp4", "outro.mp4"].map((p) => path.join(outDir, p));
const hasAudio = (f) => spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", f], { encoding: "utf-8" }).stdout.trim() !== "";
const inputs = [];
const filters = [];
parts.forEach((p, i) => {
  inputs.push("-i", p);
  filters.push(`[${i}:v]fps=30,scale=1080:1920,setsar=1,format=yuv420p[v${i}]`);
  if (hasAudio(p)) filters.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`);
  else filters.push(`anullsrc=r=44100:cl=stereo,atrim=duration=${probe(p)}[a${i}]`);
});
filters.push(`${parts.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${parts.length}:v=1:a=1[v][a]`);
const final = path.join(ROOT, "out", `${slug}.mp4`);
run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", filters.join(";"), "-map", "[v]", "-map", "[a]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final]);
console.log(`\nVidéo prête : ${final}  (${probe(final).toFixed(1)} s)`);
// Texte de publication TikTok (description + hashtags), à copier-coller.
if (script.description) {
  const tags = (script.hashtags ?? []).map((h) => `#${h.replace(/^#/, "")}`).join(" ");
  const txt = path.join(ROOT, "out", `${slug}.txt`);
  fs.writeFileSync(txt, `${script.description}\n\n${tags}\n`, "utf-8");
  console.log(`Description TikTok : ${txt}`);
}
