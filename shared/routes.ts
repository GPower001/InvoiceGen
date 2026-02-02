import { z } from 'zod';

// Invoice schema for MongoDB
export const invoiceSchema = z.object({
  _id: z.string(),
  clientName: z.string(),
  amount: z.number(),
  status: z.enum(['pending', 'paid', 'overdue']),
  dueDate: z.date(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating an invoice (without auto-generated fields)
export const insertInvoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  amount: z.union([z.number(), z.string()]).pipe(z.coerce.number().min(0, 'Amount must be positive')),
  status: z.string().transform(val => val.toLowerCase()).pipe(z.enum(['pending', 'paid', 'overdue'])).optional().default('pending'),
  dueDate: z.string().min(1, 'Due date is required').transform((val) => new Date(val)),
  description: z.string().optional().default(''),
});

// Type inference
export type Invoice = z.infer<typeof invoiceSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// API routes definition
export const api = {
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices',
      responses: {
        200: z.array(invoiceSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices',
      input: insertInvoiceSchema,
      responses: {
        201: invoiceSchema,
        400: z.object({ message: z.string(), errors: z.array(z.any()).optional() }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id',
      responses: {
        200: invoiceSchema,
        404: z.object({ message: z.string() }),
      },
    },
  },
};