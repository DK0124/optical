export type EyeSide = "right" | "left";

export type DominantEye = "right" | "left" | "unknown";

export type Purpose =
  | "daily"
  | "driving"
  | "reading"
  | "computer"
  | "sport"
  | "other";

export interface EyePrescription {
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  add: number | null;
  va: string | null;
  pd: number | null;
  prism: string | null;
  oh?: number | null;
}

export interface OptometryRecordInput {
  bvshopCustomerId: string;
  examDate: string;
  staffName?: string | null;
  dominantEye: DominantEye;
  purpose: Purpose;
  right: EyePrescription;
  left: EyePrescription;
  note?: string | null;
}

export interface GlassesOrderInput {
  optometryRecordId?: string | null;
  bvshopCustomerId: string;
  orderDate: string;
  prescription: {
    right: EyePrescription;
    left: EyePrescription;
  };
  frame: {
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    size?: string | null;
    price?: number | null;
  };
  lens: {
    brand?: string | null;
    series?: string | null;
    type?: string | null;
    index?: string | null;
    design?: string | null;
    coating?: string[];
    price?: number | null;
  };
  amount: {
    discount?: number | null;
    total?: number | null;
    deposit?: number | null;
    balance?: number | null;
  };
  note?: string | null;
}
