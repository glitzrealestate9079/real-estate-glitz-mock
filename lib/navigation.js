import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  MessagesSquare,
  CalendarClock,
  BookmarkCheck,
  CreditCard,
  HardHat,
  Star,
  BarChart3,
  FileText,
  Flag,
  Map,
  MapPinned,
  Settings,
} from "lucide-react";

/**
 * Sidebar / route config shared by Sidebar, MobileDrawer and route-highlighting.
 * `group` drives the section labels rendered above each cluster in SidebarNav —
 * it's presentation-only and doesn't affect routing.
 */
export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "listings", label: "Listings", href: "/admin/listings", icon: Building2, group: "Marketplace" },
  { id: "reported-listings", label: "Reported Listings", href: "/admin/reported-listings", icon: Flag, group: "Marketplace" },
  { id: "users", label: "Users & Agents", href: "/admin/users", icon: Users, group: "Marketplace" },
  { id: "agents", label: "Agents", href: "/admin/agents", icon: Briefcase, group: "Marketplace" },
  { id: "builders", label: "Builders", href: "/admin/builders", icon: HardHat, group: "Marketplace" },
  { id: "township", label: "Township", href: "/admin/township", icon: MapPinned, group: "Marketplace" },
  { id: "leads", label: "Leads & Enquiries", href: "/admin/leads", icon: MessagesSquare, group: "Engagement" },
  { id: "site-visits", label: "Site Visits", href: "/admin/site-visits", icon: CalendarClock, group: "Engagement" },
  { id: "saved-searches", label: "Saved Searches", href: "/admin/saved-searches", icon: BookmarkCheck, group: "Engagement" },
  { id: "reviews", label: "Reviews", href: "/admin/reviews", icon: Star, group: "Engagement" },
  { id: "payments", label: "Payments", href: "/admin/payments", icon: CreditCard, group: "Operations" },
  { id: "reports", label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3, group: "Operations" },
  { id: "locations", label: "Locations", href: "/admin/locations", icon: Map, group: "System" },
  { id: "cms", label: "CMS", href: "/admin/cms", icon: FileText, group: "System" },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings, group: "System" },
];
