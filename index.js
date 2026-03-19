import * as modeling from "@jscad/modeling";
import * as roundedCubeLib from "@justinsdk/src/rounded_cube.scad?use";
import * as roundedCylinderLib from "@nopscad/utils/rounded_cylinder.scad?use";

export function main() {
  return modeling.booleans.union(
    roundedCubeLib.rounded_cube([1.7, 1.05, 0.65], 0.16, true),
    modeling.transforms.translate([0.45, 1.1, 0], roundedCylinderLib.rounded_cylinder(0.45, 0.95, 0.12)),
    modeling.transforms.translate(
      [-0.6, -0.25, 0.3],
      modeling.primitives.sphere({ radius: 0.55, segments: 24 }),
    ),
  );
}
