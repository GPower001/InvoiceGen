// import { type Express } from "express";
// import { type Server } from "http";
// import { storage } from "./storage";
// import { z } from "zod";

// // Define API route schemas
// const invoiceItemSchema = z.object({
//   service: z.string().min(1, "Service name is required"),
//   description: z.string().optional(),
//   price: z.number().min(0, "Price must be positive"),
// });

// const createInvoiceSchema = z.object({
//   invoiceNumber: z.string().min(1, "Invoice number is required"),
//   clientName: z.string().min(1, "Client name is required"),
//   companyName: z.string().optional(),
//   clientEmail: z.string().email().optional().or(z.literal("")),
//   amount: z.number().min(0, "Amount must be positive"),
//   status: z.enum(["pending", "paid", "overdue"]).default("pending"),
//   dueDate: z.string().transform((val) => new Date(val)),
//   currency: z.string().optional(),
//   items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
//   subtotal: z.number().optional(),
//   discountRate: z.number().default(0),
//   discountAmount: z.number().default(0),
//   total: z.number().min(0, "Total must be positive"),
// });

// export async function registerRoutes(
//   httpServer: Server,
//   app: Express
// ): Promise<Server> {
  
//   // Get all invoices
//   app.get("/api/invoices", async (req, res) => {
//     try {
//       const invoices = await storage.getInvoices();
//       res.json(invoices);
//     } catch (error) {
//       console.error('Error getting invoices:', error);
//       res.status(500).json({ message: "Failed to fetch invoices" });
//     }
//   });

//   // Get single invoice
//   app.get("/api/invoices/:id", async (req, res) => {
//     try {
//       const invoice = await storage.getInvoice(req.params.id);
//       if (!invoice) {
//         return res.status(404).json({ message: "Invoice not found" });
//       }
//       res.json(invoice);
//     } catch (error) {
//       console.error('Error getting invoice:', error);
//       res.status(500).json({ message: "Failed to fetch invoice" });
//     }
//   });

//   // Create new invoice
//   app.post("/api/invoices", async (req, res) => {
//     try {
//       const input = createInvoiceSchema.parse(req.body);
//       const invoice = await storage.createInvoice(input);
//       res.status(201).json(invoice);
//     } catch (err) {
//       if (err instanceof z.ZodError) {
//         return res.status(400).json({ 
//           message: "Validation error",
//           errors: err.errors 
//         });
//       }
//       console.error('Error creating invoice:', err);
//       res.status(500).json({ message: "Failed to create invoice" });
//     }
//   });

//   return httpServer;
// }

import { type Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Define API route schemas
const invoiceItemSchema = z.object({
  service: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
});

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientName: z.string().min(1, "Client name is required"),
  companyName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  amount: z.number().min(0, "Amount must be positive"),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  dueDate: z.string().transform((val) => new Date(val)),
  currency: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().optional(),
  discountRate: z.number().default(0),
  discountAmount: z.number().default(0),
  total: z.number().min(0, "Total must be positive"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error('Error getting invoices:', error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get single invoice
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error('Error getting invoice:', error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Create new invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      const input = createInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(input);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: err.errors 
        });
      }
      console.error('Error creating invoice:', err);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Update invoice
  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Delete invoice
  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.deleteInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  return httpServer;
}