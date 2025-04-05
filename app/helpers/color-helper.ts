import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

export type DefaultColors =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

export type ColorIntensity =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

/**
 * Get a Tailwind color hex value by color name and intensity
 * @param colorName - The Tailwind color name
 * @param intensity - The color intensity/shade (50-900)
 * @returns The hex color value
 */
export function getColor(
  colorName: DefaultColors,
  intensity: ColorIntensity
): string {
  if (!colors[colorName]) {
    throw new Error(`Color "${colorName}" not found in Tailwind config`);
  }

  if (!colors[colorName][intensity]) {
    throw new Error(
      `Intensity "${intensity}" not available for color "${colorName}"`
    );
  }

  return colors[colorName][intensity];
}
