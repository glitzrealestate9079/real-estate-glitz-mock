"use client";

import { useState } from "react";
import { Eye, FileText, Image as ImageIcon, Layers, Pencil, Plus, Power, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ArticleFormModal from "@/components/cms/ArticleFormModal";
import StaticPageFormModal from "@/components/cms/StaticPageFormModal";
import BannerFormModal from "@/components/cms/BannerFormModal";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  addArticle,
  addBanner,
  addStaticPage,
  removeArticle,
  removeArticles,
  removeBanner,
  removeStaticPage,
  updateArticle,
  updateBanner,
  updateStaticPage,
} from "@/redux/slices/cmsSlice";
import { formatCount, todayISO } from "@/utils/format";

const TABS = [
  { key: "articles", label: "Blog / News", icon: FileText },
  { key: "pages", label: "Static Pages", icon: Layers },
  { key: "banners", label: "Banners", icon: ImageIcon },
];

const ARTICLE_STATUS_BADGE = {
  draft: { variant: "neutral", label: "Draft" },
  published: { variant: "success", label: "Published" },
  archived: { variant: "warning", label: "Archived" },
};

const PAGE_STATUS_BADGE = {
  draft: { variant: "neutral", label: "Draft" },
  published: { variant: "success", label: "Published" },
};

const BANNER_STATUS_BADGE = {
  inactive: { variant: "neutral", label: "Inactive" },
  scheduled: { variant: "info", label: "Scheduled" },
  active: { variant: "success", label: "Active" },
  expired: { variant: "warning", label: "Expired" },
};

/** A banner's manual on/off flag doesn't account for its own date range — this derives the real
 * on-site state so "Active" can't be shown for a banner that hasn't started yet or already ended. */
function bannerStatus(banner) {
  if (!banner.active) return "inactive";
  const today = todayISO();
  if (today < banner.startDate) return "scheduled";
  if (today > banner.endDate) return "expired";
  return "active";
}

export default function CmsPage() {
  const [tab, setTab] = useState("articles");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">CMS</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Blog articles, static pages and homepage banners — each with its own SEO metadata.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "articles" && <ArticlesTab />}
      {tab === "pages" && <PagesTab />}
      {tab === "banners" && <BannersTab />}
    </div>
  );
}

function ArticlesTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cms.articles);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const viewing = items.find((a) => a.id === viewingId) ?? null;

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateArticle({ id: editing.id, ...values, publishedDate: values.status === "published" ? editing.publishedDate ?? todayISO() : editing.publishedDate }));
        toast.success(`${values.title} updated`);
      } else {
        const newId = `ART-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addArticle({ id: newId, ...values, publishedDate: values.status === "published" ? todayISO() : null }));
        toast.success(`${values.title} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleDelete() {
    dispatch(removeArticle(deleteTarget.id));
    toast.success(`${deleteTarget.title} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    dispatch(removeArticles(selectedIds));
    toast.success(`${selectedIds.length} articles deleted`);
    setSelectedIds([]);
  }

  const columns = [
    {
      key: "title",
      header: "Article",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="max-w-[260px] truncate font-medium text-gray-900 dark:text-gray-100">{row.title}</p>
          <p className="text-xs text-gray-400">{row.author}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = ARTICLE_STATUS_BADGE[row.status] ?? ARTICLE_STATUS_BADGE.draft;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "publishedDate", header: "Published", sortable: true, render: (row) => row.publishedDate ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Article
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        emptyTitle="No articles yet"
        rowActions={(row) => (
          <>
            <button onClick={() => setViewingId(row.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" aria-label="View article">
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label="Edit article"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete article">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <ArticleFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This will permanently remove the article."
        confirmLabel="Delete"
      />

      <Modal isOpen={Boolean(viewing)} onClose={() => setViewingId(null)} size="lg" title={viewing?.title} description={viewing ? `${viewing.id} — by ${viewing.author}` : ""}>
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={ARTICLE_STATUS_BADGE[viewing.status]?.variant}>{ARTICLE_STATUS_BADGE[viewing.status]?.label}</Badge>
              <Badge variant="neutral">{viewing.category}</Badge>
              {viewing.publishedDate && <span className="text-xs text-gray-400">Published {viewing.publishedDate}</span>}
            </div>
            <p className="italic text-gray-600 dark:text-gray-400">{viewing.excerpt}</p>
            <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">{viewing.content}</p>
            <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
              <p className="font-semibold text-gray-500 dark:text-gray-400">SEO Title</p>
              <p className="mb-2 text-gray-700 dark:text-gray-300">{viewing.seoTitle}</p>
              <p className="font-semibold text-gray-500 dark:text-gray-400">SEO Description</p>
              <p className="text-gray-700 dark:text-gray-300">{viewing.seoDescription}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PagesTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cms.staticPages);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateStaticPage({ id: editing.id, ...values, lastUpdated: todayISO() }));
        toast.success(`${values.title} updated`);
      } else {
        const newId = `PAGE-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addStaticPage({ id: newId, ...values, lastUpdated: todayISO() }));
        toast.success(`${values.title} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleDelete() {
    dispatch(removeStaticPage(deleteTarget.id));
    toast.success(`${deleteTarget.title} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => dispatch(removeStaticPage(id)));
    toast.success(`${selectedIds.length} pages deleted`);
    setSelectedIds([]);
  }

  const columns = [
    { key: "title", header: "Page", sortable: true },
    { key: "slug", header: "URL" },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = PAGE_STATUS_BADGE[row.status] ?? PAGE_STATUS_BADGE.draft;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "lastUpdated", header: "Last Updated", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Page
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No static pages yet"
        rowActions={(row) => (
          <>
            <button
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label="Edit page"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete page">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <StaticPageFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This will permanently remove the page."
        confirmLabel="Delete"
      />
    </div>
  );
}

function BannersTab() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cms.banners);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(values) {
    setBusy(true);
    setTimeout(() => {
      if (editing) {
        dispatch(updateBanner({ id: editing.id, ...values }));
        toast.success(`${values.title} updated`);
      } else {
        const newId = `BNR-${Math.floor(100 + Math.random() * 899)}`;
        dispatch(addBanner({ id: newId, ...values, clicks: 0 }));
        toast.success(`${values.title} added`);
      }
      setBusy(false);
      setFormOpen(false);
      setEditing(null);
    }, 400);
  }

  function handleToggle(banner) {
    dispatch(updateBanner({ id: banner.id, active: !banner.active }));
    toast.success(`${banner.title} ${banner.active ? "deactivated" : "activated"}`);
  }

  function handleDelete() {
    dispatch(removeBanner(deleteTarget.id));
    toast.success(`${deleteTarget.title} deleted`);
    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => dispatch(removeBanner(id)));
    toast.success(`${selectedIds.length} banners deleted`);
    setSelectedIds([]);
  }

  const columns = [
    { key: "title", header: "Banner", sortable: true },
    { key: "position", header: "Placement", sortable: true },
    { key: "startDate", header: "Start", sortable: true, render: (row) => `${row.startDate} → ${row.endDate}`, searchable: false },
    { key: "clicks", header: "Clicks", sortable: true, render: (row) => formatCount(row.clicks) },
    {
      key: "active",
      header: "Status",
      sortable: true,
      render: (row) => {
        const s = BANNER_STATUS_BADGE[bannerStatus(row)];
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Banner
        </Button>
      </div>

      <Table
        columns={columns}
        data={items}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        pageSize={10}
        emptyTitle="No banners yet"
        rowActions={(row) => (
          <>
            <button
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800"
              aria-label="Edit banner"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleToggle(row)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                row.active ? "hover:text-danger" : "hover:text-success"
              )}
              aria-label={row.active ? "Deactivate banner" : "Activate banner"}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setDeleteTarget(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger" aria-label="Delete banner">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      />

      <BannerFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={editing} submitting={busy} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This will permanently remove the banner slot."
        confirmLabel="Delete"
      />
    </div>
  );
}
