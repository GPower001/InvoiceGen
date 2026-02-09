import { useInvoices } from "@/hooks/use-invoices";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FileText, Eye, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { data: invoices, isLoading, error } = useInvoices();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
      setDeleteId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const filteredInvoices = invoices?.filter(inv => 
    inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">Invoice History</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage and view your saved invoices</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search client or invoice #..." 
              className="pl-9 bg-background border-border/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p className="text-sm sm:text-base">Loading your invoices...</p>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-destructive">
            <AlertCircle className="w-8 h-8 mb-4" />
            <p className="text-sm sm:text-base">Failed to load invoices. Please try again later.</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl bg-muted/5">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium">No invoices found</p>
            <p className="text-xs sm:text-sm mb-6">Create your first invoice to get started</p>
            <Link href="/">
              <Button size="sm">Create Invoice</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold text-sm">Invoice #</th>
                        <th className="text-left p-4 font-semibold text-sm">Client</th>
                        <th className="text-left p-4 font-semibold text-sm">Amount</th>
                        <th className="text-left p-4 font-semibold text-sm">Status</th>
                        <th className="text-left p-4 font-semibold text-sm">Date</th>
                        <th className="text-left p-4 font-semibold text-sm">Due Date</th>
                        <th className="text-right p-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => (
                        <tr 
                          key={invoice._id} 
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-mono text-sm font-medium">
                              #{invoice.invoiceNumber}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{invoice.clientName}</div>
                            {invoice.companyName && (
                              <div className="text-xs text-muted-foreground">{invoice.companyName}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">
                              {invoice.currency === 'NGN' ? '₦' : '$'}
                              {(Number(invoice.total) || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={invoice.status === 'paid' ? 'default' : 'outline'}
                              className={`${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}
                            >
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {invoice.createdAt ? format(new Date(invoice.createdAt), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/invoice/${invoice._id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(invoice._id)}
                                className="hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm font-medium text-foreground mb-1">
                          #{invoice.invoiceNumber}
                        </div>
                        <div className="font-semibold text-base truncate">{invoice.clientName}</div>
                        {invoice.companyName && (
                          <div className="text-xs text-muted-foreground truncate">{invoice.companyName}</div>
                        )}
                      </div>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'outline'}
                        className={`ml-2 shrink-0 ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {invoice.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Amount</div>
                        <div className="font-semibold">
                          {invoice.currency === 'NGN' ? '₦' : '$'}
                          {(Number(invoice.total) || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Due Date</div>
                        <div className="text-sm">
                          {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/50">
                      <Link href={`/invoice/${invoice._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(invoice._id)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the invoice
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}