import { z } from "zod";

export const eyePrescriptionSchema = z.object({
  sph: z.number().nullable().optional(),
  cyl: z.number().nullable().optional(),
  axis: z.number().int().min(0).max(180).nullable().optional(),
  add: z.number().nullable().optional(),
  va: z.string().nullable().optional(),
  pd: z.number().nullable().optional(),
  prism: z.string().nullable().optional(),
  oh: z.number().nullable().optional()
});

export const optometryRecordInputSchema = z.object({
  bvshopCustomerId: z.string().min(1),
  examDate: z.string().min(1),
  staffName: z.string().nullable().optional(),
  dominantEye: z.enum(["right", "left", "unknown"]).default("unknown"),
  purpose: z.enum(["daily", "driving", "reading", "computer", "sport", "other"]).default("daily"),
  right: eyePrescriptionSchema,
  left: eyePrescriptionSchema,
  note: z.string().nullable().optional()
});

export const glassesOrderInputSchema = z.object({
  optometryRecordId: z.string().nullable().optional(),
  bvshopCustomerId: z.string().min(1),
  orderDate: z.string().min(1),
  prescription: z.object({
    right: eyePrescriptionSchema,
    left: eyePrescriptionSchema
  }),
  frame: z.object({
    brand: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    size: z.string().nullable().optional(),
    price: z.number().int().nullable().optional()
  }),
  lens: z.object({
    brand: z.string().nullable().optional(),
    series: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    index: z.string().nullable().optional(),
    design: z.string().nullable().optional(),
    coating: z.array(z.string()).optional(),
    price: z.number().int().nullable().optional()
  }),
  amount: z.object({
    discount: z.number().int().nullable().optional(),
    total: z.number().int().nullable().optional(),
    deposit: z.number().int().nullable().optional(),
    balance: z.number().int().nullable().optional()
  }),
  note: z.string().nullable().optional()
});
