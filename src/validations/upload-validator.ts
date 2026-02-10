import { SERVICES } from "@/lib/constants";
import z from "zod";

export const QueueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sourcePath: z.string().min(1),
  targetPath: z.string().min(1),
  type: z.literal(SERVICES.map(s => s.id)),

  // Others
  data: z.object({
    downloadFiles: z.boolean().optional()
  }).optional()
  
});

export const ImportSchema = z.object({
  sourcePath: z.string().min(1),
  downloadPath: z.string().min(1),
  type: z.literal(SERVICES.map(s => s.id)),
});