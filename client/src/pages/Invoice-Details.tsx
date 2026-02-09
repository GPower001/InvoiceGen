import { useParams, Link } from "wouter";
import { useInvoices } from "@/hooks/use-invoices";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Download, Printer, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function InvoiceDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: invoices, isLoading } = useInvoices();
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<any>(null);
  const queryClient = useQueryClient();

  // Find the invoice from the list
  const invoice = invoices?.find((inv: any) => inv._id === id);

  // Initialize edited invoice when invoice is loaded
  useEffect(() => {
    if (invoice && !editedInvoice) {
      setEditedInvoice({...invoice});
    }
  }, [invoice]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!editedInvoice) return;

    // Recalculate totals
    const items = editedInvoice.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
    const discountAmount = editedInvoice.discountRate 
      ? subtotal * (editedInvoice.discountRate / 100) 
      : 0;
    const total = subtotal - discountAmount;

    updateMutation.mutate({
      ...editedInvoice,
      subtotal,
      discountAmount,
      total,
    });
  };

  const handleCancel = () => {
    setEditedInvoice({...invoice});
    setIsEditing(false);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(editedInvoice?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedInvoice({ ...editedInvoice, items: newItems });
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !invoice) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: "Downloaded",
        description: "Invoice PDF has been downloaded",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!invoice || !editedInvoice) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <p className="text-destructive mb-4">Invoice not found</p>
              <Link href="/history">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const displayInvoice = isEditing ? editedInvoice : invoice;
  const items = (displayInvoice.items || []) as any[];
  const currencySymbol = displayInvoice.currency === 'NGN' ? '₦' : '$';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <Link href="/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to History</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={updateMutation.isPending} size="sm" className="flex-1 sm:flex-none">
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Edit2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                  <Printer className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-0">
            <div ref={invoiceRef} className="p-4 sm:p-6 md:p-8 lg:p-12 bg-white text-slate-900">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-8 sm:mb-12">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-slate-900 mb-2">INVOICE</h1>
                  <p className="text-slate-500 font-mono text-xs sm:text-sm">#{displayInvoice.invoiceNumber}</p>
                  <div className="mt-3 sm:mt-4">
                    {isEditing ? (
                      <Select 
                        value={editedInvoice.status} 
                        onValueChange={(value) => setEditedInvoice({...editedInvoice, status: value})}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        variant={displayInvoice.status === 'paid' ? 'default' : 'outline'}
                        className={`${
                          displayInvoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          displayInvoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {displayInvoice.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1">
                    {displayInvoice.companyName || "Your Company"}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    {displayInvoice.createdAt ? format(new Date(displayInvoice.createdAt), "MMMM dd, yyyy") : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Bill To</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editedInvoice.clientName}
                      onChange={(e) => setEditedInvoice({...editedInvoice, clientName: e.target.value})}
                      className="text-base sm:text-lg font-semibold"
                      placeholder="Client Name"
                    />
                    <Input
                      value={editedInvoice.clientEmail || ''}
                      onChange={(e) => setEditedInvoice({...editedInvoice, clientEmail: e.target.value})}
                      placeholder="Client Email"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-base sm:text-lg font-semibold text-slate-900">{displayInvoice.clientName}</div>
                    {displayInvoice.clientEmail && <div className="text-sm sm:text-base text-slate-500">{displayInvoice.clientEmail}</div>}
                  </>
                )}
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 p-4 sm:p-6 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">Invoice Date</div>
                  <div className="text-sm sm:text-base text-slate-900">
                    {displayInvoice.createdAt ? format(new Date(displayInvoice.createdAt), "MMM dd, yyyy") : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">Due Date</div>
                  <div className="text-sm sm:text-base text-slate-900">
                    {displayInvoice.dueDate ? format(new Date(displayInvoice.dueDate), "MMM dd, yyyy") : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 ? (
                <div className="mb-6 sm:mb-8">
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
                          <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                          <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="py-4 text-sm font-medium text-slate-900">
                              {isEditing ? (
                                <Input
                                  value={item.service}
                                  onChange={(e) => updateItem(index, 'service', e.target.value)}
                                  className="h-8"
                                />
                              ) : (
                                item.service
                              )}
                            </td>
                            <td className="py-4 text-sm text-slate-600">
                              {isEditing ? (
                                <Input
                                  value={item.description || ''}
                                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                                  className="h-8"
                                />
                              ) : (
                                item.description || '-'
                              )}
                            </td>
                            <td className="py-4 text-sm font-mono text-right text-slate-900">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                                  className="h-8 text-right"
                                />
                              ) : (
                                `${currencySymbol}${(Number(item.price) || 0).toLocaleString()}`
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Service</div>
                            {isEditing ? (
                              <Input
                                value={item.service}
                                onChange={(e) => updateItem(index, 'service', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <div className="text-sm font-medium text-slate-900">{item.service}</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Description</div>
                            {isEditing ? (
                              <Input
                                value={item.description || ''}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <div className="text-sm text-slate-600">{item.description || '-'}</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Price</div>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                                className="h-8 text-sm text-right"
                              />
                            ) : (
                              <div className="text-sm font-mono text-slate-900">
                                {currencySymbol}{(Number(item.price) || 0).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-100 text-center text-slate-500">
                  No items in this invoice
                </div>
              )}

              {/* Totals */}
              <div className="border-t-2 border-slate-100 pt-6 sm:pt-8">
                <div className="flex justify-end">
                  <div className="w-full sm:w-64 space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">{currencySymbol}{items.reduce((sum, item) => sum + (Number(item.price) || 0), 0).toLocaleString()}</span>
                    </div>
                    {displayInvoice.discountRate && displayInvoice.discountRate > 0 && (
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Discount ({displayInvoice.discountRate}%)</span>
                        <span className="font-mono">-{currencySymbol}{(Number(displayInvoice.discountAmount) || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900 pt-2 sm:pt-3 border-t border-slate-100">
                      <span>Total</span>
                      <span className="font-mono">{currencySymbol}{
                        (items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) - 
                        (displayInvoice.discountAmount || 0)).toLocaleString()
                      }</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 sm:mt-12 text-center text-xs text-slate-400">
                <p>Thank you for your business!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}