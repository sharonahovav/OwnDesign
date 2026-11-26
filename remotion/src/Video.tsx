import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F, sec } from "./theme";

type Caption = { from: number; title: string; note: string };
export type Scene = { clip: string; seconds: number; label: string; captions: Caption[] };

// Caption times follow the actions in the recordings (record_clips.py), in seconds from the clip start.
export const EDITOR: Scene = {
  clip: "clips/editor.webm",
  seconds: 14.0,
  label: "Phone editor",
  captions: [
    { from: 0, title: "The canvas comes first", note: "Tools sit in a bottom bar, the notice explains what a phone can do." },
    { from: 3.0, title: "Tap a piece", note: "The inspector slides up as a bottom sheet." },
    { from: 5.4, title: "Drag to move, tap to rotate", note: "Furniture stays fully editable on a phone." },
    { from: 8.0, title: "The catalog is a sheet", note: "Opening it closes the inspector, so it gets the screen." },
    { from: 10.4, title: "Tap to place", note: "The new piece lands where the finger lands." },
    { from: 12.5, title: "Undo, within reach", note: "Every edit is one tap away from coming back." },
  ],
};

export const WALLS: Scene = {
  clip: "clips/walls.webm",
  seconds: 8.6,
  label: "Read-only structure",
  captions: [
    { from: 0, title: "The same plan, on a phone", note: "Rooms, doors and windows drawn to scale." },
    { from: 3.1, title: "Walls are read-only here", note: "No end handles, disabled fields, and a note saying where to edit them." },
    { from: 5.8, title: "A menu replaces the sidebar", note: "Project pages and sign-out, on every screen below 1200 px." },
  ],
};

export const WALK: Scene = {
  clip: "clips/walk.webm",
  seconds: 11.1,
  label: "3D walkthrough",
  captions: [
    { from: 0, title: "One tap into 3D", note: "The walkthrough from #14, now on phones too." },
    { from: 4.1, title: "Walk with your thumbs", note: "The on-screen pad walks, steps and turns. The 3D view gets the whole stage." },
    { from: 9.7, title: "Back to the plan", note: "Nothing of the 2D editor paints over the 3D view." },
  ],
};

// The clips are 390 x 844 CSS pixels, shown at 1.05x so they stay sharp. A status strip above the app holds
// the camera notch, so the notch never hides the app bar.
const Phone: React.FC<{ clip: string }> = ({ clip }) => {
  const scale = 1.05;
  const width = Math.round(390 * scale);
  const height = Math.round(844 * scale);
  const strip = 40;
  return (
    <div
      style={{
        width: width + 28, height: height + strip + 28, borderRadius: 60, background: C.night, padding: 14,
        boxShadow: "0 40px 80px rgba(36,37,31,0.28), 0 8px 24px rgba(36,37,31,0.18)", position: "relative",
      }}
    >
      <div style={{ width, height: height + strip, borderRadius: 46, overflow: "hidden", background: "#fbf9f5" }}>
        <div style={{ height: strip, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.ink }}>
          <span>9:41</span>
          <span style={{ width: 96, height: 26, borderRadius: 13, background: C.night }} />
          <span style={{ letterSpacing: 2 }}>•••</span>
        </div>
        <OffthreadVideo src={staticFile(clip)} style={{ width, height, display: "block" }} muted />
      </div>
    </div>
  );
};

const CaptionBlock: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = scene.captions.reduce((last, c, i) => (frame >= sec(c.from) ? i : last), 0);
  const cap = scene.captions[active];
  const local = frame - sec(cap.from);
  const enter = spring({ frame: local, fps, config: { damping: 200 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, width: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: 2, color: C.primary, textTransform: "uppercase" }}>
          {String(index).padStart(2, "0")} · {scene.label}
        </span>
      </div>
      <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)` }}>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 76, lineHeight: 1.05, letterSpacing: -2, color: C.ink }}>{cap.title}</div>
        <div style={{ marginTop: 22, fontFamily: F.body, fontSize: 32, lineHeight: 1.45, color: C.inkSoft, maxWidth: 700 }}>{cap.note}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {scene.captions.map((c, i) => (
          <div key={c.title} style={{ height: 6, width: i === active ? 64 : 28, borderRadius: 3, background: i <= active ? C.primary : C.line }} />
        ))}
      </div>
    </div>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(1200px 800px at 78% 50%, ${C.primaryTint} 0%, ${C.bg} 62%)` }}>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
      {Array.from({ length: 49 }, (_, i) => (
        <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={1080} stroke={C.line} strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />
      ))}
      {Array.from({ length: 28 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 40} x2={1920} y2={i * 40} stroke={C.line} strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />
      ))}
    </svg>
  </AbsoluteFill>
);

const Brand: React.FC = () => (
  <div style={{ position: "absolute", top: 56, left: 120, display: "flex", alignItems: "center", gap: 18 }}>
    <span style={{ fontFamily: F.head, fontWeight: 700, fontSize: 34, letterSpacing: 1, color: C.ink }}>ATELIER</span>
    <span style={{ fontFamily: F.mono, fontSize: 20, padding: "6px 12px", borderRadius: 6, background: C.mossTint, color: C.moss }}>mobile web · PR #24</span>
  </div>
);

export const SceneView: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: Math.min(enter, exit) }}>
      <Backdrop />
      <Brand />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "60px 160px 0 120px" }}>
        <CaptionBlock scene={scene} index={index} />
        <div style={{ transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px)` }}>
          <Phone clip={scene.clip} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px", gap: 28 }}>
        <span style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: 3, color: C.primary, opacity: a }}>ATELIER · PULL REQUEST #24</span>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 132, lineHeight: 0.98, letterSpacing: -4, color: C.ink, opacity: a, transform: `translateY(${interpolate(a, [0, 1], [30, 0])}px)` }}>
          The floor plan,<br />in your pocket.
        </div>
        <div style={{ fontFamily: F.body, fontSize: 36, color: C.inkSoft, opacity: b, transform: `translateY(${interpolate(b, [0, 1], [20, 0])}px)` }}>
          Every page from 320 px. View and light edits in the editor. The 3D walkthrough on phones.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Stat: React.FC<{ value: string; label: string; delay: number }> = ({ value, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`, padding: "34px 40px", borderRadius: 16, background: C.panel, boxShadow: "0 12px 30px rgba(36,37,31,0.10)", minWidth: 330 }}>
      <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 84, letterSpacing: -2, color: C.primary, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontFamily: F.body, fontSize: 28, color: C.inkSoft, marginTop: 6 }}>{label}</div>
    </div>
  );
};

export const Outro: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Brand />
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 120px", gap: 48 }}>
      <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 84, letterSpacing: -2, color: C.ink }}>Tested, reviewed, ready for review.</div>
      <div style={{ display: "flex", gap: 28 }}>
        <Stat value="131" label="backend tests passing" delay={4} />
        <Stat value="67" label="frontend tests passing" delay={10} />
        <Stat value="31" label="phone browser journeys" delay={16} />
        <Stat value="0" label="security findings" delay={22} />
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 26, color: C.inkSoft }}>320 px → 1440 px · Chromium touch emulation · frontend only</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const TITLE = sec(3);
const OUTRO = sec(4);

export const tourLength = (scenes: Scene[]) => TITLE + scenes.reduce((n, s) => n + sec(s.seconds), 0) + OUTRO;

export const Tour: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  let at = TITLE;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={TITLE}>
        <Title />
      </Sequence>
      {scenes.map((scene, i) => {
        const from = at;
        at += sec(scene.seconds);
        return (
          <Sequence key={scene.clip} from={from} durationInFrames={sec(scene.seconds)}>
            <SceneView scene={scene} index={i + 1} />
          </Sequence>
        );
      })}
      <Sequence from={at} durationInFrames={OUTRO}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Banner: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(115deg, ${C.bg} 0%, ${C.bg} 55%, ${C.primaryTint} 100%)` }}>
    <svg width="1600" height="560" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
      {Array.from({ length: 41 }, (_, i) => (
        <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={560} stroke={C.line} strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 40} x2={1600} y2={i * 40} stroke={C.line} strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />
      ))}
    </svg>
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px", gap: 18 }}>
      <span style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: 3, color: C.primary }}>ATELIER · PULL REQUEST #24</span>
      <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 92, lineHeight: 1, letterSpacing: -3, color: C.ink }}>
        The floor plan,<br />in your pocket.
      </div>
      <div style={{ fontFamily: F.body, fontSize: 28, color: C.inkSoft }}>Mobile web version · phones, tablets, desktop</div>
    </AbsoluteFill>
    {[["shots/phone-05-sofa-selected.png", 1010, 70, -6], ["shots/phone-09b-walkthrough.png", 1270, 40, 5]].map(([src, left, top, rot]) => (
      <div key={String(src)} style={{ position: "absolute", left: Number(left), top: Number(top), width: 220, height: 476, borderRadius: 30, background: C.night, padding: 9, transform: `rotate(${rot}deg)`, boxShadow: "0 24px 48px rgba(36,37,31,0.28)" }}>
        <img src={staticFile(String(src))} style={{ width: 202, height: 458, borderRadius: 22, objectFit: "cover", objectPosition: "top" }} />
      </div>
    ))}
  </AbsoluteFill>
);
