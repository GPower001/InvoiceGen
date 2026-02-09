import { useState, useRef } from "react";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Printer, Save, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import logoGif from "@/assets/logo.gif";

type InvoiceItem = {
  id: string;
  service: string;
  description: string;
  price: number;
};

export default function CreateInvoice() {
  const { mutate: saveInvoice, isPending } = useCreateInvoice();
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generateInvoiceNumber = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("Omnix Labs");
  const [clientEmail, setClientEmail] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState("NGN");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountRate, setDiscountRate] = useState(5);
  const [logo, setLogo] = useState<string | null>(logoGif);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), service: "Web Development", description: "Frontend implementation", price: 150000 }
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price || 0), 0);
  const discountAmount = hasDiscount ? subtotal * (discountRate / 100) : 0;
  const total = subtotal - discountAmount;

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), service: "", description: "", price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    if (!clientName || !companyName || items.some(i => !i.service || !i.price)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    saveInvoice({
      invoiceNumber,
      clientName,
      companyName,
      clientEmail,
      status,
      dueDate,
      amount: total,
      currency,
      items: items.map(({ service, description, price }) => ({ service, description, price })),
      subtotal,
      discountRate: hasDiscount ? discountRate : 0,
      discountAmount,
      total,
    }, {
      onSuccess: () => {
        // Reset form or redirect
        setInvoiceNumber(generateInvoiceNumber());
      }
    });
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

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
      pdf.save(`${invoiceNumber}.pdf`);
      
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Action Buttons - Fixed at top on mobile */}
        <div className="lg:hidden sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-4 -mx-4 px-4 py-3">
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleSave} 
              disabled={isPending}
              size="sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleDownloadPDF} size="sm">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column: Editor */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">Invoice Details</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Invoice #</label>
                    <div className="flex gap-2">
                      <Input 
                        value={invoiceNumber} 
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="font-mono bg-muted/30"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setInvoiceNumber(generateInvoiceNumber())}
                        title="Generate new number"
                        className="shrink-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Company Logo</label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="cursor-pointer text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Client Name *</label>
                    <Input 
                      placeholder="Enter client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Client Email</label>
                    <Input 
                      type="email"
                      placeholder="client@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Company Name *</label>
                    <Input 
                      placeholder="Your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Status</label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Currency</label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Due Date</label>
                    <Input 
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Discount</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{hasDiscount ? "Enabled" : "Disabled"}</span>
                        <Switch 
                          checked={hasDiscount} 
                          onCheckedChange={setHasDiscount} 
                        />
                      </div>
                    </div>
                    
                    {hasDiscount && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Discount Rate (%)</label>
                        <Input 
                          type="number"
                          min="0"
                          max="100"
                          value={discountRate}
                          onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden lg:flex pt-4 gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleSave} 
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Invoice
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview & Items */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">Invoice Preview</h2>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Preview updates automatically
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-border/40 overflow-hidden">
              <div ref={invoiceRef} className="p-4 sm:p-6 md:p-8 lg:p-12 min-h-[600px] sm:min-h-[800px] flex flex-col bg-white text-slate-900">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-8 sm:mb-12">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {logo && <img src={logo} alt="Company Logo" className="h-12 sm:h-16 w-auto object-contain" />}
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-slate-900 mb-2">INVOICE</h1>
                      <p className="text-slate-500 font-mono text-xs sm:text-sm">#{invoiceNumber}</p>
                      <div className={`mt-3 sm:mt-4 inline-flex px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${status === 'paid' ? 'bg-green-100 text-green-700' : 
                          status === 'overdue' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1">
                      {companyName || "Your Company Name"}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      {format(new Date(), "MMMM dd, yyyy")}
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-slate-50 rounded-lg border border-slate-100">
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Bill To</h3>
                  <div className="text-base sm:text-lg font-semibold text-slate-900">{clientName || "Client Name"}</div>
                  <div className="text-sm sm:text-base text-slate-500">{clientEmail || "email@example.com"}</div>
                </div>

                {/* Items List - Interactive in Preview */}
                <div className="flex-1 overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-full inline-block align-middle px-4 sm:px-0">
                    <table className="w-full min-w-[600px] sm:min-w-0">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3 pr-2">Service</th>
                          <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">Description</th>
                          <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 sm:w-32">Price</th>
                          <th className="w-8 sm:w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <tr key={item.id} className="group">
                            <td className="py-3 sm:py-4 align-top pr-2">
                              <Input 
                                className="border-transparent bg-transparent hover:bg-slate-50 focus:bg-white h-auto p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-300 transition-colors"
                                placeholder="Service Name"
                                value={item.service}
                                onChange={(e) => updateItem(item.id, "service", e.target.value)}
                              />
                            </td>
                            <td className="py-3 sm:py-4 align-top pr-2">
                              <Input 
                                className="border-transparent bg-transparent hover:bg-slate-50 focus:bg-white h-auto p-1.5 sm:p-2 text-xs sm:text-sm text-slate-600 placeholder:text-slate-300 transition-colors"
                                placeholder="Description..."
                                value={item.description}
                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              />
                            </td>
                            <td className="py-3 sm:py-4 align-top">
                              <Input 
                                type="number"
                                className="border-transparent bg-transparent hover:bg-slate-50 focus:bg-white h-auto p-1.5 sm:p-2 text-xs sm:text-sm font-mono text-right text-slate-900 placeholder:text-slate-300 transition-colors"
                                placeholder="0.00"
                                value={item.price || ""}
                                onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                              />
                            </td>
                            <td className="py-3 sm:py-4 align-top text-right">
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 sm:p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={addItem}
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 mt-4 sm:mt-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>

                {/* Footer / Totals */}
                <div className="mt-6 sm:mt-8 border-t-2 border-slate-100 pt-6 sm:pt-8">
                  <div className="flex justify-end">
                    <div className="w-full sm:w-64 space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-mono">{currency === 'NGN' ? '₦' : '$'}{subtotal.toLocaleString()}</span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-sm text-slate-500">
                          <span>Discount ({discountRate}%)</span>
                          <span className="font-mono">-{currency === 'NGN' ? '₦' : '$'}{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900 pt-2 sm:pt-3 border-t border-slate-100">
                        <span>Total</span>
                        <span className="font-mono">{currency === 'NGN' ? '₦' : '$'}{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 sm:mt-12 text-center text-xs text-slate-400">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}