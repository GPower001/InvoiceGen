// import { Invoice, type IInvoice } from "./models/Invoice.js";

// export interface InvoiceItem {
//   service: string;
//   description?: string;
//   price: number;
// }

// export interface InsertInvoice {
//   invoiceNumber: string;
//   clientName: string;
//   companyName?: string;
//   clientEmail?: string;
//   amount: number;
//   status?: "pending" | "paid" | "overdue";
//   dueDate: Date;
//   currency?: string;
//   items: InvoiceItem[];
//   subtotal?: number;
//   discountRate?: number;
//   discountAmount?: number;
//   total: number;
// }

// export interface IStorage {
//   getInvoices(): Promise<IInvoice[]>;
//   getInvoice(id: string): Promise<IInvoice | null>;
//   createInvoice(invoice: InsertInvoice): Promise<IInvoice>;
// }

// export class DatabaseStorage implements IStorage {
//   async getInvoices(): Promise<IInvoice[]> {
//     try {
//       return await Invoice.find().sort({ createdAt: -1 }).exec();
//     } catch (error) {
//       console.error('Error fetching invoices:', error);
//       return [];
//     }
//   }

//   async getInvoice(id: string): Promise<IInvoice | null> {
//     try {
//       return await Invoice.findById(id).exec();
//     } catch (error) {
//       console.error('Error fetching invoice:', error);
//       return null;
//     }
//   }

//   async createInvoice(insertInvoice: InsertInvoice): Promise<IInvoice> {
//     try {
//       const invoice = new Invoice(insertInvoice);
//       return await invoice.save();
//     } catch (error) {
//       console.error('Error creating invoice:', error);
//       throw error;
//     }
//   }
// }

// export const storage = new DatabaseStorage();
import { Invoice, type IInvoice } from "./models/Invoice.js";

export interface InvoiceItem {
  service: string;
  description?: string;
  price: number;
}

export interface InsertInvoice {
  invoiceNumber: string;
  clientName: string;
  companyName?: string;
  clientEmail?: string;
  amount: number;
  status?: "pending" | "paid" | "overdue";
  dueDate: Date;
  currency?: string;
  items: InvoiceItem[];
  subtotal?: number;
  discountRate?: number;
  discountAmount?: number;
  total: number;
}

export interface IStorage {
  getInvoices(): Promise<IInvoice[]>;
  getInvoice(id: string): Promise<IInvoice | null>;
  createInvoice(invoice: InsertInvoice): Promise<IInvoice>;
  updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<IInvoice | null>;
  deleteInvoice(id: string): Promise<IInvoice | null>;
}

export class DatabaseStorage implements IStorage {
  async getInvoices(): Promise<IInvoice[]> {
    try {
      return await Invoice.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async getInvoice(id: string): Promise<IInvoice | null> {
    try {
      return await Invoice.findById(id).exec();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<IInvoice> {
    try {
      const invoice = new Invoice(insertInvoice);
      return await invoice.save();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<IInvoice | null> {
    try {
      const invoice = await Invoice.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).exec();
      return invoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<IInvoice | null> {
    try {
      const invoice = await Invoice.findByIdAndDelete(id).exec();
      return invoice;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();