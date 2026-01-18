import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pelanggan from "./pages/master/Pelanggan";
import JobOrder from "./pages/operasional/JobOrder";
import Tracking from "./pages/operasional/Tracking";
import Invoice from "./pages/keuangan/Invoice";
import Leads from "./pages/sales/Leads";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Master Data */}
          <Route path="/master/pelanggan" element={<Pelanggan />} />
          <Route path="/master/vendor" element={<Pelanggan />} />
          <Route path="/master/truk" element={<Pelanggan />} />
          <Route path="/master/pelabuhan" element={<Pelanggan />} />
          <Route path="/master/gudang" element={<Pelanggan />} />
          
          {/* Sales */}
          <Route path="/sales/leads" element={<Leads />} />
          <Route path="/sales/penawaran" element={<Leads />} />
          
          {/* Operasional */}
          <Route path="/operasional/job-order" element={<JobOrder />} />
          <Route path="/operasional/tracking" element={<Tracking />} />
          <Route path="/operasional/gudang" element={<JobOrder />} />
          
          {/* Keuangan */}
          <Route path="/keuangan/invoice" element={<Invoice />} />
          <Route path="/keuangan/pembayaran" element={<Invoice />} />
          <Route path="/keuangan/pengeluaran" element={<Invoice />} />
          <Route path="/keuangan/laba-rugi" element={<Invoice />} />
          
          {/* Laporan */}
          <Route path="/laporan/keuangan" element={<Invoice />} />
          <Route path="/laporan/operasional" element={<JobOrder />} />
          <Route path="/laporan/manajemen" element={<Invoice />} />
          
          {/* Pengaturan */}
          <Route path="/pengaturan" element={<Pelanggan />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
