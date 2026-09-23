import { Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import ThemeEffect from "@/components/providers/ThemeEffect";
import AuthEffect from "@/components/providers/AuthEffect";
import { COLOR_THEMES, DEFAULT_THEME_ID } from "@/lib/themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "AI-Powered Real Estate Marketplace — Admin",
  description: "Admin panel for moderating listings, users, leads, payments and townships.",
};

// Applies the saved dark-mode + color-theme preference to <html> before first paint, so
// returning visitors never see a flash of the default theme before React hydrates and
// ThemeEffect takes over. Built from the same lib/themes.js data the picker uses, so it can
// never drift out of sync.
const THEME_VARS_BY_ID = Object.fromEntries(COLOR_THEMES.map((t) => [t.id, t.vars]));
const COLOR_SCRIPT = `(function(){try{
var THEMES=${JSON.stringify(THEME_VARS_BY_ID)};
var root=document.documentElement;
var savedDark=localStorage.getItem("rea-admin-theme");
if(savedDark==="dark"){root.classList.add("dark");}
else if(savedDark==="light"){root.classList.remove("dark");}
else if(window.matchMedia("(prefers-color-scheme: dark)").matches){root.classList.add("dark");}
var savedTheme=localStorage.getItem("rea-admin-color-theme")||"${DEFAULT_THEME_ID}";
var vars=THEMES[savedTheme]||THEMES["${DEFAULT_THEME_ID}"];
for(var k in vars){root.style.setProperty(k,vars[k]);}
}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCRIPT }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        {/* reducedMotion="user" makes every framer-motion animation in the app honor the OS-level
            "reduce motion" accessibility preference automatically — no per-component changes. */}
        <MotionConfig reducedMotion="user">
          <ReduxProvider>
            <ThemeEffect />
            <AuthEffect />
            <ToastProvider />
            {children}
          </ReduxProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
