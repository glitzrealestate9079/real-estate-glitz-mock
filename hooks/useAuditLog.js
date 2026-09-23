import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { logAuditEntry } from "@/redux/slices/settingsSlice";
import { nowLogTimestamp } from "@/utils/format";

/**
 * Every moderation action (approve/reject a listing, suspend a user, resolve a report, ...)
 * calls `logAction` so Settings > Audit Log reflects what actually happened instead of the
 * static seed list it shipped with.
 */
export function useAuditLog() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.user?.name) ?? "admin";

  function logAction(action, module) {
    dispatch(
      logAuditEntry({
        timestamp: nowLogTimestamp(),
        admin: admin.trim().toLowerCase().replace(/\s+/g, "_"),
        action,
        module,
      })
    );
  }

  return logAction;
}
