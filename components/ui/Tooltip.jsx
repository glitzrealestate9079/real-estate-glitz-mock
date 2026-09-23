"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Portal-based tooltip — renders straight into <body> and positions itself from the trigger's
 * own bounding rect (the same portal pattern Modal.jsx uses), so it can't get clipped by a
 * scrollable/overflow ancestor. That's what the collapsed sidebar rail needs: its <nav> already
 * scrolls vertically, and a plain absolutely-positioned tooltip would get cut off horizontally.
 *
 * Usage: <Tooltip content="Dashboard" side="right"><Link ...>...</Link></Tooltip>
 * `disabled` skips the portal/listeners entirely (used when the sidebar isn't collapsed, so a
 * visible label already makes the tooltip redundant).
 */
export default function Tooltip({ children, content, side = "right", disabled = false }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  if (disabled || !content) return children;

  function show() {
    if (!ref.current) return;
    clearTimeout(hideTimer.current);
    const rect = ref.current.getBoundingClientRect();
    if (side === "right") {
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 10, transform: "translateY(-50%)" });
    } else {
      setCoords({ top: rect.top - 8, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" });
    }
    setOpen(true);
  }

  // A short grace period before actually closing — the trigger can lose and immediately regain
  // hover/focus for reasons that have nothing to do with the user intentionally moving away (a
  // click-driven route change is the main one here: navigating away from under the cursor can
  // cause a spurious blur/re-render right as the new page mounts), which without this reads as
  // the tooltip blinking off and on as you click through sidebar items with the mouse held still.
  function hide() {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const trigger = cloneElement(children, {
    ref,
    onMouseEnter: (e) => {
      children.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e) => {
      children.props.onFocus?.(e);
      show();
    },
    onBlur: (e) => {
      children.props.onBlur?.(e);
      hide();
    },
  });

  return (
    <>
      {trigger}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.span
                role="tooltip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ position: "fixed", top: coords.top, left: coords.left, transform: coords.transform }}
                className="pointer-events-none z-[100] whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-700"
              >
                {content}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
