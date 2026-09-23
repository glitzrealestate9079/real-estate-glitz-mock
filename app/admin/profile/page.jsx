"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Clock, KeyRound, Mail, Shield, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { updateProfile } from "@/redux/slices/authSlice";

const profileSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number"),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup.string().required("New password is required").min(6, "Must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords don't match"),
});

// Matches the "krishna_singh" style usernames used in the Settings > Audit Log mock data.
function toUsername(email) {
  return email.split("@")[0].replace(/\./g, "_");
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const adminUsers = useAppSelector((state) => state.settings.adminUsers);
  const auditLog = useAppSelector((state) => state.settings.auditLog);

  const adminRecord = useMemo(() => adminUsers.find((a) => a.email === user?.email), [adminUsers, user]);
  const recentActivity = useMemo(() => {
    if (!user) return [];
    const username = toUsername(user.email);
    return auditLog.filter((entry) => entry.admin === username).slice(0, 5);
  }, [auditLog, user]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({ resolver: yupResolver(profileSchema), defaultValues: { name: "", email: "", phone: "" } });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm({ resolver: yupResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  useEffect(() => {
    if (user) resetProfile({ name: user.name, email: user.email, phone: user.phone ?? "" });
  }, [user, resetProfile]);

  function submitProfile(values) {
    return new Promise((resolve) => {
      setTimeout(() => {
        dispatch(updateProfile(values));
        toast.success("Profile updated");
        resolve();
      }, 400);
    });
  }

  function submitPassword(values) {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success("Password updated");
        resetPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
        resolve();
      }, 400);
    });
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account details and password.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center text-center">
              <Avatar name={user.name} size="xl" />
              <p className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <Badge variant="info" className="mt-3">
                <Shield className="mr-1 h-3 w-3" />
                {user.role}
              </Badge>
              {adminRecord && (
                <p className="mt-3 text-xs text-gray-400">Admin since {adminRecord.createdDate}</p>
              )}
            </div>
          </Card>

          <Card title="Recent Activity">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400">No recent activity recorded for this account.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2.5 text-sm">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">{entry.action}</p>
                      <p className="text-xs text-gray-400">
                        {entry.timestamp} — {entry.module}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Profile Details" description="Update your name, email and phone number">
            <form onSubmit={handleProfileSubmit(submitProfile)} className="space-y-4">
              <Input label="Full Name" required icon={UserRound} error={profileErrors.name?.message} {...registerProfile("name")} />
              <Input label="Email" type="email" required icon={Mail} error={profileErrors.email?.message} {...registerProfile("email")} />
              <Input label="Phone" required error={profileErrors.phone?.message} {...registerProfile("phone")} placeholder="+91 98765 43210" />
              <div className="flex justify-end">
                <Button type="submit" loading={profileSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Change Password" description="Choose a strong password you don't use elsewhere">
            <form onSubmit={handlePasswordSubmit(submitPassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                icon={KeyRound}
                error={passwordErrors.currentPassword?.message}
                {...registerPassword("currentPassword")}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="New Password" type="password" required error={passwordErrors.newPassword?.message} {...registerPassword("newPassword")} />
                <Input label="Confirm New Password" type="password" required error={passwordErrors.confirmPassword?.message} {...registerPassword("confirmPassword")} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="outline" loading={passwordSubmitting}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
