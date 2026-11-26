import React from "react";
import { Composition, Still } from "remotion";
import { FPS } from "./theme";
import { Banner, EDITOR, Tour, WALK, WALLS, tourLength } from "./Video";

const FULL = [EDITOR, WALLS, WALK];
const TEASER = [EDITOR, WALK];

export const Root: React.FC = () => (
  <>
    <Composition id="MobileTour" component={Tour} defaultProps={{ scenes: FULL }} durationInFrames={tourLength(FULL)} fps={FPS} width={1920} height={1080} />
    <Composition id="MobileTeaser" component={Tour} defaultProps={{ scenes: TEASER }} durationInFrames={tourLength(TEASER)} fps={FPS} width={1920} height={1080} />
    <Still id="Banner" component={Banner} width={1600} height={560} />
  </>
);
