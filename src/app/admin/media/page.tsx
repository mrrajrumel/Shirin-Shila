"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Search,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { MediaPickerModal, MediaAsset } from "@/components/admin/media-picker-modal";

interface MediaUsageRef {
  section: string;
  identifier: string;
  label: string;
  field: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<string[]>(["all"]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Usage modal state
  const [activeUsageAsset, setActiveUsageAsset] = useState<MediaAsset | null>(null);
  const [usageRefs, setUsageRefs] = useState<MediaUsageRef[]>([]);
  const [checkingUsage, setCheckingUsage] = useState(false);

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = useState<MediaAsset | null>(null);
  const [deleteCandidateRefs, setDeleteCandidateRefs] = useState<MediaUsageRef[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        if (data.folders) setFolders(data.folders);
      }
    } catch (err) {
      console.error("Failed to load media manifest:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleReindex = async () => {
    setRefreshing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reindex" }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Media library synchronized. Indexed ${data.count} assets.`,
        });
        await fetchAssets();
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Reindex failed" });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCheckUsage = async (asset: MediaAsset) => {
    setActiveUsageAsset(asset);
    setCheckingUsage(true);
    setUsageRefs([]);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-usage", url: asset.url }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsageRefs(data.references || []);
      }
    } catch (err) {
      console.error("Error checking usage:", err);
    } finally {
      setCheckingUsage(false);
    }
  };

  const initiateDelete = async (asset: MediaAsset) => {
    setDeleteCandidate(asset);
    setDeleting(true);
    setDeleteCandidateRefs([]);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-usage", url: asset.url }),
      });
      if (res.ok) {
        const data = await res.json();
        setDeleteCandidateRefs(data.references || []);
      }
    } catch (err) {
      console.error("Error checking usage before delete:", err);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = async (force: boolean = false) => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: deleteCandidate.id,
          force,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      setFeedback({
        type: "success",
        message: `Asset ${deleteCandidate.originalName} removed safely from library.`,
      });
      setDeleteCandidate(null);
      await fetchAssets();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete asset",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRefreshing(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", selectedFolder === "all" ? "general" : selectedFolder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setFeedback({
        type: "success",
        message: data.isDuplicate
          ? "Identical file content detected; canonical asset reused!"
          : "New asset uploaded and indexed into manifest.",
      });
      await fetchAssets();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Upload failed" });
    } finally {
      setRefreshing(false);
      e.target.value = "";
    }
  };

  const filtered = assets.filter((a) => {
    const matchesFolder =
      selectedFolder === "all" || a.folder.toLowerCase() === selectedFolder.toLowerCase();
    const matchesSearch =
      !search ||
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      a.originalName.toLowerCase().includes(search.toLowerCase()) ||
      a.url.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <main className="adm-content">
      {/* Header bar */}
      <div className="adm-card mb-6">
        <div className="adm-card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="text-primary" size={20} />
                Central Media Library & Asset Registry
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Persistent, deduplicated media repository powering Hero, Filmography, Gallery,
                Timeline, Press, and SEO.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReindex}
                disabled={refreshing}
                className="adm-btn adm-btn-secondary text-xs"
                title="Rescan filesystem and sync manifest"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                <span>Resync Files</span>
              </button>

              <label className="adm-btn adm-btn-primary text-xs cursor-pointer">
                <Upload size={13} />
                <span>Upload New Media</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  style={{ display: "none" }}
                  onChange={handleUploadNew}
                />
              </label>
            </div>
          </div>

          {feedback && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {feedback.type === "success" ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {folders.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                selectedFolder === f
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename or path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Media Assets Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          Loading canonical media library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No media assets found in this folder or matching query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                  <img
                    src={asset.url}
                    alt={asset.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white font-mono uppercase">
                    {asset.folder}
                  </span>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className="text-xs font-semibold text-slate-800 truncate"
                      title={asset.originalName}
                    >
                      {asset.originalName}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5 truncate">
                    {asset.url}
                  </span>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span>{formatSize(asset.size)}</span>
                    <span className="uppercase">{asset.mimeType.split("/")[1] || "img"}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(asset.url)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Copy URL to clipboard"
                >
                  {copiedUrl === asset.url ? (
                    <>
                      <Check size={12} className="text-green-600" />
                      <span className="text-green-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckUsage(asset)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-[11px] font-medium transition-colors"
                >
                  Usage
                </button>

                <button
                  type="button"
                  onClick={() => initiateDelete(asset)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete asset"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage References Modal */}
      {activeUsageAsset && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Asset Usage Inspector
              </h3>
              <button
                type="button"
                onClick={() => setActiveUsageAsset(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4">
              <div className="flex items-center gap-3 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <img
                  src={activeUsageAsset.url}
                  alt={activeUsageAsset.originalName}
                  className="w-12 h-12 object-cover rounded border border-slate-200"
                />
                <div className="truncate">
                  <span className="block text-xs font-semibold text-slate-800 truncate">
                    {activeUsageAsset.originalName}
                  </span>
                  <span className="block text-[11px] text-slate-500 font-mono truncate">
                    {activeUsageAsset.url}
                  </span>
                </div>
              </div>

              {checkingUsage ? (
                <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  Scanning store collections for active references...
                </div>
              ) : usageRefs.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-xs text-slate-600">
                  <ShieldCheck size={20} className="text-green-600 mx-auto mb-1" />
                  This asset is currently unreferenced by any portfolio section. It can be safely
                  deleted or linked to content.
                </div>
              ) : (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Actively referenced in {usageRefs.length} place(s):
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {usageRefs.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-indigo-50 border border-indigo-100 text-[11px] flex items-center justify-between"
                      >
                        <span className="font-semibold text-indigo-950">{ref.section}</span>
                        <span className="text-indigo-600 font-mono text-[10px]">{ref.field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveUsageAsset(null)}
                className="adm-btn adm-btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold text-slate-900">Delete Asset</h3>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">{deleteCandidate.originalName}</strong>?
            </p>

            {deleteCandidateRefs.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
                <span className="font-bold block mb-1">
                  Warning: Asset is actively in use ({deleteCandidateRefs.length} place(s)):
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {deleteCandidateRefs.slice(0, 4).map((r, i) => (
                    <li key={i}>
                      {r.section} ({r.field})
                    </li>
                  ))}
                  {deleteCandidateRefs.length > 4 && (
                    <li>...and {deleteCandidateRefs.length - 4} more</li>
                  )}
                </ul>
                <span className="block mt-2 font-medium">
                  Deleting will cause broken images in these live portfolio sections!
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={deleting}
                className="adm-btn adm-btn-secondary text-xs"
              >
                Cancel
              </button>

              {deleteCandidateRefs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => confirmDelete(true)}
                  disabled={deleting}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold"
                >
                  {deleting ? "Force Deleting..." : "Force Delete Anyway"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => confirmDelete(false)}
                  disabled={deleting}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

