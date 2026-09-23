"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft, Building, MailCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = yup.object({
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
});

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { email: "" } });

  function submit(values) {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSentTo(values.email);
    }, 500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-6 py-12 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-white">
            <Building className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-gray-900 dark:text-gray-100">Real Estate Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Marketplace Control Panel</p>
          </div>
        </div>

        {sentTo ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <MailCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Check your email</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              If an account exists for <span className="font-medium text-gray-700 dark:text-gray-300">{sentTo}</span>, a password reset link has been sent.
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reset your password</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your email and we'll send you a link to reset it.</p>

            <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4">
              <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register("email")} placeholder="you@example.com" />
              <Button type="submit" className="w-full" loading={submitting}>
                Send Reset Link
              </Button>
            </form>

            <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
