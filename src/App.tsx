import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Pelanggan from "./pages/master/Pelanggan";
import Vendor from "./pages/master/Vendor";
import Truk from "./pages/master/Truk";
import JobOrder from "./pages/operasional/JobOrder";
import Tracking from "./pages/operasional/Tracking";
import Invoice from "./pages/keuangan/Invoice";
import Penawaran from "./pages/sales/Penawaran";

// Components
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          
          {/* Master Data */}
          <Route path="/master/pelanggan" element={<ProtectedRoute><Pelanggan /></ProtectedRoute>} />
          <Route path="/master/vendor" element={<ProtectedRoute><Vendor /></ProtectedRoute>} />
          <Route path="/master/truk" element={<ProtectedRoute><Truk /></ProtectedRoute>} />
          <Route path="/master/pelabuhan" element={<ProtectedRoute><Pelanggan /></ProtectedRoute>} />
          <Route path="/master/gudang" element={<ProtectedRoute><Pelanggan /></ProtectedRoute>} />
          
          {/* Sales */}
          <Route path="/sales/penawaran" element={<ProtectedRoute><Penawaran /></ProtectedRoute>} />
          
          {/* Operasional */}
          <Route path="/operasional/job-order" element={<ProtectedRoute><JobOrder /></ProtectedRoute>} />
          <Route path="/operasional/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="/operasional/gudang" element={<ProtectedRoute><JobOrder /></ProtectedRoute>} />
          
          {/* Keuangan */}
          <Route path="/keuangan/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/keuangan/pembayaran" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/keuangan/pengeluaran" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/keuangan/laba-rugi" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          
          {/* Laporan */}
          <Route path="/laporan/keuangan" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/laporan/operasional" element={<ProtectedRoute><JobOrder /></ProtectedRoute>} />
          <Route path="/laporan/manajemen" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          
          {/* Pengaturan */}
          <Route path="/pengaturan" element={<ProtectedRoute><Pelanggan /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
