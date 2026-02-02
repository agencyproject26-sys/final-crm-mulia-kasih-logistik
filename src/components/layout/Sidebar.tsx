import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  Building2,
  Handshake,
  FileText,
  Package,
  Warehouse,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  Ship,
  Anchor,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubNavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: SubNavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  {
    label: "Master Data",
    icon: Building2,
    children: [
      { label: "Pelanggan", href: "/master/pelanggan" },
      { label: "Vendor", href: "/master/vendor" },
    ],
  },
  {
    label: "Sales & CRM",
    icon: Handshake,
    children: [
      { label: "Penawaran Exp' Imp", href: "/sales/penawaran" },
      { label: "Penawaran Domestik", href: "/sales/penawaran-domestik" },
    ],
  },
  {
    label: "Operasional",
    icon: Package,
    children: [
      { label: "Job Order", href: "/operasional/job-order" },
      { label: "Tracking", href: "/operasional/tracking" },
      { label: "Gudang", href: "/operasional/gudang" },
    ],
  },
  {
    label: "Keuangan",
    icon: Receipt,
    children: [
      { label: "Invoice DP", href: "/keuangan/invoice-dp" },
      { label: "Invoice Final", href: "/keuangan/invoice" },
      { label: "Pembayaran", href: "/keuangan/pembayaran" },
      { label: "Pengeluaran", href: "/keuangan/pengeluaran" },
    ],
  },
  {
    label: "Laporan",
    icon: BarChart3,
    children: [
      { label: "Laporan Keuangan", href: "/laporan/keuangan" },
      { 
        label: "Laporan Operasional",
        children: [
          { label: "Laporan Pengiriman", href: "/laporan/pengiriman" },
          { label: "Utilisasi Truk", href: "/laporan/utilisasi-truk" },
          { label: "Okupansi Gudang", href: "/laporan/okupansi-gudang" },
          { label: "Kinerja Layanan", href: "/laporan/kinerja-layanan" },
        ],
      },
      { label: "Laporan Manajemen", href: "/laporan/manajemen" },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Master Data", "Operasional"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  
  const isChildActive = (children?: SubNavItem[]): boolean => {
    if (!children) return false;
    return children.some((child) => {
      if (child.href && location.pathname === child.href) return true;
      if (child.children) return isChildActive(child.children);
      return false;
    });
  };

  const renderSubNavItems = (items: SubNavItem[], level: number = 0) => {
    return items.map((child) => {
      if (child.children) {
        // This is a nested folder (Laporan Operasional)
        const isExpanded = expandedItems.includes(child.label);
        const hasActiveChild = isChildActive(child.children);
        return (
          <div key={child.label}>
            <button
              onClick={() => toggleExpanded(child.label)}
              className={cn(
                "nav-item w-full justify-between py-2 text-sm",
                hasActiveChild && "text-sidebar-primary"
              )}
            >
              <span className="font-medium">{child.label}</span>
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
            {isExpanded && (
              <div className="ml-3 pl-3 border-l border-sidebar-border mt-1 space-y-1">
                {renderSubNavItems(child.children, level + 1)}
              </div>
            )}
          </div>
        );
      }
      
      // Regular link item
      return (
        <Link
          key={child.href}
          to={child.href!}
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            "nav-item py-2 text-sm",
            isActive(child.href!) && "active"
          )}
        >
          <span>{child.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl ocean-gradient">
              <Ship className="h-7 w-7 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-sidebar-foreground">
                MULIA KASIH
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Logistics System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "nav-item",
                      isActive(item.href) && "active"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        "nav-item w-full justify-between",
                        isChildActive(item.children) && "text-sidebar-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {expandedItems.includes(item.label) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedItems.includes(item.label) && item.children && (
                      <div className="ml-4 pl-4 border-l border-sidebar-border mt-1 space-y-1">
                        {renderSubNavItems(item.children)}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary/20">
                <Shield size={18} className="text-sidebar-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
                <p className="text-xs text-sidebar-foreground/60">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
