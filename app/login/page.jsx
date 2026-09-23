"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Building, Eye, EyeOff, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { login, DEMO_ACCOUNTS } from "@/redux/slices/authSlice";

const schema = yup.object({
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

const HIGHLIGHTS = [
  { icon: LayoutDashboard, text: "10 fully-featured modules — listings to township management" },
  { icon: ShieldCheck, text: "Role-based access, KYC/RERA verification, full audit log" },
  { icon: Sparkles, text: "10 color themes with live, site-wide preview" },
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { email: "", password: "" } });

  // Already logged in (e.g. session restored from localStorage) -> skip straight to the dashboard.
  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/admin/dashboard");
  }, [hydrated, isAuthenticated, router]);

  function submit(values) {
    setSubmitting(true);
    setTimeout(() => {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === values.email.trim().toLowerCase() && a.password === values.password
      );
      if (!account) {
        setSubmitting(false);
        toast.error("Invalid email or password");
        return;
      }
      dispatch(login({ name: account.name, email: account.email, role: account.role }));
      toast.success(`Welcome back, ${account.name.split(" ")[0]}!`);
      router.push("/admin/dashboard");
    }, 500);
  }

  function fillDemo(account) {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
  }

  return (
    <div className="flex min-h-screen bg-surface-subtle dark:bg-surface-dark">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-900 p-10 text-white lg:flex">
        <div className="brand-gradient absolute inset-0 opacity-90" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Building className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold">Real Estate Admin</p>
            <p className="text-xs text-white/70">Marketplace Control Panel</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="max-w-sm text-3xl font-semibold leading-tight">Everything you need to run the marketplace.</h1>
          <div className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-start gap-2.5 text-sm text-white/85">
                <h.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} Real Estate Admin. Internal use only.</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-white">
              <Building className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Real Estate Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Marketplace Control Panel</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sign in to your account</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access the admin panel.</p>

          <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4">
            <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register("email")} placeholder="you@example.com" />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-end text-sm">
              <a href="/login/forgot-password" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" loading={submitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(a)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-left text-xs hover:border-primary-200 hover:bg-primary-50 dark:border-gray-800 dark:hover:bg-primary-500/10"
                >
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{a.name}</span>
                    <span className="text-gray-400"> — {a.role}</span>
                  </span>
                  <span className="text-gray-400">Click to fill</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
