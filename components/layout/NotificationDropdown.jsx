"use client";

import { Bell, CheckCheck, CreditCard, Home, MessageSquareText, ShieldAlert, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { markAllRead, markOneRead } from "@/redux/slices/notificationsSlice";
import { cn } from "@/utils/cn";

const TYPE_ICON = {
  listing: Home,
  lead: MessageSquareText,
  payment: CreditCard,
  review: ShieldAlert,
  user: UserCog,
};

export default function NotificationDropdown() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.notifications.items);
  const unreadCount = items.filter((n) => !n.read).length;

  function handleItemClick(item, close) {
    dispatch(markOneRead(item.id));
    toast.success(item.title);
    close();
  }

  function handleMarkAllRead() {
    dispatch(markAllRead());
    toast.success("All notifications marked as read");
  }

  return (
    <Dropdown
      panelClassName="w-80"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          <div className="scrollbar-thin max-h-80 overflow-y-auto">
            {items.map((item) => {
              const Icon = TYPE_ICON[item.type] ?? Bell;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item, close)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800/60",
                    !item.read && "bg-primary-50/40 dark:bg-primary-500/5"
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-100">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.message}</p>
                    <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{item.time}</p>
                  </div>
                  {!item.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Dropdown>
  );
}
