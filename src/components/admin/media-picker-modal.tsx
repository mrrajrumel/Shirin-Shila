"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Upload,
  Check,
  Folder,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  hash: string;
  folder: string;
  uploadedAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  title?: string;
  currentValue?: string;
  targetFolder?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media Asset",
  currentValue = "",
  targetFolder = "general",
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<string[]>(["all"]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        if (data.folders) setFolders(data.folders);

        // Pre-select current value if matches an asset
        if (currentValue) {
          const match = (data.assets || []).find(
            (a: MediaAsset) => a.url === currentValue || a.filename === currentValue
          );
          if (match) setSelectedAsset(match);
        }
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredAssets = assets.filter((asset) => {
    const matchesFolder =
      selectedFolder === "all" || asset.folder.toLowerCase() === selectedFolder.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", targetFolder);

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
        type: data.isDuplicate ? "info" : "success",
        message: data.message || "File uploaded successfully",
      });

      // Refresh list
      await fetchAssets();
      if (data.asset) {
        setSelectedAsset(data.asset);
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error uploading file",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.url, selectedAsset);
      onClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          maxHeight: "90vh",
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#1c2434",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                {title}
              </h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Choose existing media or upload new asset (auto-deduplicated)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              padding: "6px 12px",
              gap: "8px",
              flex: "1 1 240px",
              maxWidth: "320px",
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search media by name or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "13px",
                width: "100%",
                color: "#0f172a",
              }}
            />
          </div>

          {/* Folder Filter */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
            {folders.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFolder(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: selectedFolder === f ? 600 : 400,
                  border: selectedFolder === f ? "1px solid #1c2434" : "1px solid #e2e8f0",
                  backgroundColor: selectedFolder === f ? "#1c2434" : "#ffffff",
                  color: selectedFolder === f ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#3c50e0",
                color: "#ffffff",
                fontSize: "12.5px",
                fontWeight: 500,
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Upload New</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                style={{ display: "none" }}
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            style={{
              padding: "8px 20px",
              backgroundColor:
                feedback.type === "success"
                  ? "#dcfce7"
                  : feedback.type === "info"
                  ? "#e0e7ff"
                  : "#fee2e2",
              color:
                feedback.type === "success"
                  ? "#166534"
                  : feedback.type === "info"
                  ? "#3730a3"
                  : "#991b1b",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={15} />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Body Grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            minHeight: "300px",
            maxHeight: "55vh",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "220px",
                color: "#64748b",
                fontSize: "13px",
                gap: "8px",
              }}
            >
              <RefreshCw size={18} className="animate-spin" />
              <span>Scanning canonical media library...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "220px",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              <Folder size={40} strokeWidth={1.5} style={{ marginBottom: "8px" }} />
              <span>No media assets found matching query</span>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "12px",
              }}
            >
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id || selectedAsset?.url === asset.url;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    style={{
                      border: isSelected ? "2px solid #3c50e0" : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      transition: "all 0.15s ease",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100px",
                        backgroundColor: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={asset.url}
                        alt={asset.originalName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            backgroundColor: "#3c50e0",
                            color: "#ffffff",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "6px 8px" }}>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 500,
                          color: "#1e293b",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={asset.originalName}
                      >
                        {asset.originalName}
                      </span>
                      <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>
                        {formatSize(asset.size)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with preview and confirm */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {selectedAsset ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.originalName}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    border: "1px solid #cbd5e1",
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#0f172a",
                      display: "block",
                    }}
                  >
                    {selectedAsset.originalName}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                    {selectedAsset.url}
                  </span>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Click any asset above to select
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "12.5px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedAsset}
              onClick={handleConfirmSelection}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: selectedAsset ? "#1c2434" : "#94a3b8",
                color: "#ffffff",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: selectedAsset ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Check size={14} />
              <span>Use This Asset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

