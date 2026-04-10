import * as modeling from "@jscad/modeling";
import * as hexagonsLib from "@justinsdk/src/hexagons.scad?use";
import * as starburstLib from "@justinsdk/src/starburst.scad?use";
import * as roundedCylinderLib from "@nopscad/utils/rounded_cylinder.scad?use";

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toInteger = (value, fallback = 1, { min = 1, max = 24 } = {}) => {
  const parsed = Math.round(toFiniteNumber(value, fallback));
  return Math.max(min, Math.min(max, parsed));
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "off", "no"].includes(normalized)) {
      return false;
    }
    if (["true", "1", "on", "yes"].includes(normalized)) {
      return true;
    }
  }
  return Boolean(value);
};

const normalizeVector3 = (value, fallback = [0, 0, 0]) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : value == null
        ? []
        : [value];
  const numbers = source
    .slice(0, 3)
    .map((entry, index) => toFiniteNumber(entry, fallback[index] ?? 0));
  while (numbers.length < 3) {
    numbers.push(fallback[numbers.length] ?? 0);
  }
  return numbers;
};

const degreesToRadians = (degrees) => (toFiniteNumber(degrees, 0) * Math.PI) / 180;

export function main({ variables = {} } = {}) {
  const hexRadius = toFiniteNumber(variables.hex_radius, 3.2);
  const hexSpacing = toFiniteNumber(variables.hex_spacing, 0.8);
  const hexCount = toInteger(variables.hex_count, 3, { min: 1, max: 8 });
  const plateHeight = toFiniteNumber(variables.plate_height, 2.8);
  const crownOuterRadius = toFiniteNumber(variables.crown_outer_radius, 10);
  const crownInnerRadius = toFiniteNumber(variables.crown_inner_radius, 5);
  const crownPoints = toInteger(variables.crown_points, 6, { min: 3, max: 14 });
  const crownHeight = toFiniteNumber(variables.crown_height, 6);
  const showSupport = toBoolean(variables.show_support, true);
  const supportOffset = normalizeVector3(variables.support_offset_xyz, [12, 0, 0]);
  const supportRoundover = toFiniteNumber(variables.support_roundover, 0.55);
  const supportRadius = toFiniteNumber(variables.support_radius, 1.15);
  const supportChamfer = toFiniteNumber(variables.support_chamfer, 0.18);
  const showMarker = toBoolean(variables.show_marker, true);
  const markerOffset = normalizeVector3(variables.marker_offset_xyz, [6, -2.2, 0]);
  const markerRadius = toFiniteNumber(variables.marker_radius, 0.65);
  const yawDeg = toFiniteNumber(variables.yaw_deg, 0);
  const displayScale = Math.max(0.25, toFiniteNumber(variables.display_scale, 1));

  const plate = modeling.extrusions.extrudeLinear(
    { height: plateHeight },
    hexagonsLib.hexagons(hexRadius, hexSpacing, hexCount),
  );
  const crown = modeling.transforms.translate(
    [0, 0, plateHeight],
    starburstLib.starburst(
      crownOuterRadius,
      crownInnerRadius,
      crownPoints,
      crownHeight,
    ),
  );
  const parts = [plate, crown];

  if (showSupport) {
    parts.push(
      modeling.transforms.translate(
        supportOffset,
        roundedCylinderLib.rounded_cylinder(
          supportRoundover,
          supportRadius,
          supportChamfer,
        ),
      ),
    );
  }

  if (showMarker) {
    parts.push(
      modeling.transforms.translate(
        markerOffset,
        modeling.primitives.sphere({ radius: markerRadius, segments: 24 }),
      ),
    );
  }

  const assembly = parts.length === 1 ? parts[0] : modeling.booleans.union(...parts);
  const scaledAssembly = modeling.transforms.scale(
    [displayScale, displayScale, displayScale],
    assembly,
  );
  return yawDeg
    ? modeling.transforms.rotateZ(degreesToRadians(yawDeg), scaledAssembly)
    : scaledAssembly;
}
