import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const backendTradeSchema = z.object({
  stockSymbol: z
    .string()
    .min(1, "Stock symbol required")
    .transform((_, ctx) => {
      // Map from frontend 'symbol'
      const val = ctx?.parent?.symbol;
      if (!val) throw new Error("Symbol required");
      return val;
    }),
  stockName: z
    .string()
    .optional()
    .transform((_, ctx) => ctx?.parent?.companyName),
  tradeType: z.enum(["buy", "sell"]).transform((val, ctx) => {
    const frontendType = ctx?.parent?.tradeType;
    return frontendType ? frontendType.toLowerCase() : val;
  }),
  status: z
    .enum(["open", "close", "partially closed"])
    .default("open")
    .transform((val, ctx) => {
      const frontendStatus = ctx?.parent?.status?.toLowerCase();
      if (
        frontendStatus === "open" ||
        frontendStatus === "close" ||
        frontendStatus === "partially closed"
      ) {
        return frontendStatus;
      }
      return val;
    }),
  entryDate: z.date().transform((_, ctx) => ctx?.parent?.entryDate),
  exitDate: z
    .date()
    .optional()
    .transform((_, ctx) => ctx?.parent?.exitDate),
  quantity: z
    .number()
    .positive()
    .transform((_, ctx) => ctx?.parent?.quantity),
  entryPrice: z
    .number()
    .positive()
    .transform((_, ctx) => ctx?.parent?.entryPrice),
  exitPrice: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.exitPrice),
  commission: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.commission),
  targetPrice: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.targetPrice),
  stopLoss: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.stopLoss),
  atr: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.atr),
  relativeStrength: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.relativeStrength),
  rsi: z
    .number()
    .optional()
    .transform((_, ctx) => ctx?.parent?.rsi),
  entryNotes: z
    .string()
    .optional()
    .transform((_, ctx) => ctx?.parent?.notes),
  postTradeReflection: z
    .string()
    .optional()
    .transform((_, ctx) => ctx?.parent?.reflection),
  strategyAdherence: z.enum(["yes", "no", "partial"]).transform((val, ctx) => {
    const frontendVal = ctx?.parent?.strategyAdherence;
    if (typeof frontendVal === "boolean") return frontendVal ? "yes" : "no";
    if (
      frontendVal === "yes" ||
      frontendVal === "no" ||
      frontendVal === "partial"
    )
      return frontendVal;
    return "yes"; // default
  }),
  tags: z
    .array(z.string())
    .optional()
    .transform((_, ctx) => ctx?.parent?.tags),
});

export const portfolioSchema = z.object({
  totalCapital: z.number().nonnegative().optional(),
  availableCapital: z.number().nonnegative().optional(),
  totalTrades: z.number().nonnegative().optional(),
  openTrades: z.number().nonnegative().optional(),
  closedTrades: z.number().nonnegative().optional(),
  totalReturns: z.number().optional(),
  percentageReturns: z.number().optional(),
  winRate: z.number().optional(),
  avgProfit: z.number().optional(),
  avgLoss: z.number().optional(),
});
