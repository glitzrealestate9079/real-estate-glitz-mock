"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#0D1B33",
          color: "#fff",
          borderRadius: "10px",
          fontSize: "14px",
          padding: "10px 14px",
        },
        success: {
          iconTheme: { primary: "#16A34A", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#DC2626", secondary: "#fff" },
        },
      }}
    />
  );
}
