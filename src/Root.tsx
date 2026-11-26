import "./brand/fonts";
import React from "react";
import { Composition, Folder } from "remotion";
import { CrimsonBrandTest } from "./compositions/BrandTest/CrimsonBrandTest";
import {
  PromoReel,
  promoMetadataFor,
  promoReelSchema,
} from "./compositions/PromoReel/PromoReel";
import {
  RotationDemo,
  rotationSchema,
} from "./compositions/Rotations/RotationDemo";
import {
  ServeRuleDemo,
  serveRuleSchema,
} from "./compositions/ServingRules/ServeRuleDemo";

/**
 * Every video is registered at 1080×1920 (9:16 vertical) in both 30 and 60 FPS.
 * Animations are timed in seconds via useVideoConfig().fps, so both versions
 * play at the same speed — 60 FPS is just smoother.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Test">
        <Composition
          id="CrimsonTest-30fps"
          component={CrimsonBrandTest}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="CrimsonTest-60fps"
          component={CrimsonBrandTest}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Instructional">
        <Composition
          id="Rotations-30fps"
          component={RotationDemo}
          schema={rotationSchema}
          durationInFrames={570}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "6-PLAYER ROTATION",
            secondsPerRotation: 3,
            players: [
              { label: "S", role: "Setter" },
              { label: "OH", role: "Outside" },
              { label: "MB", role: "Middle" },
              { label: "OP", role: "Opposite" },
              { label: "OH", role: "Outside" },
              { label: "MB", role: "Middle" },
            ],
          }}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.round(
              (1 + 6 * props.secondsPerRotation) * 30,
            ),
          })}
        />
        <Composition
          id="Rotations-60fps"
          component={RotationDemo}
          schema={rotationSchema}
          durationInFrames={1140}
          fps={60}
          width={1080}
          height={1920}
          defaultProps={{
            title: "6-PLAYER ROTATION",
            secondsPerRotation: 3,
            players: [
              { label: "S", role: "Setter" },
              { label: "OH", role: "Outside" },
              { label: "MB", role: "Middle" },
              { label: "OP", role: "Opposite" },
              { label: "OH", role: "Outside" },
              { label: "MB", role: "Middle" },
            ],
          }}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.round(
              (1 + 6 * props.secondsPerRotation) * 60,
            ),
          })}
        />
        <Composition
          id="ServingRules-30fps"
          component={ServeRuleDemo}
          schema={serveRuleSchema}
          durationInFrames={480}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            secondsPerRule: 4,
            rules: [
              {
                heading: "BEHIND THE END LINE",
                body: "Serve from anywhere behind the end line, between the sideline extensions.",
              },
              {
                heading: "NO FOOT FAULTS",
                body: "Don't touch the court or the end line until the ball is hit.",
              },
              {
                heading: "8 SECONDS",
                body: "Serve within 8 seconds of the referee's whistle.",
              },
            ],
          }}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.round(
              (2 + props.rules.length * props.secondsPerRule) * 30,
            ),
          })}
        />
        <Composition
          id="ServingRules-60fps"
          component={ServeRuleDemo}
          schema={serveRuleSchema}
          durationInFrames={960}
          fps={60}
          width={1080}
          height={1920}
          defaultProps={{
            secondsPerRule: 4,
            rules: [
              {
                heading: "BEHIND THE END LINE",
                body: "Serve from anywhere behind the end line, between the sideline extensions.",
              },
              {
                heading: "NO FOOT FAULTS",
                body: "Don't touch the court or the end line until the ball is hit.",
              },
              {
                heading: "8 SECONDS",
                body: "Serve within 8 seconds of the referee's whistle.",
              },
            ],
          }}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.round(
              (2 + props.rules.length * props.secondsPerRule) * 60,
            ),
          })}
        />
      </Folder>

      <Folder name="Reels">
        <Composition
          id="PromoReel-30fps"
          component={PromoReel}
          schema={promoReelSchema}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "FRIDAY",
            subline: "CRIMSON SOCIALS",
            clips: [],
            music: null,
            musicVolume: 0.8,
            introSec: 2,
            outroSec: 2,
          }}
          calculateMetadata={promoMetadataFor(30)}
        />
        <Composition
          id="PromoReel-60fps"
          component={PromoReel}
          schema={promoReelSchema}
          durationInFrames={180}
          fps={60}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "FRIDAY",
            subline: "CRIMSON SOCIALS",
            clips: [],
            music: null,
            musicVolume: 0.8,
            introSec: 2,
            outroSec: 2,
          }}
          calculateMetadata={promoMetadataFor(60)}
        />
      </Folder>
    </>
  );
};
