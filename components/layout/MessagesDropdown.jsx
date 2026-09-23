"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCheck, MessageCircle } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import Avatar from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { markAllMessagesRead, markOneMessageRead } from "@/redux/slices/messagesSlice";
import { cn } from "@/utils/cn";

/** Quick-access buyer/tenant message threads — full detail lives in the Leads module. */
export default function MessagesDropdown() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.messages.items);
  const unreadCount = items.filter((m) => !m.read).length;

  function handleItemClick(item, close) {
    dispatch(markOneMessageRead(item.id));
    close();
    router.push("/admin/leads");
  }

  function handleMarkAllRead() {
    dispatch(markAllMessagesRead());
  }

  return (
    <Dropdown
      panelClassName="w-80"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Messages"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Messages</p>
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          <div className="scrollbar-thin max-h-80 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item, close)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800/60",
                  !item.read && "bg-primary-50/40 dark:bg-primary-500/5"
                )}
              >
                <Avatar name={item.name} size="sm" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.lastMessage}</p>
                  <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{item.time}</p>
                </div>
                {!item.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              close();
              router.push("/admin/leads");
            }}
            className="flex w-full items-center justify-center gap-1 border-t border-gray-100 px-4 py-2.5 text-xs font-medium text-primary-600 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
          >
            View all in Leads
            <ArrowRight className="h-3 w-3" />
          </button>
        </>
      )}
    </Dropdown>
  );
}
