"use client";

import { useRouter } from "next/navigation";
import { Briefcase, Building2, CalendarClock, MessagesSquare, Plus, UserPlus } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";

// Each target page reads `?new=1` on mount and auto-opens its Add form, so this is a genuine
// shortcut rather than just a bookmark to the module's list page.
const QUICK_ADD_ITEMS = [
  { label: "Add Property", href: "/admin/listings?new=1", icon: Building2 },
  { label: "Add Lead", href: "/admin/leads?new=1", icon: MessagesSquare },
  { label: "Schedule Site Visit", href: "/admin/site-visits?new=1", icon: CalendarClock },
  { label: "Add Agent", href: "/admin/agents?new=1", icon: Briefcase },
  { label: "Add User", href: "/admin/users?new=1", icon: UserPlus },
];

export default function QuickAddDropdown() {
  const router = useRouter();

  function handleSelect(href, close) {
    close();
    router.push(href);
  }

  return (
    <Dropdown
      panelClassName="w-56 py-1.5"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Quick add"
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <p className="px-3.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
            Quick Add
          </p>
          {QUICK_ADD_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => handleSelect(item.href, close)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Icon className="h-4 w-4 text-gray-400" />
                {item.label}
              </button>
            );
          })}
        </>
      )}
    </Dropdown>
  );
}
