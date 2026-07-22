"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Document } from "@/lib/supabase";

// --- Data ---


const salesChecklist = [
  "Agency Agreement signed",
  "Vendor disclosure provided",
  "Section 32 / Vendor Statement prepared",
  "AML customer ID verified",
  "Contract of Sale prepared",
  "Marketing material approved",
  "Cooling-off period noted",
  "Deposit received into trust account",
  "Settlement date confirmed",
  "Final inspection completed",
];

const managementChecklist = [
  "Management Agreement signed",
  "Property condition report completed",
  "Bond lodged with authority",
  "Tenant identity verified (AML)",
  "Entry condition report completed",
  "Smoke alarm compliance checked",
  "Pool safety certificate obtained",
  "Rental listing compliance reviewed",
  "First inspection scheduled",
  "Rent roll entry complete",
];

const defaultChecked: Record<string, number[]> = {
  s1: [0, 1, 2, 3, 4],
  s2: [0, 1, 2],
  s3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  s4: [0],
  s5: [0, 1, 2, 3, 4, 5, 6],
  m1: [0, 1, 2, 3, 4, 5],
  m2: [0, 1, 2],
  m3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  m4: [0, 1],
  m5: [0, 1, 2, 3, 4, 5, 6, 7],
};

type SalesPropItem = { id: string; address: string; vendorName?: string; addedAt?: string };

type StaffRow = {
  id: string;
  name: string;
  role: string;
  licence: "current" | "renewal-due" | "exempt";
  expiry: string;
  cpd: "complete" | "due-soon" | "overdue" | "na";
  email: string;
  phone: string;
  start_date: string;
  licence_number: string;
  cpd_required: number;
  cpd_completed: number;
  cpd_deadline: string;
};

// --- Icons ---
function PolIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4h10M4 8h7M4 12h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function SalesIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 13L7 8l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MgmtIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="9" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="7" y="5" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="12" y="2" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.6" /></svg>; }
function StaffIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function TrustIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M2 8h14" stroke="currentColor" strokeWidth="1.6" /><path d="M6 12h2M10 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.93 3.93l1.06 1.06M13.01 13.01l1.06 1.06M14.07 3.93l-1.06 1.06M4.99 13.01l-1.06 1.06" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }

const iconMap: Record<string, React.ReactNode> = {
  policies: <PolIcon />, sales: <SalesIcon />, management: <MgmtIcon />, staff: <StaffIcon />, trust: <TrustIcon />,
};

// --- Types ---
type PolicyRow = {
  id: string;
  name: string;
  category: string | null;
  status: "current" | "review-due";
  last_reviewed: string | null;
  next_review: string | null;
  content: string | null;
  source: "template" | "upload";
};

type ItemStatus = "not_started" | "in_progress" | "complete" | "na";
interface UploadedFile { name: string; size: string; addedAt: string; }
interface ItemData { status: ItemStatus; notes: string; files: UploadedFile[]; }
type ItemDataMap = Record<string, ItemData>;

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bg: string; border: string }> = {
  not_started: { label: "Not started", color: "var(--rc-faint)", bg: "transparent", border: "var(--rc-border)" },
  in_progress: { label: "In progress", color: "oklch(0.55 0.15 55)", bg: "oklch(0.97 0.025 55)", border: "oklch(0.82 0.09 55)" },
  complete: { label: "Complete", color: "oklch(0.45 0.14 145)", bg: "oklch(0.96 0.025 145)", border: "oklch(0.82 0.08 145)" },
  na: { label: "N/A", color: "var(--rc-muted)", bg: "var(--rc-surface)", border: "var(--rc-border)" },
};

function fmtBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// --- Item detail panel ---
function ItemDetail({
  itemKey,
  label,
  data,
  onChange,
  onClose,
}: {
  itemKey: string;
  label: string;
  data: ItemData;
  onChange: (key: string, data: ItemData) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  function update(patch: Partial<ItemData>) {
    onChange(itemKey, { ...data, ...patch });
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: fmtBytes(f.size),
      addedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    }));
    update({ files: [...data.files, ...newFiles] });
  }

  function removeFile(idx: number) {
    update({ files: data.files.filter((_, i) => i !== idx) });
  }

  function saveNotes() {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  const cfg = STATUS_CONFIG[data.status];

  return (
    <div
      style={{
        width: "380px",
        flexShrink: 0,
        borderLeft: "1px solid var(--rc-border)",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 0px)",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        background: "var(--rc-bg)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--rc-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", lineHeight: 1.35 }}>
            {label}
          </h2>
          <button
            onClick={onClose}
            style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", padding: "2px", borderRadius: "4px" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "28px", flex: 1 }}>

        {/* Status */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--rc-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Status</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map((s) => {
              const c = STATUS_CONFIG[s];
              const active = data.status === s;
              return (
                <button
                  key={s}
                  onClick={() => update({ status: s, ...(s === "complete" ? {} : {}) })}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "100px",
                    border: `1px solid ${active ? c.border : "var(--rc-border)"}`,
                    background: active ? c.bg : "transparent",
                    color: active ? c.color : "var(--rc-faint)",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--rc-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Notes</p>
          <textarea
            value={data.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Add notes, instructions, or context for this item…"
            rows={5}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--rc-border)",
              background: "var(--rc-bg)",
              fontSize: "13.5px",
              color: "var(--rc-ink)",
              fontFamily: "var(--font-inter)",
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")}
          />
          <button
            onClick={saveNotes}
            style={{
              marginTop: "8px",
              padding: "7px 16px",
              borderRadius: "7px",
              background: notesSaved ? "oklch(0.60 0.16 145)" : "var(--rc-primary)",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
              transition: "background 0.2s ease",
            }}
          >
            {notesSaved ? "Saved ✓" : "Save notes"}
          </button>
        </div>

        {/* Documents */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--rc-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Documents</p>

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragOver ? "var(--rc-primary)" : "var(--rc-border)"}`,
              borderRadius: "10px",
              padding: "20px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "var(--rc-primary-light)" : "var(--rc-surface)",
              transition: "all 0.15s ease",
              marginBottom: "12px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px", display: "block", color: dragOver ? "var(--rc-primary)" : "var(--rc-faint)" }}>
              <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: "13px", color: dragOver ? "var(--rc-primary)" : "var(--rc-muted)", fontWeight: 500, maxWidth: "none", margin: 0 }}>
              Drop files here or <span style={{ color: "var(--rc-primary)", fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ fontSize: "11px", color: "var(--rc-faint)", marginTop: "4px", maxWidth: "none" }}>PDF, Word, images up to 20MB</p>
          </div>
          <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />

          {/* File list */}
          {data.files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.files.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    background: "var(--rc-surface)",
                    border: "1px solid var(--rc-border)",
                    borderRadius: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--rc-primary)" }}>
                    <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "none", margin: 0 }}>{f.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none", margin: 0 }}>{f.size} · {f.addedAt}</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", padding: "2px", flexShrink: 0 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Property checklist view ---
function PropertyChecklist({
  propertyId,
  address,
  type,
  onRemove,
}: {
  propertyId: string;
  address: string;
  type: "sales" | "management";
  onRemove: () => void;
}) {
  const items = type === "sales" ? salesChecklist : managementChecklist;

  const [itemData, setItemData] = useState<ItemDataMap>(() => {
    const map: ItemDataMap = {};
    items.forEach((_, i) => {
      const key = `${propertyId}_${i}`;
      const isComplete = (defaultChecked[propertyId] ?? []).includes(i);
      map[key] = { status: isComplete ? "complete" : "not_started", notes: "", files: [] };
    });
    return map;
  });

  const [openItem, setOpenItem] = useState<number | null>(null);

  function updateItem(key: string, data: ItemData) {
    setItemData((prev) => ({ ...prev, [key]: data }));
  }

  const done = items.filter((_, i) => itemData[`${propertyId}_${i}`]?.status === "complete").length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "flex-start" }}>
      {/* Checklist */}
      <div style={{ flex: 1, padding: "48px", minWidth: 0 }}>
        <div style={{ maxWidth: "600px" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-accent-dark)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px", maxWidth: "none" }}>
              {type === "sales" ? "Residential Sales" : "Residential Management"}
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>
              {address}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, height: "6px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "oklch(0.60 0.16 145)" : "var(--rc-primary)", borderRadius: "100px", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: pct === 100 ? "oklch(0.45 0.14 145)" : "var(--rc-primary)", flexShrink: 0 }}>
                {done}/{items.length} complete
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden" }}>
            {items.map((item, i) => {
              const key = `${propertyId}_${i}`;
              const data = itemData[key];
              const status = data?.status ?? "not_started";
              const isOpen = openItem === i;
              const cfg = STATUS_CONFIG[status];

              return (
                <div
                  key={item}
                  onClick={() => setOpenItem(isOpen ? null : i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    borderBottom: i < items.length - 1 ? "1px solid var(--rc-border)" : "none",
                    background: isOpen ? "var(--rc-surface)" : status === "complete" ? "oklch(0.985 0.006 145)" : "var(--rc-bg)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    userSelect: "none",
                  }}
                >
                  {/* Status dot */}
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      border: status === "complete" ? "none" : `1.5px solid ${status === "in_progress" ? "oklch(0.75 0.15 55)" : "var(--rc-border)"}`,
                      background: status === "complete" ? "oklch(0.60 0.16 145)" : status === "in_progress" ? "oklch(0.97 0.025 55)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {status === "complete" && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {status === "in_progress" && (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "oklch(0.65 0.16 55)" }} />
                    )}
                  </div>

                  <span style={{ fontSize: "14px", color: status === "complete" ? "var(--rc-faint)" : "var(--rc-ink)", textDecoration: status === "complete" ? "line-through" : "none", flex: 1 }}>
                    {item}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {data?.files.length > 0 && (
                      <span style={{ fontSize: "11px", color: "var(--rc-primary)", fontWeight: 600 }}>
                        {data.files.length} doc{data.files.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {data?.notes && (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: "var(--rc-faint)" }}>
                        <path d="M2 2h9v7H7l-2 2V9H2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: cfg.color,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        padding: "2px 8px",
                        borderRadius: "100px",
                        display: status === "not_started" ? "none" : "inline",
                      }}
                    >
                      {cfg.label}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--rc-faint)", flexShrink: 0 }}>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {pct === 100 && (
            <div style={{ marginTop: "20px", padding: "14px 18px", background: "oklch(0.96 0.025 145)", border: "1px solid oklch(0.82 0.08 145)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" fill="oklch(0.60 0.16 145)" />
                <path d="M5.5 9l2.5 2.5 4-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "oklch(0.38 0.13 145)" }}>All compliance items complete.</span>
            </div>
          )}

          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--rc-border)" }}>
            <button
              onClick={() => { if (window.confirm(`Remove "${address}" from your properties? This cannot be undone.`)) onRemove(); }}
              style={{ fontSize: "13px", fontWeight: 500, color: "oklch(0.50 0.18 25)", background: "transparent", border: "1px solid oklch(0.82 0.06 25)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "background 0.15s ease, color 0.15s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.96 0.02 25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Remove property
            </button>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {openItem !== null && (
        <ItemDetail
          key={`${propertyId}_${openItem}`}
          itemKey={`${propertyId}_${openItem}`}
          label={items[openItem]}
          data={itemData[`${propertyId}_${openItem}`]}
          onChange={updateItem}
          onClose={() => setOpenItem(null)}
        />
      )}
    </div>
  );
}

// --- Sales property checklist ---

const amlSubChecklist = [
  "Vendor identity verified",
  "Government-issued ID sighted",
  "ID document copied / scanned",
  "AUSTRAC sanctions check completed",
  "Politically Exposed Person (PEP) check",
  "Source of funds assessed",
  "Risk rating assigned (Low / Medium / High)",
  "AML record created in system",
];

const idTypes = ["Driver's Licence", "Passport", "Medicare Card", "Birth Certificate", "Other"];

interface SalesPropertyState {
  cma: { value: string; notes: string; files: UploadedFile[]; status: ItemStatus };
  identification: { name: string; idType: string; idNumber: string; status: ItemStatus };
  rates: { council: UploadedFile[]; water: UploadedFile[]; strata: UploadedFile[]; status: ItemStatus };
  aml: { checks: boolean[]; status: ItemStatus };
  agencyAgreement: { files: UploadedFile[]; status: ItemStatus };
  contract: { files: UploadedFile[]; status: ItemStatus };
}

function SalesFileUpload({
  label,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  files: UploadedFile[];
  onAdd: (f: UploadedFile[]) => void;
  onRemove: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handle(fl: FileList | null) {
    if (!fl) return;
    onAdd(
      Array.from(fl).map((f) => ({
        name: f.name,
        size: fmtBytes(f.size),
        addedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      }))
    );
  }

  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--rc-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", maxWidth: "none" }}>
        {label}
      </p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        style={{
          border: `1.5px dashed ${drag ? "var(--rc-primary)" : "var(--rc-border)"}`,
          borderRadius: "8px",
          padding: "12px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: drag ? "oklch(0.97 0.015 255)" : "var(--rc-surface)",
          transition: "all 0.15s ease",
          marginBottom: files.length > 0 ? "8px" : "0",
        }}
      >
        <p style={{ fontSize: "12.5px", color: drag ? "var(--rc-primary)" : "var(--rc-faint)", maxWidth: "none", margin: 0 }}>
          Drop file or{" "}
          <span style={{ color: "var(--rc-primary)", fontWeight: 600 }}>browse</span>
        </p>
      </div>
      <input ref={ref} type="file" multiple style={{ display: "none" }} onChange={(e) => handle(e.target.files)} />
      {files.map((f, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 10px",
            background: "var(--rc-surface)",
            border: "1px solid var(--rc-border)",
            borderRadius: "7px",
            marginBottom: "4px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--rc-primary)" }}>
            <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</p>
            <p style={{ fontSize: "11px", color: "var(--rc-faint)", margin: 0, maxWidth: "none" }}>{f.size} · {f.addedAt}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", padding: "2px", flexShrink: 0, borderRadius: "4px" }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function SalesItemPanel({
  itemKey,
  state,
  setState,
  onClose,
}: {
  itemKey: keyof SalesPropertyState;
  state: SalesPropertyState;
  setState: React.Dispatch<React.SetStateAction<SalesPropertyState>>;
  onClose: () => void;
}) {
  const titles: Record<keyof SalesPropertyState, string> = {
    cma: "CMA Report",
    identification: "Identification",
    rates: "Rates",
    aml: "AML Compliance",
    agencyAgreement: "Selling Agency Agreement",
    contract: "Contract of Sale",
  };

  const status = state[itemKey].status;

  function setStatus(s: ItemStatus) {
    setState((prev) => ({ ...prev, [itemKey]: { ...prev[itemKey], status: s } }));
  }

  const panelWrap: React.CSSProperties = {
    width: "380px",
    flexShrink: 0,
    borderLeft: "1px solid var(--rc-border)",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 0px)",
    position: "sticky",
    top: 0,
    overflowY: "auto",
    background: "var(--rc-bg)",
  };

  const sectionLbl: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--rc-faint)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "10px",
    maxWidth: "none",
  };

  const inputSty: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--rc-border)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "var(--rc-ink)",
    background: "var(--rc-bg)",
    outline: "none",
    fontFamily: "var(--font-inter)",
    boxSizing: "border-box",
  };

  function PanelHeader() {
    return (
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--rc-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", lineHeight: 1.35 }}>
            {titles[itemKey]}
          </h2>
          <button onClick={onClose} style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", padding: "2px", borderRadius: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  function StatusPicker() {
    return (
      <div>
        <p style={sectionLbl}>Status</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map((s) => {
            const c = STATUS_CONFIG[s];
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: `1px solid ${active ? c.border : "var(--rc-border)"}`,
                  background: active ? c.bg : "transparent",
                  color: active ? c.color : "var(--rc-faint)",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                  transition: "all 0.15s ease",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (itemKey === "cma") {
    return (
      <div style={panelWrap}>
        <PanelHeader />
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
          <StatusPicker />
          <div>
            <p style={sectionLbl}>Estimated property value</p>
            <input
              value={state.cma.value}
              onChange={(e) => setState((prev) => ({ ...prev, cma: { ...prev.cma, value: e.target.value } }))}
              placeholder="e.g. $1,250,000"
              style={inputSty}
            />
          </div>
          <div>
            <p style={sectionLbl}>Notes</p>
            <textarea
              value={state.cma.notes}
              onChange={(e) => setState((prev) => ({ ...prev, cma: { ...prev.cma, notes: e.target.value } }))}
              placeholder="Comparable sales, market conditions, methodology..."
              rows={4}
              style={{ ...inputSty, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>
          <SalesFileUpload
            label="CMA document"
            files={state.cma.files}
            onAdd={(fs) => setState((prev) => ({ ...prev, cma: { ...prev.cma, files: [...prev.cma.files, ...fs] } }))}
            onRemove={(i) => setState((prev) => ({ ...prev, cma: { ...prev.cma, files: prev.cma.files.filter((_, j) => j !== i) } }))}
          />
        </div>
      </div>
    );
  }

  if (itemKey === "identification") {
    const idSighted = state.identification.status === "complete";
    return (
      <div style={panelWrap}>
        <PanelHeader />
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
          <StatusPicker />
          <div>
            <p style={sectionLbl}>Full legal name</p>
            <input
              value={state.identification.name}
              onChange={(e) => setState((prev) => ({ ...prev, identification: { ...prev.identification, name: e.target.value } }))}
              placeholder="Vendor full legal name"
              style={inputSty}
            />
          </div>
          <div>
            <p style={sectionLbl}>ID document type</p>
            <select
              value={state.identification.idType}
              onChange={(e) => setState((prev) => ({ ...prev, identification: { ...prev.identification, idType: e.target.value } }))}
              style={{ ...inputSty, appearance: "none" as React.CSSProperties["appearance"] }}
            >
              {idTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p style={sectionLbl}>Document number</p>
            <input
              value={state.identification.idNumber}
              onChange={(e) => setState((prev) => ({ ...prev, identification: { ...prev.identification, idNumber: e.target.value } }))}
              placeholder="Licence / passport number"
              style={inputSty}
            />
          </div>
          <div
            onClick={() => setStatus(idSighted ? "in_progress" : "complete")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              background: idSighted ? "oklch(0.96 0.025 145)" : "var(--rc-surface)",
              borderRadius: "9px",
              border: `1px solid ${idSighted ? "oklch(0.82 0.08 145)" : "var(--rc-border)"}`,
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "5px",
                border: idSighted ? "none" : "1.5px solid var(--rc-border)",
                background: idSighted ? "oklch(0.60 0.16 145)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              {idSighted && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: "13px", color: idSighted ? "oklch(0.38 0.13 145)" : "var(--rc-ink)", fontWeight: 500 }}>
              ID document sighted
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (itemKey === "rates") {
    return (
      <div style={panelWrap}>
        <PanelHeader />
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          <StatusPicker />
          <SalesFileUpload
            label="Council rates"
            files={state.rates.council}
            onAdd={(fs) => setState((prev) => ({ ...prev, rates: { ...prev.rates, council: [...prev.rates.council, ...fs] } }))}
            onRemove={(i) => setState((prev) => ({ ...prev, rates: { ...prev.rates, council: prev.rates.council.filter((_, j) => j !== i) } }))}
          />
          <SalesFileUpload
            label="Water rates"
            files={state.rates.water}
            onAdd={(fs) => setState((prev) => ({ ...prev, rates: { ...prev.rates, water: [...prev.rates.water, ...fs] } }))}
            onRemove={(i) => setState((prev) => ({ ...prev, rates: { ...prev.rates, water: prev.rates.water.filter((_, j) => j !== i) } }))}
          />
          <SalesFileUpload
            label="Strata rates"
            files={state.rates.strata}
            onAdd={(fs) => setState((prev) => ({ ...prev, rates: { ...prev.rates, strata: [...prev.rates.strata, ...fs] } }))}
            onRemove={(i) => setState((prev) => ({ ...prev, rates: { ...prev.rates, strata: prev.rates.strata.filter((_, j) => j !== i) } }))}
          />
        </div>
      </div>
    );
  }

  if (itemKey === "aml") {
    const gc = { bg: "oklch(0.96 0.025 145)", color: "oklch(0.45 0.14 145)", border: "oklch(0.82 0.08 145)" };
    const sp: React.CSSProperties = { padding: "16px 20px", borderBottom: "1px solid var(--rc-border)" };
    const stitle: React.CSSProperties = { fontSize: "13px", fontWeight: 700, color: "var(--rc-ink)" };
    const sdesc: React.CSSProperties = { fontSize: "12px", color: "var(--rc-faint)", margin: "4px 0 0", maxWidth: "none", lineHeight: 1.45 };
    const ghostBtn2 = (lbl: string) => (
      <button style={{ fontSize: "11px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "1px solid var(--rc-border)", padding: "3px 8px", borderRadius: "5px", cursor: "pointer", fontFamily: "var(--font-inter)", whiteSpace: "nowrap" }}>
        {lbl}
      </button>
    );

    return (
      <div style={panelWrap}>
        <PanelHeader />
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* AML Onboarding Form */}
          <div style={sp}>
            <span style={stitle}>AML Onboarding Form</span>
            <p style={{ ...sdesc, margin: "4px 0 8px" }}>Completed in REI Forms Live and attached to this client file.</p>
            <p style={{ fontSize: "11.5px", color: "var(--rc-faint)", margin: 0, maxWidth: "none", lineHeight: 1.4, padding: "8px 10px", background: "var(--rc-surface)", borderRadius: "6px" }}>
              Pick the AML CDD form that matches each buyer's entity type, then create it in REI Forms Live.
            </p>
          </div>

          {/* Client Info Request */}
          <div style={sp}>
            <span style={stitle}>Client Info Request</span>
            <p style={{ ...sdesc, margin: "4px 0 10px" }}>Sent from the onboarding form for each buyer to complete their identity & KYC details from their own device.</p>
            <div style={{ display: "flex", gap: "6px" }}>
              <button style={{ fontSize: "12px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontFamily: "var(--font-inter)" }}>
                Send to all
              </button>
              {ghostBtn2("Refresh status")}
            </div>
          </div>

          {/* Risk Assessment */}
          <div style={sp}>
            <span style={stitle}>Risk Assessment</span>
            <p style={{ ...sdesc, margin: "4px 0 10px" }}>Complete the AML/CTF risk assessment (Section A) for each buyer — the form matches their entity type — and record the rating.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              {ghostBtn2("Review")}
              <span style={{ fontSize: "12px", fontWeight: 700, color: gc.color, background: gc.bg, border: `1px solid ${gc.border}`, padding: "3px 10px", borderRadius: "6px" }}>Low</span>
              {ghostBtn2("Escalate to compliance officer")}
              {ghostBtn2("Record UAR")}
            </div>
          </div>

          {/* Verification of ID */}
          <div style={sp}>
            <span style={stitle}>Verification of ID</span>
            <p style={sdesc}>Verify each buyer's identity by risk rating — low risk allows a manual document check; medium/high require a full electronic VOI.</p>
          </div>

          {/* Sanction Check */}
          <div style={sp}>
            <span style={stitle}>Sanction Check</span>
            <p style={sdesc}>Screen each buyer against the DFAT Consolidated List, then adjudicate any potential match.</p>
          </div>

          {/* PEP Check */}
          <div style={{ ...sp, borderBottom: "none" }}>
            <span style={stitle}>PEP Check</span>
            <p style={sdesc}>Screen each buyer's occupation against the PEP occupations list, then adjudicate any potential match.</p>
          </div>

        </div>
      </div>
    );
  }

  const uploadFiles = itemKey === "agencyAgreement" ? state.agencyAgreement.files : state.contract.files;

  function setUploadFiles(fs: UploadedFile[]) {
    if (itemKey === "agencyAgreement") {
      setState((prev) => ({ ...prev, agencyAgreement: { ...prev.agencyAgreement, files: fs } }));
    } else {
      setState((prev) => ({ ...prev, contract: { ...prev.contract, files: fs } }));
    }
  }

  return (
    <div style={panelWrap}>
      <PanelHeader />
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
        <StatusPicker />
        <SalesFileUpload
          label="Upload document"
          files={uploadFiles}
          onAdd={(fs) => setUploadFiles([...uploadFiles, ...fs])}
          onRemove={(i) => setUploadFiles(uploadFiles.filter((_, j) => j !== i))}
        />
      </div>
    </div>
  );
}

function SalesPropertyChecklist({
  propertyId,
  address,
  onRemove,
}: {
  propertyId: string;
  address: string;
  onRemove: () => void;
}) {
  const [selectedItem, setSelectedItem] = useState<keyof SalesPropertyState | null>(null);
  const [state, setState] = useState<SalesPropertyState>({
    cma: { value: "", notes: "", files: [], status: "not_started" },
    identification: { name: "", idType: "Driver's Licence", idNumber: "", status: "not_started" },
    rates: { council: [], water: [], strata: [], status: "not_started" },
    aml: { checks: Array(amlSubChecklist.length).fill(false), status: "not_started" },
    agencyAgreement: { files: [], status: "not_started" },
    contract: { files: [], status: "not_started" },
  });

  const items: { key: keyof SalesPropertyState; label: string; subtitle: () => string }[] = [
    {
      key: "cma",
      label: "CMA Report",
      subtitle: () => state.cma.value ? `Est. value: ${state.cma.value}` : "No value entered",
    },
    {
      key: "identification",
      label: "Identification",
      subtitle: () =>
        state.identification.name
          ? `${state.identification.name} · ${state.identification.idType}`
          : "No ID recorded",
    },
    {
      key: "rates",
      label: "Rates",
      subtitle: () => {
        const n = [state.rates.council, state.rates.water, state.rates.strata].filter((f) => f.length > 0).length;
        return `${n} of 3 uploaded`;
      },
    },
    {
      key: "aml",
      label: "AML Compliance",
      subtitle: () => {
        const done = state.aml.checks.filter(Boolean).length;
        return `${done}/${amlSubChecklist.length} checks complete`;
      },
    },
    {
      key: "agencyAgreement",
      label: "Selling Agency Agreement",
      subtitle: () =>
        state.agencyAgreement.files.length > 0
          ? `${state.agencyAgreement.files.length} document${state.agencyAgreement.files.length > 1 ? "s" : ""} uploaded`
          : "No document uploaded",
    },
    {
      key: "contract",
      label: "Contract of Sale",
      subtitle: () =>
        state.contract.files.length > 0
          ? `${state.contract.files.length} document${state.contract.files.length > 1 ? "s" : ""} uploaded`
          : "No document uploaded",
    },
  ];

  const completeCount = items.filter((item) => state[item.key].status === "complete").length;
  const pct = Math.round((completeCount / items.length) * 100);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "flex-start" }}>
      <div style={{ flex: 1, padding: "48px", minWidth: 0 }}>
        <div style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-accent-dark)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px", maxWidth: "none" }}>
              Residential Sales
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>
              {address}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, height: "6px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "oklch(0.60 0.16 145)" : "var(--rc-primary)", borderRadius: "100px", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: pct === 100 ? "oklch(0.45 0.14 145)" : "var(--rc-primary)", flexShrink: 0 }}>
                {completeCount}/{items.length} complete
              </span>
            </div>
          </div>

          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden" }}>
            {items.map((item, i) => {
              const st = state[item.key].status;
              const cfg = STATUS_CONFIG[st];
              const isOpen = selectedItem === item.key;

              return (
                <div
                  key={item.key}
                  onClick={() => setSelectedItem(isOpen ? null : item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    borderBottom: i < items.length - 1 ? "1px solid var(--rc-border)" : "none",
                    background: isOpen ? "var(--rc-surface)" : st === "complete" ? "oklch(0.985 0.006 145)" : "var(--rc-bg)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      border: st === "complete" ? "none" : `1.5px solid ${st === "in_progress" ? "oklch(0.75 0.15 55)" : "var(--rc-border)"}`,
                      background: st === "complete" ? "oklch(0.60 0.16 145)" : st === "in_progress" ? "oklch(0.97 0.025 55)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {st === "complete" && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {st === "in_progress" && (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "oklch(0.65 0.16 55)" }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: st === "complete" ? "var(--rc-faint)" : "var(--rc-ink)", textDecoration: st === "complete" ? "line-through" : "none", margin: 0 }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "2px 0 0", maxWidth: "none" }}>
                      {item.subtitle()}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {st !== "not_started" && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: cfg.color,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          padding: "2px 8px",
                          borderRadius: "100px",
                        }}
                      >
                        {cfg.label}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--rc-faint)", flexShrink: 0 }}>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {pct === 100 && (
            <div style={{ marginTop: "20px", padding: "14px 18px", background: "oklch(0.96 0.025 145)", border: "1px solid oklch(0.82 0.08 145)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" fill="oklch(0.60 0.16 145)" />
                <path d="M5.5 9l2.5 2.5 4-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "oklch(0.38 0.13 145)" }}>All compliance items complete.</span>
            </div>
          )}

          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--rc-border)" }}>
            <button
              onClick={() => { if (window.confirm(`Remove "${address}" from your properties? This cannot be undone.`)) onRemove(); }}
              style={{ fontSize: "13px", fontWeight: 500, color: "oklch(0.50 0.18 25)", background: "transparent", border: "1px solid oklch(0.82 0.06 25)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "background 0.15s ease, color 0.15s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.96 0.02 25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Remove property
            </button>
          </div>
        </div>
      </div>

      {selectedItem !== null && (
        <SalesItemPanel
          key={selectedItem}
          itemKey={selectedItem}
          state={state}
          setState={setState}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

// --- Dashboard home ---

const moduleOverview = [
  { id: "policies",   label: "Policies & Procedures",     icon: <PolIcon /> },
  { id: "sales",      label: "Residential Sales",          icon: <SalesIcon /> },
  { id: "management", label: "Residential Management",     icon: <MgmtIcon /> },
  { id: "staff",      label: "Staff",                      icon: <StaffIcon /> },
  { id: "trust",      label: "Trust Accounting",           icon: <TrustIcon /> },
];

function computeModuleData(
  moduleId: string,
  staffRows: StaffRow[] = [],
  salesProps: SalesPropItem[] = [],
  mgmtProps: SalesPropItem[] = [],
  policies: PolicyRow[] = []
): { score: number; detail: string } {
  if (moduleId === "staff") {
    const total = staffRows.length;
    if (total === 0) return { score: 0, detail: "No staff added yet" };
    const licOk = staffRows.filter(s => s.licence === "current" || s.licence === "exempt").length;
    const cpdOk = staffRows.filter(s => s.cpd === "complete" || s.cpd === "na").length;
    const score = Math.round((licOk + cpdOk) / (total * 2) * 100);
    const renewalDue = total - licOk;
    return {
      score,
      detail: renewalDue === 0
        ? `${total} staff · All licences current`
        : `${renewalDue} licence renewal${renewalDue !== 1 ? "s" : ""} due`,
    };
  }
  if (moduleId === "sales") {
    const total = salesProps.length;
    if (total === 0) return { score: 0, detail: "No sales properties added" };
    const checklist = salesChecklist;
    const totalScore = salesProps.reduce((sum, p) => {
      const done = defaultChecked[p.id]?.length ?? 0;
      return sum + done / checklist.length;
    }, 0);
    const score = Math.round((totalScore / total) * 100);
    const compliant = salesProps.filter(p => (defaultChecked[p.id]?.length ?? 0) === checklist.length).length;
    return {
      score,
      detail: `${compliant} of ${total} ${total === 1 ? "property" : "properties"} fully compliant`,
    };
  }
  if (moduleId === "management") {
    const total = mgmtProps.length;
    if (total === 0) return { score: 0, detail: "No management properties added" };
    const checklist = managementChecklist;
    const totalScore = mgmtProps.reduce((sum, p) => {
      const done = defaultChecked[p.id]?.length ?? 0;
      return sum + done / checklist.length;
    }, 0);
    const score = Math.round((totalScore / total) * 100);
    const compliant = mgmtProps.filter(p => (defaultChecked[p.id]?.length ?? 0) === checklist.length).length;
    return {
      score,
      detail: `${compliant} of ${total} ${total === 1 ? "property" : "properties"} fully compliant`,
    };
  }
  if (moduleId === "policies") {
    const total = policies.length;
    if (total === 0) return { score: 0, detail: "No policies added yet" };
    const current = policies.filter(p => p.status === "current").length;
    const due = total - current;
    return {
      score: Math.round(current / total * 100),
      detail: due === 0 ? "All policies current" : `${due} ${due === 1 ? "policy" : "policies"} due for review`,
    };
  }
  if (moduleId === "trust") {
    return { score: 0, detail: "Add trust accounts to track reconciliation" };
  }
  return { score: 0, detail: "" };
}

function smoothLinePath(pts: number[][]): string {
  const n = pts.length;
  if (n < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

function ComplianceChart({ currentScore }: { currentScore: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 840; const H = 240;
  const PL = 42; const PR = 56; const PT = 18; const PB = 30;
  const cW = W - PL - PR; const cH = H - PT - PB;

  const visibleHistory = [{ month: "Today", score: currentScore }];
  const scores = visibleHistory.map(d => d.score);
  const dataMin = Math.min(...scores);
  const dataMax = Math.max(...scores);
  // Pad 15% above and below to fill height nicely
  const pad = Math.max(Math.ceil((dataMax - dataMin) * 0.35), 4);
  const yMin = Math.floor((dataMin - pad) / 5) * 5;
  const yMax = Math.ceil((dataMax + pad) / 5) * 5;

  const xPos = (i: number) => visibleHistory.length === 1 ? PL + cW / 2 : PL + (i / (visibleHistory.length - 1)) * cW;
  const yPos = (v: number) => PT + cH * (1 - (v - yMin) / (yMax - yMin));
  const pts = visibleHistory.map((d, i) => [xPos(i), yPos(d.score)]);
  const linePath = smoothLinePath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${PT + cH} L ${pts[0][0]} ${PT + cH} Z`;

  // Grid lines every 5 pts within range
  const gridY: number[] = [];
  for (let v = yMin + 5; v < yMax; v += 5) gridY.push(v);

  const ink = "oklch(0.36 0.140 260)";
  const faint = "oklch(0.68 0.008 260)";
  const gridLine = "oklch(0.93 0.006 260)";

  // Tooltip geometry
  const ttW = 68; const ttH = 40;

  return (
    <svg
      width="100%" height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ink} stopOpacity="0.12" />
          <stop offset="100%" stopColor={ink} stopOpacity="0.00" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {gridY.map(v => (
        <g key={v}>
          <line x1={PL} y1={yPos(v)} x2={W - PR} y2={yPos(v)} stroke={gridLine} strokeWidth="1" />
          <text x={PL - 8} y={yPos(v) + 4} textAnchor="end" fontSize="11" fill={faint} fontFamily="system-ui, sans-serif">{v}</text>
        </g>
      ))}

      {/* X-axis month labels */}
      {visibleHistory.map((d, i) => (
        <text key={i} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="10.5"
          fill={hovered === i ? ink : faint}
          fontWeight={hovered === i ? "600" : "400"}
          fontFamily="system-ui, sans-serif">{d.month}</text>
      ))}

      {/* Vertical hover line */}
      {hovered !== null && (
        <line
          x1={pts[hovered][0]} y1={pts[hovered][1] + 10}
          x2={pts[hovered][0]} y2={PT + cH}
          stroke={ink} strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.25"
        />
      )}

      {/* Area fill */}
      <path d={areaPath} fill="url(#cg)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points */}
      {pts.map((pt, i) => {
        const isLast = i === pts.length - 1;
        const isHovered = hovered === i;
        return (
          <g key={i}>
            {(isHovered || isLast) && <circle cx={pt[0]} cy={pt[1]} r="9" fill={ink} fillOpacity="0.09" />}
            <circle cx={pt[0]} cy={pt[1]} r={isHovered || isLast ? 3.5 : 2} fill={ink} />
          </g>
        );
      })}

      {/* End-value label (hide when last point hovered — tooltip covers it) */}
      {hovered !== pts.length - 1 && (
        <text x={pts[pts.length - 1][0] + 11} y={pts[pts.length - 1][1] + 4}
          fontSize="12" fontWeight="600" fill={ink} fontFamily="system-ui, sans-serif">
          {visibleHistory[pts.length - 1].score}
        </text>
      )}

      {/* Tooltip */}
      {hovered !== null && (() => {
        const pt = pts[hovered];
        const d = visibleHistory[hovered];
        const rawX = pt[0] - ttW / 2;
        const ttX = Math.min(Math.max(rawX, PL), W - PR - ttW);
        const ttY = Math.max(pt[1] - ttH - 12, PT);
        return (
          <g style={{ pointerEvents: "none" }}>
            <rect x={ttX} y={ttY} width={ttW} height={ttH} rx="7"
              fill="oklch(0.14 0.025 260)" />
            <text x={ttX + ttW / 2} y={ttY + 14} textAnchor="middle" fontSize="10"
              fill="white" fillOpacity="0.6" fontFamily="system-ui, sans-serif">{d.month}</text>
            <text x={ttX + ttW / 2} y={ttY + 30} textAnchor="middle" fontSize="15"
              fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">{d.score}</text>
          </g>
        );
      })()}

      {/* Invisible hover zones — one per data point */}
      {pts.map((pt, i) => {
        const segW = cW / (visibleHistory.length - 1);
        const x = i === 0 ? PL : pt[0] - segW / 2;
        const w = i === 0 ? segW / 2 : i === pts.length - 1 ? segW / 2 : segW;
        return (
          <rect key={i} x={x} y={PT} width={w} height={cH}
            fill="transparent"
            style={{ cursor: "crosshair" }}
            onMouseEnter={() => setHovered(i)}
          />
        );
      })}
    </svg>
  );
}



function DashboardHome({ onNavigate, agencyName, staffRows, salesProps, mgmtProps, policies }: {
  onNavigate: (id: string) => void;
  agencyName: string;
  staffRows: StaffRow[];
  salesProps: SalesPropItem[];
  mgmtProps: SalesPropItem[];
  policies: PolicyRow[];
}) {
  const moduleScores = moduleOverview.map(m => computeModuleData(m.id, staffRows, salesProps, mgmtProps, policies).score);
  const overallScore = Math.round(moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length);
  const scoreLabel = overallScore >= 85 ? "Good standing" : overallScore >= 65 ? "Needs attention" : "Action required";
  const badgeColor = overallScore >= 85 ? "oklch(0.46 0.13 145)" : overallScore >= 65 ? "oklch(0.50 0.12 55)" : "oklch(0.46 0.18 25)";
  const badgeBg = overallScore >= 85 ? "oklch(0.94 0.04 145)" : overallScore >= 65 ? "oklch(0.96 0.04 55)" : "oklch(0.95 0.05 25)";

  const totalProps = salesProps.length + mgmtProps.length;
  const totalStaff = staffRows.length;
  const licensedStaff = staffRows.filter(s => s.licence === "current" || s.licence === "exempt").length;
  const renewalDue = totalStaff - licensedStaff;
  const policiesCurrent = policies.filter(p => p.status === "current").length;
  const policiesDue = policies.length - policiesCurrent;
  const stats: { label: string; value: string; detail: string; warn: boolean }[] = [
    {
      label: "Properties",
      value: totalProps === 0 ? "None yet" : `${totalProps} total`,
      detail: totalProps === 0 ? "Add via Sales or Management" : `${salesProps.length} sales · ${mgmtProps.length} managed`,
      warn: false,
    },
    {
      label: "Staff licensed",
      value: totalStaff === 0 ? "No staff" : `${licensedStaff} of ${totalStaff}`,
      detail: totalStaff === 0 ? "Add staff via Onboarding" : renewalDue === 0 ? "All licences current" : `${renewalDue} renewal${renewalDue !== 1 ? "s" : ""} due`,
      warn: renewalDue > 0,
    },
    {
      label: "Policies current",
      value: policies.length === 0 ? "None yet" : `${policiesCurrent} of ${policies.length}`,
      detail: policiesDue === 0 ? "All policies current" : `${policiesDue} due for review`,
      warn: policiesDue > 0,
    },
    {
      label: "Trust accounts",
      value: "—",
      detail: "Set up in Trust Accounting",
      warn: false,
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", padding: "32px 44px 28px", gap: "18px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0, paddingBottom: "22px", borderBottom: "1px solid var(--rc-border)" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.035em", lineHeight: 1.15 }}>Business Overview</h1>
          <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none", marginTop: "5px" }}>
            {agencyName} · {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 600, color: badgeColor, background: badgeBg, padding: "5px 13px", borderRadius: "100px", marginTop: "3px", flexShrink: 0, letterSpacing: "0.01em" }}>
          {scoreLabel}
        </span>
      </div>

      {/* Score + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "196px 1fr", gap: "14px", flexShrink: 0 }}>
        {/* Score ring panel */}
        <div style={{ background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "14px", padding: "24px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <ScoreRing score={overallScore} size={108} />
            <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
              <p style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.06em", lineHeight: 1, margin: 0 }}>{overallScore}</p>
              <p style={{ fontSize: "10px", color: "var(--rc-faint)", margin: "1px 0 0", fontWeight: 500 }}>/ 100</p>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--rc-muted)", textAlign: "center", maxWidth: "none", lineHeight: 1.5, margin: 0 }}>Compliance score<br />this month</p>
        </div>

        {/* Stats list panel */}
        <div style={{ background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "14px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
          {stats.map(({ label, value, detail, warn }, i) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "130px 110px 1fr", alignItems: "center", padding: "13px 22px", borderBottom: i < stats.length - 1 ? "1px solid var(--rc-border)" : "none", gap: "0" }}>
              <p style={{ fontSize: "12.5px", color: "var(--rc-faint)", maxWidth: "none", fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.025em", maxWidth: "none" }}>{value}</p>
              <p style={{ fontSize: "12px", color: warn ? "oklch(0.50 0.12 55)" : "var(--rc-faint)", maxWidth: "none", fontWeight: warn ? 500 : 400 }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module list */}
      <div style={{ flexShrink: 0, background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "14px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        {moduleOverview.map((m, i) => {
          const { score } = computeModuleData(m.id, staffRows, salesProps, mgmtProps, policies);
          const trackColor = score >= 85 ? "var(--rc-primary)" : score >= 65 ? "oklch(0.58 0.13 55)" : "oklch(0.52 0.18 25)";
          const pctColor = score >= 85 ? "oklch(0.38 0.12 260)" : score >= 65 ? "oklch(0.44 0.12 55)" : "oklch(0.44 0.17 25)";
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              style={{ width: "100%", display: "grid", gridTemplateColumns: "36px 1fr 160px 50px 16px", alignItems: "center", gap: "16px", padding: "14px 20px", border: "none", borderBottom: i < moduleOverview.length - 1 ? "1px solid var(--rc-border)" : "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-inter)", transition: "background 0.12s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--rc-surface-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--rc-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rc-primary)", flexShrink: 0 }}>
                {m.icon}
              </div>
              <span style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--rc-ink)", letterSpacing: "-0.01em" }}>{m.label}</span>
              <div style={{ height: "3px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: `${score}%`, height: "100%", background: trackColor, borderRadius: "100px" }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: pctColor, textAlign: "right", letterSpacing: "-0.02em" }}>{score}%</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.22, flexShrink: 0 }}><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          );
        })}
      </div>

      {/* Compliance trend chart */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ border: "1px solid var(--rc-border)", borderRadius: "14px", overflow: "hidden", flex: 1, boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", background: "var(--rc-surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px 0", flexShrink: 0 }}>
            <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.02em" }}>Compliance trend</span>
            <span style={{ fontSize: "12px", color: "var(--rc-faint)", fontWeight: 500 }}>Last 3 months</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: "8px 16px 14px" }}>
            <ComplianceChart currentScore={overallScore} />
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Module Overview ---

function StatusPill({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color, background: bg, border: `1px solid ${border}`, padding: "3px 10px", borderRadius: "100px", whiteSpace: "nowrap", flexShrink: 0 }}>
      {label}
    </span>
  );
}

function ModuleOverview({ moduleId, onSelectProperty, salesProps, mgmtProps, onAddSalesProperty, onAddMgmtProperty, staffRows, policies }: {
  moduleId: string;
  onSelectProperty: (prop: { type: "property"; section: "sales" | "management"; id: string; address: string }) => void;
  salesProps: SalesPropItem[];
  mgmtProps: SalesPropItem[];
  onAddSalesProperty: (prop: Required<SalesPropItem>) => Promise<string | null>;
  onAddMgmtProperty: (prop: Required<SalesPropItem>) => Promise<string | null>;
  staffRows: StaffRow[];
  policies: PolicyRow[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addrInput, setAddrInput] = useState("");
  const [vendorInput, setVendorInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function submitAdd() {
    if (!addrInput.trim()) return;
    setSaving(true);
    setSaveError(null);
    const addedAt = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const prop: Required<SalesPropItem> = { id: `tmp-${Date.now()}`, address: addrInput.trim(), vendorName: vendorInput.trim(), addedAt };
    const err = moduleId === "management"
      ? await onAddMgmtProperty(prop)
      : await onAddSalesProperty(prop);
    setSaving(false);
    if (err) { setSaveError(err); return; }
    setAddrInput("");
    setVendorInput("");
    setShowAdd(false);
  }

  const mod = moduleOverview.find(m => m.id === moduleId)!;
  const { score: modScore, detail: modDetail } = computeModuleData(moduleId, staffRows, salesProps, mgmtProps, policies);
  const scoreColor = modScore >= 85 ? "oklch(0.42 0.14 145)" : modScore >= 65 ? "oklch(0.50 0.14 55)" : "oklch(0.50 0.20 25)";
  const barColor = modScore >= 85 ? "oklch(0.60 0.16 145)" : modScore >= 65 ? "oklch(0.65 0.16 55)" : "oklch(0.58 0.20 25)";
  const scoreLabel = modScore >= 85 ? "Good standing" : modScore >= 65 ? "Needs attention" : "Action required";

  // Per-module stats and list content
  let stats: { label: string; value: string; sub: string }[] = [];
  let sectionLabel = "";
  let content: React.ReactNode = null;

  if (moduleId === "policies") {
    const current = policies.filter(p => p.status === "current").length;
    const due = policies.filter(p => p.status === "review-due").length;
    stats = [
      { label: "Total policies", value: String(policies.length), sub: "In library" },
      { label: "Current", value: String(current), sub: "Up to date" },
      { label: "Due for review", value: String(due), sub: "Action needed" },
      { label: "Overdue", value: "0", sub: "None overdue" },
    ];
    content = policies.length === 0 ? (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)" }}>
        <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No policies yet. Create one via Policy Templates or upload a document.</p>
      </div>
    ) : (
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 110px", padding: "10px 20px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)", flexShrink: 0 }}>
          {["Policy", "Status", "Last reviewed", "Next review"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>{h}</span>
          ))}
        </div>
        {policies.map((p, i) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 110px", padding: "0 20px", flex: 1, borderBottom: i < policies.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)" }}>{p.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: p.status === "current" ? "oklch(0.55 0.16 145)" : "oklch(0.60 0.14 55)" }} />
              <span style={{ fontSize: "12.5px", color: p.status === "current" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{p.status === "current" ? "Current" : "Review due"}</span>
            </div>
            <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{p.last_reviewed ?? "—"}</span>
            <span style={{ fontSize: "12.5px", color: p.status === "review-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)" }}>{p.next_review ?? "—"}</span>
          </div>
        ))}
      </div>
    );
  }

  if (moduleId === "sales" || moduleId === "management") {
    const props = moduleId === "sales" ? salesProps : mgmtProps;
    const section = moduleId as "sales" | "management";
    const checklist = moduleId === "sales" ? salesChecklist : managementChecklist;
    const compliant = props.filter(p => (defaultChecked[p.id]?.length ?? 0) === checklist.length).length;
    const inProgress = props.filter(p => { const n = defaultChecked[p.id]?.length ?? 0; return n > 0 && n < checklist.length; }).length;
    const notStarted = props.filter(p => (defaultChecked[p.id]?.length ?? 0) === 0).length;
    stats = [
      { label: "Total properties", value: String(props.length), sub: "Under management" },
      { label: "Fully compliant", value: String(compliant), sub: "All items complete" },
      { label: "In progress", value: String(inProgress), sub: "Checklist started" },
      { label: "Needs attention", value: String(notStarted), sub: "Not yet started" },
    ];
    content = (
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
        {props.map((prop, i) => {
          const done = defaultChecked[prop.id]?.length ?? 0;
          const total = checklist.length;
          const pct = Math.round((done / total) * 100);
          const trackColor = pct === 100 ? "var(--rc-primary)" : pct >= 50 ? "oklch(0.60 0.14 55)" : "oklch(0.55 0.20 25)";
          const pctColor = pct === 100 ? "oklch(0.38 0.12 145)" : pct >= 50 ? "oklch(0.46 0.12 55)" : "oklch(0.46 0.18 25)";
          return (
            <div
              key={prop.id}
              onClick={() => onSelectProperty({ type: "property", section, id: prop.id, address: prop.address })}
              style={{ display: "grid", gridTemplateColumns: "1fr 200px 56px", alignItems: "center", gap: "20px", padding: "12px 24px", borderBottom: i < props.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", cursor: "pointer", transition: "background 0.12s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--rc-surface)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--rc-bg)"; }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--rc-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prop.address}</p>
                {(prop.vendorName || prop.addedAt) && (
                  <p style={{ fontSize: "11px", color: "var(--rc-faint)", margin: "2px 0 0", maxWidth: "none" }}>
                    {prop.vendorName}{prop.vendorName && prop.addedAt ? " · " : ""}{prop.addedAt ? `Added ${prop.addedAt}` : ""}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ flex: 1, height: "2px", background: "var(--rc-border-subtle)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: trackColor, borderRadius: "100px" }} />
                </div>
                <span style={{ fontSize: "11.5px", color: "var(--rc-faint)", flexShrink: 0 }}>{done}/{total}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: pctColor, textAlign: "right" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (moduleId === "staff") {
    const current = staffRows.filter(s => s.licence === "current" || s.licence === "exempt").length;
    const renewalDue = staffRows.filter(s => s.licence === "renewal-due").length;
    const cpdDue = staffRows.filter(s => s.cpd === "due-soon" || s.cpd === "overdue").length;
    stats = [
      { label: "Team members", value: String(staffRows.length), sub: "Total staff" },
      { label: "Licensed", value: String(current), sub: "Current or exempt" },
      { label: "Renewal due", value: String(renewalDue), sub: "Action needed" },
      { label: "CPD attention", value: String(cpdDue), sub: "Due or overdue" },
    ];
    content = staffRows.length === 0 ? (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)" }}>
        <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No staff yet. Add them via Staff → Onboarding.</p>
      </div>
    ) : (
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 130px 90px 100px", padding: "10px 20px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)", flexShrink: 0 }}>
          {["Name", "Role", "Licence", "Expiry", "CPD"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>{h}</span>
          ))}
        </div>
        {staffRows.map((s, i) => {
          const licenceEl = s.licence === "current"
            ? <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.16 145)" }} /><span style={{ fontSize: "12.5px", color: "oklch(0.42 0.12 145)" }}>Licensed</span></div>
            : s.licence === "renewal-due"
            ? <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.20 25)" }} /><span style={{ fontSize: "12.5px", color: "oklch(0.46 0.18 25)" }}>Renewal due</span></div>
            : <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Exempt</span>;
          const cpdEl = s.cpd === "complete"
            ? <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.16 145)" }} /><span style={{ fontSize: "12.5px", color: "oklch(0.42 0.12 145)" }}>Complete</span></div>
            : s.cpd === "due-soon"
            ? <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.60 0.14 55)" }} /><span style={{ fontSize: "12.5px", color: "oklch(0.46 0.12 55)" }}>Due soon</span></div>
            : s.cpd === "overdue"
            ? <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.20 25)" }} /><span style={{ fontSize: "12.5px", color: "oklch(0.46 0.18 25)" }}>Overdue</span></div>
            : <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>N/A</span>;
          return (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 130px 90px 100px", padding: "0 20px", flex: 1, borderBottom: i < staffRows.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)" }}>{s.name}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{s.role}</span>
              {licenceEl}
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{s.expiry || "—"}</span>
              {cpdEl}
            </div>
          );
        })}
      </div>
    );
  }

  if (moduleId === "trust") {
    stats = [
      { label: "Trust accounts", value: "—", sub: "Set up in Account Reconciliation" },
      { label: "Transactions", value: "—", sub: "Log entries in Transaction Log" },
      { label: "AML checks", value: "—", sub: "Track in AML Compliance" },
      { label: "Audit reports", value: "—", sub: "Upload in Audit Reports" },
    ];
    content = (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "14px", color: "var(--rc-faint)", textAlign: "center", maxWidth: "none" }}>
          Use the sections on the left to set up trust accounts, log transactions, and manage AML checks.
        </p>
      </div>
    );
  }

  const inputSty2: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", padding: "32px 44px", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, paddingBottom: "20px", borderBottom: "1px solid var(--rc-border)" }}>
        <div>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.02em" }}>{mod.label}</h1>
          <p style={{ fontSize: "12.5px", color: "var(--rc-faint)", maxWidth: "none", marginTop: "1px" }}>{modDetail}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {(moduleId === "sales" || moduleId === "management") && (
            <button
              onClick={() => setShowAdd(true)}
              style={{ fontSize: "12.5px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              + Add property
            </button>
          )}
          <div style={{ width: "80px", height: "2px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ width: `${modScore}%`, height: "100%", background: barColor, borderRadius: "100px" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: scoreColor }}>{modScore}%</span>
          <span style={{ color: "var(--rc-border)", fontSize: "16px", lineHeight: 1 }}>|</span>
          <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{scoreLabel}</span>
        </div>
      </div>

      {/* Stats — unified strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", flexShrink: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        {stats.map(({ label, value, sub }, i) => (
          <div key={label} style={{ padding: "18px 20px", borderRight: i < 3 ? "1px solid var(--rc-border)" : "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            <p style={{ fontSize: "11.5px", color: "var(--rc-faint)", maxWidth: "none" }}>{label}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Module content */}
      {content}

      {/* Add property modal */}
      {showAdd && (
        <div
          onClick={() => { if (!saving) { setShowAdd(false); setSaveError(null); } }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--rc-bg)", borderRadius: "14px", padding: "28px", width: "420px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: 0 }}>Add property</h2>
              <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "4px 0 0", maxWidth: "none" }}>The date added will be recorded automatically.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-faint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Property address</p>
                <input
                  autoFocus
                  value={addrInput}
                  onChange={(e) => setAddrInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") { setShowAdd(false); setSaveError(null); } }}
                  placeholder="e.g. 42 Harbour View Rd, Balmain"
                  style={inputSty2}
                  disabled={saving}
                />
              </div>
              <div>
                <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-faint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{moduleId === "management" ? "Owner name" : "Vendor name"} <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
                <input
                  value={vendorInput}
                  onChange={(e) => setVendorInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") { setShowAdd(false); setSaveError(null); } }}
                  placeholder={moduleId === "management" ? "e.g. Sarah & James Nguyen" : "e.g. John & Mary Thompson"}
                  style={inputSty2}
                  disabled={saving}
                />
              </div>
              {saveError && (
                <p style={{ fontSize: "12px", color: "oklch(0.50 0.20 25)", margin: 0, maxWidth: "none", background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.06 25)", borderRadius: "8px", padding: "8px 12px" }}>
                  Save failed: {saveError}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowAdd(false); setSaveError(null); }}
                disabled={saving}
                style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                disabled={saving}
                style={{ fontSize: "13px", fontWeight: 600, color: "white", background: saving ? "var(--rc-faint)" : "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: saving ? "default" : "pointer", fontFamily: "var(--font-inter)" }}
              >
                {saving ? "Saving…" : "Add property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-page data ---

const policyTemplates = [
  { name: "Supervision Guidelines Template", category: "Management", updated: "Feb 2026" },
  { name: "Privacy Policy Template", category: "Compliance", updated: "Jan 2026" },
  { name: "AML & CTF Policy Template", category: "Compliance", updated: "Feb 2026" },
  { name: "Trust Accounting Procedures Template", category: "Trust", updated: "Mar 2026" },
  { name: "WHS Policy Template", category: "Staff", updated: "Oct 2025" },
  { name: "Complaints Handling Procedure Template", category: "Admin", updated: "Dec 2025" },
  { name: "Social Media Policy Template", category: "Marketing", updated: "Apr 2026" },
  { name: "Record Keeping Policy Template", category: "Compliance", updated: "Aug 2025" },
];

const auditReports: { name: string; generated: string; type: string; pages: number }[] = [];

type TrustAccountRow = { id: string; name: string; bank: string; balance: string; last_reconciled: string | null; status: "reconciled" | "pending" };
type TrustTransactionRow = { id: string; description: string; account: string; amount: string; type: "credit" | "debit"; date: string };
type AMLCheckRow = { id: string; address: string; party: string; party_type: string; verified: boolean; verified_date: string | null; method: string | null };
type TrustReportRow = { id: string; month: string; account: string; notes: string | null; file_url: string | null; file_name: string | null; uploaded_at: string };

type OBField = { id: string; label: string; placeholder: string; type?: "text" | "date" | "textarea" };
type OBItemConfig = { id: string; label: string; description: string; fields: OBField[]; docTitle: string };

const onboardingItems: OBItemConfig[] = [
  {
    id: "contract",
    label: "Employment contract signed",
    description: "Record the employment contract details. This will be saved to the staff member's documents.",
    fields: [
      { id: "position", label: "Position / role", placeholder: "e.g. Sales Agent" },
      { id: "salary", label: "Salary / remuneration", placeholder: "e.g. $75,000 base + commission" },
      { id: "hoursPerWeek", label: "Hours per week", placeholder: "e.g. 38" },
      { id: "probationPeriod", label: "Probation period", placeholder: "e.g. 3 months" },
      { id: "contractSignedDate", label: "Date signed", placeholder: "e.g. 22 Jul 2026", type: "date" },
    ],
    docTitle: "Employment Contract",
  },
  {
    id: "induction",
    label: "Office induction completed",
    description: "Record that the office induction was completed, including areas covered.",
    fields: [
      { id: "inductionDate", label: "Date completed", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "conductedBy", label: "Conducted by", placeholder: "e.g. Principal / Manager name" },
      { id: "areasCovered", label: "Areas covered", placeholder: "e.g. Office layout, emergency exits, systems intro...", type: "textarea" },
    ],
    docTitle: "Office Induction Record",
  },
  {
    id: "rcAccount",
    label: "RealComply account created",
    description: "Confirm the staff member's RealComply account has been set up and access granted.",
    fields: [
      { id: "email", label: "Login email", placeholder: "e.g. sarah@agency.com.au" },
      { id: "accessLevel", label: "Access level", placeholder: "e.g. Agent, Manager" },
      { id: "createdDate", label: "Date created", placeholder: "e.g. 22 Jul 2026", type: "date" },
    ],
    docTitle: "System Access Record",
  },
  {
    id: "licence",
    label: "Licence number recorded",
    description: "Record the staff member's real estate licence details.",
    fields: [
      { id: "licenceNumber", label: "Licence number", placeholder: "e.g. 20212345" },
      { id: "licenceClass", label: "Licence class", placeholder: "e.g. Class 1, Class 2" },
      { id: "licenceExpiry", label: "Expiry date", placeholder: "e.g. Nov 2028" },
      { id: "issuedBy", label: "Issued by", placeholder: "e.g. NSW Fair Trading" },
    ],
    docTitle: "Licence Record",
  },
  {
    id: "trustTraining",
    label: "Trust accounting training completed",
    description: "Record completion of trust accounting training.",
    fields: [
      { id: "completionDate", label: "Date completed", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "provider", label: "Training provider", placeholder: "e.g. REINSW, internal" },
      { id: "certificateRef", label: "Certificate / reference number", placeholder: "e.g. TA-2026-1234" },
    ],
    docTitle: "Trust Accounting Training Record",
  },
  {
    id: "whs",
    label: "WHS induction completed",
    description: "Record the Work Health & Safety induction completion.",
    fields: [
      { id: "inductionDate", label: "Date completed", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "conductedBy", label: "Conducted by", placeholder: "e.g. WHS Officer / Principal" },
      { id: "whsNotes", label: "Notes", placeholder: "e.g. Manual handling, hazard reporting, emergency procedures...", type: "textarea" },
    ],
    docTitle: "WHS Induction Record",
  },
  {
    id: "privacy",
    label: "Privacy policy acknowledged",
    description: "Record that the staff member has read and acknowledged the agency's privacy policy.",
    fields: [
      { id: "acknowledgedDate", label: "Date acknowledged", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "policyVersion", label: "Policy version", placeholder: "e.g. v2.1, July 2026" },
    ],
    docTitle: "Privacy Policy Acknowledgement",
  },
  {
    id: "itAccess",
    label: "IT systems access granted",
    description: "Record which systems the staff member has been granted access to.",
    fields: [
      { id: "systems", label: "Systems granted", placeholder: "e.g. CRM, email, PropertyMe, DocuSign...", type: "textarea" },
      { id: "grantedDate", label: "Date granted", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "grantedBy", label: "Granted by", placeholder: "e.g. IT Manager / Principal" },
    ],
    docTitle: "IT Access Record",
  },
  {
    id: "cpd",
    label: "First CPD cycle registered",
    description: "Register the staff member's first Continuing Professional Development cycle.",
    fields: [
      { id: "cycleStartDate", label: "Cycle start date", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "cycleEndDate", label: "Cycle end date", placeholder: "e.g. 22 Jul 2027", type: "date" },
      { id: "requiredHours", label: "Required hours", placeholder: "e.g. 12" },
      { id: "provider", label: "Registered with", placeholder: "e.g. REINSW, CPD provider name" },
    ],
    docTitle: "CPD Registration",
  },
  {
    id: "mentor",
    label: "Mentor assigned",
    description: "Assign a mentor to support the new staff member through their first months.",
    fields: [
      { id: "mentorName", label: "Mentor name", placeholder: "e.g. James Wilson" },
      { id: "mentorRole", label: "Mentor role", placeholder: "e.g. Senior Agent, Principal" },
      { id: "assignedDate", label: "Date assigned", placeholder: "e.g. 22 Jul 2026", type: "date" },
      { id: "meetingSchedule", label: "Meeting schedule", placeholder: "e.g. Weekly, fortnightly" },
    ],
    docTitle: "Mentor Assignment",
  },
];


// --- Sub-page components ---

const PAGE_WRAP: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", padding: "32px 44px", gap: "22px" };
const PAGE_HEADER: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, paddingBottom: "22px", borderBottom: "1px solid var(--rc-border)" };
const PAGE_H1: React.CSSProperties = { fontSize: "1.15rem", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.03em" };
const PAGE_SUB: React.CSSProperties = { fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none", marginTop: "3px" };

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 18) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const strokeColor = score >= 85 ? "oklch(0.50 0.15 145)" : score >= 65 ? "oklch(0.55 0.14 55)" : "oklch(0.50 0.19 25)";
  const trackColor = "var(--rc-border)";
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth="9" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={strokeColor} strokeWidth="9"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }} />
    </svg>
  );
}
const TH: React.CSSProperties = { fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px", background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" };
const TD: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", padding: "14px 20px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-bg)", alignItems: "center" };

function GreenDot() { return <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.16 145)", flexShrink: 0 }} />; }
function AmberDot() { return <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.60 0.14 55)", flexShrink: 0 }} />; }
function RedDot() { return <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.20 25)", flexShrink: 0 }} />; }

function TableWrap({ children, cols }: { children: React.ReactNode; cols: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
      <div style={{ gridTemplateColumns: cols, ...TH, display: "contents" }}>
        {/* children render as display:contents */}
      </div>
      {children}
    </div>
  );
}

function downloadPolicyPDF(p: PolicyRow) {
  const content = p.content ?? "(No content stored for this policy.)";
  const statusLabel = p.status === "current" ? "Current" : "Review Due";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${p.name}</title><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',Times,serif;font-size:11pt;line-height:1.65;color:#1a1a1a;padding:40px 48px}
    .meta{font-size:9.5pt;color:#555;border-bottom:1px solid #ccc;padding-bottom:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start}
    .meta-left{display:flex;flex-direction:column;gap:3px}
    .meta-badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:8.5pt;font-weight:700;background:${p.status==="current"?"#e6f4ec":"#fef3e2"};color:${p.status==="current"?"#276f43":"#92450a"};border:1px solid ${p.status==="current"?"#a8d5b5":"#f5c97a"}}
    pre{white-space:pre-wrap;word-wrap:break-word;font-family:'Times New Roman',Times,serif;font-size:11pt;line-height:1.7}
    @media print{body{padding:20px 28px}@page{margin:18mm 20mm;size:A4}}
  </style></head><body>
    <div class="meta">
      <div class="meta-left">
        <span style="font-size:8.5pt;color:#888">REALCOMPLY — POLICY DOCUMENT</span>
        <span style="font-size:9pt;color:#555">Category: ${p.category ?? "General"} &nbsp;·&nbsp; Last reviewed: ${p.last_reviewed ?? "—"} &nbsp;·&nbsp; Next review: ${p.next_review ?? "—"}</span>
      </div>
      <span class="meta-badge">${statusLabel}</span>
    </div>
    <pre>${content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
  </body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

function PolicyDetailView({ policy, onBack, onMarkReviewed, onDelete }: { policy: PolicyRow; onBack: () => void; onMarkReviewed?: (p: PolicyRow) => void; onDelete?: (p: PolicyRow) => void }) {
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleMarkReviewed() {
    if (!onMarkReviewed) return;
    setMarking(true);
    await onMarkReviewed(policy);
    setMarking(false);
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!window.confirm(`Delete "${policy.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(policy);
  }

  const cat = catColors[policy.category ?? ""] ?? catColors["Admin"];

  return (
    <div style={{ ...PAGE_WRAP, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--rc-faint)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", padding: 0, transition: "color 0.15s ease" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--rc-ink)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to policies
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ ...PAGE_H1, marginBottom: 0 }}>{policy.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {policy.category && (
              <span style={{ fontSize: "11.5px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px", background: cat.bg, color: cat.color }}>{policy.category}</span>
            )}
            <span style={{ fontSize: "12px", color: policy.status === "current" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)", display: "flex", alignItems: "center", gap: "5px" }}>
              {policy.status === "current" ? <GreenDot /> : <AmberDot />}
              {policy.status === "current" ? "Current" : "Review due"}
            </span>
            {policy.last_reviewed && <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>Last reviewed: {policy.last_reviewed}</span>}
            {policy.next_review && <span style={{ fontSize: "12px", color: policy.status === "review-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)" }}>Next review: {policy.next_review}</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
          {policy.status === "review-due" && onMarkReviewed && (
            <button onClick={handleMarkReviewed} disabled={marking} style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "background 0.15s ease", opacity: marking ? 0.6 : 1 }}>
              {marking ? "Saving…" : "Mark reviewed"}
            </button>
          )}
          <button onClick={() => downloadPolicyPDF(policy)} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "opacity 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download PDF
          </button>
          {onDelete && (
            <button onClick={handleDelete} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 500, color: "oklch(0.50 0.18 25)", background: "transparent", border: "1px solid oklch(0.82 0.06 25)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "background 0.15s ease, color 0.15s ease", opacity: deleting ? 0.5 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.96 0.02 25)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3h9M5 3V2h3v1M3.5 3l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)", background: "var(--rc-bg)" }}>
        <div style={{ overflowY: "auto", height: "100%", padding: "28px 32px" }}>
          {policy.content ? (
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontFamily: "'Georgia', serif", fontSize: "13.5px", lineHeight: 1.8, color: "var(--rc-ink)", margin: 0 }}>
              {policy.content}
            </pre>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
              <p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none" }}>No content stored for this policy. Re-generate it from Policy Templates to store the full text.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AllPoliciesPage({ policies, onPolicyUpdated, onPolicyDeleted }: { policies: PolicyRow[]; onPolicyUpdated: (p: PolicyRow) => void; onPolicyDeleted: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [viewPolicy, setViewPolicy] = useState<PolicyRow | null>(null);
  const filtered = policies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const cols = "minmax(0,1fr) 110px 130px 130px 110px";

  async function markReviewed(p: PolicyRow) {
    const today = new Date();
    const fmtDate = (d: Date) => d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
    const nextYear = new Date(today); nextYear.setFullYear(nextYear.getFullYear() + 1);
    const { data, error } = await supabase.from("policies").update({
      status: "current", last_reviewed: fmtDate(today), next_review: fmtDate(nextYear),
    }).eq("id", p.id).select().single();
    if (!error && data) {
      const updated = { ...p, status: "current" as const, last_reviewed: data.last_reviewed, next_review: data.next_review };
      onPolicyUpdated(updated);
      if (viewPolicy?.id === p.id) setViewPolicy(updated);
    }
  }

  async function deletePolicy(p: PolicyRow) {
    const { error } = await supabase.from("policies").delete().eq("id", p.id);
    if (!error) { onPolicyDeleted(p.id); setViewPolicy(null); }
  }

  if (viewPolicy) {
    return <PolicyDetailView policy={viewPolicy} onBack={() => setViewPolicy(null)} onMarkReviewed={viewPolicy.status === "review-due" ? markReviewed : undefined} onDelete={deletePolicy} />;
  }

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>All Policies</h1>
          <p style={PAGE_SUB}>{policies.length} document{policies.length !== 1 ? "s" : ""} in library</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policies…"
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--rc-border)", fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", fontFamily: "var(--font-inter)", outline: "none", width: "220px" }}
          onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
      </div>
      {policies.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No policies yet. Use Policy Templates or Upload Document to add your first one.</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
            {["Policy name", "Status", "Last reviewed", "Next review", "Action"].map(h => (
              <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", cursor: "pointer", transition: "background 0.1s ease" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--rc-surface)")} onMouseLeave={e => (e.currentTarget.style.background = "var(--rc-bg)")}>
                <button onClick={() => setViewPolicy(p)} style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-primary)", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "opacity 0.1s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  {p.name}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 20px" }}>
                  {p.status === "current" ? <GreenDot /> : <AmberDot />}
                  <span style={{ fontSize: "12.5px", color: p.status === "current" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{p.status === "current" ? "Current" : "Review due"}</span>
                </div>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{p.last_reviewed ?? "—"}</span>
                <span style={{ fontSize: "12.5px", color: p.status === "review-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)", padding: "0 20px" }}>{p.next_review ?? "—"}</span>
                <div style={{ padding: "0 20px" }}>
                  {p.status === "review-due" ? (
                    <button onClick={e => { e.stopPropagation(); markReviewed(p); }} style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "color 0.1s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--rc-ink)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>
                      Mark reviewed →
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const catColors: Record<string, { color: string; bg: string }> = {
  Sales:      { color: "oklch(0.38 0.12 260)", bg: "oklch(0.94 0.03 260)" },
  Management: { color: "oklch(0.40 0.12 195)", bg: "oklch(0.94 0.03 195)" },
  Compliance: { color: "oklch(0.46 0.18 25)",  bg: "oklch(0.96 0.03 25)"  },
  Trust:      { color: "oklch(0.42 0.12 145)", bg: "oklch(0.95 0.025 145)" },
  Admin:      { color: "var(--rc-muted)",       bg: "var(--rc-surface)"    },
  Staff:      { color: "oklch(0.40 0.12 310)", bg: "oklch(0.95 0.025 310)" },
};

type PTQuestion = { id: string; label: string; placeholder: string; hint?: string; multiline?: boolean };
type PTConfig = { name: string; category: string; description: string; questions: PTQuestion[]; generate: (a: Record<string, string>) => string };

const policyTemplateConfigs: PTConfig[] = [
  {
    name: "Supervision Guidelines", category: "Management",
    description: "Defines how licensed staff are supervised in line with NSW Fair Trading requirements.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "principal", label: "Principal licensee full name", placeholder: "e.g. Sarah Mitchell" },
      { id: "licenceNo", label: "Principal licence number", placeholder: "e.g. 1234567" },
      { id: "staffCount", label: "Number of licensed staff and certificate holders supervised", placeholder: "e.g. 9" },
      { id: "absenceDelegate", label: "Nominated senior licensee to act in principal's absence", placeholder: "e.g. James Chen (Licence No. 7654321)" },
      { id: "meetingFreq", label: "Team meeting / supervision meeting frequency", placeholder: "e.g. Weekly team meetings every Monday at 8:30am, plus daily morning check-ins" },
      { id: "checkInMethod", label: "Day-to-day supervision method", placeholder: "e.g. open-door policy, daily activity logs reviewed each afternoon, CRM pipeline reviewed weekly", multiline: true },
      { id: "cpdMethod", label: "How CPD obligations are monitored", placeholder: "e.g. tracked in RealComply with automated expiry alerts 90 and 30 days before deadline" },
      { id: "breach", label: "Process when a compliance breach or concern is identified", placeholder: "e.g. immediate verbal counselling, written incident report filed within 24 hours, principal reviews and determines remedial action", multiline: true },
      { id: "records", label: "How are supervision records kept and where?", placeholder: "e.g. documented in RealComply and individual staff files; reviewed monthly by the principal" },
      { id: "review", label: "How often is this policy reviewed?", placeholder: "e.g. Annually in July, or immediately following any regulatory change or Fair Trading audit" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `SUPERVISION GUIDELINES
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
DOCUMENT OWNER: ${a.principal} — Principal Licensee (Licence No. ${a.licenceNo})
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. LEGISLATIVE FRAMEWORK

These Supervision Guidelines are issued pursuant to:
  • Property and Stock Agents Act 2002 (NSW), ss 32, 33, 34 and 47
  • Property and Stock Agents Regulation 2022 (NSW), Part 3
  • Agents Code of Conduct (contained in Schedule 1 of the Regulation)

Under s32 of the Act, the Licensee in Charge (LIC) of a real estate agency must ensure that the business of the agency is properly supervised. Failure to properly supervise licensed and certificate-holding staff is grounds for disciplinary action by NSW Fair Trading, including suspension or revocation of licence.

────────────────────────────────────────

2. PURPOSE AND SCOPE

These Guidelines set out the supervision arrangements for ${a.agency} and apply to all ${a.staffCount} persons employed or engaged by the agency who hold a real estate licence or certificate of registration under the Property and Stock Agents Act 2002 (NSW).

The Guidelines are designed to ensure that:
  (a) all agency activities are conducted lawfully and ethically;
  (b) staff understand their obligations under the Act, the Regulation and the Code of Conduct;
  (c) any non-compliance is identified and addressed promptly;
  (d) clients receive professional and compliant service at all times.

────────────────────────────────────────

3. LICENSEE IN CHARGE — RESPONSIBILITIES

${a.principal} (Licence No. ${a.licenceNo}) is the Licensee in Charge of ${a.agency} and carries ultimate responsibility for:

  (a) Supervising all licensed agents and certificate holders employed or engaged by the agency;
  (b) Ensuring all staff are appropriately licensed or hold a valid certificate of registration for the functions they perform;
  (c) Verifying that CPD requirements are met by all staff within required timeframes;
  (d) Ensuring agency agreements, contracts, and all client-facing documents comply with the Act and associated legislation;
  (e) Maintaining a proper trust accounting system and ensuring statutory audit obligations are met;
  (f) Ensuring the agency's advertising and marketing comply with the Australian Consumer Law and the REIA Code of Conduct;
  (g) Providing mentoring, guidance and support to less experienced staff;
  (h) Ensuring that this policy and all related procedures remain current and are communicated to all staff.

────────────────────────────────────────

4. ABSENCE OF THE LICENSEE IN CHARGE

When ${a.principal} is absent from the principal place of business, ${a.absenceDelegate} will act as the supervising licensee for that period. The acting supervisory licensee has the same obligations as the LIC during the period of absence.

All periods of LIC absence exceeding five (5) consecutive business days will be documented, and the acting supervisory licensee will be notified in writing prior to commencement of the absence period.

────────────────────────────────────────

5. SUPERVISION METHODS AND PROCEDURES

5.1  Structured Meetings
${a.meetingFreq}. Meetings are minuted and attendance is recorded. Staff are encouraged to raise compliance questions, client concerns, and procedural issues at these forums.

5.2  Day-to-Day Supervision
${a.checkInMethod}

5.3  File and Transaction Review
The LIC or delegate reviews client files, agency agreements, contracts of sale, management agreements and trust accounting entries on a sampling basis not less than quarterly. Any errors, omissions or non-compliant conduct identified during review are communicated to the relevant staff member and remedied promptly.

5.4  Licence and Certificate Verification
All staff are required to maintain a current licence or certificate of registration at all times. The LIC maintains a register of all staff licences and certificates, including expiry dates. Staff are required to provide evidence of renewal prior to the expiry of their current authority to act.

5.5  Continuing Professional Development (CPD)
${a.cpdMethod}. Staff who fail to complete mandatory CPD by the required deadline must cease performing functions requiring a licence or certificate until CPD obligations are met and the relevant regulatory body has been notified as required.

5.6  New Staff Induction
All new staff members undergo an induction covering: agency policies and procedures; the Act and Regulation; the Code of Conduct; trust accounting obligations; client care standards; and the agency's filing and document management requirements. Induction is completed before the new staff member undertakes any unsupervised client-facing activity.

────────────────────────────────────────

6. BREACH IDENTIFICATION AND RESPONSE

${a.breach}

Breaches of the Act, the Regulation, the Code of Conduct, or this policy are taken seriously. Depending on the nature and severity of the breach, the agency may take one or more of the following steps:
  (a) Formal counselling and documented warning;
  (b) Increased supervision and performance monitoring;
  (c) Mandatory additional training;
  (d) Referral to NSW Fair Trading where required by law;
  (e) Disciplinary action up to and including termination of engagement.

────────────────────────────────────────

7. RECORD KEEPING

${a.records}

All supervision records — including meeting minutes, staff attendance, file review outcomes, CPD records, licence registers, and breach incident reports — are retained for a minimum of three (3) years and are made available to NSW Fair Trading on request in accordance with s118 of the Act.

────────────────────────────────────────

8. REVIEW OF THIS POLICY

This policy is reviewed ${a.review}. The LIC is responsible for ensuring the policy reflects any changes to the Act, the Regulation, the Code of Conduct, or Fair Trading guidance. Staff are notified of any material changes promptly.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.principal}
Licensee in Charge — Licence No. ${a.licenceNo}
${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
  {
    name: "Privacy Policy", category: "Compliance",
    description: "Outlines how your agency collects, uses, stores and discloses personal information under the APPs.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "principal", label: "Privacy officer / principal name", placeholder: "e.g. Sarah Mitchell" },
      { id: "website", label: "Agency website (if applicable)", placeholder: "e.g. www.rwbondijunction.com.au" },
      { id: "infoTypes", label: "Types of personal information collected", placeholder: "e.g. full name, date of birth, contact details, financial information, photo ID, tax file numbers (for property management only), rental history", multiline: true },
      { id: "sensitiveInfo", label: "Any sensitive information collected? (health, criminal, financial)", placeholder: "e.g. financial statements and bank details for rental applicants; no health or criminal records collected" },
      { id: "purpose", label: "Primary purposes for collecting personal information", placeholder: "e.g. facilitating property sales and purchases, leasing properties, providing property management services, AML/CTF compliance", multiline: true },
      { id: "thirdParties", label: "Third parties to whom information may be disclosed", placeholder: "e.g. solicitors and conveyancers, financiers and mortgage brokers, REI NSW, AUSTRAC, NSW Fair Trading, tenant reference agencies, utilities connection services", multiline: true },
      { id: "overseas", label: "Is personal information disclosed overseas? If so, to which countries?", placeholder: "e.g. No overseas disclosure / e.g. Cloud storage provider servers in the USA under AWS" },
      { id: "storage", label: "How is personal information stored and protected?", placeholder: "e.g. encrypted cloud-based CRM (PropertyMe) with role-based access controls; locked physical filing cabinets; password-protected workstations" },
      { id: "retention", label: "Retention period for personal information", placeholder: "e.g. 7 years after conclusion of the relevant transaction; rental applications not proceeding destroyed within 1 year" },
      { id: "contact", label: "Privacy enquiries contact (email or postal address)", placeholder: "e.g. privacy@agency.com.au or PO Box 123, Suburb NSW 2000" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `PRIVACY POLICY
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
PRIVACY OFFICER: ${a.principal}
WEBSITE: ${a.website || "N/A"}
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. OUR COMMITMENT

${a.agency} is committed to protecting the privacy of every person whose personal information we collect, hold, use or disclose. We comply with the Privacy Act 1988 (Cth) and the thirteen (13) Australian Privacy Principles (APPs) contained in Schedule 1 of that Act. This Policy explains how we manage personal information in the course of providing real estate services.

We may update this Policy from time to time. The current version is available on request and, where applicable, on our website (${a.website || "on request"}).

────────────────────────────────────────

2. WHAT PERSONAL INFORMATION WE COLLECT

We collect and hold the following types of personal information:
${a.infoTypes}

Where you engage us as a vendor, purchaser, landlord or tenant, we typically collect information that enables us to perform our agency obligations under the Property and Stock Agents Act 2002 (NSW) and any agency agreement entered into with you.

Sensitive Information: ${a.sensitiveInfo}

We will not collect sensitive information without your explicit consent, or unless required or authorised by law.

────────────────────────────────────────

3. HOW WE COLLECT PERSONAL INFORMATION

We collect personal information:
  (a) Directly from you when you engage our services, complete enquiry forms, attend open homes, submit rental applications, or communicate with us in person, by phone, or electronically;
  (b) From third parties such as referral agents, financiers, solicitors, tenant reference checking agencies, and publicly available sources (including property title searches and ASIC records) where reasonably necessary.

We collect personal information only by lawful and fair means and, where practicable, directly from the individual concerned.

────────────────────────────────────────

4. WHY WE COLLECT AND USE PERSONAL INFORMATION

We collect, hold, use and disclose personal information for the following primary purposes:
${a.purpose}

We may also use personal information for the following secondary purposes that you would reasonably expect:
  • Complying with our obligations under the AML/CTF Act 2006 (Cth) and AUSTRAC reporting requirements;
  • Providing you with updates on properties, market reports or agency services where you have not opted out;
  • Managing complaints, disputes or enquiries;
  • Complying with orders or requests from courts, tribunals, regulators (including NSW Fair Trading) or law enforcement agencies.

We will not use or disclose personal information for any other purpose without your consent.

────────────────────────────────────────

5. DISCLOSURE OF PERSONAL INFORMATION

We may disclose personal information to the following third parties:
${a.thirdParties}

Overseas Disclosure: ${a.overseas}

Where personal information is disclosed overseas, we take reasonable steps to ensure the recipient handles it consistently with the APPs or an equivalent privacy framework. Where we cannot ensure adequate protection, we will seek your consent prior to disclosure.

────────────────────────────────────────

6. STORAGE AND SECURITY

Personal information is stored as follows: ${a.storage}

We take reasonable steps to protect personal information from misuse, interference, loss, unauthorised access, modification or disclosure. These steps include:
  • Restricting access to personal information to authorised personnel only on a need-to-know basis;
  • Using industry-standard encryption for digital storage and transmission;
  • Requiring third-party service providers to maintain equivalent security standards under contractual obligations;
  • Conducting periodic security reviews and access audits.

────────────────────────────────────────

7. DATA BREACHES — NOTIFIABLE DATA BREACHES SCHEME

${a.agency} is subject to the Notifiable Data Breaches (NDB) scheme under Part IIIC of the Privacy Act 1988 (Cth). In the event of an eligible data breach (an unauthorised access, disclosure, or loss of personal information that is likely to result in serious harm), we will:
  (a) Contain the breach and assess likely harm within 30 days;
  (b) Notify the Office of the Australian Information Commissioner (OAIC) as soon as practicable;
  (c) Notify affected individuals where required;
  (d) Take immediate steps to prevent further data loss or harm.

────────────────────────────────────────

8. RETENTION AND DISPOSAL

We retain personal information for the following periods:
${a.retention}

After the relevant retention period, personal information is securely destroyed or de-identified. Physical documents are cross-cut shredded; digital records are permanently deleted and verified by the relevant system administrator.

────────────────────────────────────────

9. ACCESS AND CORRECTION

You have the right to request access to personal information we hold about you, and to request correction of any information that is inaccurate, out of date, incomplete or misleading.

To make a request, please contact our Privacy Officer (see clause 11). We will respond to access and correction requests within 30 days. We may decline access in limited circumstances permitted by the Privacy Act, and will explain the reason in writing.

We do not charge a fee for making an access request but may recover reasonable costs of producing a copy of records.

────────────────────────────────────────

10. COMPLAINTS

If you believe ${a.agency} has handled your personal information in breach of the Privacy Act or this Policy, please contact our Privacy Officer in the first instance (see clause 11). We will acknowledge your complaint within 5 business days and aim to resolve it within 30 days.

If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au or by calling 1300 363 992.

────────────────────────────────────────

11. CONTACT

Privacy Officer: ${a.principal}
${a.agency} (ABN ${a.abn})
Email / postal address: ${a.contact}
Website: ${a.website || "N/A"}

────────────────────────────────────────

_________________________
${a.principal} — Privacy Officer
${a.agency}

Date: ${date}`;
    },
  },
  {
    name: "AML & CTF Policy", category: "Compliance",
    description: "Anti-Money Laundering and Counter-Terrorism Financing policy for real estate agents.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "officer", label: "AML/CTF Compliance Officer name", placeholder: "e.g. Sarah Mitchell" },
      { id: "officerRole", label: "AML Compliance Officer's role / title", placeholder: "e.g. Principal Licensee & Director" },
      { id: "serviceTypes", label: "Designated services provided (real estate)", placeholder: "e.g. acting as agent in the buying and selling of real property on behalf of buyers or sellers" },
      { id: "stdVerification", label: "Standard CDD — identity documents accepted", placeholder: "e.g. Australian driver licence or passport (primary); Medicare card or utility bill (secondary); verified using AUSTRAC-compliant digital verification service", multiline: true },
      { id: "enhancedCDD", label: "When is enhanced CDD applied?", placeholder: "e.g. politically exposed persons (PEPs), transactions above $100,000 in cash or cryptocurrency, non-face-to-face customers, complex or unusual transaction structures", multiline: true },
      { id: "lowRisk", label: "Examples of low-risk customers/transactions", placeholder: "e.g. Australian residents with straightforward owner-occupier purchases under market value threshold" },
      { id: "highRisk", label: "Examples of high-risk indicators", placeholder: "e.g. cash or cryptocurrency payment, offshore buyer with no Australian connection, third-party payments, rushed settlement with little explanation", multiline: true },
      { id: "smrProcess", label: "Suspicious Matter Report (SMR) internal process", placeholder: "e.g. staff report concern to Compliance Officer immediately; officer assesses within 24 hours and lodges SMR via AUSTRAC Online within 3 business days if warranted", multiline: true },
      { id: "training", label: "Staff AML/CTF training frequency and format", placeholder: "e.g. induction training for all new staff; annual refresher for all staff; training records maintained by Compliance Officer" },
      { id: "records", label: "AML/CTF record retention period", placeholder: "e.g. 7 years from the date of the relevant designated service or transaction" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `AML & COUNTER-TERRORISM FINANCING (AML/CTF) POLICY AND PROGRAMME
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
AML/CTF COMPLIANCE OFFICER: ${a.officer} — ${a.officerRole}
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. LEGISLATIVE FRAMEWORK

This Policy and AML/CTF Programme is issued pursuant to:
  • Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (Cth) (AML/CTF Act)
  • Anti-Money Laundering and Counter-Terrorism Financing Rules Instrument 2007 (No. 1) (AML/CTF Rules)
  • Proceeds of Crime Act 2002 (Cth)
  • Financial Action Task Force (FATF) Recommendations (2012, as updated)

Real estate agents who provide designated services as defined in Table 1, Item 54 of the AML/CTF Act — specifically, acting as an intermediary in the purchase or sale of real property — are reporting entities with obligations to AUSTRAC.

────────────────────────────────────────

2. PURPOSE

This Policy establishes the framework by which ${a.agency} identifies, assesses, manages and mitigates the risk that its services may be used to facilitate money laundering or terrorism financing. It also sets out our obligations to report to AUSTRAC and to apply customer due diligence (CDD) procedures.

────────────────────────────────────────

3. DESIGNATED SERVICES

${a.agency} provides the following designated services under the AML/CTF Act:
${a.serviceTypes}

────────────────────────────────────────

4. AML/CTF COMPLIANCE OFFICER

${a.officer} (${a.officerRole}) is appointed as the AML/CTF Compliance Officer and is responsible for:
  (a) Developing, implementing and maintaining this AML/CTF Programme;
  (b) Overseeing the day-to-day application of CDD procedures;
  (c) Receiving and assessing suspicious matter reports from staff;
  (d) Lodging Suspicious Matter Reports (SMRs) and Threshold Transaction Reports (TTRs) with AUSTRAC where required;
  (e) Maintaining the AML/CTF risk assessment and keeping it current;
  (f) Delivering or arranging AML/CTF training for all relevant staff;
  (g) Engaging with AUSTRAC on any enquiries, requests or audits;
  (h) Reviewing and updating this Programme at least annually.

────────────────────────────────────────

5. ML/TF RISK ASSESSMENT

${a.agency} has conducted a risk assessment of its services, customers, and geographic exposure. Risk ratings are assigned as Low, Medium or High based on:
  • Customer type and background
  • Transaction complexity, value and structure
  • Payment methods used (particularly cash and cryptocurrency)
  • Property type and location
  • Whether the customer is a Politically Exposed Person (PEP) or associated with a PEP
  • Geographic risk (source country of customer or funds)

Low-risk indicators include: ${a.lowRisk}

High-risk indicators include: ${a.highRisk}

The risk assessment is reviewed at least annually and updated when business circumstances change materially.

────────────────────────────────────────

6. CUSTOMER DUE DILIGENCE (CDD)

6.1  Standard CDD
Before providing a designated service, ${a.agency} will verify the identity of:
  • All natural persons who are the principal party to the transaction (vendor or purchaser);
  • Any person acting as agent, attorney or representative for a principal party;
  • The beneficial owners of any corporate or trust customer.

Standard CDD requires: ${a.stdVerification}

Identity verification must be completed before the agency agreement is executed or at the latest prior to exchange of contracts.

6.2  Enhanced CDD
Enhanced CDD is applied in the following circumstances:
${a.enhancedCDD}

Enhanced CDD involves obtaining additional documentation (e.g. source-of-funds statements, certified constitutional documents for trusts or companies, independent reference checks) and escalating to the Compliance Officer for sign-off before proceeding.

6.3  Ongoing CDD
For property management clients, CDD is updated when there are material changes to the client relationship or when a suspicious matter is identified.

────────────────────────────────────────

7. SUSPICIOUS MATTER REPORTING (SMR)

All staff members are required to report any suspicious matter to the Compliance Officer immediately upon identification. A suspicious matter exists where a staff member suspects, on reasonable grounds, that:
  (a) A customer is not who they claim to be;
  (b) A transaction or pattern of transactions relates to money laundering or terrorism financing;
  (c) Information gathered during CDD is false, misleading or cannot be verified;
  (d) A customer is a sanctioned person under Australian sanctions law.

Internal SMR Process: ${a.smrProcess}

Staff must NOT tip off a customer that an SMR has been or may be lodged. Tipping off is a criminal offence under s123 of the AML/CTF Act.

────────────────────────────────────────

8. THRESHOLD TRANSACTION REPORTS (TTR)

Where ${a.agency} facilitates or is involved in a cash transaction of AUD $10,000 or more (or foreign currency equivalent), or a series of transactions totalling $10,000 or more that appear to be structured to avoid reporting, a Threshold Transaction Report must be lodged with AUSTRAC within 10 business days.

The Compliance Officer is responsible for identifying and lodging all TTRs via AUSTRAC Online (www.austrac.gov.au).

────────────────────────────────────────

9. SANCTIONS SCREENING

Before entering a new client relationship, ${a.agency} screens the customer against:
  • Australia's Consolidated List (DFAT)
  • UN Security Council sanctions lists
  • AUSTRAC's Financial Intelligence resources

A client who appears on any sanctions list must not receive a designated service. The Compliance Officer must be notified immediately and will determine the appropriate course of action, which may include refusing to act or lodging an SMR.

────────────────────────────────────────

10. STAFF TRAINING

${a.training}

Training covers:
  • The nature and purpose of the AML/CTF Act and this Programme;
  • How to identify suspicious matters and red flag indicators;
  • CDD procedures and documentation requirements;
  • The internal SMR and TTR reporting process;
  • Consequences of tipping off and non-compliance.

Training records (name, date, content) are maintained by the Compliance Officer for at least 7 years.

────────────────────────────────────────

11. RECORD KEEPING

The following records are retained for ${a.records}:
  • CDD documents and verification records for each customer;
  • Transaction records including agency agreements, contracts, trust account receipts and disbursements;
  • SMRs and TTRs lodged with AUSTRAC;
  • The risk assessment and this AML/CTF Programme (each version);
  • Training records.

Records are stored securely and available to AUSTRAC on request under s116 of the AML/CTF Act.

────────────────────────────────────────

12. INDEPENDENT REVIEW

This AML/CTF Programme will be subject to independent review no less than every three (3) years, or sooner if there is a material change in business activities, a significant regulatory development, or an adverse finding by AUSTRAC. The Compliance Officer will commission and oversee the review.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.officer}
AML/CTF Compliance Officer — ${a.officerRole}
${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
  {
    name: "WHS Policy", category: "Staff",
    description: "Work Health and Safety policy establishing duties and procedures for your agency.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "principal", label: "Name of PCBU / person responsible for WHS", placeholder: "e.g. Sarah Mitchell" },
      { id: "whsOfficer", label: "WHS Officer or Health & Safety Representative (if appointed)", placeholder: "e.g. James Chen (HSR) or 'None appointed — principal assumes HSR responsibilities'" },
      { id: "firstAid", label: "First Aid Officer name and training currency", placeholder: "e.g. Anna Brown — HLTAID011 current until March 2027" },
      { id: "firstAidKit", label: "Location of first aid kit(s)", placeholder: "e.g. Kitchen area Level 1 office; rear storage room" },
      { id: "hazardProcess", label: "Hazard identification, reporting and control process", placeholder: "e.g. all staff complete a hazard report form (available in kitchen) and email it to whs@agency.com.au; principal reviews within 24 hours and applies hierarchy of controls", multiline: true },
      { id: "remoteWork", label: "WHS obligations for staff working remotely or at property inspections", placeholder: "e.g. staff conducting open homes must advise principal of address and expected return time; check-in protocol if solo inspection", multiline: true },
      { id: "incidentProcess", label: "Incident and near-miss reporting process", placeholder: "e.g. immediate first aid, call 000 if required, notify principal immediately, complete incident report within 24 hours, preserve scene if notifiable incident", multiline: true },
      { id: "emergency", label: "Emergency response — fire, medical, evacuation", placeholder: "e.g. call 000, activate fire panel if required, evacuate to assembly point (front carpark), account for all persons, contact principal on 0400 000 000" },
      { id: "mentalHealth", label: "Mental health and wellbeing support available to staff", placeholder: "e.g. EAP (Employee Assistance Programme) via [provider] on 1800 XXX XXX; open-door policy with principal; annual wellbeing check-in" },
      { id: "review", label: "WHS policy review frequency", placeholder: "e.g. Annually each July, or immediately following any workplace incident, change in legislation, or new risk identified" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `WORK HEALTH AND SAFETY (WHS) POLICY AND PROCEDURE
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
PCBU: ${a.principal}
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. LEGISLATIVE FRAMEWORK

This Policy is issued pursuant to:
  • Work Health and Safety Act 2011 (NSW) (WHS Act)
  • Work Health and Safety Regulation 2017 (NSW) (WHS Regulation)
  • Workplace Injury Management and Workers Compensation Act 1998 (NSW)
  • SafeWork NSW Codes of Practice

Under s19 of the WHS Act, a Person Conducting a Business or Undertaking (PCBU) has a primary duty of care to ensure, so far as is reasonably practicable, the health and safety of workers and others affected by the carrying out of the work.

────────────────────────────────────────

2. COMMITMENT

${a.agency} is committed to providing a safe, healthy and supportive workplace for all workers, contractors, clients and visitors. We regard the prevention of workplace injury and illness as a core business priority, not a discretionary matter. This Policy reflects our commitment to meeting and exceeding our legal obligations under the WHS Act.

────────────────────────────────────────

3. SCOPE

This Policy applies to:
  (a) All workers engaged by ${a.agency}, whether permanent, part-time, casual, or as independent contractors;
  (b) All persons conducting work-related activities on behalf of the agency, including at property inspections, open homes, client meetings held off-site, and when working remotely;
  (c) All visitors and clients attending the principal office or any property at which the agency is conducting business.

────────────────────────────────────────

4. DUTIES AND RESPONSIBILITIES

4.1  PCBU — ${a.principal}
As PCBU, ${a.principal} must, so far as is reasonably practicable:
  (a) Provide and maintain a safe work environment, systems of work, and plant and structures;
  (b) Ensure the safe use, handling, storage and transport of plant and substances;
  (c) Provide adequate facilities for the welfare of workers;
  (d) Provide information, training, instruction and supervision to ensure safe work practices;
  (e) Monitor the health of workers and conditions at the workplace;
  (f) Consult with workers on WHS matters (see clause 7).

4.2  WHS Officer / Health and Safety Representative
${a.whsOfficer} assists the PCBU in implementing this Policy, conducting hazard inspections, facilitating worker consultation, and maintaining WHS records.

4.3  All Workers
Each worker must, so far as reasonably able to do so:
  (a) Take reasonable care of their own health and safety;
  (b) Take reasonable care that their acts or omissions do not adversely affect the health and safety of others;
  (c) Comply with any reasonable WHS instruction given by the agency;
  (d) Cooperate with any reasonable WHS policy or procedure;
  (e) Report hazards, near-misses and incidents promptly.

────────────────────────────────────────

5. HAZARD IDENTIFICATION, RISK ASSESSMENT AND CONTROL

5.1  Hazard Identification
${a.agency} conducts formal hazard inspections of the principal place of business no less than annually. In addition, all workers are required to identify and report hazards on an ongoing basis.

Hazard reporting process: ${a.hazardProcess}

5.2  Risk Assessment
Reported hazards are assessed using a risk matrix (likelihood × consequence). The PCBU or WHS Officer prioritises remediation based on risk rating.

5.3  Hierarchy of Controls
Controls are applied in the following order of preference:
  1. Elimination — remove the hazard entirely
  2. Substitution — replace with something less hazardous
  3. Isolation — separate people from the hazard
  4. Engineering controls — physical barriers or redesign
  5. Administrative controls — procedures, training, signage
  6. Personal protective equipment (PPE) — used as a last resort only

5.4  Remote Work and Property Inspections
${a.remoteWork}

────────────────────────────────────────

6. FIRST AID

First Aid Officer: ${a.firstAid}

First aid kit location(s): ${a.firstAidKit}

The first aid kit is inspected and restocked every six (6) months, or immediately following use. The First Aid Officer's training currency is monitored by the PCBU and renewed before expiry.

────────────────────────────────────────

7. CONSULTATION AND WORKER PARTICIPATION

Under ss 46–49 of the WHS Act, the PCBU must consult with workers on WHS matters that are likely to directly affect them. Consultation occurs through:
  (a) Team meetings, where WHS is a standing agenda item;
  (b) Direct discussion with the WHS Officer or PCBU;
  (c) Incident debriefs following any workplace incident or near-miss.

Workers are encouraged to raise WHS concerns without fear of reprisal. Workers who believe a WHS concern has not been adequately addressed may contact SafeWork NSW on 13 10 50.

────────────────────────────────────────

8. INCIDENT AND NEAR-MISS REPORTING

8.1  Immediate Response
${a.incidentProcess}

8.2  Notifiable Incidents
Under s35 of the WHS Act, a notifiable incident (death, serious illness or injury, or a dangerous incident) must be reported to SafeWork NSW immediately on 13 10 50. The scene must be preserved until an inspector from SafeWork NSW has attended or the requirement is otherwise waived. No person may interfere with the scene of a notifiable incident without authority.

8.3  Records
All incidents and near-misses are recorded in the agency's incident register. Records are retained for at least five (5) years.

────────────────────────────────────────

9. EMERGENCY PROCEDURES

${a.emergency}

Emergency procedures are posted visibly at all exits and near all first aid kits. Staff are briefed on emergency procedures during induction and at least annually thereafter. Emergency drills are conducted annually.

────────────────────────────────────────

10. MENTAL HEALTH AND WELLBEING

${a.agency} acknowledges that psychosocial hazards — including bullying, harassment, excessive work demands, remote isolation and client-related aggression — are real workplace health risks.

${a.mentalHealth}

Any worker who experiences or witnesses bullying, harassment, discrimination or violence in the workplace should report it to the PCBU immediately. Confidential support is also available via the EAP. Reports are treated seriously and confidentially.

────────────────────────────────────────

11. REVIEW

This Policy is reviewed ${a.review}. The PCBU is responsible for ensuring the Policy remains current and reflecting any changes in the WHS Act, WHS Regulation, SafeWork NSW guidance, or the agency's risk profile.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.principal}
PCBU — ${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
  {
    name: "Complaints Handling Procedure", category: "Admin",
    description: "Sets out how your agency receives, investigates and resolves complaints in line with NSW Fair Trading expectations.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "officer", label: "Designated Complaints Officer name", placeholder: "e.g. Sarah Mitchell" },
      { id: "officerRole", label: "Complaints Officer's role / title", placeholder: "e.g. Principal Licensee" },
      { id: "contactEmail", label: "Complaints email address", placeholder: "e.g. complaints@agency.com.au" },
      { id: "contactPhone", label: "Complaints contact phone number", placeholder: "e.g. (02) 9000 0000" },
      { id: "contactMethods", label: "All channels through which complaints may be lodged", placeholder: "e.g. in writing by email or letter, verbally in person or by phone, or via the complaints form on our website" },
      { id: "acknowledgement", label: "Complaint acknowledgement timeframe", placeholder: "e.g. within 2 business days of receipt" },
      { id: "progressUpdate", label: "Progress update timeframe for ongoing complaints", placeholder: "e.g. every 5 business days" },
      { id: "resolution", label: "Target resolution timeframe", placeholder: "e.g. within 10 business days of receipt; complex matters within 30 business days" },
      { id: "escalation", label: "Internal escalation process (e.g. to franchisor or director)", placeholder: "e.g. if the Complaints Officer is the subject of the complaint, escalated to the agency director or franchisor principal" },
      { id: "externalBodies", label: "External bodies available to complainants", placeholder: "e.g. NSW Fair Trading (1300 799 001), NSW Civil & Administrative Tribunal (NCAT), REI NSW, Office of the Australian Information Commissioner (for privacy complaints)" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `COMPLAINTS HANDLING POLICY AND PROCEDURE
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
COMPLAINTS OFFICER: ${a.officer} — ${a.officerRole}
COMPLAINTS CONTACT: ${a.contactEmail} | ${a.contactPhone}
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. PURPOSE AND LEGISLATIVE CONTEXT

${a.agency} is committed to providing high-quality real estate services and to resolving complaints fairly, promptly and transparently. We recognise that complaints provide valuable feedback and an opportunity to improve our service.

This Procedure applies to all complaints received from vendors, purchasers, landlords, tenants, and members of the public in relation to services provided by ${a.agency} or its staff.

Relevant legislative framework:
  • Property and Stock Agents Act 2002 (NSW), Part 8 — Discipline
  • Property and Stock Agents Regulation 2022 (NSW), Schedule 1 — Code of Conduct (cl 1 — general conduct obligations; cl 6 — dealing with complaints)
  • Australian Consumer Law (Schedule 2, Competition and Consumer Act 2010 (Cth))
  • Privacy Act 1988 (Cth)

Under the Code of Conduct, agents are required to deal with complaints honestly, promptly and courteously, and to maintain a record of all complaints received.

────────────────────────────────────────

2. HOW TO LODGE A COMPLAINT

Complaints may be lodged by:
${a.contactMethods}

All complaints are directed to:
  Complaints Officer: ${a.officer}
  Email: ${a.contactEmail}
  Phone: ${a.contactPhone}

Anonymous complaints are accepted. Where possible, we will investigate and take appropriate action even where the complainant's identity is not disclosed. However, the ability to provide feedback to an anonymous complainant will necessarily be limited.

────────────────────────────────────────

3. WHAT CONSTITUTES A COMPLAINT

For the purposes of this Procedure, a complaint is any expression of dissatisfaction, whether verbal or written, made by a person in relation to:
  (a) the conduct of a licensee or certificate holder employed or engaged by the agency;
  (b) the standard of service provided;
  (c) the agency's policies or procedures;
  (d) a transaction, agency agreement, property management matter, or disclosure obligation;
  (e) a suspected breach of the Act, the Regulation or the Code of Conduct.

────────────────────────────────────────

4. COMPLAINTS OFFICER — RESPONSIBILITIES

${a.officer} (${a.officerRole}) is the designated Complaints Officer and is responsible for:
  (a) Receiving and acknowledging all complaints;
  (b) Conducting or overseeing a fair and impartial investigation;
  (c) Keeping the complainant informed of progress;
  (d) Determining and communicating outcomes;
  (e) Implementing remedial action where appropriate;
  (f) Maintaining the complaints register;
  (g) Reporting systemic complaint trends to agency management.

Escalation: ${a.escalation}

────────────────────────────────────────

5. COMPLAINT HANDLING PROCESS

Step 1 — Receipt and Acknowledgement
All complaints are logged in the complaints register upon receipt. The complainant is acknowledged ${a.acknowledgement}. The acknowledgement confirms receipt and provides the name of the Complaints Officer and an estimated timeframe for resolution.

Step 2 — Investigation
The Complaints Officer investigates the complaint by:
  (a) Reviewing the relevant client file, correspondence, agency agreement, and any applicable transaction records;
  (b) Speaking with the staff member(s) involved and obtaining their account;
  (c) Consulting relevant legislation, the Code of Conduct, or agency policy as applicable;
  (d) Obtaining any independent information or evidence needed to resolve the matter.

The complainant is kept informed of progress at least every ${a.progressUpdate}.

Step 3 — Resolution
${a.agency} aims to resolve all complaints ${a.resolution}. More complex matters requiring factual investigation or legal input may take additional time; in such cases the complainant will be informed of the expected extended timeline within the standard resolution period.

The outcome of the complaint is communicated to the complainant in writing, including:
  (a) A summary of the investigation findings;
  (b) The agency's determination;
  (c) Any remedial action taken or proposed;
  (d) The complainant's right to escalate the matter externally.

Step 4 — Remedial Action
Where a complaint is substantiated in whole or in part, the agency will promptly take appropriate corrective action, which may include:
  • Apology and explanation;
  • Fee adjustment or refund as warranted;
  • Remediation of the specific issue complained of;
  • Counselling, retraining or disciplinary action in relation to involved staff;
  • Amendment of agency procedures to prevent recurrence.

────────────────────────────────────────

6. EXTERNAL ESCALATION

If a complainant is not satisfied with the agency's handling of their complaint, they may contact any of the following external bodies:

${a.externalBodies}

NSW Fair Trading is the primary regulator for real estate agents in NSW. Fair Trading can investigate complaints about agents and may take disciplinary action under Part 8 of the Act.

The NSW Civil and Administrative Tribunal (NCAT) hears certain residential tenancy disputes (under the Residential Tenancies Act 2010 (NSW)) and can hear matters involving alleged breaches of the Property and Stock Agents Act.

────────────────────────────────────────

7. RECORD KEEPING AND CONTINUOUS IMPROVEMENT

All complaints, including their nature, date received, investigation steps, and outcome, are recorded in the agency's complaints register and retained for a minimum of three (3) years in accordance with legislative requirements.

The Complaints Officer reviews the complaints register at least quarterly to identify any patterns or systemic issues and to implement improvements to agency service and procedures. An annual summary of complaints and outcomes is reported to agency management.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.officer}
Complaints Officer — ${a.officerRole}
${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
  {
    name: "Trust Accounting Procedures", category: "Trust",
    description: "Procedures for receiving, holding and disbursing trust monies under the Property and Stock Agents Act 2002 (NSW).",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "licensee", label: "Licensee in Charge (full name)", placeholder: "e.g. Sarah Mitchell" },
      { id: "licenceNo", label: "LIC licence number", placeholder: "e.g. 1234567" },
      { id: "signatories", label: "Authorised trust account signatories", placeholder: "e.g. Sarah Mitchell (primary); James Chen (secondary — requires dual authorisation for disbursements over $10,000)" },
      { id: "bankName", label: "Name of bank / financial institution holding trust account(s)", placeholder: "e.g. Commonwealth Bank of Australia" },
      { id: "accountTypes", label: "Types of trust accounts maintained", placeholder: "e.g. General Sales Trust Account; General Property Management Trust Account" },
      { id: "receiptProcess", label: "Process for receipting trust money", placeholder: "e.g. sequential pre-printed receipts issued immediately via PropertyMe; funds deposited same day or next business day if received after 3pm", multiline: true },
      { id: "disbursementProcess", label: "Process for authorising disbursements", placeholder: "e.g. written or email authority from client required; dual signatory for amounts over $10,000; LIC reviews and approves all disbursements before processing", multiline: true },
      { id: "reconciliation", label: "Reconciliation frequency and process", placeholder: "e.g. trial balance reconciliation completed monthly on the last business day; three-way reconciliation (trust ledger, bank statement, client ledger) reviewed and signed by LIC within 5 days of month end" },
      { id: "software", label: "Trust accounting software used", placeholder: "e.g. PropertyMe / Console Cloud / Managed App / Palace" },
      { id: "shortage", label: "Process if a trust account shortage is identified", placeholder: "e.g. LIC notified immediately; agency funds used to remedy shortage immediately; NSW Fair Trading notified in writing within 3 days; external audit commissioned if required" },
      { id: "audit", label: "Annual audit arrangement", placeholder: "e.g. audited annually by [Auditor Name], approved auditor under s90 of the Act, within 3 months of the end of each financial year; audit report submitted to NSW Fair Trading" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `TRUST ACCOUNTING POLICY AND PROCEDURES
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
LICENSEE IN CHARGE: ${a.licensee} (Licence No. ${a.licenceNo})
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. LEGISLATIVE FRAMEWORK

These Procedures are issued pursuant to:
  • Property and Stock Agents Act 2002 (NSW), Part 5 — Trust Accounts (ss 84–107)
  • Property and Stock Agents Regulation 2022 (NSW), Part 5 — Trust Money
  • Conveyancing Act 1919 (NSW) (as applicable to deposit monies)

Failure to comply with trust accounting obligations is a serious statutory breach and may result in disciplinary action by NSW Fair Trading, including the suspension or revocation of the agency's licence.

────────────────────────────────────────

2. PURPOSE AND SCOPE

These Procedures govern all aspects of trust money management at ${a.agency}, including:
  • Receipt and deposit of all trust money;
  • Maintenance of trust accounting records;
  • Disbursement of trust funds;
  • Reconciliation of trust accounts;
  • Annual audit compliance.

These Procedures apply to all staff involved in any aspect of trust money handling.

────────────────────────────────────────

3. RESPONSIBILITY — LICENSEE IN CHARGE

${a.licensee} (Licence No. ${a.licenceNo}) is the Licensee in Charge and has primary statutory responsibility under s87 of the Act for:
  (a) Ensuring all trust money is held, recorded and disbursed in compliance with the Act and Regulation;
  (b) Maintaining accurate trust accounting records;
  (c) Ensuring the trust account is audited annually by an approved auditor;
  (d) Notifying NSW Fair Trading of any trust account shortage as required by s107 of the Act;
  (e) Supervising all staff who handle trust money.

────────────────────────────────────────

4. TRUST ACCOUNTS MAINTAINED

Bank / Financial Institution: ${a.bankName}

Trust Accounts:
${a.accountTypes}

All trust accounts are maintained with an authorised deposit-taking institution (ADI) as required by s85 of the Act. The agency's licence number is included in the account name. Trust money is not to be mixed with the agency's general operating funds under any circumstances.

────────────────────────────────────────

5. AUTHORISED SIGNATORIES

Only the following persons are authorised to operate trust accounts:
${a.signatories}

No other person may access, withdraw from or operate the trust account without written authority from the Licensee in Charge. Authority must be documented in the agency's records before any disbursement is made.

────────────────────────────────────────

6. RECEIPT OF TRUST MONEY

${a.receiptProcess}

Trust money must be deposited into the trust account on the day of receipt, or on the next business day where receipt occurs after banking hours, in accordance with s86 of the Act. Under no circumstances is trust money to be deposited into the agency's general account.

────────────────────────────────────────

7. DISBURSEMENT OF TRUST MONEY

${a.disbursementProcess}

Trust money must only be disbursed:
  (a) To the person entitled to receive it;
  (b) In accordance with a written authority from the person for whom it is held;
  (c) In accordance with a court order or the terms of an agency agreement;
  (d) As otherwise required or permitted by the Act.

All disbursements are recorded in ${a.software} at the time of payment with supporting documentation attached to the relevant ledger entry.

────────────────────────────────────────

8. TRUST ACCOUNTING RECORDS

The following records are maintained for each trust transaction:
  (a) Numbered trust account receipt;
  (b) Deposit records;
  (c) Trust ledger entries for each client;
  (d) Disbursement records and supporting authorities;
  (e) Monthly reconciliation statements;
  (f) Auditor's reports.

Trust accounting is conducted using ${a.software}. All records produced by this system are backed up daily and retained for a minimum of three (3) years in accordance with s88 of the Act.

────────────────────────────────────────

9. RECONCILIATION

${a.reconciliation}

The reconciliation confirms that the trust bank statement balance equals the trial balance of trust ledgers (the three-way reconciliation). Reconciliation statements are signed by the Licensee in Charge and retained as part of the agency's trust accounting records.

Any discrepancy identified during reconciliation is investigated immediately by the LIC and resolved before any further disbursements are made.

────────────────────────────────────────

10. TRUST ACCOUNT SHORTAGES

A trust account shortage exists where the amount held in the trust account is less than the total amount owed to all clients across all ledger balances.

${a.shortage}

Under s107 of the Act, the Licensee in Charge must notify NSW Fair Trading in writing if a trust account shortage cannot be remedied immediately. Failure to notify is a disciplinary offence.

────────────────────────────────────────

11. ANNUAL AUDIT

${a.audit}

Under s90 of the Act, the Licensee in Charge must cause the trust accounts to be audited by an approved auditor within 3 months after the end of each financial year (i.e. by 30 September). The auditor's report is submitted to NSW Fair Trading in the form required by the Director-General.

────────────────────────────────────────

12. PROHIBITED USES OF TRUST MONEY

Trust money must never be used:
  (a) To fund agency operating expenses, wages or any business cost;
  (b) As security for any loan or financial obligation of the agency;
  (c) For any purpose not authorised in writing by the client to whom the money belongs;
  (d) In any way that creates a commingling of trust and general funds.

Any staff member who knowingly misappropriates trust money may be subject to criminal prosecution and loss of their licence or certificate of registration.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.licensee}
Licensee in Charge — Licence No. ${a.licenceNo}
${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
  {
    name: "Social Media Policy", category: "Marketing",
    description: "Governs staff use of social media in compliance with the ACL, Privacy Act and real estate advertising standards.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "principal", label: "Principal licensee name", placeholder: "e.g. Sarah Mitchell" },
      { id: "socialManager", label: "Person responsible for managing official social media accounts", placeholder: "e.g. Lisa Torres — Marketing Coordinator" },
      { id: "platforms", label: "Approved official agency platforms", placeholder: "e.g. Facebook Business Page, Instagram, LinkedIn Company Page, Google Business Profile" },
      { id: "approvalProcess", label: "Content approval process before publishing", placeholder: "e.g. all property listings approved by LIC before going live; all promotional or opinion content approved by principal or nominated marketing manager; staff must not post anything real-estate related without approval", multiline: true },
      { id: "listingStandards", label: "Advertising and listing content standards", placeholder: "e.g. all prices, fees and property details must be accurate; estimated sale price ranges require a current CMA; rent amounts must match management agreement; no use of 'offers above' or price ranges in violation of the Regulation", multiline: true },
      { id: "prohibited", label: "Prohibited content — specific to real estate", placeholder: "e.g. client names or personal details without consent; undisclosed testimonials or endorsements; discriminatory content in property advertising; representations about price, area or features that cannot be substantiated; agent comparisons without factual basis", multiline: true },
      { id: "personalUse", label: "Personal social media — obligations for staff", placeholder: "e.g. staff must not post agency listings or property details on personal accounts without approval; must not post client information; must identify posts as personal opinion and not the agency's view", multiline: true },
      { id: "breach", label: "Consequence of breach", placeholder: "e.g. verbal warning for minor first breach; formal written warning for second breach; termination or referral to NSW Fair Trading for serious breaches involving client information disclosure or misleading conduct" },
      { id: "retention", label: "How long are social media posts / content records retained?", placeholder: "e.g. screenshots of all published posts retained for 3 years in agency marketing files" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `SOCIAL MEDIA POLICY
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
PRINCIPAL: ${a.principal}
SOCIAL MEDIA MANAGER: ${a.socialManager}
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. PURPOSE AND LEGISLATIVE CONTEXT

This Policy governs the use of social media by ${a.agency} and all persons employed or engaged by the agency in connection with the agency's real estate business.

Relevant legislative and regulatory framework:
  • Competition and Consumer Act 2010 (Cth), Schedule 2 — Australian Consumer Law (ACL): misleading and deceptive conduct (s18), false representations (s29), unconscionable conduct (s21)
  • Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs)
  • Property and Stock Agents Act 2002 (NSW), Part 4 — Conduct of Agency Business
  • Property and Stock Agents Regulation 2022 (NSW), Schedule 1 — Code of Conduct
  • Advertising Standards (AANA Code of Ethics)
  • Anti-Discrimination Act 1977 (NSW) — in relation to any property advertising

All real estate advertising — whether on portals, social media or any other channel — must comply with the above legislation. Misleading advertising in relation to property is grounds for disciplinary action by NSW Fair Trading and may attract penalties under the ACL.

────────────────────────────────────────

2. OFFICIAL AGENCY ACCOUNTS

${a.agency} maintains official social media accounts on the following platforms:
${a.platforms}

${a.socialManager} is responsible for managing all official agency accounts, including:
  (a) Creating and scheduling approved content;
  (b) Monitoring and responding to comments and messages;
  (c) Reporting any complaints, reputational concerns or compliance issues to the principal;
  (d) Maintaining the login credentials and security settings of all official accounts.

Staff must not create additional agency pages, accounts or groups on any platform without prior written approval from ${a.principal}. Unofficial accounts that purport to represent the agency may be required to be closed or transferred.

────────────────────────────────────────

3. CONTENT APPROVAL AND PUBLISHING PROCESS

${a.approvalProcess}

All content must be reviewed against the checklist below before publishing:
  □ Is all factual information (price, address, property details) accurate and verifiable?
  □ Does the post comply with NSW price advertising requirements under the Regulation?
  □ Has client consent been obtained where a client's image, name or property is featured?
  □ Does the post disclose any material interest or potential conflict?
  □ Is any testimonial or review clearly attributed and based on a genuine experience?
  □ Is any comparison with competitors fair, accurate and substantiated?

────────────────────────────────────────

4. ADVERTISING AND LISTING STANDARDS

${a.listingStandards}

Under the Property and Stock Agents Regulation 2022 (NSW) and the ACL:
  (a) Estimated sale prices must be based on a documented current comparative market analysis (CMA) and must not be underquoted;
  (b) Auction reserve prices and vendor bids must not be disclosed in contravention of the Act;
  (c) Rental amounts must reflect the amount in the current management agreement;
  (d) All advertising must state the name of the agent and the licence number of the agency;
  (e) "Expressions of interest" and "contact agent" pricing are permitted in certain circumstances only — the LIC will advise on a case-by-case basis.

────────────────────────────────────────

5. PROHIBITED CONTENT

The following content must not appear on any official or personal social media account in connection with the agency's business:
${a.prohibited}

In addition, the following categories of content are prohibited on all platforms regardless of context:
  (a) Discriminatory content of any kind in relation to property advertising (including references to the race, ethnicity, religion, disability, age, gender or family status of preferred purchasers or tenants) — this is unlawful under the Anti-Discrimination Act 1977 (NSW);
  (b) Photographs of clients, properties or internal documents without express written consent;
  (c) Content that makes unsubstantiated comparative claims about competitor agents;
  (d) Posts that reproduce property portal data, photos or descriptions in breach of the relevant platform's intellectual property terms;
  (e) Any content that creates, or is likely to create, a false or misleading impression about the agency, its staff, or any property.

────────────────────────────────────────

6. PERSONAL SOCIAL MEDIA USE

${a.personalUse}

In particular, staff using personal accounts:
  (a) Must clearly identify any real estate-related opinion as personal and not as a statement of the agency;
  (b) Must not post client names, contact details, property addresses, sale prices or any confidential information;
  (c) Must not make comments that could be perceived as disparaging clients, competing agents, or the agency itself;
  (d) Should be aware that publicly visible comments made in a personal capacity that are derogatory, discriminatory or misleading may still expose the agency to reputational or regulatory risk, and may be grounds for disciplinary action.

────────────────────────────────────────

7. RECORDS RETENTION

${a.retention}

Records of published advertising content — including property listings, price representations and testimonials — are retained to demonstrate compliance with price advertising requirements and the ACL in the event of a complaint or investigation.

────────────────────────────────────────

8. BREACH OF POLICY

${a.breach}

A breach of this Policy may also constitute a breach of:
  (a) The ACL (potential pecuniary penalties of up to $50 million for corporations under s224 of the ACL);
  (b) The Property and Stock Agents Act 2002 (NSW) — grounds for disciplinary action by NSW Fair Trading;
  (c) The agency's professional indemnity insurance policy terms.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.principal}
Principal Licensee
${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
  {
    name: "Record Keeping Policy", category: "Compliance",
    description: "Establishes statutory minimum standards for the creation, storage, retention and disposal of agency records.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "abn", label: "Agency ABN", placeholder: "e.g. 12 345 678 901" },
      { id: "responsible", label: "Person responsible for records management", placeholder: "e.g. Sarah Mitchell — Principal Licensee" },
      { id: "systems", label: "Systems and software used for record storage", placeholder: "e.g. PropertyMe (trust accounting and property management), REX CRM (sales and client records), SharePoint (internal documents), locked fire-rated filing cabinets for originals" },
      { id: "access", label: "Who has access to different categories of records?", placeholder: "e.g. trust records — LIC only; client files — relevant agent plus LIC; AML/CTF records — LIC and Compliance Officer only; HR records — LIC only", multiline: true },
      { id: "backup", label: "Data backup frequency and method", placeholder: "e.g. automated daily backup via cloud provider; weekly verified restore test conducted monthly; offsite backup maintained" },
      { id: "physicalSecurity", label: "Physical security for paper records", placeholder: "e.g. locked filing cabinets in secure office; access restricted to authorised staff; visitor access to office is escorted at all times" },
      { id: "disposal", label: "Approved disposal methods for records at end of retention period", placeholder: "e.g. physical documents — commercial cross-cut shredding by certified secure destruction provider; digital records — verified deletion with confirmation log; disposal recorded in the records register" },
      { id: "review", label: "How often is this policy reviewed?", placeholder: "e.g. Annually in July, or following any legislative change or data breach" },
    ],
    generate: (a) => {
      const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      return `RECORD KEEPING POLICY
${a.agency} (ABN ${a.abn})

EFFECTIVE DATE: ${date}
RECORDS MANAGER: ${a.responsible}
NEXT REVIEW DATE: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}

────────────────────────────────────────

1. LEGISLATIVE FRAMEWORK

This Policy establishes minimum standards for the creation, maintenance, storage, retention and disposal of records at ${a.agency}, in compliance with:
  • Property and Stock Agents Act 2002 (NSW), s88 — trust account records
  • Property and Stock Agents Regulation 2022 (NSW), Part 5, cl 38 — records of transactions
  • Privacy Act 1988 (Cth) — APP 11 (security of personal information), APP 6 (use and disclosure)
  • Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (Cth), ss 105–116 — AML/CTF records
  • Income Tax Assessment Act 1997 (Cth) — financial record keeping (5-year minimum)
  • Limitation Act 1969 (NSW) — civil claims (general 6-year limitation period)

Where legislation prescribes a specific minimum retention period, that period overrides any shorter period in this Policy.

────────────────────────────────────────

2. PURPOSE AND SCOPE

This Policy applies to all records created, received or managed by ${a.agency} in the course of its business, whether in physical (paper) or digital (electronic) format. It applies to all staff and contractors who create, access or manage agency records.

────────────────────────────────────────

3. RESPONSIBILITY

${a.responsible} is responsible for:
  (a) Implementing and overseeing this Policy;
  (b) Ensuring all staff understand and comply with their record keeping obligations;
  (c) Maintaining the records register and disposal log;
  (d) Reviewing the Policy annually and following any legislative change;
  (e) Making records available to NSW Fair Trading, AUSTRAC, the ATO and other regulators on request.

────────────────────────────────────────

4. SYSTEMS AND STORAGE

${a.systems}

Digital records must be:
  (a) Stored in an authorised system with appropriate access controls;
  (b) Protected from unauthorised access, alteration or deletion;
  (c) Backed up according to clause 5 below;
  (d) Capable of being reproduced in legible, printable form on request.

Physical records must be maintained as set out in clause 6 below.

────────────────────────────────────────

5. DATA BACKUP

${a.backup}

In the event of data loss or system failure, the agency's disaster recovery procedure is activated immediately. The responsible person will notify the system provider and initiate recovery from the most recent verified backup. Any data loss affecting client records will also be assessed under the Notifiable Data Breaches Scheme (Privacy Act 1988 (Cth)).

────────────────────────────────────────

6. PHYSICAL SECURITY

${a.physicalSecurity}

When staff leave the agency (including after-hours), all physical client files and trust accounting records must be secured in locked cabinets or drawers. Client files must not be left on desks, in common areas or in vehicles overnight.

────────────────────────────────────────

7. ACCESS CONTROLS

${a.access}

Access to records is reviewed whenever a staff member changes role or leaves the agency. Former staff are removed from all systems promptly upon cessation of employment or engagement. The responsible person maintains a current access register.

────────────────────────────────────────

8. STATUTORY RETENTION PERIODS

The following minimum retention periods apply:

TRUST ACCOUNTING RECORDS
  • Trust account receipts, payments, ledgers, reconciliations, auditor reports: 3 years from date of transaction (Property and Stock Agents Act, s88) — agency practice: 7 years

AGENCY AGREEMENTS AND TRANSACTION RECORDS
  • Exclusive agency agreements, sales contracts, auction records, bidder registers: 3 years from date of document (Regulation, cl 38) — agency practice: 7 years
  • Property management agreements and rent rolls: 3 years from termination of agreement — agency practice: 7 years

AML/CTF RECORDS
  • Customer identification documents, transaction records, SMRs, TTRs, risk assessments, training records: 7 years from date of transaction or document (AML/CTF Act, ss 105–116)

PRIVACY / PERSONAL INFORMATION
  • Rental applications not proceeding: 1 year from decision date (then destroy)
  • Tenant files: 7 years from end of tenancy
  • Vendor and purchaser files: 7 years from settlement or completion

STAFF AND HR RECORDS
  • Employment records, contracts, performance records, incident reports: 7 years from end of employment
  • Workers compensation records: 7 years

FINANCIAL AND TAX RECORDS
  • General financial records, invoices, receipts, bank statements: 5 years from date of document (Income Tax Assessment Act)

Where a record is subject to an active complaint, dispute, litigation or regulatory investigation, the relevant records must be retained for the duration of that matter plus 7 years, regardless of the standard period.

────────────────────────────────────────

9. DISPOSAL OF RECORDS

Records that have reached the end of their retention period must be disposed of securely. Approved disposal methods:
${a.disposal}

A disposal must only be authorised by ${a.responsible}. Each disposal is recorded in the agency's records disposal log, including:
  (a) Description and category of records disposed;
  (b) Date range of records;
  (c) Date of disposal;
  (d) Method of disposal;
  (e) Name of authorising officer;
  (f) Name of disposal service provider (where applicable).

Records that are the subject of a current or anticipated complaint, investigation, or legal proceedings must NOT be disposed of, regardless of retention period, until the matter is fully resolved.

────────────────────────────────────────

10. REGULATOR ACCESS

All records held by ${a.agency} must be made available to authorised NSW Fair Trading inspectors, AUSTRAC, the ATO, the OAIC or other regulators on request, in accordance with the relevant legislative powers. Requests for record access from any regulator must be directed immediately to ${a.responsible}.

────────────────────────────────────────

11. REVIEW

This Policy is reviewed ${a.review}. ${a.responsible} is responsible for ensuring the Policy reflects any changes in legislation, agency systems, or record types managed by the agency.

────────────────────────────────────────

SIGN-OFF

_________________________
${a.responsible}
Records Manager
${a.agency} (ABN ${a.abn})

Date: ${date}`;
    },
  },
];

function PolicyTemplatesPage({ onPolicySaved, savedNames }: { onPolicySaved: (p: PolicyRow) => void; savedNames: string[] }) {
  const [view, setView] = useState<"list" | "questionnaire" | "review" | "saved">("list");
  const [selectedTemplate, setSelectedTemplate] = useState<PTConfig | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const inputStyPT: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "10px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box", resize: "vertical" };

  function startTemplate(t: PTConfig) {
    setSelectedTemplate(t);
    setAnswers({});
    setStep(0);
    setView("questionnaire");
  }

  function goBack() {
    if (view === "questionnaire" && step > 0) { setStep(s => s - 1); return; }
    setView("list"); setSelectedTemplate(null); setStep(0); setAnswers({});
  }

  function nextStep() {
    if (!selectedTemplate) return;
    if (step < selectedTemplate.questions.length - 1) { setStep(s => s + 1); }
    else { setView("review"); }
  }

  async function savePolicy() {
    if (!selectedTemplate) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSaving(false); return; }
    const today = new Date();
    const fmtDate = (d: Date) => d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
    const nextYear = new Date(today); nextYear.setFullYear(nextYear.getFullYear() + 1);
    const content = selectedTemplate.generate(answers);
    const { data, error } = await supabase.from("policies").insert({
      user_id: user.user.id,
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      status: "current",
      last_reviewed: fmtDate(today),
      next_review: fmtDate(nextYear),
      content,
      source: "template",
    }).select().single();
    setSaving(false);
    if (!error && data) {
      onPolicySaved({ id: data.id, name: data.name, category: data.category, status: data.status, last_reviewed: data.last_reviewed, next_review: data.next_review, content: data.content, source: data.source });
    }
    setView("saved");
  }

  // LIST VIEW
  if (view === "list") {
    return (
      <div style={PAGE_WRAP}>
        <div style={PAGE_HEADER}>
          <div>
            <h1 style={PAGE_H1}>Policy Templates</h1>
            <p style={PAGE_SUB}>Select a template to generate a customised policy for your agency</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", alignContent: "start" }}>
          {policyTemplateConfigs.map(t => {
            const cat = catColors[t.category] ?? catColors.Admin;
            const isSaved = savedNames.includes(t.name);
            return (
              <div key={t.name} style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", padding: "20px 22px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: cat.color, background: cat.bg, padding: "2px 9px", borderRadius: "100px", display: "inline-block", marginBottom: "8px" }}>{t.category}</span>
                    <p style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--rc-ink)", lineHeight: 1.4, maxWidth: "none", margin: "0 0 4px" }}>{t.name}</p>
                    <p style={{ fontSize: "12px", color: "var(--rc-faint)", maxWidth: "none", margin: 0, lineHeight: 1.4 }}>{t.description}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {isSaved
                    ? <span style={{ fontSize: "12px", fontWeight: 600, color: "oklch(0.42 0.12 145)", display: "flex", alignItems: "center", gap: "5px" }}><GreenDot /> Saved to library</span>
                    : <span style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>{t.questions.length} questions</span>
                  }
                  <button
                    onClick={() => startTemplate(t)}
                    style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--rc-primary)", background: "var(--rc-primary-light)", border: "none", padding: "6px 14px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
                  >
                    {isSaved ? "Recreate" : "Create →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // QUESTIONNAIRE VIEW
  if (view === "questionnaire" && selectedTemplate) {
    const q = selectedTemplate.questions[step];
    const total = selectedTemplate.questions.length;
    const pct = Math.round((step / total) * 100);
    const currentAnswer = answers[q.id] ?? "";
    return (
      <div style={PAGE_WRAP}>
        <div style={PAGE_HEADER}>
          <div>
            <button onClick={goBack} style={{ fontSize: "12px", color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>← Back</button>
            <h1 style={PAGE_H1}>{selectedTemplate.name}</h1>
            <p style={PAGE_SUB}>Question {step + 1} of {total}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ width: "120px", height: "4px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--rc-primary)", borderRadius: "100px", transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>{step}/{total}</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "560px" }}>
          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "14px", padding: "32px 36px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Question {step + 1}</p>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--rc-ink)", lineHeight: 1.4, margin: 0, maxWidth: "none" }}>{q.label}</p>
            </div>
            {q.multiline
              ? <textarea
                  autoFocus
                  rows={4}
                  value={currentAnswer}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && currentAnswer.trim()) nextStep(); }}
                  placeholder={q.placeholder}
                  style={{ ...inputStyPT }}
                />
              : <input
                  autoFocus
                  value={currentAnswer}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter" && currentAnswer.trim()) nextStep(); }}
                  placeholder={q.placeholder}
                  style={{ ...inputStyPT, resize: undefined }}
                />
            }
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: "" })); nextStep(); }}
                style={{ fontSize: "12px", color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)" }}
              >
                Skip
              </button>
              <button
                onClick={nextStep}
                style={{ fontSize: "13px", fontWeight: 600, color: "white", background: currentAnswer.trim() ? "var(--rc-primary)" : "var(--rc-border)", border: "none", borderRadius: "8px", padding: "10px 22px", cursor: currentAnswer.trim() ? "pointer" : "default", fontFamily: "var(--font-inter)", transition: "background 0.15s ease" }}
              >
                {step < total - 1 ? "Next →" : "Review policy →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW VIEW
  if (view === "review" && selectedTemplate) {
    const policyText = selectedTemplate.generate(answers);
    return (
      <div style={PAGE_WRAP}>
        <div style={PAGE_HEADER}>
          <div>
            <button onClick={() => { setStep(selectedTemplate.questions.length - 1); setView("questionnaire"); }} style={{ fontSize: "12px", color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>← Edit answers</button>
            <h1 style={PAGE_H1}>Review Policy</h1>
            <p style={PAGE_SUB}>{selectedTemplate.name} · Generated {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={() => { setStep(0); setView("questionnaire"); }}
              style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              Edit answers
            </button>
            <button
              onClick={savePolicy}
              disabled={saving}
              style={{ fontSize: "13px", fontWeight: 600, color: "white", background: saving ? "var(--rc-faint)" : "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: saving ? "default" : "pointer", fontFamily: "var(--font-inter)" }}
            >
              {saving ? "Saving…" : "Save to library"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid var(--rc-border)", borderRadius: "12px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ padding: "36px 44px", maxWidth: "760px" }}>
            <pre style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "var(--rc-ink)", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0, maxWidth: "none" }}>
              {policyText}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // SAVED VIEW
  if (view === "saved") {
    return (
      <div style={PAGE_WRAP}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "oklch(0.96 0.025 145)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="10" fill="oklch(0.60 0.16 145)" /><path d="M8 13l3.5 3.5L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--rc-ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Policy saved to library</p>
            <p style={{ fontSize: "13px", color: "var(--rc-faint)", margin: 0, maxWidth: "none" }}>{selectedTemplate?.name} has been added to your Policies & Procedures.</p>
          </div>
          <button
            onClick={() => { setView("list"); setSelectedTemplate(null); setStep(0); setAnswers({}); }}
            style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-primary)", background: "var(--rc-primary-light)", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontFamily: "var(--font-inter)", marginTop: "8px" }}
          >
            Back to templates
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ReviewSchedulePage({ policies, onPolicyUpdated, onPolicyDeleted }: { policies: PolicyRow[]; onPolicyUpdated: (p: PolicyRow) => void; onPolicyDeleted: (id: string) => void }) {
  const [viewPolicy, setViewPolicy] = useState<PolicyRow | null>(null);
  const upcoming = policies.filter(p => p.status === "review-due");
  const current  = policies.filter(p => p.status === "current");

  async function markReviewed(p: PolicyRow) {
    const today = new Date();
    const fmtDate = (d: Date) => d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
    const nextYear = new Date(today); nextYear.setFullYear(nextYear.getFullYear() + 1);
    const { data, error } = await supabase.from("policies").update({
      status: "current", last_reviewed: fmtDate(today), next_review: fmtDate(nextYear),
    }).eq("id", p.id).select().single();
    if (!error && data) {
      const updated = { ...p, status: "current" as const, last_reviewed: data.last_reviewed, next_review: data.next_review };
      onPolicyUpdated(updated);
      if (viewPolicy?.id === p.id) setViewPolicy(updated);
    }
  }

  async function deletePolicy(p: PolicyRow) {
    const { error } = await supabase.from("policies").delete().eq("id", p.id);
    if (!error) { onPolicyDeleted(p.id); setViewPolicy(null); }
  }

  if (viewPolicy) {
    return <PolicyDetailView policy={viewPolicy} onBack={() => setViewPolicy(null)} onMarkReviewed={viewPolicy.status === "review-due" ? markReviewed : undefined} onDelete={deletePolicy} />;
  }

  const rowStyle = (bg: string): React.CSSProperties => ({ display: "grid", gridTemplateColumns: "1fr 130px 130px 150px", alignItems: "center", padding: "0 20px", background: bg, cursor: "pointer", transition: "filter 0.1s ease" });

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Review Schedule</h1>
          <p style={PAGE_SUB}>{upcoming.length} policies due for review · {current.length} up to date</p>
        </div>
      </div>
      {policies.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No policies yet. Add some via Policy Templates or Upload Document.</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: "16px", overflowY: "auto" }}>
          {upcoming.length > 0 && (
            <div>
              <p style={{ fontSize: "11.5px", fontWeight: 600, color: "oklch(0.46 0.12 55)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Due for review</p>
              <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
                {upcoming.map((p, i) => (
                  <div key={p.id} style={{ ...rowStyle("oklch(0.985 0.012 55)"), borderBottom: i < upcoming.length - 1 ? "1px solid var(--rc-border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.filter = "brightness(0.97)")} onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                    <button onClick={() => setViewPolicy(p)} style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-primary)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", textAlign: "left", padding: "14px 0" }}>
                      {p.name}
                    </button>
                    <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Last: {p.last_reviewed ?? "—"}</span>
                    <span style={{ fontSize: "12.5px", color: "oklch(0.46 0.12 55)", fontWeight: 500 }}>Due: {p.next_review ?? "—"}</span>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                      <button onClick={e => { e.stopPropagation(); markReviewed(p); }} style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "color 0.1s ease" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--rc-ink)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>
                        Mark reviewed →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {current.length > 0 && (
            <div>
              <p style={{ fontSize: "11.5px", fontWeight: 600, color: "oklch(0.42 0.12 145)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Up to date</p>
              <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
                {current.map((p, i) => (
                  <div key={p.id} style={{ ...rowStyle("var(--rc-bg)"), borderBottom: i < current.length - 1 ? "1px solid var(--rc-border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.filter = "brightness(0.97)")} onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                    <button onClick={() => setViewPolicy(p)} style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-primary)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", textAlign: "left", padding: "14px 0" }}>
                      {p.name}
                    </button>
                    <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Last: {p.last_reviewed ?? "—"}</span>
                    <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Due: {p.next_review ?? "—"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                      <GreenDot />
                      <span style={{ fontSize: "12px", color: "oklch(0.42 0.12 145)" }}>Current</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UploadDocumentPage({ onPolicySaved }: { onPolicySaved: (p: PolicyRow) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sales");
  const [effective, setEffective] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const files: UploadedFile[] = rawFiles.map(f => ({ name: f.name, size: fmtBytes(f.size), addedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) }));

  function handleFiles(fl: FileList | null) {
    if (!fl) return;
    setRawFiles(prev => [...prev, ...Array.from(fl)]);
  }

  async function handleUpload() {
    if (!rawFiles.length || !name.trim()) return;
    setUploading(true);
    setUploadError(null);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setUploading(false); setUploadError("Not signed in."); return; }
    const today = new Date();
    const fmtDate = (d: Date) => d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
    const nextYear = new Date(today); nextYear.setFullYear(nextYear.getFullYear() + 1);
    // Upload first file to storage
    const file = rawFiles[0];
    const storagePath = `${user.user.id}/${Date.now()}_${file.name}`;
    const { error: storageErr } = await supabase.storage.from("policy-docs").upload(storagePath, file, { upsert: false });
    if (storageErr && storageErr.message !== "The resource already exists") {
      setUploading(false); setUploadError(storageErr.message); return;
    }
    const { data, error } = await supabase.from("policies").insert({
      user_id: user.user.id,
      name: name.trim(),
      category,
      status: "current",
      last_reviewed: effective ? new Date(effective).toLocaleDateString("en-AU", { month: "short", year: "numeric" }) : fmtDate(today),
      next_review: fmtDate(nextYear),
      content: null,
      source: "upload",
    }).select().single();
    setUploading(false);
    if (error) { setUploadError(error.message); return; }
    if (data) onPolicySaved({ id: data.id, name: data.name, category: data.category, status: data.status, last_reviewed: data.last_reviewed, next_review: data.next_review, content: null, source: "upload" });
    setUploaded(true);
    setRawFiles([]); setName(""); setEffective("");
    setTimeout(() => setUploaded(false), 3000);
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--rc-border)", fontSize: "13.5px", color: "var(--rc-ink)", background: "var(--rc-bg)", fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box" };

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Upload Document</h1>
          <p style={PAGE_SUB}>Add a new policy or procedure to the library</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignContent: "start" }}>
        {/* Upload zone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `1.5px dashed ${dragOver ? "var(--rc-primary)" : "var(--rc-border)"}`, borderRadius: "12px", padding: "40px 24px", textAlign: "center", cursor: "pointer", background: dragOver ? "var(--rc-primary-light)" : "var(--rc-surface)", transition: "all 0.15s ease" }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 12px", display: "block", color: dragOver ? "var(--rc-primary)" : "var(--rc-faint)" }}>
              <path d="M16 22V10M10 16l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 24v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, color: dragOver ? "var(--rc-primary)" : "var(--rc-muted)", maxWidth: "none", margin: "0 0 4px" }}>
              Drop files here or <span style={{ color: "var(--rc-primary)", fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ fontSize: "12px", color: "var(--rc-faint)", maxWidth: "none", margin: 0 }}>PDF, Word, or image · up to 20 MB</p>
          </div>
          <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />

          {files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: "1px solid var(--rc-border)", borderRadius: "9px", background: "var(--rc-bg)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "var(--rc-primary)" }}>
                    <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "none" }}>{f.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--rc-faint)", margin: 0, maxWidth: "none" }}>{f.size}</p>
                  </div>
                  <button onClick={() => setRawFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", padding: "2px" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metadata form */}
        <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", padding: "24px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", gap: "18px", alignSelf: "start" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-ink)", margin: 0 }}>Document details</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Policy name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Privacy & Data Policy v2" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
              {["Sales", "Management", "Compliance", "Trust", "Staff", "Admin"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Effective date</label>
            <input type="date" value={effective} onChange={e => setEffective(e.target.value)} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
          </div>
          {uploadError && (
            <p style={{ fontSize: "12px", color: "oklch(0.50 0.20 25)", margin: 0, maxWidth: "none", background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.06 25)", borderRadius: "8px", padding: "8px 12px" }}>
              {uploadError}
            </p>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading || !rawFiles.length || !name.trim()}
            style={{ padding: "11px 20px", borderRadius: "8px", background: uploaded ? "oklch(0.55 0.16 145)" : (uploading || !rawFiles.length || !name.trim()) ? "var(--rc-border)" : "var(--rc-primary)", color: "white", border: "none", fontSize: "14px", fontWeight: 600, cursor: (uploading || !rawFiles.length || !name.trim()) ? "default" : "pointer", fontFamily: "var(--font-inter)", transition: "background 0.2s ease" }}
          >
            {uploaded ? "Uploaded ✓" : uploading ? "Uploading…" : "Upload to library"}
          </button>
        </div>
      </div>
    </div>
  );
}



const docCategoryColor: Record<string, { bg: string; color: string }> = {
  Contract: { bg: "var(--rc-primary-light)", color: "var(--rc-primary)" },
  Licence: { bg: "oklch(0.93 0.04 195)", color: "oklch(0.38 0.10 195)" },
  Compliance: { bg: "oklch(0.94 0.04 145)", color: "oklch(0.38 0.13 145)" },
  CPD: { bg: "oklch(0.95 0.03 55)", color: "oklch(0.42 0.12 55)" },
  WHS: { bg: "oklch(0.94 0.04 25)", color: "oklch(0.42 0.14 25)" },
  Training: { bg: "oklch(0.93 0.04 195)", color: "oklch(0.38 0.10 195)" },
  Induction: { bg: "var(--rc-surface-2)", color: "var(--rc-muted)" },
  Onboarding: { bg: "var(--rc-surface-2)", color: "var(--rc-muted)" },
};

function _renderDocContent_unused(doc: { title: string; category: string; date: string }, s: StaffRow, agencyName = "Your Agency"): React.ReactNode {
  const licNum = s.licence_number;
  const startDate = s.start_date;
  const h2: React.CSSProperties = { fontSize: "11px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "20px 0 6px" };
  const p: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", lineHeight: 1.7, margin: "0 0 8px", maxWidth: "68ch" };
  const sig: React.CSSProperties = { display: "flex", flexDirection: "column" as const, gap: "4px", marginTop: "6px" };
  const sigLine: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", borderBottom: "1px solid var(--rc-border)", paddingBottom: "18px", marginBottom: "6px", maxWidth: "260px" };
  const sigLabel: React.CSSProperties = { fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none" };

  if (doc.category === "Contract") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Employment Agreement</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      <div style={{ display: "flex", gap: "40px", marginBottom: "24px" }}>
        {[["Employee", s.name], ["Position", s.role], ["Commencement", startDate]].map(([l, v]) => (
          <div key={l}><p style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px", maxWidth: "none" }}>{l}</p><p style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p></div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--rc-border)", paddingTop: "20px" }}>
        <p style={h2}>1. Position</p>
        <p style={p}>{agencyName} ("the Employer") engages {s.name} ("the Employee") as {s.role}. The Employee will report to the Principal and perform all duties consistent with this role in accordance with the agency's standards and NSW Fair Trading requirements.</p>
        <p style={h2}>2. Hours of Work</p>
        <p style={p}>Standard working hours are 38 hours per week, Monday to Friday. The Employee may be required to work reasonable additional hours to meet client and agency obligations. Overtime arrangements are in accordance with the Real Estate Industry Award.</p>
        <p style={h2}>3. Remuneration</p>
        <p style={p}>Remuneration will be paid fortnightly and is set out in Schedule A attached to this Agreement. Annual reviews will be conducted each July. Any commission arrangements will be documented separately in the Commission Schedule.</p>
        <p style={h2}>4. Probationary Period</p>
        <p style={p}>The first three (3) months of employment constitute a probationary period. Either party may terminate during this period with one (1) week's written notice. Upon satisfactory completion, the Employee's appointment becomes ongoing.</p>
        <p style={h2}>5. Confidentiality</p>
        <p style={p}>The Employee agrees to maintain strict confidentiality of all client information, property data, vendor details, and agency business information during and after the term of employment. Breach of this obligation may result in disciplinary action or termination.</p>
        <p style={h2}>6. Licence Requirement</p>
        <p style={p}>{s.licence === "exempt" ? "This role does not require a real estate licence. The Employee must not perform licenced functions without appropriate supervision." : `The Employee must hold a current NSW real estate licence for the duration of employment. The Employee is responsible for ensuring their licence (${licNum}) remains current and for completing CPD requirements annually.`}</p>
        <p style={h2}>7. Termination</p>
        <p style={p}>After the probationary period, either party may terminate this Agreement with four (4) weeks' written notice, or payment in lieu. The Employer may terminate immediately for serious misconduct in accordance with applicable legislation.</p>
        <p style={{ ...h2, marginTop: "28px" }}>Signatures</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "12px" }}>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name} (Employee)</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>Sarah Mitchell, Principal</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
        </div>
      </div>
    </div>
  );

  if (doc.category === "Licence") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>NSW Fair Trading · Department of Customer Service</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Certificate of Licence</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 28px", maxWidth: "none" }}>Property and Stock Agents Act 2002</p>
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "10px", padding: "20px 24px", background: "var(--rc-surface)", marginBottom: "24px" }}>
        <p style={{ fontSize: "13px", color: "var(--rc-faint)", margin: "0 0 12px", maxWidth: "none" }}>This is to certify that</p>
        <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 16px", maxWidth: "none" }}>{s.name}</p>
        {[["Licence Number", licNum], ["Licence Class", "Class 2 — Real Estate Agent"], ["Authorisation", "Sales, leasing, and property management in NSW"], ["Issue Date", doc.date], ["Expiry Date", s.expiry]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: "20px", marginBottom: "10px", alignItems: "flex-start" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, width: "150px", flexShrink: 0, maxWidth: "none" }}>{l}</p>
            <p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none", fontWeight: l === "Licence Number" ? 600 : 400, fontFamily: l === "Licence Number" ? "monospace" : "inherit" }}>{v}</p>
          </div>
        ))}
      </div>
      <p style={p}>The holder of this licence is authorised to carry on the business of a real estate agent in New South Wales subject to the conditions of this licence and the provisions of the Property and Stock Agents Act 2002 and Property and Stock Agents Regulation 2014.</p>
      <p style={p}>This licence must be displayed at the principal place of business and produced on request by an authorised officer of NSW Fair Trading.</p>
      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
        <div style={sig}><div style={sigLine} /><p style={sigLabel}>Commissioner for Fair Trading, NSW</p></div>
      </div>
    </div>
  );

  if (doc.category === "Compliance") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Privacy Policy Acknowledgement</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      <p style={p}>I, <strong>{s.name}</strong>, acknowledge that I have read, understood, and agree to comply with the {agencyName} Privacy Policy in all aspects of my role as {s.role}.</p>
      <p style={h2}>The policy covers</p>
      {["Collection, use and storage of personal information relating to clients, vendors, tenants and landlords", "How personal data is protected and disclosed to third parties in compliance with Australian Privacy Principles", "My obligations to keep client information confidential and use it only for authorised purposes", "Clients' rights to access and correct their personal information", "Procedures for handling privacy complaints and data breach notifications"].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "var(--rc-faint)", flexShrink: 0 }}>—</span><p style={{ ...p, margin: 0 }}>{item}</p></div>
      ))}
      <p style={{ ...p, marginTop: "16px" }}>I understand that breaches of privacy obligations may result in disciplinary action, up to and including termination of employment, and may expose the agency to regulatory penalties under the Privacy Act 1988 (Cth).</p>
      <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name}</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>Witnessed by — Principal</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
        </div>
      </div>
    </div>
  );

  if (doc.category === "WHS") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>WHS Induction Record</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Work Health & Safety Act 2011 (NSW) · Dated {doc.date}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {[["Employee", s.name], ["Role", s.role], ["Induction date", doc.date], ["Conducted by", "Sarah Mitchell, Principal"]].map(([l, v]) => (
          <div key={l}><p style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px", maxWidth: "none" }}>{l}</p><p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p></div>
        ))}
      </div>
      <p style={h2}>Topics Covered</p>
      {["Emergency procedures — exits, assembly points, and evacuation plan", "First aid kit locations and trained first-aid officers on site", "Incident and hazard reporting procedures (WHS register)", "Manual handling guidelines — safe lifting and ergonomic workstation setup", "Electrical safety and IT equipment usage", "Harassment and bullying — agency zero-tolerance policy", "Risk assessment obligations when attending properties", "Personal safety protocols for property inspections (lone-worker policy)"].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "oklch(0.60 0.16 145)", flexShrink: 0 }}>✓</span><p style={{ ...p, margin: 0 }}>{item}</p></div>
      ))}
      <p style={{ ...p, marginTop: "16px" }}>The employee confirms they have received and understood the WHS induction and know how to report hazards, incidents, and near-misses.</p>
      <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name} (Employee)</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>WHS Officer / Principal</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
        </div>
      </div>
    </div>
  );

  if (doc.category === "CPD" || doc.title.includes("CPD")) return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Real Estate Institute of NSW (REINSW)</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>CPD {doc.title.includes("Registration") ? "Registration" : "Completion Certificate"}</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 28px", maxWidth: "none" }}>Continuing Professional Development · {doc.date}</p>
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "10px", padding: "20px 24px", background: "var(--rc-surface)", marginBottom: "24px" }}>
        {[["Licensee", s.name], ["Licence No.", licNum], ["CPD Period", doc.title.includes("2025") ? "Sep 2024 – Aug 2025" : "Sep 2023 – Aug 2024"], ["Hours Required", "12"], ["Hours Completed", doc.title.includes("Registration") ? "0 (cycle commenced)" : "12"], ["Status", doc.title.includes("Registration") ? "Enrolled" : "Complete"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, width: "140px", flexShrink: 0, maxWidth: "none" }}>{l}</p>
            <p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none", fontWeight: l === "Status" ? 600 : 400 }}>{v}</p>
          </div>
        ))}
      </div>
      {!doc.title.includes("Registration") && <>
        <p style={h2}>Completed Units</p>
        {["Underquoting compliance and price representation (3 hrs)", "Trust accounting — disbursements and audit requirements (3 hrs)", "Strata title and community schemes update (2 hrs)", "Anti-money laundering obligations for real estate agents (2 hrs)", "WHS obligations in property inspections (1 hr)", "Ethics and professional conduct in real estate (1 hr)"].map((unit, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "oklch(0.60 0.16 145)", flexShrink: 0 }}>✓</span><p style={{ ...p, margin: 0 }}>{unit}</p></div>
        ))}
      </>}
      <p style={{ ...p, marginTop: "16px" }}>This {doc.title.includes("Registration") ? "registration confirms enrolment in" : "certificate confirms successful completion of"} the CPD requirements under the Property and Stock Agents Act 2002 and Property and Stock Agents Regulation 2014.</p>
    </div>
  );

  if (doc.category === "Training") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Trust Accounting Training Record</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      {[["Employee", s.name], ["Role", s.role], ["Training date", doc.date], ["Provider", "REINSW — Trust Accounting Module"], ["Duration", "4 hours"], ["Certificate ref", `TA-2026-${s.name.replace(/ /g, "").slice(0, 4).toUpperCase()}`]].map(([l, v]) => (
        <div key={l} style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, width: "140px", flexShrink: 0, maxWidth: "none" }}>{l}</p>
          <p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p>
        </div>
      ))}
      <p style={h2}>Training Content</p>
      {["Obligations under the Property and Stock Agents Act 2002 regarding trust money", "Opening, maintaining, and auditing trust accounts", "Receiving and receipting trust money — correct procedures", "Disbursement of trust funds and required authorisations", "Record-keeping requirements and audit trail documentation", "Consequences of misappropriation or improper use of trust funds"].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "oklch(0.60 0.16 145)", flexShrink: 0 }}>✓</span><p style={{ ...p, margin: 0 }}>{item}</p></div>
      ))}
      <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name}</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>Training Officer, REINSW</p></div>
        </div>
      </div>
    </div>
  );

  if (doc.category === "Induction") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Office Induction Record</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      {[["Employee", s.name], ["Role", s.role], ["Date", doc.date], ["Conducted by", "Sarah Mitchell, Principal"]].map(([l, v]) => (
        <div key={l} style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, width: "140px", flexShrink: 0, maxWidth: "none" }}>{l}</p>
          <p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p>
        </div>
      ))}
      <p style={h2}>Areas Covered</p>
      {["Office layout, facilities, and amenities — kitchen, meeting rooms, parking", "Introduction to all team members and their roles", "IT systems overview — CRM, email, PropertyMe, DocuSign, RealComply", "Phone system, voicemail, and communication protocols", "Agency procedures for listings, appraisals, and open homes", "Filing systems and document management — physical and digital", "Brand standards — use of Ray White logo, templates, and signage", "Dress code and professional presentation expectations", "Client relationship management and referral protocols"].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "oklch(0.60 0.16 145)", flexShrink: 0 }}>✓</span><p style={{ ...p, margin: 0 }}>{item}</p></div>
      ))}
      <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name} (Employee)</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>Sarah Mitchell, Principal</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
        </div>
      </div>
    </div>
  );

  if (doc.category === "Onboarding" && doc.title.includes("Mentor")) return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Mentor Assignment</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      {[["New staff member", s.name], ["Role", s.role], ["Mentor assigned", "James Chen"], ["Mentor role", "Senior Sales Agent"], ["Assignment date", doc.date], ["Meeting schedule", "Fortnightly (first 6 months), then monthly"]].map(([l, v]) => (
        <div key={l} style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, width: "160px", flexShrink: 0, maxWidth: "none" }}>{l}</p>
          <p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p>
        </div>
      ))}
      <p style={h2}>Mentoring Goals</p>
      {["Guide the new agent through their first listings, appraisals, and negotiations", "Review and provide feedback on client communications and proposals", "Introduce to key contacts — solicitors, brokers, photographers, trades", "Support with compliance obligations and CPD planning", "Conduct fortnightly check-ins and document progress"].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "oklch(0.60 0.16 145)", flexShrink: 0 }}>✓</span><p style={{ ...p, margin: 0 }}>{item}</p></div>
      ))}
      <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name} (Mentee)</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          <div style={sig}><div style={sigLine} /><p style={sigLabel}>James Chen (Mentor)</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
        </div>
      </div>
    </div>
  );

  // IT Access / other
  return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>{agencyName}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>{doc.title}</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      {[["Employee", s.name], ["Role", s.role], ["Date", doc.date]].map(([l, v]) => (
        <div key={l} style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, width: "140px", flexShrink: 0, maxWidth: "none" }}>{l}</p>
          <p style={{ fontSize: "13px", color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p>
        </div>
      ))}
      {doc.category === "Onboarding" && doc.title.includes("IT") && <>
        <p style={h2}>Systems Access Granted</p>
        {["Office 365 — email, calendar, Teams (sarah@raywhite.com.au)", "PropertyMe — listings, property management, trust accounting", "DocuSign — digital document signing and contracts", "RealComply — compliance management and onboarding", "MRI Software — rental management and arrears", "Canon multi-function printer — print/scan/copy access"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "oklch(0.60 0.16 145)", flexShrink: 0 }}>✓</span><p style={{ ...p, margin: 0 }}>{item}</p></div>
        ))}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div style={sig}><div style={sigLine} /><p style={sigLabel}>{s.name}</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
            <div style={sig}><div style={sigLine} /><p style={sigLabel}>IT Administrator</p><p style={{ ...sigLabel, marginTop: "2px", maxWidth: "none" }}>Date: {doc.date}</p></div>
          </div>
        </div>
      </>}
    </div>
  );
}

function StaffFilePage({ staffRow, onBack, agencyName }: { staffRow: StaffRow; onBack: () => void; agencyName: string }) {
  const s = staffRow;
  const licNum = s.licence_number;
  const initials = s.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const licOk = s.licence === "current" || s.licence === "exempt";
  const cpdOk = s.cpd === "complete" || s.cpd === "na";
  const cpdPct = s.cpd_required === 0 ? null : Math.min(100, Math.round((s.cpd_completed / s.cpd_required) * 100));
  const [selectedDocIdx, setSelectedDocIdx] = useState<number | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    setDocsLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("staff_name", s.name)
      .order("created_at", { ascending: false });
    setDocs(data ?? []);
    setDocsLoading(false);
  }, [s.name]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleSelectDoc = async (idx: number) => {
    if (selectedDocIdx === idx) { setSelectedDocIdx(null); setViewerUrl(null); return; }
    setSelectedDocIdx(idx);
    setViewerUrl(null);
    setViewerLoading(true);
    const { data } = await supabase.storage.from("documents").createSignedUrl(docs[idx].storage_path, 3600);
    setViewerUrl(data?.signedUrl ?? null);
    setViewerLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setUploadError("Only PDF files are supported."); return; }
    setUploading(true);
    setUploadError(null);
    const path = `${s.name.replace(/ /g, "_")}/${Date.now()}_${file.name}`;
    const { error: storageErr } = await supabase.storage.from("documents").upload(path, file);
    if (storageErr) { setUploadError(storageErr.message); setUploading(false); return; }
    const today = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const { error: dbErr } = await supabase.from("documents").insert({
      staff_name: s.name,
      title: file.name.replace(/\.pdf$/i, ""),
      category: "Document",
      date: today,
      storage_path: path,
    });
    if (dbErr) { setUploadError(dbErr.message); setUploading(false); return; }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchDocs();
  };

  const infoRow = (label: string, value: string) => (
    <div key={label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "var(--rc-ink)" }}>{value}</span>
    </div>
  );

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <button onClick={onBack} style={{ fontSize: "12px", color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            ← Back to Team Overview
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--rc-primary-light)", color: "var(--rc-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h1 style={PAGE_H1}>{s.name}</h1>
              <p style={PAGE_SUB}>{s.role}{s.start_date ? ` · Started ${s.start_date}` : ""}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: 600, padding: "4px 12px", borderRadius: "100px", background: licOk ? "oklch(0.94 0.04 145)" : "oklch(0.94 0.06 25)", color: licOk ? "oklch(0.38 0.13 145)" : "oklch(0.42 0.18 25)" }}>
            {s.licence === "exempt" ? "Exempt" : licOk ? "Licensed" : "Renewal due"}
          </span>
          {s.cpd !== "na" && (
            <span style={{ fontSize: "11.5px", fontWeight: 600, padding: "4px 12px", borderRadius: "100px", background: cpdOk ? "oklch(0.94 0.04 145)" : s.cpd === "due-soon" ? "oklch(0.95 0.04 55)" : "oklch(0.94 0.06 25)", color: cpdOk ? "oklch(0.38 0.13 145)" : s.cpd === "due-soon" ? "oklch(0.42 0.12 55)" : "oklch(0.42 0.18 25)" }}>
              {s.cpd === "complete" ? "CPD complete" : s.cpd === "due-soon" ? "CPD due soon" : "CPD overdue"}
            </span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "18px", minHeight: 0 }}>
        {/* Left column: details cards */}
        <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" }}>
          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", padding: "18px 20px", background: "var(--rc-surface)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--rc-ink)", margin: 0, letterSpacing: "-0.01em" }}>Contact</p>
            {infoRow("Email", s.email)}
            {infoRow("Phone", s.phone)}
            {infoRow("Start date", s.start_date)}
          </div>
          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", padding: "18px 20px", background: "var(--rc-surface)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--rc-ink)", margin: 0, letterSpacing: "-0.01em" }}>Licence</p>
            {infoRow("Licence no.", licNum)}
            {infoRow("Class", s.licence === "exempt" ? "Exempt" : "Class 2")}
            {infoRow("Expiry", s.expiry)}
            {infoRow("Status", s.licence === "current" ? "Current" : s.licence === "exempt" ? "Exempt" : "Renewal due")}
          </div>
          {s.cpd !== "na" && (
            <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", padding: "18px 20px", background: "var(--rc-surface)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--rc-ink)", margin: 0, letterSpacing: "-0.01em" }}>CPD — {new Date().getFullYear()} Cycle</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--rc-faint)" }}>Hours</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-ink)" }}>{s.cpd_completed}/{s.cpd_required}</span>
                </div>
                <div style={{ height: "4px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${cpdPct}%`, height: "100%", background: cpdPct === 100 ? "oklch(0.60 0.16 145)" : cpdPct! >= 60 ? "oklch(0.60 0.14 55)" : "var(--rc-primary)", borderRadius: "100px" }} />
                </div>
              </div>
              {infoRow("Deadline", s.cpd_deadline)}
            </div>
          )}
        </div>

        {/* Right column: documents + viewer */}
        <div style={{ flex: 1, display: "flex", gap: "14px", minHeight: 0 }}>
          {/* Doc list */}
          <div style={{ width: selectedDocIdx !== null ? "240px" : "100%", flexShrink: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)", transition: "width 0.2s ease" }}>
            <div style={{ padding: "14px 20px", background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--rc-ink)" }}>Documents</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>{docs.length} file{docs.length !== 1 ? "s" : ""}</span>
                <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-primary)", background: "var(--rc-primary-light)", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: uploading ? "not-allowed" : "pointer", fontFamily: "var(--font-inter)", opacity: uploading ? 0.6 : 1 }}
                >
                  {uploading ? "Uploading…" : "+ Upload PDF"}
                </button>
              </div>
            </div>
            {uploadError && (
              <div style={{ padding: "8px 16px", background: "oklch(0.94 0.06 25)", borderBottom: "1px solid var(--rc-border)" }}>
                <p style={{ fontSize: "11.5px", color: "oklch(0.42 0.18 25)", margin: 0, maxWidth: "none" }}>{uploadError}</p>
              </div>
            )}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {docsLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                  <p style={{ fontSize: "13px", color: "var(--rc-faint)", textAlign: "center", maxWidth: "none" }}>Loading…</p>
                </div>
              ) : docs.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", gap: "10px" }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="2" width="20" height="28" rx="3" stroke="var(--rc-border)" strokeWidth="1.5"/><path d="M10 10h12M10 16h12M10 22h8" stroke="var(--rc-border)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <p style={{ fontSize: "13px", color: "var(--rc-faint)", textAlign: "center", maxWidth: "none", margin: 0 }}>No documents on file</p>
                  <p style={{ fontSize: "11.5px", color: "var(--rc-faint)", textAlign: "center", maxWidth: "none", margin: 0 }}>Upload a PDF to get started</p>
                </div>
              ) : docs.map((doc, i) => {
                const cat = docCategoryColor[doc.category] ?? { bg: "var(--rc-surface-2)", color: "var(--rc-muted)" };
                const isSelected = selectedDocIdx === i;
                return (
                  <div key={doc.id} onClick={() => handleSelectDoc(i)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderBottom: i < docs.length - 1 ? "1px solid var(--rc-border)" : "none", background: isSelected ? "var(--rc-primary-light)" : "var(--rc-bg)", cursor: "pointer", transition: "background 0.15s ease" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--rc-surface-2)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "var(--rc-bg)"; }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: isSelected ? "white" : cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="1.5" stroke={cat.color} strokeWidth="1.3" /><path d="M5 5h6M5 8h6M5 11h4" stroke={cat.color} strokeWidth="1.1" strokeLinecap="round" /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12.5px", fontWeight: isSelected ? 600 : 500, color: isSelected ? "var(--rc-primary)" : "var(--rc-ink)", margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "none" }}>{doc.title}</p>
                      <p style={{ fontSize: "10.5px", color: "var(--rc-faint)", margin: 0, maxWidth: "none" }}>{doc.date}</p>
                    </div>
                    {selectedDocIdx === null && <span style={{ fontSize: "10px", fontWeight: 600, color: cat.color, background: cat.bg, padding: "2px 7px", borderRadius: "100px", flexShrink: 0 }}>{doc.category}</span>}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: isSelected ? 1 : 0.4 }}><path d="M4 2l4 4-4 4" stroke={isSelected ? "var(--rc-primary)" : "var(--rc-faint)"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PDF viewer */}
          {selectedDocIdx !== null && (
            <div style={{ flex: 1, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)", minWidth: 0 }}>
              <div style={{ padding: "13px 20px", background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)", flexShrink: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                {(() => { const cat = docCategoryColor[docs[selectedDocIdx].category] ?? { bg: "var(--rc-surface-2)", color: "var(--rc-muted)" }; return <span style={{ fontSize: "10px", fontWeight: 700, color: cat.color, background: cat.bg, padding: "3px 9px", borderRadius: "100px" }}>{docs[selectedDocIdx].category}</span>; })()}
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--rc-ink)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{docs[selectedDocIdx].title}</span>
                {viewerUrl && (
                  <a href={viewerUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-primary)", textDecoration: "none", padding: "3px 8px", background: "var(--rc-primary-light)", borderRadius: "6px" }}>Open ↗</a>
                )}
                <button onClick={() => { setSelectedDocIdx(null); setViewerUrl(null); }} style={{ fontSize: "12px", color: "var(--rc-faint)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", padding: "4px", display: "flex", alignItems: "center" }}>✕</button>
              </div>
              <div style={{ flex: 1, background: "var(--rc-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {viewerLoading ? (
                  <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none" }}>Loading document…</p>
                ) : viewerUrl ? (
                  <iframe src={viewerUrl} style={{ width: "100%", height: "100%", border: "none" }} title={docs[selectedDocIdx].title} />
                ) : (
                  <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none" }}>Could not load document.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamOverviewPage({ agencyName, staffRows }: { agencyName: string; staffRows: StaffRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRow = staffRows.find(r => r.id === selectedId) ?? null;

  if (selectedId !== null && selectedRow) {
    return <StaffFilePage staffRow={selectedRow} onBack={() => setSelectedId(null)} agencyName={agencyName} />;
  }

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Team Overview</h1>
          <p style={PAGE_SUB}>{staffRows.length} staff member{staffRows.length !== 1 ? "s" : ""} · {agencyName}</p>
        </div>
      </div>
      {staffRows.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="10" r="5" stroke="var(--rc-faint)" strokeWidth="1.6" /><path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="var(--rc-faint)" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No staff members yet.<br />Add staff from the Licence Tracking or Onboarding pages.</p>
        </div>
      ) : (
      <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", alignContent: "start" }}>
        {staffRows.map((s) => {
          const initials = s.name.split(" ").map(n => n[0]).join("").slice(0, 2);
          const licOk = s.licence === "current" || s.licence === "exempt";
          const cpdOk = s.cpd === "complete" || s.cpd === "na";
          return (
            <div key={s.id} onClick={() => setSelectedId(s.id)}
              style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", padding: "18px 20px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)", display: "flex", gap: "16px", alignItems: "center", cursor: "pointer", transition: "box-shadow 0.15s ease, border-color 0.15s ease" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--rc-shadow)"; e.currentTarget.style.borderColor = "oklch(0.82 0.015 260)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--rc-shadow-sm)"; e.currentTarget.style.borderColor = "var(--rc-border)"; }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "var(--rc-primary-light)", color: "var(--rc-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--rc-ink)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "none" }}>{s.name}</p>
                <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: 0, maxWidth: "none" }}>{s.role}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {licOk ? <GreenDot /> : <RedDot />}
                  <span style={{ fontSize: "11.5px", color: licOk ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.18 25)" }}>{s.licence === "exempt" ? "Exempt" : licOk ? "Licensed" : "Renewal due"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {cpdOk ? <GreenDot /> : s.cpd === "due-soon" ? <AmberDot /> : s.cpd === "na" ? null : <RedDot />}
                  {s.cpd !== "na" && <span style={{ fontSize: "11.5px", color: cpdOk ? "oklch(0.42 0.12 145)" : s.cpd === "due-soon" ? "oklch(0.46 0.12 55)" : "oklch(0.46 0.18 25)" }}>{s.cpd === "complete" ? "CPD done" : s.cpd === "due-soon" ? "CPD due soon" : "CPD overdue"}</span>}
                  {s.cpd === "na" && <span style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>CPD N/A</span>}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M5 3l4 4-4 4" stroke="var(--rc-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

function LicenceTrackingPage({ staffRows }: { staffRows: StaffRow[] }) {
  const cols = "minmax(0,1fr) 140px 130px 110px 110px 100px";
  const licensed = staffRows.filter(s => s.licence !== "exempt").length;
  const renewalDue = staffRows.filter(s => s.licence === "renewal-due").length;
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Licence Tracking</h1>
          <p style={PAGE_SUB}>{licensed} licensed agent{licensed !== 1 ? "s" : ""}{renewalDue > 0 ? ` · ${renewalDue} renewal due` : ""}</p>
        </div>
      </div>
      {staffRows.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="3" stroke="var(--rc-faint)" strokeWidth="1.5" /><path d="M10 10h12M10 16h8" stroke="var(--rc-faint)" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No staff members yet. Add staff via Onboarding.</p>
        </div>
      ) : (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Name", "Role", "Licence no.", "Type", "Expiry", "Status"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {staffRows.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < staffRows.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.role}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", fontFamily: "monospace", padding: "0 20px" }}>{s.licence_number || "—"}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.licence === "exempt" ? "—" : "Class 2"}</span>
              <span style={{ fontSize: "12.5px", color: s.licence === "renewal-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)", padding: "0 20px" }}>{s.expiry || "—"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 20px" }}>
                {s.licence === "current" ? <><GreenDot /><span style={{ fontSize: "12px", color: "oklch(0.42 0.12 145)" }}>Current</span></> :
                 s.licence === "renewal-due" ? <><AmberDot /><span style={{ fontSize: "12px", color: "oklch(0.46 0.12 55)" }}>Due</span></> :
                 <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>Exempt</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

function CPDRecordsPage({ staffRows }: { staffRows: StaffRow[] }) {
  const cols = "minmax(0,1fr) 130px 90px 90px 110px 100px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>CPD Records</h1>
          <p style={PAGE_SUB}>Continuing professional development — {new Date().getFullYear()} cycle</p>
        </div>
      </div>
      {staffRows.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="6" stroke="var(--rc-faint)" strokeWidth="1.6" /><path d="M10 22h12M13 26h6" stroke="var(--rc-faint)" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No staff members yet. Add staff via Onboarding.</p>
        </div>
      ) : (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Name", "Role", "Required", "Completed", "Deadline", "Status"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {staffRows.map((s, i) => {
            const pct = s.cpd_required === 0 ? null : Math.min(100, Math.round((s.cpd_completed / s.cpd_required) * 100));
            const done = s.cpd === "complete" || s.cpd === "na";
            const barColor = done ? "oklch(0.60 0.16 145)" : s.cpd === "due-soon" ? "oklch(0.60 0.14 55)" : "oklch(0.55 0.20 25)";
            return (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < staffRows.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.role}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", padding: "0 20px" }}>{s.cpd_required === 0 ? "—" : `${s.cpd_required} hrs`}</span>
                <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {pct !== null ? (
                    <>
                      <span style={{ fontSize: "12.5px", color: "var(--rc-muted)" }}>{s.cpd_completed} hrs</span>
                      <div style={{ height: "2px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "100px" }} />
                      </div>
                    </>
                  ) : <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>—</span>}
                </div>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.cpd_deadline || "—"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 20px" }}>
                  {s.cpd === "complete" ? <><GreenDot /><span style={{ fontSize: "12px", color: "oklch(0.42 0.12 145)" }}>Complete</span></> :
                   s.cpd === "due-soon" ? <><AmberDot /><span style={{ fontSize: "12px", color: "oklch(0.46 0.12 55)" }}>Due soon</span></> :
                   s.cpd === "overdue" ? <><RedDot /><span style={{ fontSize: "12px", color: "oklch(0.46 0.18 25)" }}>Overdue</span></> :
                   <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>N/A</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}

type OnboardingMember = { id: string; name: string; role: string; startDate: string; addedAt: string; checkData: (Record<string, string> | null)[] };

function OnboardingChecklist({ member, onBack, onUpdateMember }: { member: OnboardingMember; onBack: () => void; onUpdateMember: (updated: OnboardingMember) => void }) {
  const [checkData, setCheckData] = useState<(Record<string, string> | null)[]>(member.checkData);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [savedAnim, setSavedAnim] = useState(false);

  const done = checkData.filter(d => d !== null).length;
  const total = onboardingItems.length;
  const pct = Math.round((done / total) * 100);

  function selectItem(i: number) {
    setSelectedIdx(i);
    setEditing(false);
    setFormValues(checkData[i] ?? {});
    setSavedAnim(false);
  }

  async function saveItem() {
    if (selectedIdx === null) return;
    const saved = { ...formValues, _savedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) };
    const next = checkData.map((d, i) => i === selectedIdx ? saved : d);
    setCheckData(next);
    setSavedAnim(true);
    setEditing(false);
    await supabase.from("onboarding_members").update({ check_data: next }).eq("id", member.id);
    onUpdateMember({ ...member, checkData: next });
  }

  const inputSty: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  const selectedItem = selectedIdx !== null ? onboardingItems[selectedIdx] : null;
  const selectedData = selectedIdx !== null ? checkData[selectedIdx] : null;
  const isComplete = selectedData !== null;
  const showForm = !isComplete || editing;

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <button onClick={onBack} style={{ fontSize: "12px", color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            ← Back to onboarding
          </button>
          <h1 style={PAGE_H1}>{member.name}</h1>
          <p style={PAGE_SUB}>{member.role}{member.startDate ? ` · Started ${member.startDate}` : ""}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "120px", height: "4px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "oklch(0.60 0.16 145)" : "var(--rc-primary)", borderRadius: "100px", transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: pct === 100 ? "oklch(0.42 0.12 145)" : "var(--rc-primary)" }}>{done}/{total} complete</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "20px", minHeight: 0 }}>
        {/* Left: checklist */}
        <div style={{ width: "300px", flexShrink: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
          {onboardingItems.map((item, i) => {
            const isDone = checkData[i] !== null;
            const isSelected = selectedIdx === i;
            return (
              <div key={item.id} onClick={() => selectItem(i)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderBottom: i < onboardingItems.length - 1 ? "1px solid var(--rc-border)" : "none", background: isSelected ? "var(--rc-primary-light)" : isDone ? "oklch(0.985 0.006 145)" : "var(--rc-bg)", cursor: "pointer", transition: "background 0.15s ease", userSelect: "none" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, border: isDone ? "none" : "1.5px solid var(--rc-border)", background: isDone ? "oklch(0.60 0.16 145)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}>
                  {isDone && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: "13px", flex: 1, color: isDone ? "var(--rc-faint)" : isSelected ? "var(--rc-primary)" : "var(--rc-ink)", textDecoration: isDone ? "line-through" : "none", fontWeight: isSelected ? 600 : 400 }}>{item.label}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M5 3l4 4-4 4" stroke={isSelected ? "var(--rc-primary)" : "var(--rc-border)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            );
          })}
        </div>

        {/* Right: form / detail */}
        <div style={{ flex: 1, border: "1px solid var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selectedItem === null ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="3" stroke="var(--rc-faint)" strokeWidth="1.5" /><path d="M10 10h12M10 15h12M10 20h8" stroke="var(--rc-faint)" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>Select a checklist item to complete it</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Panel header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rc-border)", flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Step {selectedIdx! + 1} of {total}</p>
                    {isComplete && !editing && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "oklch(0.38 0.13 145)", background: "oklch(0.94 0.04 145)", padding: "2px 8px", borderRadius: "100px" }}>Saved to Documents</span>
                    )}
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--rc-ink)", margin: 0, letterSpacing: "-0.02em" }}>{selectedItem.label}</p>
                  <p style={{ fontSize: "12.5px", color: "var(--rc-faint)", margin: "4px 0 0", maxWidth: "none" }}>{selectedItem.description}</p>
                </div>
                {isComplete && !editing && (
                  <button onClick={() => { setEditing(true); setSavedAnim(false); }} style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-primary)", background: "var(--rc-primary-light)", border: "none", borderRadius: "7px", padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font-inter)", flexShrink: 0 }}>Edit</button>
                )}
              </div>

              {/* Form or saved view */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                {showForm ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {selectedItem.fields.map(field => (
                      <div key={field.id}>
                        <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{field.label}</p>
                        {field.type === "textarea" ? (
                          <textarea
                            value={formValues[field.id] ?? ""}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            rows={3}
                            style={{ ...inputSty, resize: "vertical", lineHeight: "1.5" }}
                          />
                        ) : (
                          <input
                            type={field.type === "date" ? "text" : "text"}
                            value={formValues[field.id] ?? ""}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            style={inputSty}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {selectedItem.fields.map(field => (
                      <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--rc-faint)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{field.label}</p>
                        <p style={{ fontSize: "13.5px", color: selectedData![field.id] ? "var(--rc-ink)" : "var(--rc-faint)", margin: 0, maxWidth: "none", whiteSpace: "pre-wrap" }}>{selectedData![field.id] || "—"}</p>
                      </div>
                    ))}
                    {selectedData!._savedAt && (
                      <p style={{ fontSize: "11px", color: "var(--rc-faint)", margin: "8px 0 0", maxWidth: "none" }}>Saved {selectedData!._savedAt}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {showForm && (
                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--rc-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--rc-bg)" }}>
                  <div>
                    {savedAnim && (
                      <span style={{ fontSize: "13px", color: "oklch(0.42 0.12 145)", fontWeight: 500 }}>✓ Saved to Documents</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {editing && (
                      <button onClick={() => { setEditing(false); setFormValues(checkData[selectedIdx!] ?? {}); }} style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Cancel</button>
                    )}
                    <button onClick={saveItem} style={{ fontSize: "13px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontFamily: "var(--font-inter)" }}>
                      Save to Documents
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {pct === 100 && (
        <div style={{ flexShrink: 0, padding: "14px 18px", background: "oklch(0.96 0.025 145)", border: "1px solid oklch(0.82 0.08 145)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" fill="oklch(0.60 0.16 145)" /><path d="M5.5 9l2.5 2.5 4-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "oklch(0.38 0.13 145)" }}>Onboarding complete for {member.name}. All documents saved.</span>
        </div>
      )}
    </div>
  );
}

function OnboardingPage() {
  const [members, setMembers] = useState<OnboardingMember[]>([]);
  const [selected, setSelected] = useState<OnboardingMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [startInput, setStartInput] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("onboarding_members").select("*").eq("user_id", data.user.id).order("created_at").then(({ data: rows }) => {
        if (!rows) return;
        setMembers(rows.map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          startDate: r.start_date,
          addedAt: r.added_at,
          checkData: Array.isArray(r.check_data) ? r.check_data : Array(onboardingItems.length).fill(null),
        })));
      });
    });
  }, []);

  const inputSty2: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  async function submitAdd() {
    if (!nameInput.trim()) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const addedAt = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const emptyCheck = Array(onboardingItems.length).fill(null);
    const { data: row } = await supabase.from("onboarding_members").insert({
      user_id: user.user.id,
      name: nameInput.trim(),
      role: roleInput.trim(),
      start_date: startInput.trim(),
      added_at: addedAt,
      check_data: emptyCheck,
    }).select().single();
    if (row) {
      setMembers(prev => [...prev, { id: row.id, name: row.name, role: row.role, startDate: row.start_date, addedAt: row.added_at, checkData: emptyCheck }]);
    }
    setNameInput(""); setRoleInput(""); setStartInput("");
    setShowAdd(false);
  }

  function handleUpdateMember(updated: OnboardingMember) {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (selected?.id === updated.id) setSelected(updated);
  }

  if (selected) {
    return <OnboardingChecklist member={selected} onBack={() => setSelected(null)} onUpdateMember={handleUpdateMember} />;
  }

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Staff Onboarding</h1>
          <p style={PAGE_SUB}>{members.length === 0 ? "Add a new staff member to begin their onboarding checklist" : `${members.length} staff member${members.length !== 1 ? "s" : ""} in onboarding`}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ fontSize: "12.5px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-inter)", flexShrink: 0 }}
        >
          + Add staff member
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {members.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", border: "1px dashed var(--rc-border)", borderRadius: "12px", background: "var(--rc-surface)" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="10" r="5" stroke="var(--rc-faint)" strokeWidth="1.6" /><path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="var(--rc-faint)" strokeWidth="1.6" strokeLinecap="round" /><path d="M22 6h6M25 3v6" stroke="var(--rc-faint)" strokeWidth="1.6" strokeLinecap="round" /></svg>
            <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No staff members added yet.<br />Click "+ Add staff member" to start.</p>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
            {members.map((m, i) => {
              const done = m.checkData.filter(d => d !== null).length;
              const total = onboardingItems.length;
              const pct = Math.round((done / total) * 100);
              const trackColor = pct === 100 ? "var(--rc-primary)" : pct >= 50 ? "oklch(0.60 0.14 55)" : "oklch(0.55 0.20 25)";
              const pctColor = pct === 100 ? "oklch(0.38 0.12 145)" : pct >= 50 ? "oklch(0.46 0.12 55)" : "oklch(0.46 0.18 25)";
              return (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 200px 56px 130px", alignItems: "center", gap: "20px", padding: "12px 24px", borderBottom: i < members.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--rc-ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--rc-faint)", margin: "2px 0 0", maxWidth: "none" }}>
                      {m.role}{m.role && m.startDate ? " · " : ""}{m.startDate ? `Started ${m.startDate}` : ""}{(!m.role && !m.startDate) ? `Added ${m.addedAt}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "2px", background: "var(--rc-border-subtle)", borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: trackColor, borderRadius: "100px" }} />
                    </div>
                    <span style={{ fontSize: "11.5px", color: "var(--rc-faint)", flexShrink: 0 }}>{done}/{total}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: pctColor, textAlign: "right" }}>{pct}%</span>
                  <button
                    onClick={() => setSelected(m)}
                    style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", whiteSpace: "nowrap", textAlign: "right", transition: "color 0.1s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--rc-ink)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--rc-faint)"; }}
                  >
                    View checklist →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--rc-bg)", borderRadius: "14px", padding: "28px", width: "420px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: 0 }}>Add staff member</h2>
              <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "4px 0 0", maxWidth: "none" }}>Their onboarding checklist will be created automatically.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-faint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Full name</p>
                <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") setShowAdd(false); }} placeholder="e.g. Sarah Mitchell" style={inputSty2} />
              </div>
              <div>
                <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-faint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Role <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
                <input value={roleInput} onChange={e => setRoleInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") setShowAdd(false); }} placeholder="e.g. Sales Agent" style={inputSty2} />
              </div>
              <div>
                <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-faint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Start date <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
                <input value={startInput} onChange={e => setStartInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") setShowAdd(false); }} placeholder="e.g. 28 Jul 2026" style={inputSty2} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Cancel</button>
              <button onClick={submitAdd} style={{ fontSize: "13px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Add staff member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountReconciliationPage() {
  const [accounts, setAccounts] = useState<TrustAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bankInput, setBankInput] = useState("");
  const [balanceInput, setBalanceInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data } = await supabase.from("trust_accounts").select("*").eq("user_id", user.user.id).order("created_at");
      if (data) setAccounts(data.map(r => ({ id: r.id, name: r.name, bank: r.bank, balance: r.balance, last_reconciled: r.last_reconciled, status: r.status as TrustAccountRow["status"] })));
      setLoading(false);
    })();
  }, []);

  async function toggleStatus(acc: TrustAccountRow) {
    const newStatus = acc.status === "reconciled" ? "pending" : "reconciled";
    const today = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const { error } = await supabase.from("trust_accounts").update({ status: newStatus, last_reconciled: newStatus === "reconciled" ? today : acc.last_reconciled }).eq("id", acc.id);
    if (!error) setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, status: newStatus, last_reconciled: newStatus === "reconciled" ? today : a.last_reconciled } : a));
  }

  async function addAccount() {
    if (!nameInput.trim() || !bankInput.trim()) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSaving(false); return; }
    const { data, error } = await supabase.from("trust_accounts").insert({ user_id: user.user.id, name: nameInput.trim(), bank: bankInput.trim(), balance: balanceInput.trim() || "$0", status: "pending", last_reconciled: null }).select().single();
    setSaving(false);
    if (!error && data) {
      setAccounts(prev => [...prev, { id: data.id, name: data.name, bank: data.bank, balance: data.balance, last_reconciled: data.last_reconciled, status: data.status }]);
      setNameInput(""); setBankInput(""); setBalanceInput(""); setShowAdd(false);
    }
  }

  async function deleteAccount(id: string) {
    if (!window.confirm("Remove this trust account? This cannot be undone.")) return;
    const { error } = await supabase.from("trust_accounts").delete().eq("id", id);
    if (!error) setAccounts(prev => prev.filter(a => a.id !== id));
  }

  const inputSty: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Account Reconciliation</h1>
          <p style={PAGE_SUB}>{accounts.length} trust account{accounts.length !== 1 ? "s" : ""} · Reconcile balances to confirm records match</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--rc-primary)", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)" }}>
          + Add account
        </button>
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAdd(false)}>
          <div style={{ background: "var(--rc-bg)", borderRadius: "16px", padding: "32px", width: "420px", boxShadow: "0 20px 60px oklch(0 0 0 / 0.18)", display: "flex", flexDirection: "column", gap: "18px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--rc-ink)", margin: 0 }}>Add trust account</h2>
            {[
              { label: "Account name", value: nameInput, set: setNameInput, placeholder: "e.g. Sales Trust Account" },
              { label: "Bank & account", value: bankInput, set: setBankInput, placeholder: "e.g. Commonwealth Bank ****4521" },
              { label: "Current balance", value: balanceInput, set: setBalanceInput, placeholder: "e.g. $284,500" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inputSty}
                  onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", fontSize: "13px", fontWeight: 500, color: "var(--rc-muted)", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Cancel</button>
              <button onClick={addAccount} disabled={saving || !nameInput.trim() || !bankInput.trim()} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-primary)", border: "none", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "var(--font-inter)", opacity: saving || !nameInput.trim() || !bankInput.trim() ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Add account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "14px", color: "var(--rc-faint)" }}>Loading…</p>
        </div>
      ) : accounts.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No trust accounts yet. Add your first account to start tracking reconciliations.</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0, flexWrap: "wrap", overflowY: "auto" }}>
          {accounts.map(acc => (
            <div key={acc.id} style={{ flex: "1 1 280px", border: "1px solid var(--rc-border)", borderRadius: "12px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--rc-ink)", margin: 0 }}>{acc.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {acc.status === "reconciled" ? <GreenDot /> : <AmberDot />}
                    <span style={{ fontSize: "12px", color: acc.status === "reconciled" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{acc.status === "reconciled" ? "Reconciled" : "Pending"}</span>
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "var(--rc-faint)", maxWidth: "none", margin: "4px 0 0" }}>{acc.bank}</p>
              </div>
              <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Balance", value: acc.balance },
                  { label: "Last reconciled", value: acc.last_reconciled ?? "Not yet reconciled" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--rc-border)", paddingBottom: "12px" }}>
                    <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{row.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.02em" }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <button onClick={() => toggleStatus(acc)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: acc.status === "reconciled" ? "var(--rc-surface)" : "var(--rc-primary)", color: acc.status === "reconciled" ? "var(--rc-muted)" : "white", border: acc.status === "reconciled" ? "1px solid var(--rc-border)" : "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.15s ease" }}>
                    {acc.status === "reconciled" ? "Mark pending" : "Confirm reconciled"}
                  </button>
                  <button onClick={() => deleteAccount(acc.id)} style={{ padding: "10px 12px", borderRadius: "8px", background: "transparent", border: "1px solid oklch(0.82 0.06 25)", color: "oklch(0.50 0.18 25)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "background 0.15s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.96 0.02 25)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditReportsPage() {
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Audit Reports</h1>
          <p style={PAGE_SUB}>Upload and store your annual trust account audit reports</p>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No audit reports yet. Upload your audit reports using the Upload Document section in Policies &amp; Procedures, or contact your auditor to obtain a copy.</p>
      </div>
    </div>
  );
}

function TransactionLogPage() {
  const [transactions, setTransactions] = useState<TrustTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState<"credit" | "debit">("credit");
  const [txDate, setTxDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data } = await supabase.from("trust_transactions").select("*").eq("user_id", user.user.id).order("created_at", { ascending: false });
      if (data) setTransactions(data.map(r => ({ id: r.id, description: r.description, account: r.account, amount: r.amount, type: r.type as TrustTransactionRow["type"], date: r.date })));
      setLoading(false);
    })();
  }, []);

  const accountNames = ["All", ...Array.from(new Set(transactions.map(t => t.account)))];
  const filtered = filter === "All" ? transactions : transactions.filter(t => t.account === filter);
  const cols = "minmax(0,1fr) 130px 110px 90px 100px";

  async function addTransaction() {
    if (!desc.trim() || !account.trim() || !amount.trim()) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSaving(false); return; }
    const dateLabel = txDate ? new Date(txDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const displayAmount = (txType === "credit" ? "+" : "-") + (amount.trim().startsWith("$") ? amount.trim() : "$" + amount.trim());
    const { data, error } = await supabase.from("trust_transactions").insert({ user_id: user.user.id, description: desc.trim(), account: account.trim(), amount: displayAmount, type: txType, date: dateLabel }).select().single();
    setSaving(false);
    if (!error && data) {
      setTransactions(prev => [{ id: data.id, description: data.description, account: data.account, amount: data.amount, type: data.type, date: data.date }, ...prev]);
      setDesc(""); setAccount(""); setAmount(""); setTxType("credit"); setTxDate(""); setShowAdd(false);
    }
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from("trust_transactions").delete().eq("id", id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
  }

  const inputSty: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Transaction Log</h1>
          <p style={PAGE_SUB}>{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {accountNames.length > 1 && (
            <div style={{ display: "flex", gap: "4px", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "3px" }}>
              {accountNames.map(a => (
                <button key={a} onClick={() => setFilter(a)} style={{ padding: "5px 12px", borderRadius: "5px", border: "none", background: filter === a ? "var(--rc-bg)" : "transparent", color: filter === a ? "var(--rc-ink)" : "var(--rc-faint)", fontSize: "12.5px", fontWeight: filter === a ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-inter)", boxShadow: filter === a ? "var(--rc-shadow-sm)" : "none", transition: "all 0.15s ease" }}>{a}</button>
              ))}
            </div>
          )}
          <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--rc-primary)", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)" }}>+ Add entry</button>
        </div>
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAdd(false)}>
          <div style={{ background: "var(--rc-bg)", borderRadius: "16px", padding: "32px", width: "440px", boxShadow: "0 20px 60px oklch(0 0 0 / 0.18)", display: "flex", flexDirection: "column", gap: "16px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--rc-ink)", margin: 0 }}>Log transaction</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Type</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["credit", "debit"] as const).map(t => (
                  <button key={t} onClick={() => setTxType(t)} style={{ flex: 1, padding: "9px", borderRadius: "8px", border: `1px solid ${txType === t ? "var(--rc-primary)" : "var(--rc-border)"}`, background: txType === t ? "oklch(0.95 0.03 260)" : "var(--rc-bg)", color: txType === t ? "var(--rc-primary)" : "var(--rc-muted)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.1s ease", textTransform: "capitalize" }}>{t}</button>
                ))}
              </div>
            </div>
            {[
              { label: "Description", value: desc, set: setDesc, placeholder: "e.g. Deposit — 42 Harbour View Rd" },
              { label: "Trust account", value: account, set: setAccount, placeholder: "e.g. Sales Trust Account" },
              { label: "Amount (numbers only)", value: amount, set: setAmount, placeholder: "e.g. 22000" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inputSty}
                  onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Date (leave blank for today)</label>
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} style={inputSty}
                onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", fontSize: "13px", fontWeight: 500, color: "var(--rc-muted)", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Cancel</button>
              <button onClick={addTransaction} disabled={saving || !desc.trim() || !account.trim() || !amount.trim()} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-primary)", border: "none", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "var(--font-inter)", opacity: saving || !desc.trim() || !account.trim() || !amount.trim() ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Log entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: "14px", color: "var(--rc-faint)" }}>Loading…</p></div>
      ) : transactions.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No transactions yet. Use '+ Add entry' to log your first trust account transaction.</p></div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
            {["Description", "Account", "Date", "Type", "Amount"].map(h => (
              <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((tx, i) => (
              <div key={tx.id} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", cursor: "default", transition: "background 0.1s ease" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--rc-surface)")} onMouseLeave={e => (e.currentTarget.style.background = "var(--rc-bg)")}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</span>
                <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.account}</span>
                <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{tx.date}</span>
                <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {tx.type === "credit" ? <GreenDot /> : <RedDot />}
                  <span style={{ fontSize: "12px", color: tx.type === "credit" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.18 25)" }}>{tx.type === "credit" ? "Credit" : "Debit"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: tx.type === "credit" ? "oklch(0.38 0.12 145)" : "oklch(0.46 0.18 25)" }}>{tx.amount}</span>
                  <button onClick={() => deleteTransaction(tx.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", fontSize: "11px", fontFamily: "var(--font-inter)", transition: "color 0.1s ease", padding: "2px 4px" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.50 0.18 25)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AMLCompliancePage() {
  const [checks, setChecks] = useState<AMLCheckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addrInput, setAddrInput] = useState("");
  const [partyInput, setPartyInput] = useState("");
  const [partyTypeInput, setPartyTypeInput] = useState("Vendor");
  const [methodInput, setMethodInput] = useState("Document verification");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data } = await supabase.from("aml_checks").select("*").eq("user_id", user.user.id).order("created_at", { ascending: false });
      if (data) setChecks(data.map(r => ({ id: r.id, address: r.address, party: r.party, party_type: r.party_type, verified: r.verified, verified_date: r.verified_date, method: r.method })));
      setLoading(false);
    })();
  }, []);

  async function addCheck() {
    if (!addrInput.trim() || !partyInput.trim()) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSaving(false); return; }
    const { data, error } = await supabase.from("aml_checks").insert({ user_id: user.user.id, address: addrInput.trim(), party: partyInput.trim(), party_type: partyTypeInput, verified: false, verified_date: null, method: methodInput.trim() || null }).select().single();
    setSaving(false);
    if (!error && data) {
      setChecks(prev => [{ id: data.id, address: data.address, party: data.party, party_type: data.party_type, verified: data.verified, verified_date: data.verified_date, method: data.method }, ...prev]);
      setAddrInput(""); setPartyInput(""); setPartyTypeInput("Vendor"); setMethodInput("Document verification"); setShowAdd(false);
    }
  }

  async function toggleVerified(c: AMLCheckRow) {
    const now = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const newVerified = !c.verified;
    const { error } = await supabase.from("aml_checks").update({ verified: newVerified, verified_date: newVerified ? now : null }).eq("id", c.id);
    if (!error) setChecks(prev => prev.map(x => x.id === c.id ? { ...x, verified: newVerified, verified_date: newVerified ? now : null } : x));
  }

  async function deleteCheck(id: string) {
    const { error } = await supabase.from("aml_checks").delete().eq("id", id);
    if (!error) setChecks(prev => prev.filter(x => x.id !== id));
  }

  const verified = checks.filter(c => c.verified).length;
  const cols = "minmax(0,1fr) 150px 80px 80px 140px 80px";
  const inputSty: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>AML Compliance</h1>
          <p style={PAGE_SUB}>{verified}/{checks.length} identity checks complete · Anti-Money Laundering &amp; CTF</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--rc-primary)", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)" }}>+ Add check</button>
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAdd(false)}>
          <div style={{ background: "var(--rc-bg)", borderRadius: "16px", padding: "32px", width: "440px", boxShadow: "0 20px 60px oklch(0 0 0 / 0.18)", display: "flex", flexDirection: "column", gap: "16px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--rc-ink)", margin: 0 }}>Add AML check</h2>
            {[
              { label: "Property address", value: addrInput, set: setAddrInput, placeholder: "e.g. 42 Harbour View Rd, Balmain NSW 2041" },
              { label: "Party name", value: partyInput, set: setPartyInput, placeholder: "e.g. John & Mary Thompson" },
              { label: "Verification method", value: methodInput, set: setMethodInput, placeholder: "e.g. Document verification" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inputSty}
                  onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Party type</label>
              <select value={partyTypeInput} onChange={e => setPartyTypeInput(e.target.value)} style={{ ...inputSty, appearance: "none" }}>
                {["Vendor", "Purchaser", "Tenant", "Landlord", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", fontSize: "13px", fontWeight: 500, color: "var(--rc-muted)", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Cancel</button>
              <button onClick={addCheck} disabled={saving || !addrInput.trim() || !partyInput.trim()} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-primary)", border: "none", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "var(--font-inter)", opacity: saving || !addrInput.trim() || !partyInput.trim() ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Add check"}
              </button>
            </div>
          </div>
        </div>
      )}

      {checks.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", flexShrink: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
          {[
            { label: "Total checks", value: String(checks.length), sub: "Properties + parties" },
            { label: "Verified", value: String(verified), sub: "ID confirmed" },
            { label: "Pending", value: String(checks.length - verified), sub: "Action required" },
          ].map(({ label, value, sub }, i) => (
            <div key={label} style={{ padding: "18px 20px", borderRight: i < 2 ? "1px solid var(--rc-border)" : "none", display: "flex", flexDirection: "column", gap: "5px" }}>
              <p style={{ fontSize: "11.5px", color: "var(--rc-faint)", maxWidth: "none" }}>{label}</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none" }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: "14px", color: "var(--rc-faint)" }}>Loading…</p></div>
      ) : checks.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No AML checks yet. Add your first check to start tracking identity verification.</p></div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
            {["Property / Address", "Party name", "Type", "Verified", "Date", ""].map(h => (
              <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {checks.map((c, i) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < checks.length - 1 ? "1px solid var(--rc-border)" : "none", background: c.verified ? "var(--rc-bg)" : "oklch(0.985 0.012 55)" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", padding: "0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.party}</span>
                <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{c.party_type}</span>
                <div style={{ padding: "0 12px" }}>
                  <button onClick={() => toggleVerified(c)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-inter)" }}>
                    {c.verified ? <GreenDot /> : <AmberDot />}
                    <span style={{ fontSize: "12px", color: c.verified ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{c.verified ? "Verified" : "Pending"}</span>
                  </button>
                </div>
                <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{c.verified_date ?? "—"}</span>
                <div style={{ padding: "0 20px" }}>
                  <button onClick={() => deleteCheck(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", fontSize: "11px", fontFamily: "var(--font-inter)", transition: "color 0.1s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.50 0.18 25)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthlyTrustReportsPage() {
  const [reports, setReports] = useState<TrustReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [monthInput, setMonthInput] = useState("");
  const [accountInput, setAccountInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data } = await supabase.from("trust_reports").select("*").eq("user_id", user.user.id).order("created_at", { ascending: false });
      if (data) setReports(data.map(r => ({ id: r.id, month: r.month, account: r.account, notes: r.notes, file_url: r.file_url, file_name: r.file_name, uploaded_at: r.uploaded_at })));
      setLoading(false);
    })();
  }, []);

  function resetModal() { setMonthInput(""); setAccountInput(""); setNotesInput(""); setFileInput(null); if (fileRef.current) fileRef.current.value = ""; setShowAdd(false); }

  async function addReport() {
    if (!monthInput || !accountInput.trim()) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setSaving(false); return; }
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    if (fileInput) {
      const path = `trust-reports/${user.user.id}/${Date.now()}-${fileInput.name}`;
      const { error: upErr } = await supabase.storage.from("policy-docs").upload(path, fileInput);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("policy-docs").getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = fileInput.name;
      }
    }
    const uploadedAt = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    const { data, error } = await supabase.from("trust_reports").insert({ user_id: user.user.id, month: monthInput, account: accountInput.trim(), notes: notesInput.trim() || null, file_url: fileUrl, file_name: fileName, uploaded_at: uploadedAt }).select().single();
    setSaving(false);
    if (!error && data) {
      setReports(prev => [{ id: data.id, month: data.month, account: data.account, notes: data.notes, file_url: data.file_url, file_name: data.file_name, uploaded_at: data.uploaded_at }, ...prev]);
      resetModal();
    }
  }

  async function deleteReport(id: string) {
    if (!window.confirm("Delete this report record?")) return;
    const { error } = await supabase.from("trust_reports").delete().eq("id", id);
    if (!error) setReports(prev => prev.filter(r => r.id !== id));
  }

  const inputSty: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };
  const cols = "140px minmax(0,1fr) minmax(0,1fr) 110px 120px 36px";

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Monthly Reports</h1>
          <p style={PAGE_SUB}>{reports.length} report{reports.length !== 1 ? "s" : ""} logged</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--rc-primary)", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)" }}>+ Add report</button>
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={resetModal}>
          <div style={{ background: "var(--rc-bg)", borderRadius: "16px", padding: "32px", width: "460px", boxShadow: "0 20px 60px oklch(0 0 0 / 0.18)", display: "flex", flexDirection: "column", gap: "16px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--rc-ink)", margin: 0 }}>Log monthly report</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Month</label>
              <input type="month" value={monthInput} onChange={e => setMonthInput(e.target.value)} style={inputSty}
                onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Trust account</label>
              <input value={accountInput} onChange={e => setAccountInput(e.target.value)} placeholder="e.g. Sales Trust Account" style={inputSty}
                onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Notes (optional)</label>
              <textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="e.g. Reconciliation completed, variance nil" rows={2}
                style={{ ...inputSty, resize: "vertical", lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-muted)" }}>Attach report PDF (optional)</label>
              <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={e => setFileInput(e.target.files?.[0] ?? null)}
                style={{ fontSize: "12.5px", color: "var(--rc-muted)", fontFamily: "var(--font-inter)", cursor: "pointer" }} />
              {fileInput && <p style={{ fontSize: "11.5px", color: "var(--rc-faint)", maxWidth: "none" }}>{fileInput.name}</p>}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button onClick={resetModal} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", fontSize: "13px", fontWeight: 500, color: "var(--rc-muted)", cursor: "pointer", fontFamily: "var(--font-inter)" }}>Cancel</button>
              <button onClick={addReport} disabled={saving || !monthInput || !accountInput.trim()} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "var(--rc-primary)", border: "none", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer", fontFamily: "var(--font-inter)", opacity: saving || !monthInput || !accountInput.trim() ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Save report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: "14px", color: "var(--rc-faint)" }}>Loading…</p></div>
      ) : reports.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <p style={{ fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none", textAlign: "center" }}>No monthly reports yet. Add your first report to start tracking trust account reconciliations.</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
            {["Month", "Account", "Notes", "Uploaded", "File", ""].map(h => (
              <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {reports.map((r, i) => {
              const monthLabel = (() => { try { const [y, m] = r.month.split("-"); return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" }); } catch { return r.month; } })();
              return (
                <div key={r.id} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < reports.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", transition: "background 0.1s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--rc-surface)")} onMouseLeave={e => (e.currentTarget.style.background = "var(--rc-bg)")}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-ink)", padding: "14px 20px" }}>{monthLabel}</span>
                  <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", padding: "0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.account}</span>
                  <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.notes ?? "—"}</span>
                  <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{r.uploaded_at}</span>
                  <div style={{ padding: "0 20px" }}>
                    {r.file_url ? (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-primary)", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", maxWidth: "100px" }}>
                        {r.file_name ?? "Download"}
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>No file</span>
                    )}
                  </div>
                  <div style={{ padding: "0 12px", display: "flex", justifyContent: "center" }}>
                    <button onClick={() => deleteReport(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", fontSize: "11px", fontFamily: "var(--font-inter)", transition: "color 0.1s ease", padding: "4px" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.50 0.18 25)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Settings pages ---

const SETTINGS_INPUT: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: "8px",
  border: "1px solid var(--rc-border)", background: "var(--rc-surface)",
  fontSize: "14px", color: "var(--rc-ink)", outline: "none",
  fontFamily: "var(--font-inter)", transition: "border-color 0.15s ease",
};

const SETTINGS_BTN: React.CSSProperties = {
  padding: "10px 22px", background: "var(--rc-primary)", color: "white",
  border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px",
  cursor: "pointer", fontFamily: "var(--font-inter)",
};

const CARD: React.CSSProperties = {
  border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden",
};

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--rc-border)" }}>
      <span style={{ width: "180px", fontSize: "13px", fontWeight: 500, color: "var(--rc-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", color: "var(--rc-ink)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: "super_user" | "standard" }) {
  const isSuper = role === "super_user";
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 700,
      background: isSuper ? "oklch(0.92 0.06 260)" : "var(--rc-surface-2)",
      color: isSuper ? "oklch(0.38 0.14 260)" : "var(--rc-muted)",
    }}>
      {isSuper ? "Super User" : "Standard"}
    </span>
  );
}

function AccountSettingsPage({ agencyName, userEmail }: { agencyName: string; userEmail: string | null }) {
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true); setPwMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwMsg(error ? error.message : "Password updated successfully.");
    setPwLoading(false);
    setNewPassword("");
  }

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Account</h1>
          <p style={PAGE_SUB}>Manage your agency details and login credentials.</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
        {/* Account info */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Organisation</p>
          <div style={CARD}>
            <SettingsRow label="Agency name" value={agencyName} />
            <SettingsRow label="Account email" value={userEmail ?? "—"} />
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center" }}>
              <span style={{ width: "180px", fontSize: "13px", fontWeight: 500, color: "var(--rc-muted)", flexShrink: 0 }}>Role</span>
              <RoleBadge role="super_user" />
            </div>
          </div>
        </div>

        {/* Change password */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Security</p>
          <div style={{ ...CARD, padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflow: "visible" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--rc-ink)", marginBottom: "4px", maxWidth: "none" }}>Change password</p>
              <p style={{ fontSize: "13px", color: "var(--rc-muted)", maxWidth: "none" }}>Choose a strong password of at least 6 characters.</p>
            </div>
            <form onSubmit={handleChangePassword} style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password" style={{ ...SETTINGS_INPUT, flex: 1, minWidth: "220px" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
              <button type="submit" disabled={pwLoading} style={{ ...SETTINGS_BTN, opacity: pwLoading ? 0.7 : 1, cursor: pwLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                {pwLoading ? "Updating…" : "Update password"}
              </button>
            </form>
            {pwMsg && <p style={{ fontSize: "13px", color: pwMsg.includes("successfully") ? "var(--rc-primary)" : "oklch(0.55 0.18 25)", maxWidth: "none", margin: 0 }}>{pwMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSettingsPage({ userId }: { userId: string | null }) {
  const [sub, setSub] = useState<{ plan: string; status: string; stripe_customer_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const PLAN_LABELS: Record<string, string> = { essentials: "Essentials", standard: "Standard", professional: "Professional" };
  const PLAN_PRICES: Record<string, number> = { essentials: 129, standard: 249, professional: 549 };
  const PLAN_SEATS: Record<string, number> = { essentials: 20, standard: 60, professional: 120 };

  useEffect(() => {
    if (!userId) return;
    supabase.from("subscriptions").select("plan, status, stripe_customer_id").eq("user_id", userId).single().then(({ data }) => {
      setSub(data); setLoading(false);
    });
  }, [userId]);

  async function openPortal() {
    if (!userId) return;
    setPortalLoading(true);
    const res = await fetch("/api/create-portal-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setPortalLoading(false);
  }

  if (loading) return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}><h1 style={PAGE_H1}>Billing</h1></div>
      <p style={{ color: "var(--rc-muted)", fontSize: "14px" }}>Loading billing details…</p>
    </div>
  );

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Billing</h1>
          <p style={PAGE_SUB}>Manage your subscription, invoices, and payment method.</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
        {sub ? (
          <>
            {/* Plan summary */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Current plan</p>
              <div style={CARD}>
                <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--rc-border)" }}>
                  <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.04em", marginBottom: "4px" }}>{PLAN_LABELS[sub.plan] ?? sub.plan}</div>
                    <div style={{ fontSize: "13px", color: "var(--rc-muted)" }}>
                      ${PLAN_PRICES[sub.plan] ?? "—"}/month · up to {PLAN_SEATS[sub.plan] ?? "—"} team members
                    </div>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 700,
                    background: sub.status === "active" ? "var(--rc-primary-light)" : "oklch(0.97 0.02 25)",
                    color: sub.status === "active" ? "var(--rc-primary)" : "oklch(0.55 0.18 25)",
                  }}>
                    {sub.status === "active" ? "Active" : sub.status}
                  </span>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "13px", color: "var(--rc-muted)", maxWidth: "none", margin: 0 }}>
                    Update your card, download past invoices, or cancel your subscription through the secure Stripe portal.
                  </p>
                  <button onClick={openPortal} disabled={portalLoading} style={{ ...SETTINGS_BTN, marginLeft: "24px", flexShrink: 0, opacity: portalLoading ? 0.7 : 1, cursor: portalLoading ? "not-allowed" : "pointer" }}>
                    {portalLoading ? "Opening…" : "Manage billing →"}
                  </button>
                </div>
              </div>
            </div>

            {/* What's included */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Included in your plan</p>
              <div style={CARD}>
                {[
                  ["Team seats", `Up to ${PLAN_SEATS[sub.plan] ?? "—"} members`],
                  ["CPD & Licence tracking", "Included"],
                  ["Trust accounting", "Included"],
                  ["AML compliance", "Included"],
                  ["Policies & procedures", "Included"],
                  ["Audit readiness", "Included"],
                ].map(([label, value], i, arr) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: i < arr.length - 1 ? "1px solid var(--rc-border)" : "none" }}>
                    <span style={{ fontSize: "13px", color: "var(--rc-muted)" }}>{label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-ink)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...CARD, padding: "32px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "16px", maxWidth: "none" }}>No active subscription found.</p>
            <a href="/signup" style={{ ...SETTINGS_BTN, display: "inline-block", textDecoration: "none" }}>Choose a plan →</a>
          </div>
        )}
      </div>
    </div>
  );
}

type InviteRow = { id: string; email: string | null; created_at: string; accepted_at: string | null; member_role: "super_user" | "standard" };

function TeamInvitesPage({ userId, agencyName, staffRows }: { userId: string | null; agencyName: string; staffRows: StaffRow[] }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [copied, setCopied] = useState(false);
  const [seatsTotal, setSeatsTotal] = useState<number | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  function refreshInvites() {
    if (!userId) return;
    supabase.from("invites").select("id, email, created_at, accepted_at, member_role").eq("invited_by", userId).order("created_at", { ascending: false }).then(({ data }) => { if (data) setInvites(data as InviteRow[]); });
  }

  useEffect(() => {
    if (!userId) return;
    refreshInvites();
    supabase.from("subscriptions").select("plan").eq("user_id", userId).single().then(({ data }) => {
      const limits: Record<string, number> = { essentials: 20, standard: 60, professional: 120 };
      if (data?.plan) setSeatsTotal(limits[data.plan] ?? 20);
    });
  }, [userId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setInviteLoading(true); setInviteError(""); setInviteLink("");
    const res = await fetch("/api/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, email: inviteEmail, agencyName }) });
    const data = await res.json();
    if (!res.ok) { setInviteError(data.error); setInviteLoading(false); return; }
    setInviteLink(data.inviteUrl);
    setSeatsTotal(data.seatsTotal);
    setInviteEmail("");
    setInviteLoading(false);
    refreshInvites();
  }

  async function toggleRole(inv: InviteRow) {
    const newRole = inv.member_role === "super_user" ? "standard" : "super_user";
    setRoleLoading(inv.id);
    await supabase.from("invites").update({ member_role: newRole }).eq("id", inv.id);
    setRoleLoading(null);
    refreshInvites();
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const acceptedInvites = invites.filter(i => i.accepted_at);
  const pendingInvites = invites.filter(i => !i.accepted_at);
  const totalMembers = 1 + acceptedInvites.length; // owner + accepted invites

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Team &amp; Invites</h1>
          <p style={PAGE_SUB}>
            {totalMembers} member{totalMembers !== 1 ? "s" : ""}
            {seatsTotal !== null ? ` · ${seatsTotal - totalMembers} seats remaining` : ""}
          </p>
        </div>
        <button onClick={() => document.getElementById("invite-form-input")?.focus()}
          style={{ ...SETTINGS_BTN, display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Invite member
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Seat usage bar */}
        {seatsTotal !== null && (
          <div style={{ ...CARD, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-ink)" }}>Seat usage</span>
              <span style={{ fontSize: "13px", color: "var(--rc-muted)" }}>{totalMembers} / {seatsTotal} used</span>
            </div>
            <div style={{ height: "6px", background: "var(--rc-surface-2)", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((totalMembers / seatsTotal) * 100, 100)}%`, background: totalMembers >= seatsTotal ? "oklch(0.55 0.18 25)" : "var(--rc-primary)", borderRadius: "100px", transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}

        {/* Invite form */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Send invite</p>
          <div style={{ ...CARD, padding: "24px" }}>
            <p style={{ fontSize: "13px", color: "var(--rc-muted)", marginBottom: "16px", maxWidth: "none" }}>
              Staff sign up for free using your invite link. They&apos;ll join as Standard users by default — you can promote them to Super User below.
            </p>
            <form onSubmit={handleInvite} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input id="invite-form-input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Staff email (optional — prefills their signup form)"
                style={{ ...SETTINGS_INPUT, flex: 1, minWidth: "220px" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
              <button type="submit" disabled={inviteLoading} style={{ ...SETTINGS_BTN, opacity: inviteLoading ? 0.7 : 1, cursor: inviteLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                {inviteLoading ? "Generating…" : "Generate invite link"}
              </button>
            </form>
            {inviteError && <p style={{ marginTop: "10px", fontSize: "13px", color: "oklch(0.55 0.18 25)", maxWidth: "none" }}>{inviteError}</p>}
            {inviteLink && (
              <div style={{ marginTop: "14px", padding: "14px 16px", background: "var(--rc-primary-light)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M6.5 9.5a4 4 0 005.657-5.657L10.5 2.2A4 4 0 004.843 7.857" stroke="var(--rc-primary)" strokeWidth="1.5" strokeLinecap="round" /><path d="M9.5 6.5a4 4 0 00-5.657 5.657L5.5 13.8A4 4 0 0011.157 8.143" stroke="var(--rc-primary)" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <span style={{ flex: 1, fontSize: "13px", color: "var(--rc-ink)", wordBreak: "break-all", maxWidth: "none" }}>{inviteLink}</span>
                <button onClick={copyLink} style={{ flexShrink: 0, padding: "7px 16px", background: copied ? "var(--rc-primary)" : "white", color: copied ? "white" : "var(--rc-primary)", border: "1px solid var(--rc-primary)", borderRadius: "6px", fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.15s ease", whiteSpace: "nowrap" }}>
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active members */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Members</p>
          <div style={CARD}>
            {/* Owner row */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: acceptedInvites.length > 0 ? "1px solid var(--rc-border)" : "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "oklch(0.92 0.06 260)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "oklch(0.38 0.14 260)", flexShrink: 0, marginRight: "14px" }}>
                {agencyName.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--rc-ink)" }}>{agencyName}</div>
                <div style={{ fontSize: "12px", color: "var(--rc-muted)" }}>Organisation owner</div>
              </div>
              <RoleBadge role="super_user" />
            </div>

            {acceptedInvites.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "var(--rc-faint)" }}>
                No team members yet — send an invite above.
              </div>
            )}

            {acceptedInvites.map((inv, i) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: i < acceptedInvites.length - 1 ? "1px solid var(--rc-border)" : "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--rc-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "var(--rc-muted)", flexShrink: 0, marginRight: "14px" }}>
                  {(inv.email ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>{inv.email ?? "Team member"}</div>
                  <div style={{ fontSize: "12px", color: "var(--rc-muted)" }}>Joined {new Date(inv.accepted_at!).toLocaleDateString("en-AU")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <RoleBadge role={inv.member_role ?? "standard"} />
                  <button
                    onClick={() => toggleRole(inv)}
                    disabled={roleLoading === inv.id}
                    style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid var(--rc-border)", background: "var(--rc-surface)", color: "var(--rc-muted)", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-inter)", whiteSpace: "nowrap", opacity: roleLoading === inv.id ? 0.6 : 1 }}
                  >
                    {roleLoading === inv.id ? "…" : inv.member_role === "super_user" ? "Make Standard" : "Make Super User"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", maxWidth: "none" }}>Pending invites</p>
            <div style={CARD}>
              {pendingInvites.map((inv, i) => (
                <div key={inv.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: i < pendingInvites.length - 1 ? "1px solid var(--rc-border)" : "none" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--rc-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "14px" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4l6 5 6-5M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="var(--rc-faint)" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>{inv.email ?? "Link shared"}</div>
                    <div style={{ fontSize: "12px", color: "var(--rc-muted)" }}>Sent {new Date(inv.created_at).toLocaleDateString("en-AU")}</div>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 600, background: "oklch(0.97 0.04 60)", color: "oklch(0.50 0.13 55)" }}>Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StaticSubPage({ label, agencyName, userEmail, userId, staffRows, policies, onPolicySaved, onPolicyUpdated, onPolicyDeleted }: {
  label: string; agencyName: string; userEmail: string | null; userId: string | null; staffRows: StaffRow[];
  policies: PolicyRow[]; onPolicySaved: (p: PolicyRow) => void; onPolicyUpdated: (p: PolicyRow) => void; onPolicyDeleted: (id: string) => void;
}) {
  const savedNames = policies.filter(p => p.source === "template").map(p => p.name);
  switch (label) {
    case "All Policies":            return <AllPoliciesPage policies={policies} onPolicyUpdated={onPolicyUpdated} onPolicyDeleted={onPolicyDeleted} />;
    case "Policy Templates":        return <PolicyTemplatesPage onPolicySaved={onPolicySaved} savedNames={savedNames} />;
    case "Review Schedule":         return <ReviewSchedulePage policies={policies} onPolicyUpdated={onPolicyUpdated} onPolicyDeleted={onPolicyDeleted} />;
    case "Upload Document":         return <UploadDocumentPage onPolicySaved={onPolicySaved} />;
    case "Team Overview":           return <TeamOverviewPage agencyName={agencyName} staffRows={staffRows} />;
    case "Licence Tracking":        return <LicenceTrackingPage staffRows={staffRows} />;
    case "CPD Records":             return <CPDRecordsPage staffRows={staffRows} />;
    case "Onboarding":              return <OnboardingPage />;
    case "Account Reconciliation":  return <AccountReconciliationPage />;
    case "Monthly Reports":         return <MonthlyTrustReportsPage />;
    case "Audit Reports":           return <AuditReportsPage />;
    case "Transaction Log":         return <TransactionLogPage />;
    case "AML Compliance":          return <AMLCompliancePage />;
    case "Account":                 return <AccountSettingsPage agencyName={agencyName} userEmail={userEmail} />;
    case "Billing":                 return <BillingSettingsPage userId={userId} />;
    case "Team & Invites":          return <TeamInvitesPage userId={userId} agencyName={agencyName} staffRows={staffRows} />;
    default:                        return null;
  }
}

// --- Sidebar nav ---
type Selected =
  | { type: "property"; section: "sales" | "management"; id: string; address: string }
  | { type: "static"; label: string }
  | null;

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selected>(null);
  const [salesProps, setSalesProps] = useState<SalesPropItem[]>([]);
  const [mgmtProps, setMgmtProps] = useState<SalesPropItem[]>([]);
  const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>("Your Agency");
  const [userRole, setUserRole] = useState<"owner" | "standard">("standard");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { window.location.href = "/signin"; return; }
      const uid = data.session.user.id;
      setUserEmail(data.session.user.email ?? null);
      setUserId(data.session.user.id);
      const name = data.session.user.user_metadata?.agency_name;
      if (name) setAgencyName(name);

      // Determine role: owner has a subscriptions record; invited staff are standard by default
      const { data: sub } = await supabase.from("subscriptions").select("id").eq("user_id", uid).maybeSingle();
      if (sub) {
        setUserRole("owner");
      } else {
        // Check if their invite had member_role promoted to super_user
        const { data: inv } = await supabase.from("invites").select("member_role").eq("email", data.session.user.email ?? "").not("accepted_at", "is", null).maybeSingle();
        setUserRole(inv?.member_role === "super_user" ? "owner" : "standard");
      }

      const [{ data: staffData }, { data: propsData }, { data: policiesData }] = await Promise.all([
        supabase.from("staff_members").select("*").eq("user_id", uid).order("created_at"),
        supabase.from("properties").select("*").eq("user_id", uid).order("created_at"),
        supabase.from("policies").select("*").eq("user_id", uid).order("created_at"),
      ]);
      if (staffData) {
        setStaffRows(staffData.map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          licence: r.licence as StaffRow["licence"],
          expiry: r.licence_expiry,
          cpd: r.cpd_status as StaffRow["cpd"],
          email: r.email,
          phone: r.phone,
          start_date: r.start_date,
          licence_number: r.licence_number,
          cpd_required: r.cpd_required,
          cpd_completed: r.cpd_completed,
          cpd_deadline: r.cpd_deadline,
        })));
      }
      if (propsData) {
        setSalesProps(propsData.filter(p => p.type === "sales").map(p => ({ id: p.id, address: p.address, vendorName: p.vendor_name ?? undefined, addedAt: p.added_at ?? undefined })));
        setMgmtProps(propsData.filter(p => p.type === "management").map(p => ({ id: p.id, address: p.address })));
      }
      if (policiesData) {
        setPolicies(policiesData.map(p => ({ id: p.id, name: p.name, category: p.category, status: p.status as PolicyRow["status"], last_reviewed: p.last_reviewed, next_review: p.next_review, content: p.content, source: p.source as PolicyRow["source"] })));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { window.location.href = "/signin"; return; }
      const name = session.user.user_metadata?.agency_name;
      if (name) setAgencyName(name);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAddSalesProperty(prop: Required<SalesPropItem>): Promise<string | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return "Not signed in";
    const { data: row, error } = await supabase.from("properties").insert({
      user_id: user.user.id,
      address: prop.address,
      type: "sales",
      vendor_name: prop.vendorName || null,
      added_at: prop.addedAt || null,
    }).select().single();
    if (error) { console.error("Sales property insert failed:", error); return error.message; }
    if (row) setSalesProps(prev => [...prev, { id: row.id, address: row.address, vendorName: row.vendor_name ?? undefined, addedAt: row.added_at ?? undefined }]);
    return null;
  }

  async function handleRemoveProperty(id: string, section: "sales" | "management") {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) { console.error("Remove property failed:", error); return; }
    if (section === "sales") setSalesProps(prev => prev.filter(p => p.id !== id));
    else setMgmtProps(prev => prev.filter(p => p.id !== id));
    setSelected(null);
  }

  async function handleAddMgmtProperty(prop: Required<SalesPropItem>): Promise<string | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return "Not signed in";
    const { data: row, error } = await supabase.from("properties").insert({
      user_id: user.user.id,
      address: prop.address,
      type: "management",
      vendor_name: prop.vendorName || null,
      added_at: prop.addedAt || null,
    }).select().single();
    if (error) { console.error("Management property insert failed:", error); return error.message; }
    if (row) setMgmtProps(prev => [...prev, { id: row.id, address: row.address, vendorName: row.vendor_name ?? undefined, addedAt: row.added_at ?? undefined }]);
    return null;
  }

  function handlePolicySaved(p: PolicyRow) {
    setPolicies(prev => [...prev, p]);
  }

  function handlePolicyUpdated(p: PolicyRow) {
    setPolicies(prev => prev.map(x => x.id === p.id ? p : x));
  }

  function handlePolicyDeleted(id: string) {
    setPolicies(prev => prev.filter(x => x.id !== id));
  }

  type SidebarModule =
    | { id: string; label: string; icon: React.ReactNode; type: "properties"; properties: { id: string; address: string }[] }
    | { id: string; label: string; icon: React.ReactNode; type: "static"; children: string[] };

  const allModules: SidebarModule[] = [
    { id: "policies", label: "Policies & Procedures", icon: <PolIcon />, type: "static", children: ["All Policies", "Policy Templates", "Review Schedule", "Upload Document"] },
    { id: "sales", label: "Residential Sales", icon: <SalesIcon />, type: "properties", properties: salesProps },
    { id: "management", label: "Residential Management", icon: <MgmtIcon />, type: "properties", properties: mgmtProps },
    { id: "staff", label: "Staff", icon: <StaffIcon />, type: "static", children: ["Team Overview", "Licence Tracking", "CPD Records", "Onboarding"] },
    { id: "trust", label: "Trust Accounting", icon: <TrustIcon />, type: "static", children: ["Account Reconciliation", "Monthly Reports", "Transaction Log", "AML Compliance", "Audit Reports"] },
    { id: "settings", label: "Settings", icon: <SettingsIcon />, type: "static", children: ["Account", "Billing", "Team & Invites"] },
  ];

  // Standard users cannot access Trust Accounting or Settings
  const modules = userRole === "owner" ? allModules : allModules.filter(m => m.id !== "trust" && m.id !== "settings");

  const module = modules.find((m) => m.id === activeModule) ?? null;

  function openModule(id: string) {
    setActiveModule(id);
    if (id === "settings") setSelected({ type: "static", label: "Account" });
    else setSelected(null);
  }
  function goBack() { setActiveModule(null); setSelected(null); }

  return (
    <div style={{ display: "flex", minHeight: "100svh", background: "var(--rc-bg)" }}>
      {/* Sidebar */}
      <aside style={{ width: "252px", flexShrink: 0, background: "var(--rc-nav)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, overflowY: "auto", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", flexShrink: 0 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "32px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </Link>
        </div>

        {!activeModule && (
          <nav style={{ flex: 1, padding: "2px 10px 10px" }}>
            <button onClick={goBack}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "var(--rc-nav-active-bg)", color: "oklch(0.97 0.006 260)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "left", marginBottom: "1px", fontFamily: "var(--font-inter)" }}
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}><path d="M3 8.5L9 3l6 5.5V15a1 1 0 01-1 1H11v-4H7v4H4a1 1 0 01-1-1V8.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              <span style={{ flex: 1 }}>Home</span>
            </button>
            <div style={{ height: "1px", background: "var(--rc-nav-border)", margin: "8px 2px" }} />
            {modules.map((m) => (
              <button key={m.id} onClick={() => openModule(m.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", color: "var(--rc-nav-text)", fontSize: "13.5px", fontWeight: 500, cursor: "pointer", textAlign: "left", marginBottom: "1px", fontFamily: "var(--font-inter)", transition: "background 0.12s ease, color 0.12s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rc-nav-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.90 0.007 260)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--rc-nav-text)"; }}
              >
                <span style={{ flexShrink: 0, opacity: 0.75 }}>{m.icon}</span>
                <span style={{ flex: 1 }}>{m.label}</span>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.22 }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            ))}
          </nav>
        )}

        {activeModule && module && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 16px", border: "none", borderBottom: "1px solid var(--rc-nav-border)", background: "transparent", color: "var(--rc-nav-text)", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-inter)", textAlign: "left", flexShrink: 0, transition: "color 0.12s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "oklch(0.90 0.007 260)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--rc-nav-text)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              All modules
            </button>
            <div style={{ padding: "16px 16px 6px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "oklch(0.97 0.006 260)" }}>
                <span style={{ flexShrink: 0, opacity: 0.8 }}>{iconMap[activeModule]}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.015em" }}>{module.label}</span>
              </div>
            </div>
            <nav style={{ flex: 1, padding: "4px 10px 12px" }}>
              {module.type === "properties" && module.properties.map((prop) => {
                const isActive = selected?.type === "property" && selected.id === prop.id;
                return (
                  <button key={prop.id} onClick={() => setSelected({ type: "property", section: module.id as "sales" | "management", id: prop.id, address: prop.address })}
                    style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: "8px", padding: "9px 12px", border: "none", background: isActive ? "var(--rc-nav-active-bg)" : "transparent", color: isActive ? "oklch(0.97 0.006 260)" : "var(--rc-nav-text)", fontSize: "13px", fontWeight: isActive ? 600 : 400, cursor: "pointer", textAlign: "left", borderRadius: "8px", marginBottom: "2px", transition: "background 0.1s ease, color 0.1s ease", fontFamily: "var(--font-inter)", lineHeight: 1.4 }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "var(--rc-nav-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.90 0.007 260)"; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--rc-nav-text)"; } }}
                  >
                    <span style={{ flexShrink: 0, marginTop: "3px", opacity: 0.35, fontSize: "8px" }}>●</span>
                    {prop.address}
                  </button>
                );
              })}
              {module.type === "static" && module.children.map((child) => {
                const isActive = selected?.type === "static" && selected.label === child;
                return (
                  <button key={child} onClick={() => setSelected({ type: "static", label: child })}
                    style={{ width: "100%", display: "block", padding: "9px 12px", border: "none", background: isActive ? "var(--rc-nav-active-bg)" : "transparent", color: isActive ? "oklch(0.97 0.006 260)" : "var(--rc-nav-text)", fontSize: "13.5px", fontWeight: isActive ? 600 : 400, cursor: "pointer", textAlign: "left", borderRadius: "8px", marginBottom: "2px", transition: "background 0.1s ease, color 0.1s ease", fontFamily: "var(--font-inter)" }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "var(--rc-nav-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.90 0.007 260)"; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--rc-nav-text)"; } }}
                  >
                    {child}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Bottom: agency + sign out */}
        <div style={{ padding: "10px 10px 16px", borderTop: "1px solid var(--rc-nav-border)", flexShrink: 0 }}>
          <div style={{ padding: "8px 12px 6px" }}>
            <p style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--rc-nav-text)", maxWidth: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>Agency</p>
            <p style={{ fontSize: "12.5px", color: "oklch(0.80 0.014 260)", maxWidth: "none", marginTop: "3px", fontWeight: 500, lineHeight: 1.3 }}>{agencyName}</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/signin"; }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, color: "var(--rc-nav-text)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", width: "100%", textAlign: "left" }}
          >
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: "252px", display: "flex", minHeight: "100svh" }}>
        {selected?.type === "property" ? (
          selected.section === "sales" ? (
            <SalesPropertyChecklist key={selected.id} propertyId={selected.id} address={selected.address} onRemove={() => handleRemoveProperty(selected.id, "sales")} />
          ) : (
            <PropertyChecklist key={selected.id} propertyId={selected.id} address={selected.address} type={selected.section} onRemove={() => handleRemoveProperty(selected.id, "management")} />
          )
        ) : selected?.type === "static" ? (
          <StaticSubPage label={selected.label} agencyName={agencyName} userEmail={userEmail} userId={userId} staffRows={staffRows} policies={policies} onPolicySaved={handlePolicySaved} onPolicyUpdated={handlePolicyUpdated} onPolicyDeleted={handlePolicyDeleted} />
        ) : activeModule && activeModule !== "settings" ? (
          <ModuleOverview moduleId={activeModule} onSelectProperty={setSelected} salesProps={salesProps} mgmtProps={mgmtProps} onAddSalesProperty={handleAddSalesProperty} onAddMgmtProperty={handleAddMgmtProperty} staffRows={staffRows} policies={policies} />
        ) : (
          <DashboardHome onNavigate={openModule} agencyName={agencyName} staffRows={staffRows} salesProps={salesProps} mgmtProps={mgmtProps} policies={policies} />
        )}
      </div>
    </div>
  );
}
