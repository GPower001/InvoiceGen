// import { Layout } from "@/components/layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useInvoices } from "@/hooks/use-invoices";
// import { Loader2, TrendingUp, FileText, Clock, FileEdit, Download, Users, DollarSign, ArrowRightLeft } from "lucide-react";
// import { useState, useMemo } from "react";
// import { subDays, isAfter, parseISO, format, startOfMonth } from "date-fns";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// export default function Dashboard() {
//   const { data: invoices, isLoading } = useInvoices();
//   const [duration, setDuration] = useState("30");
//   const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
//   const [rate, setRate] = useState(1500); // Default conversion rate

//   const invoiceList = useMemo(() => invoices || [], [invoices]);

//   const filteredInvoices = useMemo(() => {
//     return invoiceList.filter(invoice => {
//       if (duration === "all") return true;
//       const date = typeof invoice.createdAt === 'string' ? parseISO(invoice.createdAt) : new Date(invoice.createdAt!);
//       return isAfter(date, subDays(new Date(), parseInt(duration)));
//     });
//   }, [invoiceList, duration]);

//   const convertAmount = (amount: number) => {
//     if (currency === "USD") return amount / rate;
//     return amount;
//   };

//   const currencySymbol = currency === "NGN" ? "₦" : "$";

//   const totalRevenue = filteredInvoices
//     .filter(i => i.status === "Paid")
//     .reduce((sum, i) => sum + Number(i.total), 0);

//   const pendingAmount = filteredInvoices
//     .filter(i => i.status === "Pending")
//     .reduce((sum, i) => sum + Number(i.total), 0);

//   // Chart Data: Revenue Overview (Income vs Month)
//   const monthlyRevenue = useMemo(() => {
//     const data: Record<string, number> = {};
//     filteredInvoices.forEach(inv => {
//       const month = format(parseISO(inv.createdAt as string), "MMM yyyy");
//       data[month] = (data[month] || 0) + Number(inv.total);
//     });
//     return Object.entries(data).map(([name, income]) => ({ name, income: convertAmount(income) }));
//   }, [filteredInvoices, currency, rate]);

//   // Chart Data: Services vs Income
//   const servicesIncome = useMemo(() => {
//     const data: Record<string, number> = {};
//     filteredInvoices.forEach(inv => {
//       const items = inv.items as any[];
//       items.forEach(item => {
//         data[item.description] = (data[item.description] || 0) + (Number(item.quantity) * Number(item.price));
//       });
//     });
//     return Object.entries(data)
//       .map(([name, value]) => ({ name, value: convertAmount(value) }))
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 5);
//   }, [filteredInvoices, currency, rate]);

//   // Top Clients
//   const topClients = useMemo(() => {
//     const clients: Record<string, { count: number, total: number }> = {};
//     filteredInvoices.forEach(inv => {
//       const key = inv.clientName;
//       if (!clients[key]) clients[key] = { count: 0, total: 0 };
//       clients[key].count++;
//       clients[key].total += Number(inv.total);
//     });
//     return Object.entries(clients)
//       .map(([name, data]) => ({ name, ...data }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);
//   }, [filteredInvoices]);

//   const recentInvoices = useMemo(() => {
//     return [...filteredInvoices]
//       .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
//       .slice(0, 5);
//   }, [filteredInvoices]);

//   const handleDownloadReport = () => {
//     const doc = new jsPDF();
//     doc.text("Invoice Report", 14, 15);
//     doc.text(`Duration: ${duration === 'all' ? 'All Time' : `Last ${duration} Days`}`, 14, 25);
    
//     const tableData = filteredInvoices.map(inv => [
//       inv.invoiceNumber,
//       inv.clientName,
//       inv.status,
//       `${inv.currency} ${Number(inv.total).toLocaleString()}`,
//       new Date(inv.createdAt!).toLocaleDateString()
//     ]);

//     autoTable(doc, {
//       head: [["Invoice #", "Client", "Status", "Amount", "Date"]],
//       body: tableData,
//       startY: 35,
//     });

//     doc.save(`report-${duration}-days.pdf`);
//   };

//   if (isLoading) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center min-h-[400px]">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       </Layout>
//     );
//   }

//   const stats = [
//     {
//       title: "Total Revenue",
//       value: `${currencySymbol}${convertAmount(totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
//       icon: TrendingUp,
//       description: "Total amount from paid invoices",
//       color: "text-green-600"
//     },
//     {
//       title: "Total Invoices",
//       value: filteredInvoices.length,
//       icon: FileText,
//       description: `Includes all services: ${filteredInvoices.reduce((acc, inv) => acc + (inv.items as any[]).length, 0)} items`,
//       color: "text-blue-600"
//     },
//     {
//       title: "Pending",
//       value: filteredInvoices.filter(i => i.status === "Pending").length,
//       icon: Clock,
//       description: `Awaiting: ${currencySymbol}${convertAmount(pendingAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
//       color: "text-amber-600"
//     },
//     {
//       title: "Draft",
//       value: filteredInvoices.filter(i => i.status === "Draft").length,
//       icon: FileEdit,
//       description: "In-progress invoices",
//       color: "text-slate-600"
//     }
//   ];

//   return (
//     <Layout>
//       <div className="space-y-8 pb-8">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold font-display">Dashboard</h1>
//             <p className="text-muted-foreground">Overview of your invoice statistics</p>
//           </div>
          
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center bg-card rounded-md border p-1">
//               <Button 
//                 variant={currency === "NGN" ? "default" : "ghost"} 
//                 size="sm" 
//                 onClick={() => setCurrency("NGN")}
//                 className="h-8 px-3"
//               >
//                 NGN
//               </Button>
//               <Button 
//                 variant={currency === "USD" ? "default" : "ghost"} 
//                 size="sm" 
//                 onClick={() => setCurrency("USD")}
//                 className="h-8 px-3"
//               >
//                 USD
//               </Button>
//             </div>

//             {currency === "USD" && (
//               <div className="flex items-center gap-2 border rounded-md px-2 bg-card h-10">
//                 <span className="text-xs text-muted-foreground whitespace-nowrap">Rate: ₦</span>
//                 <input 
//                   type="number" 
//                   value={rate} 
//                   onChange={(e) => setRate(Number(e.target.value))}
//                   className="w-16 bg-transparent border-none focus:ring-0 text-sm font-medium"
//                 />
//               </div>
//             )}

//             <Select value={duration} onValueChange={setDuration}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Duration" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="7">Last 7 Days</SelectItem>
//                 <SelectItem value="30">Last 30 Days</SelectItem>
//                 <SelectItem value="90">Last 90 Days</SelectItem>
//                 <SelectItem value="all">All Time</SelectItem>
//               </SelectContent>
//             </Select>
            
//             <Button onClick={handleDownloadReport} className="gap-2">
//               <Download className="w-4 h-4" />
//               Download Report
//             </Button>
//           </div>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//           {stats.map((stat) => (
//             <Card key={stat.title}>
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   {stat.title}
//                 </CardTitle>
//                 <stat.icon className={`h-4 w-4 ${stat.color}`} />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stat.value}</div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {stat.description}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle>Revenue Overview</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[300px] w-full">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={monthlyRevenue}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip 
//                       formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, "Income"]}
//                     />
//                     <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Services Revenue</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[300px] w-full">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={servicesIncome}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={80}
//                       paddingAngle={5}
//                       dataKey="value"
//                     >
//                       {servicesIncome.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip 
//                       formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, "Income"]}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="mt-4 space-y-2">
//                 {servicesIncome.map((service, index) => (
//                   <div key={service.name} className="flex items-center justify-between text-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
//                       <span className="truncate max-w-[120px]">{service.name}</span>
//                     </div>
//                     <span className="font-medium">{currencySymbol}{service.value.toLocaleString()}</span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Users className="w-5 h-5 text-primary" />
//                 Top Clients
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {topClients.map((client) => (
//                   <div key={client.name} className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">{client.name}</p>
//                       <p className="text-xs text-muted-foreground">{client.count} Invoices</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold">{currencySymbol}{convertAmount(client.total).toLocaleString()}</p>
//                     </div>
//                   </div>
//                 ))}
//                 {topClients.length === 0 && (
//                   <p className="text-center text-muted-foreground py-4">No data available</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="w-5 h-5 text-primary" />
//                 Recent Invoices
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {recentInvoices.map((inv) => (
//                   <div key={inv.id} className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">#{inv.invoiceNumber}</p>
//                       <p className="text-xs text-muted-foreground">{inv.clientName}</p>
//                     </div>
//                     <div className="flex flex-col items-end">
//                       <Badge variant={inv.status === "Paid" ? "default" : "outline"}>
//                         {inv.status}
//                       </Badge>
//                       <p className="text-xs mt-1 font-medium">
//                         {currencySymbol}{convertAmount(Number(inv.total)).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 {recentInvoices.length === 0 && (
//                   <p className="text-center text-muted-foreground py-4">No data available</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </Layout>
//   );
// }



import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvoices } from "@/hooks/use-invoices";
import { Loader2, TrendingUp, FileText, Clock, FileEdit, Download, Users, DollarSign, ArrowRightLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { subDays, isAfter, parseISO, format, startOfMonth } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
  const { data: invoices, isLoading } = useInvoices();
  const [duration, setDuration] = useState("30");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [rate, setRate] = useState(1500); // Default conversion rate

  const invoiceList = useMemo(() => invoices || [], [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoiceList.filter(invoice => {
      if (duration === "all") return true;
      const date = typeof invoice.createdAt === 'string' ? parseISO(invoice.createdAt) : new Date(invoice.createdAt!);
      return isAfter(date, subDays(new Date(), parseInt(duration)));
    });
  }, [invoiceList, duration]);

  const convertAmount = (amount: number) => {
    if (currency === "USD") return amount / rate;
    return amount;
  };

  const currencySymbol = currency === "NGN" ? "₦" : "$";

  const totalRevenue = filteredInvoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const pendingAmount = filteredInvoices
    .filter(i => i.status === "pending")
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  // Chart Data: Revenue Overview (Income vs Month)
  const monthlyRevenue = useMemo(() => {
    const data: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      if (!inv.createdAt) return;
      const date = typeof inv.createdAt === 'string' ? parseISO(inv.createdAt) : new Date(inv.createdAt);
      const month = format(date, "MMM yyyy");
      data[month] = (data[month] || 0) + (Number(inv.total) || 0);
    });
    return Object.entries(data).map(([name, income]) => ({ name, income: convertAmount(income) }));
  }, [filteredInvoices, currency, rate]);

  // Chart Data: Services vs Income
  const servicesIncome = useMemo(() => {
    const data: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      if (!inv.items || !Array.isArray(inv.items)) return;
      const items = inv.items as any[];
      items.forEach(item => {
        const serviceName = item.service || "Unnamed Service";
        data[serviceName] = (data[serviceName] || 0) + (Number(item.price) || 0);
      });
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value: convertAmount(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredInvoices, currency, rate]);

  // Top Clients
  const topClients = useMemo(() => {
    const clients: Record<string, { count: number, total: number }> = {};
    filteredInvoices.forEach(inv => {
      const key = inv.clientName;
      if (!clients[key]) clients[key] = { count: 0, total: 0 };
      clients[key].count++;
      clients[key].total += (Number(inv.total) || 0);
    });
    return Object.entries(clients)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredInvoices]);

  const recentInvoices = useMemo(() => {
    return [...filteredInvoices]
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);
  }, [filteredInvoices]);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("Invoice Report", 14, 15);
    doc.text(`Duration: ${duration === 'all' ? 'All Time' : `Last ${duration} Days`}`, 14, 25);
    
    const tableData = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      inv.clientName,
      inv.status,
      `${inv.currency} ${Number(inv.total).toLocaleString()}`,
      new Date(inv.createdAt!).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [["Invoice #", "Client", "Status", "Amount", "Date"]],
      body: tableData,
      startY: 35,
    });

    doc.save(`report-${duration}-days.pdf`);
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

  const stats = [
    {
      title: "Total Revenue",
      value: `${currencySymbol}${convertAmount(totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: "Total amount from paid invoices",
      color: "text-green-600"
    },
    {
      title: "Total Invoices",
      value: filteredInvoices.length,
      icon: FileText,
      description: `Includes all services: ${filteredInvoices.reduce((acc, inv) => acc + ((inv.items as any[])?.length || 0), 0)} items`,
      color: "text-blue-600"
    },
    {
      title: "Pending",
      value: filteredInvoices.filter(i => i.status === "pending").length,
      icon: Clock,
      description: `Awaiting: ${currencySymbol}${convertAmount(pendingAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      color: "text-amber-600"
    },
    {
      title: "Overdue",
      value: filteredInvoices.filter(i => i.status === "overdue").length,
      icon: FileEdit,
      description: "Past due date",
      color: "text-red-600"
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your invoice statistics</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-card rounded-md border p-1">
              <Button 
                variant={currency === "NGN" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setCurrency("NGN")}
                className="h-8 px-3"
              >
                NGN
              </Button>
              <Button 
                variant={currency === "USD" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setCurrency("USD")}
                className="h-8 px-3"
              >
                USD
              </Button>
            </div>

            {currency === "USD" && (
              <div className="flex items-center gap-2 border rounded-md px-2 bg-card h-10">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Rate: ₦</span>
                <input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-16 bg-transparent border-none focus:ring-0 text-sm font-medium"
                />
              </div>
            )}

            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleDownloadReport} className="gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, "Income"]}
                    />
                    <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicesIncome}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {servicesIncome.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, "Income"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {servicesIncome.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate max-w-[120px]">{service.name}</span>
                    </div>
                    <span className="font-medium">{currencySymbol}{service.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Top Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client) => (
                  <div key={client.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.count} Invoices</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{currencySymbol}{convertAmount(client.total).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {topClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{inv.clientName}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant={inv.status === "paid" ? "default" : "outline"}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                      <p className="text-xs mt-1 font-medium">
                        {(inv.currency === 'NGN' ? '₦' : '$')}{convertAmount(Number(inv.total) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentInvoices.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}