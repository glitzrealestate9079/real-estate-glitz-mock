"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Skeleton, SkeletonRow } from "./Skeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

/**
 * Generic sortable / paginated / searchable table used by every module.
 *
 * columns: [{ key, header, sortable?, searchable?, render?(row) }]
 * data: array of row objects (each needs a stable `id`)
 * Other props: loading, error, onRetry, searchable, pageSize, emptyTitle, emptyDescription,
 *   selectable (adds a checkbox column), selectedIds, onSelectedIdsChange, rowActions(row)
 */
export default function Table({
  columns,
  data = [],
  loading = false,
  error = null,
  onRetry,
  searchable = true,
  pageSize = 8,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your filters or search.",
  selectable = false,
  selectedIds = [],
  onSelectedIdsChange,
  rowActions,
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const searchableKeys = useMemo(
    () => columns.filter((c) => c.searchable !== false).map((c) => c.key),
    [columns]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchableKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchableKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir("asc");
    }
    setPage(1);
  }

  function toggleAll(checked) {
    onSelectedIdsChange?.(checked ? pageRows.map((r) => r.id) : []);
  }

  function toggleOne(id, checked) {
    if (!onSelectedIdsChange) return;
    onSelectedIdsChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));
  }

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds.includes(r.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card dark:border-gray-800 dark:bg-surface-dark-subtle">
      {searchable && (
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-700 outline-none transition focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:bg-gray-900"
            />
          </div>
        </div>
      )}

      {/* Desktop/tablet: standard scrollable table. */}
      <div className="scrollbar-thin hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-accent-400"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium">
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} />
              ))}

            {!loading &&
              !error &&
              pageRows.map((row, idx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: idx * 0.015 }}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => toggleOne(row.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-accent-400"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">{rowActions(row)}</div>
                    </td>
                  )}
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per row instead of a cramped, horizontally-scrolling table. */}
      <div className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}

        {!loading &&
          !error &&
          pageRows.map((row, idx) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, delay: idx * 0.015 }}
              className="p-4"
            >
              <div className="flex items-start gap-3">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => toggleOne(row.id, e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-accent-400"
                  />
                )}
                <div className="min-w-0 flex-1">
                  {columns[0].render ? columns[0].render(row) : <p className="font-medium text-gray-900 dark:text-gray-100">{row[columns[0].key]}</p>}
                </div>
              </div>

              {columns.length > 1 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                  {columns.slice(1).map((col) => (
                    <div key={col.key} className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-gray-400">{col.header}</dt>
                      <dd className="mt-0.5 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(row) : row[col.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {rowActions && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-800">
                  {rowActions(row)}
                </div>
              )}
            </motion.div>
          ))}
      </div>

      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}
      {!loading && !error && sorted.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 disabled:opacity-40 dark:border-gray-700",
                currentPage !== 1 && "hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 disabled:opacity-40 dark:border-gray-700",
                currentPage !== totalPages && "hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
