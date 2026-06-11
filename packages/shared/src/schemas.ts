import { z } from "zod";

export const bvshopCustomerInputSchema = z.object({
  phone: z.string().min(1, "電話為必填"),
  fullName: z.string().min(1, "姓名為必填"),
  email: z.string().email("Email 格式錯誤"),
  address: z.string().min(1, "地址為必填"),
  dealerCode: z.string().nullable().optional(),
});

export type BvshopCustomerInput = z.infer<typeof bvshopCustomerInputSchema>;

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

export const optometryRecordPatchSchema = z.object({
  examDate: z.string().min(1).optional(),
  staffName: z.string().nullable().optional(),
  dominantEye: z.enum(["right", "left", "unknown"]).optional(),
  purpose: z.enum(["daily", "driving", "reading", "computer", "sport", "other"]).optional(),
  right: eyePrescriptionSchema.optional(),
  left: eyePrescriptionSchema.optional(),
  note: z.string().nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export const createBvshopOrderInputSchema = z.object({
  paymentId: z.number().int().positive(),
  logisticId: z.number().int().positive(),
  cvs: z
    .object({
      storeName: z.string().min(1),
      storeNum: z.string().min(1),
    })
    .optional(),
  deposit: z.number().int().nonnegative().optional(),
  confirm: z.literal(true),
});
