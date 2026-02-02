// import { Switch, Route } from "wouter";
// import { queryClient } from "./lib/queryClient";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import NotFound from "@/pages/not-found";
// import CreateInvoice from "@/pages/create-invoice";
// import History from "@/pages/history";
// import Dashboard from "@/pages/dashboard";

// function Router() {
//   return (
//     <Switch>
//       <Route path="/" component={Dashboard} />
//       <Route path="/create" component={CreateInvoice} />
//       <Route path="/history" component={History} />
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Router />
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;


import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CreateInvoice from "@/pages/create-invoice";
import History from "@/pages/history";
import Dashboard from "@/pages/dashboard";
import InvoiceDetail from "@/pages/Invoice-Details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/create" component={CreateInvoice} />
      <Route path="/history" component={History} />
      <Route path="/invoice/:id" component={InvoiceDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;