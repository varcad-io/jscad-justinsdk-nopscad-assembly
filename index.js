import * as modeling from "@jscad/modeling";
import { createJustinShape } from "/Libraries/JustinSDK";
import { createNopShape } from "varcad:library/nopscad";

export function main() {
  return modeling.booleans.union(
    createJustinShape(),
    modeling.transforms.translate([0.4, 1.15, 0], createNopShape()),
    modeling.transforms.translate(
      [-0.6, -0.25, 0.3],
      modeling.primitives.sphere({ radius: 0.55, segments: 24 }),
    ),
  );
}
