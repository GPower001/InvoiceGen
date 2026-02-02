// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@shared/routes";
// import { type InsertInvoice } from "@shared/schema";
// import { useToast } from "@/hooks/use-toast";

// export function useInvoices() {
//   return useQuery({
//     queryKey: [api.invoices.list.path],
//     queryFn: async () => {
//       const res = await fetch(api.invoices.list.path);
//       if (!res.ok) throw new Error("Failed to fetch invoices");
//       return api.invoices.list.responses[200].parse(await res.json());
//     },
//   });
// }

// export function useInvoice(id: number) {
//   return useQuery({
//     queryKey: [api.invoices.get.path, id],
//     queryFn: async () => {
//       const url = api.invoices.get.path.replace(":id", String(id));
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch invoice");
//       return api.invoices.get.responses[200].parse(await res.json());
//     },
//     enabled: !!id,
//   });
// }

// export function useCreateInvoice() {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async (data: InsertInvoice) => {
//       const res = await fetch(api.invoices.create.path, {
//         method: api.invoices.create.method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
      
//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || "Failed to create invoice");
//       }
      
//       return api.invoices.create.responses[201].parse(await res.json());
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
//       toast({
//         title: "Success",
//         description: "Invoice saved successfully",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertInvoice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      // Don't parse since API returns date strings, not date objects
      return await res.json();
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [api.invoices.get.path, id],
    queryFn: async () => {
      const url = api.invoices.get.path.replace(":id", id);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch invoice");
      // Don't parse since API returns date strings, not date objects
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const res = await fetch(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create invoice");
      }
      
      // Don't parse the response since the API returns date strings
      // but the schema expects date objects
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}