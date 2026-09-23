"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import Avatar from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { logout } from "@/redux/slices/authSlice";

export default function ProfileDropdown() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  function handleLogout(close) {
    close();
    dispatch(logout());
    toast.success("Logged out");
    router.push("/login");
  }

  if (!user) return null;

  return (
    <Dropdown
      panelClassName="w-52 py-1.5"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Avatar name={user.name} />
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{user.role}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <button
            onClick={() => {
              close();
              router.push("/admin/profile");
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <UserCircle className="h-4 w-4 text-gray-400" />
            My Profile
          </button>
          <button
            onClick={() => {
              close();
              router.push("/admin/settings");
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Settings className="h-4 w-4 text-gray-400" />
            Settings
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <button
            onClick={() => handleLogout(close)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-danger hover:bg-danger/10 dark:hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </>
      )}
    </Dropdown>
  );
}
