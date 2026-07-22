"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Document } from "@/lib/supabase";

// --- Data ---

const initialSalesProperties: { id: string; address: string; vendorName?: string; addedAt?: string }[] = [
  { id: "s1", address: "42 Harbour View Rd, Balmain" },
  { id: "s2", address: "8/15 Park Lane, Surry Hills" },
  { id: "s3", address: "3 Clifton Ave, Mosman" },
  { id: "s4", address: "12 Marine Parade, Manly" },
  { id: "s5", address: "7 Rose Bay Dr, Rose Bay" },
];

const managementProperties = [
  { id: "m1", address: "14 Brunswick St, Newtown" },
  { id: "m2", address: "2/88 Oxford St, Paddington" },
  { id: "m3", address: "5 Crown St, Darlinghurst" },
  { id: "m4", address: "31 King St, Randwick" },
  { id: "m5", address: "19 Glebe Point Rd, Glebe" },
];

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

// --- Icons ---
function PolIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4h10M4 8h7M4 12h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function SalesIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 13L7 8l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MgmtIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="9" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="7" y="5" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="12" y="2" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.6" /></svg>; }
function StaffIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function TrustIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M2 8h14" stroke="currentColor" strokeWidth="1.6" /><path d="M6 12h2M10 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }

const iconMap: Record<string, React.ReactNode> = {
  policies: <PolIcon />, sales: <SalesIcon />, management: <MgmtIcon />, staff: <StaffIcon />, trust: <TrustIcon />,
};

// --- Types ---
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
}: {
  propertyId: string;
  address: string;
  type: "sales" | "management";
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
}: {
  propertyId: string;
  address: string;
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
  {
    id: "policies",
    label: "Policies & Procedures",
    icon: <PolIcon />,
    score: 78,
    detail: "3 policies due for review",
    status: "warning" as const,
  },
  {
    id: "sales",
    label: "Residential Sales",
    icon: <SalesIcon />,
    score: 60,
    detail: "2 of 5 properties fully compliant",
    status: "warning" as const,
  },
  {
    id: "management",
    label: "Residential Management",
    icon: <MgmtIcon />,
    score: 72,
    detail: "3 of 5 properties fully compliant",
    status: "warning" as const,
  },
  {
    id: "staff",
    label: "Staff",
    icon: <StaffIcon />,
    score: 90,
    detail: "9 of 10 licences current",
    status: "good" as const,
  },
  {
    id: "trust",
    label: "Trust Accounting",
    icon: <TrustIcon />,
    score: 95,
    detail: "Reconciliation up to date",
    status: "good" as const,
  },
];

const scoreHistory = [
  { month: "Aug '25", score: 58 },
  { month: "Sep '25", score: 62 },
  { month: "Oct '25", score: 61 },
  { month: "Nov '25", score: 65 },
  { month: "Dec '25", score: 68 },
  { month: "Jan '26", score: 70 },
  { month: "Feb '26", score: 72 },
  { month: "Mar '26", score: 75 },
  { month: "Apr '26", score: 71 },
  { month: "May '26", score: 74 },
  { month: "Jun '26", score: 77 },
  { month: "Jul '26", score: 79 },
];

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

function ComplianceChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 840; const H = 240;
  const PL = 42; const PR = 56; const PT = 18; const PB = 30;
  const cW = W - PL - PR; const cH = H - PT - PB;

  const visibleHistory = scoreHistory.slice(-3);
  const scores = visibleHistory.map(d => d.score);
  const dataMin = Math.min(...scores);
  const dataMax = Math.max(...scores);
  // Pad 15% above and below to fill height nicely
  const pad = Math.max(Math.ceil((dataMax - dataMin) * 0.35), 4);
  const yMin = Math.floor((dataMin - pad) / 5) * 5;
  const yMax = Math.ceil((dataMax + pad) / 5) * 5;

  const xPos = (i: number) => PL + (i / (visibleHistory.length - 1)) * cW;
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



function DashboardHome({ onNavigate }: { onNavigate: (id: string) => void }) {
  const overallScore = Math.round(moduleOverview.reduce((sum, m) => sum + m.score, 0) / moduleOverview.length);
  const scoreLabel = overallScore >= 85 ? "Good standing" : overallScore >= 65 ? "Needs attention" : "Action required";
  const badgeColor = overallScore >= 85 ? "oklch(0.46 0.13 145)" : overallScore >= 65 ? "oklch(0.50 0.12 55)" : "oklch(0.46 0.18 25)";
  const badgeBg = overallScore >= 85 ? "oklch(0.94 0.04 145)" : overallScore >= 65 ? "oklch(0.96 0.04 55)" : "oklch(0.95 0.05 25)";

  const stats: { label: string; value: string; detail: string; warn: boolean }[] = [
    { label: "Properties", value: "10 total", detail: "5 sales · 5 managed", warn: false },
    { label: "Staff licensed", value: "9 of 10", detail: "1 renewal due", warn: true },
    { label: "Policies current", value: "12 of 15", detail: "3 due for review", warn: true },
    { label: "Trust accounts", value: "Reconciled", detail: "As of today", warn: false },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", padding: "32px 44px 28px", gap: "18px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0, paddingBottom: "22px", borderBottom: "1px solid var(--rc-border)" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.035em", lineHeight: 1.15 }}>Business Overview</h1>
          <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none", marginTop: "5px" }}>
            Ray White Bondi Junction · {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
          const trackColor = m.score >= 85 ? "var(--rc-primary)" : m.score >= 65 ? "oklch(0.58 0.13 55)" : "oklch(0.52 0.18 25)";
          const pctColor = m.score >= 85 ? "oklch(0.38 0.12 260)" : m.score >= 65 ? "oklch(0.44 0.12 55)" : "oklch(0.44 0.17 25)";
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
                <div style={{ width: `${m.score}%`, height: "100%", background: trackColor, borderRadius: "100px" }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: pctColor, textAlign: "right", letterSpacing: "-0.02em" }}>{m.score}%</span>
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
            <ComplianceChart />
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Module overview data ---

const modulePolicies = [
  { name: "Supervision Guidelines", status: "current" as const, lastReviewed: "Feb 2026", nextReview: "Feb 2027" },
  { name: "Privacy & Data Collection Policy", status: "review-due" as const, lastReviewed: "Sep 2025", nextReview: "Sep 2026" },
  { name: "AML & Counter-Terrorism Financing Policy", status: "review-due" as const, lastReviewed: "Oct 2025", nextReview: "Oct 2026" },
  { name: "Trust Accounting Procedures", status: "current" as const, lastReviewed: "Mar 2026", nextReview: "Mar 2027" },
  { name: "Work Health & Safety Policy", status: "review-due" as const, lastReviewed: "Nov 2025", nextReview: "Nov 2026" },
  { name: "Complaints Handling Procedure", status: "current" as const, lastReviewed: "Dec 2025", nextReview: "Dec 2026" },
  { name: "Social Media & Marketing Policy", status: "current" as const, lastReviewed: "Apr 2026", nextReview: "Apr 2027" },
  { name: "Residential Tenancies Act Compliance Procedure", status: "current" as const, lastReviewed: "Jan 2026", nextReview: "Jan 2027" },
  { name: "Conflicts of Interest Policy", status: "current" as const, lastReviewed: "Mar 2026", nextReview: "Mar 2027" },
  { name: "Record Keeping & Document Retention Policy", status: "review-due" as const, lastReviewed: "Aug 2025", nextReview: "Aug 2026" },
];

const staffMembers = [
  { name: "Sarah Mitchell", role: "Principal", licence: "current" as const, expiry: "Nov 2026", cpd: "complete" as const },
  { name: "James Chen", role: "Sales Agent", licence: "current" as const, expiry: "Mar 2027", cpd: "complete" as const },
  { name: "Emma Watson", role: "Property Manager", licence: "current" as const, expiry: "Jun 2026", cpd: "complete" as const },
  { name: "Tom Richards", role: "Sales Agent", licence: "current" as const, expiry: "Sep 2026", cpd: "due-soon" as const },
  { name: "Lisa Park", role: "Property Manager", licence: "current" as const, expiry: "Feb 2027", cpd: "complete" as const },
  { name: "Mark Johnson", role: "Sales Agent", licence: "current" as const, expiry: "Dec 2026", cpd: "complete" as const },
  { name: "Anna Brown", role: "Admin", licence: "exempt" as const, expiry: "—", cpd: "na" as const },
  { name: "Chris Davis", role: "Sales Agent", licence: "renewal-due" as const, expiry: "Aug 2026", cpd: "overdue" as const },
  { name: "Olivia Taylor", role: "Property Manager", licence: "current" as const, expiry: "Jan 2027", cpd: "complete" as const },
  { name: "Ryan White", role: "Business Dev", licence: "current" as const, expiry: "May 2027", cpd: "complete" as const },
];

const trustAccounts = [
  { name: "Sales Trust Account", bank: "CommBank ****4521", balance: "$284,500", lastReconciled: "Today", status: "reconciled" as const },
  { name: "Rental Trust Account", bank: "CommBank ****8834", balance: "$42,180", lastReconciled: "Today", status: "reconciled" as const },
];

const trustTransactions = [
  { description: "Deposit — 8/15 Park Lane", amount: "+$22,000", date: "Today", type: "credit" as const },
  { description: "Bond lodged — 14 Brunswick St", amount: "+$2,400", date: "Yesterday", type: "credit" as const },
  { description: "Disbursement — 3 Clifton Ave", amount: "-$18,500", date: "19 Jul", type: "debit" as const },
  { description: "Rent receipt — 5 Crown St", amount: "+$2,800", date: "18 Jul", type: "credit" as const },
  { description: "Agent fees — 12 Marine Parade", amount: "-$4,200", date: "17 Jul", type: "debit" as const },
];

// --- Module Overview ---

function StatusPill({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color, background: bg, border: `1px solid ${border}`, padding: "3px 10px", borderRadius: "100px", whiteSpace: "nowrap", flexShrink: 0 }}>
      {label}
    </span>
  );
}

function ModuleOverview({ moduleId, onSelectProperty, salesProps, onAddSalesProperty }: {
  moduleId: string;
  onSelectProperty: (prop: { type: "property"; section: "sales" | "management"; id: string; address: string }) => void;
  salesProps: SalesPropItem[];
  onAddSalesProperty: (prop: Required<SalesPropItem>) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addrInput, setAddrInput] = useState("");
  const [vendorInput, setVendorInput] = useState("");

  function submitAdd() {
    if (!addrInput.trim()) return;
    onAddSalesProperty({
      id: `s${Date.now()}`,
      address: addrInput.trim(),
      vendorName: vendorInput.trim(),
      addedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    });
    setAddrInput("");
    setVendorInput("");
    setShowAdd(false);
  }

  const mod = moduleOverview.find(m => m.id === moduleId)!;
  const scoreColor = mod.score >= 85 ? "oklch(0.42 0.14 145)" : mod.score >= 65 ? "oklch(0.50 0.14 55)" : "oklch(0.50 0.20 25)";
  const barColor = mod.score >= 85 ? "oklch(0.60 0.16 145)" : mod.score >= 65 ? "oklch(0.65 0.16 55)" : "oklch(0.58 0.20 25)";
  const scoreLabel = mod.score >= 85 ? "Good standing" : mod.score >= 65 ? "Needs attention" : "Action required";

  // Per-module stats and list content
  let stats: { label: string; value: string; sub: string }[] = [];
  let sectionLabel = "";
  let content: React.ReactNode = null;

  if (moduleId === "policies") {
    const current = modulePolicies.filter(p => p.status === "current").length;
    const due = modulePolicies.filter(p => p.status === "review-due").length;
    stats = [
      { label: "Total policies", value: String(modulePolicies.length), sub: "In library" },
      { label: "Current", value: String(current), sub: "Up to date" },
      { label: "Due for review", value: String(due), sub: "Action needed" },
      { label: "Overdue", value: "0", sub: "None overdue" },
    ];
    content = (
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 110px", padding: "10px 20px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)", flexShrink: 0 }}>
          {["Policy", "Status", "Last reviewed", "Next review"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>{h}</span>
          ))}
        </div>
        {modulePolicies.map((p, i) => (
          <div key={p.name} style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 110px", padding: "0 20px", flex: 1, borderBottom: i < modulePolicies.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)" }}>{p.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: p.status === "current" ? "oklch(0.55 0.16 145)" : "oklch(0.60 0.14 55)" }} />
              <span style={{ fontSize: "12.5px", color: p.status === "current" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{p.status === "current" ? "Current" : "Review due"}</span>
            </div>
            <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{p.lastReviewed}</span>
            <span style={{ fontSize: "12.5px", color: p.status === "review-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)" }}>{p.nextReview}</span>
          </div>
        ))}
      </div>
    );
  }

  if (moduleId === "sales" || moduleId === "management") {
    const props = moduleId === "sales" ? salesProps : managementProperties;
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
            <div key={prop.id} style={{ display: "grid", gridTemplateColumns: "1fr 200px 56px 110px", alignItems: "center", gap: "20px", padding: "12px 24px", borderBottom: i < props.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
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
              <button
                onClick={() => onSelectProperty({ type: "property", section, id: prop.id, address: prop.address })}
                style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: "0", cursor: "pointer", fontFamily: "var(--font-inter)", whiteSpace: "nowrap", textAlign: "right", transition: "color 0.1s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--rc-ink)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--rc-faint)"; }}
              >
                View checklist →
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  if (moduleId === "staff") {
    const current = staffMembers.filter(s => s.licence === "current" || s.licence === "exempt").length;
    const renewalDue = staffMembers.filter(s => s.licence === "renewal-due").length;
    const cpdDue = staffMembers.filter(s => s.cpd === "due-soon" || s.cpd === "overdue").length;
    stats = [
      { label: "Team members", value: String(staffMembers.length), sub: "Total staff" },
      { label: "Licensed", value: String(current), sub: "Current or exempt" },
      { label: "Renewal due", value: String(renewalDue), sub: "Action needed" },
      { label: "CPD attention", value: String(cpdDue), sub: "Due or overdue" },
    ];
    content = (
      <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 130px 90px 100px", padding: "10px 20px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)", flexShrink: 0 }}>
          {["Name", "Role", "Licence", "Expiry", "CPD"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>{h}</span>
          ))}
        </div>
        {staffMembers.map((s, i) => {
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
            <div key={s.name} style={{ display: "grid", gridTemplateColumns: "1fr 140px 130px 90px 100px", padding: "0 20px", flex: 1, borderBottom: i < staffMembers.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)" }}>{s.name}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{s.role}</span>
              {licenceEl}
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{s.expiry}</span>
              {cpdEl}
            </div>
          );
        })}
      </div>
    );
  }

  if (moduleId === "trust") {
    stats = [
      { label: "Trust accounts", value: "2", sub: "Sales & rental" },
      { label: "Last reconciled", value: "Today", sub: "Both accounts" },
      { label: "Entries this month", value: "47", sub: "Transactions" },
      { label: "AML checks", value: "100%", sub: "All complete" },
    ];
    content = (
      <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0 }}>
        {/* Account cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "260px", flexShrink: 0 }}>
          {trustAccounts.map(acc => (
            <div key={acc.name} style={{ border: "1px solid var(--rc-border)", background: "var(--rc-bg)", borderRadius: "12px", padding: "20px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "var(--rc-shadow-sm)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "oklch(0.55 0.16 145)" }} />
                  <span style={{ fontSize: "11.5px", color: "oklch(0.42 0.12 145)" }}>Reconciled</span>
                </div>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--rc-ink)", marginBottom: "3px" }}>{acc.name}</p>
                <p style={{ fontSize: "12px", color: "var(--rc-faint)", maxWidth: "none" }}>{acc.bank}</p>
              </div>
              <div>
                <p style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.03em", marginBottom: "2px" }}>{acc.balance}</p>
                <p style={{ fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none" }}>Reconciled {acc.lastReconciled.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Transactions */}
        <div style={{ flex: 1, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--rc-shadow-sm)" }}>
          <div style={{ padding: "11px 20px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)" }}>
            <span style={{ fontSize: "11.5px", color: "var(--rc-faint)" }}>Recent transactions</span>
          </div>
          {trustTransactions.map((tx, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr 70px 80px", alignItems: "center", gap: "14px", padding: "0 20px", flex: 1, borderBottom: i < trustTransactions.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
              <span style={{ fontSize: "13px", color: tx.type === "credit" ? "oklch(0.50 0.14 145)" : "oklch(0.50 0.14 25)", fontWeight: 500 }}>{tx.type === "credit" ? "↑" : "↓"}</span>
              <p style={{ fontSize: "13px", color: "var(--rc-ink)", fontWeight: 500, margin: 0 }}>{tx.description}</p>
              <span style={{ fontSize: "12px", color: "var(--rc-faint)", textAlign: "right" }}>{tx.date}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: tx.type === "credit" ? "oklch(0.38 0.12 145)" : "oklch(0.46 0.18 25)", textAlign: "right" }}>{tx.amount}</span>
            </div>
          ))}
        </div>
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
          <p style={{ fontSize: "12.5px", color: "var(--rc-faint)", maxWidth: "none", marginTop: "1px" }}>{mod.detail}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {moduleId === "sales" && (
            <button
              onClick={() => setShowAdd(true)}
              style={{ fontSize: "12.5px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              + Add property
            </button>
          )}
          <div style={{ width: "80px", height: "2px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ width: `${mod.score}%`, height: "100%", background: barColor, borderRadius: "100px" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: scoreColor }}>{mod.score}%</span>
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
          onClick={() => setShowAdd(false)}
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
                  onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") setShowAdd(false); }}
                  placeholder="e.g. 42 Harbour View Rd, Balmain"
                  style={inputSty2}
                />
              </div>
              <div>
                <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--rc-faint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Vendor name <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
                <input
                  value={vendorInput}
                  onChange={(e) => setVendorInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") setShowAdd(false); }}
                  placeholder="e.g. John & Mary Thompson"
                  style={inputSty2}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowAdd(false)}
                style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                style={{ fontSize: "13px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
              >
                Add property
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

const auditReports = [
  { name: "Annual Compliance Report — FY 2025/26", generated: "1 Jul 2026", type: "Annual", pages: 24 },
  { name: "Trust Account Audit — Q4 2025/26", generated: "30 Jun 2026", type: "Trust", pages: 8 },
  { name: "AML/CTF Compliance Review — Jun 2026", generated: "15 Jun 2026", type: "AML", pages: 12 },
  { name: "Staff Licencing Audit — Jun 2026", generated: "10 Jun 2026", type: "Staff", pages: 6 },
  { name: "Trust Account Audit — Q3 2025/26", generated: "31 Mar 2026", type: "Trust", pages: 9 },
  { name: "Annual Compliance Report — FY 2024/25", generated: "1 Jul 2025", type: "Annual", pages: 22 },
];

const allTransactions = [
  { description: "Deposit — 8/15 Park Lane", account: "Sales Trust", amount: "+$22,000", date: "Today", type: "credit" as const },
  { description: "Bond lodged — 14 Brunswick St", account: "Rental Trust", amount: "+$2,400", date: "Yesterday", type: "credit" as const },
  { description: "Disbursement — 3 Clifton Ave", account: "Sales Trust", amount: "-$18,500", date: "19 Jul", type: "debit" as const },
  { description: "Rent received — 5 Crown St", account: "Rental Trust", amount: "+$2,800", date: "18 Jul", type: "credit" as const },
  { description: "Agent fees — 12 Marine Parade", account: "Sales Trust", amount: "-$4,200", date: "17 Jul", type: "debit" as const },
  { description: "Bond lodged — 31 King St", account: "Rental Trust", amount: "+$2,200", date: "16 Jul", type: "credit" as const },
  { description: "Rent received — 19 Glebe Point Rd", account: "Rental Trust", amount: "+$3,100", date: "15 Jul", type: "credit" as const },
  { description: "Disbursement — 7 Rose Bay Dr", account: "Sales Trust", amount: "-$32,000", date: "14 Jul", type: "debit" as const },
  { description: "Deposit — 42 Harbour View Rd", account: "Sales Trust", amount: "+$45,000", date: "12 Jul", type: "credit" as const },
  { description: "Management fees — Jul 2026", account: "Rental Trust", amount: "-$8,400", date: "11 Jul", type: "debit" as const },
];

const amlChecks = [
  { address: "42 Harbour View Rd, Balmain", party: "John & Mary Thompson", type: "Vendor", verified: true, date: "12 May 2026", method: "Document verification" },
  { address: "8/15 Park Lane, Surry Hills", party: "David Chen", type: "Vendor", verified: true, date: "3 Jun 2026", method: "Document verification" },
  { address: "3 Clifton Ave, Mosman", party: "Sarah & Peter Williams", type: "Vendor", verified: true, date: "28 Apr 2026", method: "Document verification" },
  { address: "12 Marine Parade, Manly", party: "Estate of R. Jones", type: "Vendor", verified: false, date: "—", method: "Pending" },
  { address: "7 Rose Bay Dr, Rose Bay", party: "Michael & Lisa Park", type: "Vendor", verified: true, date: "15 Mar 2026", method: "Document verification" },
  { address: "14 Brunswick St, Newtown", party: "Jake Morrison", type: "Tenant", verified: true, date: "1 Jul 2026", method: "Document verification" },
  { address: "2/88 Oxford St, Paddington", party: "Aisha Patel", type: "Tenant", verified: true, date: "20 Jun 2026", method: "Document verification" },
  { address: "5 Crown St, Darlinghurst", party: "Tom & Linda Harris", type: "Tenant", verified: true, date: "15 Jun 2026", method: "Document verification" },
  { address: "31 King St, Randwick", party: "Zhang Wei", type: "Tenant", verified: true, date: "10 Jun 2026", method: "Document verification" },
  { address: "19 Glebe Point Rd, Glebe", party: "Sophie & Marcus Young", type: "Tenant", verified: true, date: "5 Jun 2026", method: "Document verification" },
];

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

const cpdData = staffMembers.map((s, i) => ({
  ...s,
  required: s.licence === "exempt" ? 0 : 12,
  completed: [12, 12, 12, 8, 12, 12, 0, 4, 12, 12][i],
  deadline: ["Nov 2026", "Mar 2027", "Jun 2026", "Sep 2026", "Feb 2027", "Dec 2026", "—", "Aug 2026", "Jan 2027", "May 2027"][i],
}));

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
      <div style={{ display: "grid", gridTemplateColumns: cols, ...TH, padding: "10px 20px", display: "contents" }}>
        {/* children render as display:contents */}
      </div>
      {children}
    </div>
  );
}

function AllPoliciesPage() {
  const [search, setSearch] = useState("");
  const filtered = modulePolicies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const cols = "minmax(0,1fr) 110px 130px 130px 110px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>All Policies</h1>
          <p style={PAGE_SUB}>{modulePolicies.length} documents in library</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policies…"
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--rc-border)", fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-bg)", fontFamily: "var(--font-inter)", outline: "none", width: "220px" }}
          onFocus={e => (e.target.style.borderColor = "var(--rc-primary)")} onBlur={e => (e.target.style.borderColor = "var(--rc-border)")} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Policy name", "Status", "Last reviewed", "Next review", "Action"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((p, i) => (
            <div key={p.name} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "14px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 20px" }}>
                {p.status === "current" ? <GreenDot /> : <AmberDot />}
                <span style={{ fontSize: "12.5px", color: p.status === "current" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{p.status === "current" ? "Current" : "Review due"}</span>
              </div>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{p.lastReviewed}</span>
              <span style={{ fontSize: "12.5px", color: p.status === "review-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)", padding: "0 20px" }}>{p.nextReview}</span>
              <div style={{ padding: "0 20px" }}>
                <button style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "color 0.1s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--rc-ink)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>
                  {p.status === "review-due" ? "Mark reviewed →" : "View →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
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
      { id: "principal", label: "Principal licensee name", placeholder: "e.g. Sarah Mitchell" },
      { id: "staffCount", label: "Number of licensed staff supervised", placeholder: "e.g. 9" },
      { id: "method", label: "Primary supervision method", placeholder: "e.g. weekly team meetings and daily check-ins", multiline: true },
      { id: "records", label: "How are supervision records kept?", placeholder: "e.g. recorded in RealComply and reviewed monthly", multiline: true },
      { id: "review", label: "How often is this policy reviewed?", placeholder: "e.g. Annually, or following any regulatory change" },
    ],
    generate: (a) => `SUPERVISION GUIDELINES\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. PURPOSE\nThis document sets out the supervision arrangements for ${a.agency} in accordance with the Property and Stock Agents Act 2002 (NSW) and associated Regulation.\n\n2. PRINCIPAL LICENSEE\n${a.principal} is the Principal Licensee responsible for supervising all licensed and certificate-holding staff. The Principal Licensee ensures that all agency activities comply with applicable legislation, regulations, and codes of conduct.\n\n3. SCOPE\nThese guidelines apply to all ${a.staffCount} licensed staff and certificate holders employed by or engaged under ${a.agency}.\n\n4. SUPERVISION METHOD\n${a.method}\n\nThe Principal Licensee is available during all business hours and maintains open communication with all staff. Where the Principal Licensee is absent, a nominated senior licensee will act in a supervisory capacity.\n\n5. RECORD KEEPING\n${a.records}\n\nSupervision records are retained for a minimum of three (3) years and are available for inspection by NSW Fair Trading on request.\n\n6. REVIEW\nThis policy is reviewed ${a.review}. The Principal Licensee is responsible for ensuring the policy remains current and reflects any changes in legislation or agency practice.\n\n_________________________\n${a.principal} — Principal Licensee\n${a.agency}`,
  },
  {
    name: "Privacy Policy", category: "Compliance",
    description: "Outlines how your agency collects, uses, stores and discloses personal information.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "principal", label: "Privacy officer / principal name", placeholder: "e.g. Sarah Mitchell" },
      { id: "infoTypes", label: "Types of personal information collected", placeholder: "e.g. names, contact details, financial information, identification documents", multiline: true },
      { id: "purpose", label: "Primary purpose for collecting information", placeholder: "e.g. to facilitate property sales, leasing and property management services", multiline: true },
      { id: "storage", label: "How is personal information stored?", placeholder: "e.g. secure cloud-based CRM and encrypted physical files" },
      { id: "retention", label: "Retention period for records", placeholder: "e.g. 7 years after the conclusion of the relevant transaction" },
      { id: "contact", label: "Privacy enquiries contact (email or phone)", placeholder: "e.g. privacy@agency.com.au" },
    ],
    generate: (a) => `PRIVACY POLICY\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. COMMITMENT TO PRIVACY\n${a.agency} is committed to protecting the privacy of our clients, vendors, tenants and other individuals in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).\n\n2. INFORMATION WE COLLECT\nWe collect the following types of personal information: ${a.infoTypes}.\n\nWe collect this information directly from individuals where possible, and may also receive it from third parties such as referral agents, financial institutions, or publicly available sources.\n\n3. PURPOSE OF COLLECTION\nPersonal information is collected and used ${a.purpose}.\n\nWe will only use or disclose personal information for the primary purpose for which it was collected, or for a related secondary purpose the individual would reasonably expect.\n\n4. STORAGE & SECURITY\nPersonal information is stored ${a.storage}. We take reasonable steps to protect personal information from misuse, interference, loss, unauthorised access, modification or disclosure.\n\n5. RETENTION & DISPOSAL\nPersonal information is retained for ${a.retention}, after which it is securely destroyed or de-identified.\n\n6. ACCESS & CORRECTION\nIndividuals may request access to or correction of their personal information held by us. Requests should be directed to our Privacy Officer.\n\n7. CONTACT\nPrivacy enquiries can be directed to: ${a.contact}\nPrivacy Officer: ${a.principal}\n${a.agency}`,
  },
  {
    name: "AML & CTF Policy", category: "Compliance",
    description: "Anti-Money Laundering and Counter-Terrorism Financing policy for real estate agents.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "officer", label: "AML Compliance Officer name", placeholder: "e.g. Sarah Mitchell" },
      { id: "verification", label: "Customer identity verification method", placeholder: "e.g. certified copy of driver licence or passport plus secondary document", multiline: true },
      { id: "riskRating", label: "Risk rating approach", placeholder: "e.g. low / medium / high rating applied based on AUSTRAC guidance and transaction type", multiline: true },
      { id: "records", label: "Record retention period", placeholder: "e.g. 7 years from date of transaction" },
      { id: "training", label: "Staff AML training frequency", placeholder: "e.g. annually and on commencement" },
    ],
    generate: (a) => `AML & COUNTER-TERRORISM FINANCING POLICY\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. PURPOSE\nThis policy sets out the obligations of ${a.agency} under the Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (Cth) (AML/CTF Act) and associated Rules, as they apply to real estate agency services.\n\n2. AML COMPLIANCE OFFICER\n${a.officer} is appointed as the AML Compliance Officer and is responsible for overseeing the implementation of this policy, maintaining the AML/CTF Programme, and reporting to AUSTRAC as required.\n\n3. CUSTOMER DUE DILIGENCE (CDD)\nBefore providing a designated service, ${a.agency} will verify the identity of all customers. Our standard verification procedure requires: ${a.verification}.\n\nEnhanced due diligence is applied where higher risk indicators are present.\n\n4. RISK ASSESSMENT\n${a.riskRating}\n\nRisk ratings are reviewed at each transaction and documented in the client file.\n\n5. RECORD KEEPING\nAll AML/CTF records, including identification documents and transaction records, are retained for ${a.records} and are available to AUSTRAC on request.\n\n6. SUSPICIOUS MATTER REPORTING\nAll staff must report any suspicious matter to the AML Compliance Officer immediately. The Compliance Officer is responsible for lodging Suspicious Matter Reports (SMRs) with AUSTRAC where required.\n\n7. STAFF TRAINING\nAll staff receive AML/CTF training ${a.training}. Training records are maintained by the Compliance Officer.\n\n_________________________\n${a.officer} — AML Compliance Officer\n${a.agency}`,
  },
  {
    name: "WHS Policy", category: "Staff",
    description: "Work Health and Safety policy establishing duties and procedures for your agency.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "principal", label: "Person responsible for WHS (PCBU)", placeholder: "e.g. Sarah Mitchell" },
      { id: "firstAid", label: "First aid officer name", placeholder: "e.g. Anna Brown" },
      { id: "hazardProcess", label: "Hazard identification and reporting process", placeholder: "e.g. staff complete a hazard report form and notify the principal within 24 hours", multiline: true },
      { id: "emergency", label: "Emergency contact / procedure", placeholder: "e.g. call 000, then notify principal on 0400 000 000" },
      { id: "review", label: "WHS policy review frequency", placeholder: "e.g. annually or following any workplace incident" },
    ],
    generate: (a) => `WORK HEALTH AND SAFETY POLICY\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. COMMITMENT\n${a.agency} is committed to providing a safe and healthy workplace for all workers, contractors and visitors, in compliance with the Work Health and Safety Act 2011 (NSW).\n\n2. RESPONSIBILITIES\n${a.principal} (Person Conducting a Business or Undertaking — PCBU) has primary responsibility for WHS at ${a.agency}. This includes identifying hazards, assessing and controlling risks, and ensuring all workers have the information, training and supervision needed to work safely.\n\nAll workers are responsible for taking reasonable care of their own health and safety and that of others, and for cooperating with WHS procedures.\n\n3. FIRST AID\n${a.firstAid} is the designated First Aid Officer. A first aid kit is maintained on the premises and is inspected regularly.\n\n4. HAZARD IDENTIFICATION & REPORTING\n${a.hazardProcess}\n\nAll incidents, near-misses and hazards are recorded and investigated promptly. Where required, incidents are notified to SafeWork NSW.\n\n5. EMERGENCY PROCEDURES\n${a.emergency}\n\nEvacuation procedures are posted at all exits. Emergency drills are conducted periodically.\n\n6. REVIEW\nThis policy is reviewed ${a.review}, or following any significant workplace incident, change in legislation, or change in workplace conditions.\n\n_________________________\n${a.principal} — PCBU\n${a.agency}`,
  },
  {
    name: "Complaints Handling Procedure", category: "Admin",
    description: "Sets out how your agency receives, manages and resolves client complaints.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "officer", label: "Complaints officer name", placeholder: "e.g. Sarah Mitchell" },
      { id: "contactMethod", label: "How can complaints be lodged?", placeholder: "e.g. in writing by email to complaints@agency.com.au or in person" },
      { id: "acknowledgement", label: "Acknowledgement timeframe", placeholder: "e.g. within 2 business days of receipt" },
      { id: "resolution", label: "Target resolution timeframe", placeholder: "e.g. within 10 business days" },
      { id: "escalation", label: "Escalation process if unresolved", placeholder: "e.g. referral to NSW Fair Trading or appointment of independent mediator", multiline: true },
    ],
    generate: (a) => `COMPLAINTS HANDLING PROCEDURE\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. PURPOSE\n${a.agency} is committed to resolving complaints fairly, promptly and transparently. This procedure applies to all complaints received from clients, vendors, tenants and members of the public.\n\n2. COMPLAINTS OFFICER\n${a.officer} is the designated Complaints Officer and is responsible for receiving, investigating and resolving complaints.\n\n3. HOW TO LODGE A COMPLAINT\nComplaints may be lodged ${a.contactMethod}. Anonymous complaints will be considered where sufficient detail is provided to permit investigation.\n\n4. ACKNOWLEDGEMENT\nAll complaints will be acknowledged ${a.acknowledgement}. The acknowledgement will confirm receipt of the complaint and provide an estimated timeframe for resolution.\n\n5. INVESTIGATION & RESOLUTION\nComplaints will be investigated thoroughly and impartially. The complainant will be kept informed of progress. We aim to resolve all complaints ${a.resolution}.\n\n6. ESCALATION\nIf a complaint cannot be resolved to the complainant's satisfaction: ${a.escalation}.\n\n7. RECORD KEEPING\nAll complaints and their outcomes are recorded and retained for a minimum of three (3) years. Records are reviewed periodically to identify systemic issues and improve service quality.\n\n_________________________\n${a.officer} — Complaints Officer\n${a.agency}`,
  },
  {
    name: "Trust Accounting Procedures", category: "Trust",
    description: "Procedures for receiving, holding and disbursing trust monies in compliance with legislation.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "licensee", label: "Licensee in charge of trust accounts", placeholder: "e.g. Sarah Mitchell" },
      { id: "signatories", label: "Authorised account signatories", placeholder: "e.g. Sarah Mitchell and James Chen" },
      { id: "reconciliation", label: "Reconciliation frequency", placeholder: "e.g. monthly, on the last business day of each month" },
      { id: "audit", label: "Annual audit arrangement", placeholder: "e.g. conducted by an approved auditor within 3 months of the end of each financial year" },
      { id: "software", label: "Trust accounting software used", placeholder: "e.g. PropertyMe / Console Cloud / Managed" },
    ],
    generate: (a) => `TRUST ACCOUNTING PROCEDURES\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. PURPOSE\nThese procedures govern the receipt, holding, disbursement and accounting of trust monies by ${a.agency} in accordance with the Property and Stock Agents Act 2002 (NSW) and the Property and Stock Agents Regulation 2014 (NSW).\n\n2. RESPONSIBILITY\n${a.licensee} is the Licensee in Charge and holds primary responsibility for the management and integrity of all trust accounts held by ${a.agency}.\n\n3. AUTHORISED SIGNATORIES\nOnly the following persons are authorised to operate trust accounts: ${a.signatories}. No other person may withdraw trust funds without written authorisation from the Licensee in Charge.\n\n4. RECEIPTING & PAYMENT\nAll trust money received must be receipted immediately and deposited into the trust account on the same day of receipt (or the next business day if received after banking hours). Disbursements must be supported by a written authority from the client.\n\n5. RECONCILIATION\nTrust account reconciliations are conducted ${a.reconciliation}. Reconciliation records are signed by the Licensee in Charge and retained for a minimum of three (3) years.\n\n6. SOFTWARE\nTrust accounting is conducted using ${a.software}. All records produced by this system are retained as required by legislation.\n\n7. ANNUAL AUDIT\nAn annual audit of trust accounts is ${a.audit}. Any deficiencies identified are reported to NSW Fair Trading as required.\n\n_________________________\n${a.licensee} — Licensee in Charge\n${a.agency}`,
  },
  {
    name: "Social Media Policy", category: "Marketing",
    description: "Guidelines for staff use of social media in a professional and compliant manner.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "platforms", label: "Approved social media platforms", placeholder: "e.g. Facebook, Instagram, LinkedIn" },
      { id: "approval", label: "Approval process for posts", placeholder: "e.g. all property listings and promotional content must be approved by the principal before publishing", multiline: true },
      { id: "prohibited", label: "Prohibited content (examples)", placeholder: "e.g. client personal information, misleading claims, discriminatory content, undisclosed testimonials", multiline: true },
      { id: "breach", label: "Consequence of policy breach", placeholder: "e.g. formal warning, and potential termination for serious or repeated breaches" },
    ],
    generate: (a) => `SOCIAL MEDIA POLICY\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. PURPOSE\nThis policy governs the use of social media by ${a.agency} and its staff in connection with the agency's business, in compliance with the Australian Consumer Law, the Privacy Act 1988 (Cth), and applicable advertising standards.\n\n2. APPROVED PLATFORMS\nThe agency maintains an official presence on the following platforms: ${a.platforms}. Staff must not create unofficial agency accounts or pages without prior approval.\n\n3. CONTENT APPROVAL\n${a.approval}\n\nStaff must ensure that all content is accurate, truthful and compliant with consumer protection laws and real estate advertising standards.\n\n4. PROHIBITED CONTENT\nThe following content must not be published on any platform: ${a.prohibited}.\n\nStaff must also comply with platform-specific terms of service and avoid any conduct that could damage the agency's reputation.\n\n5. PERSONAL USE\nStaff using personal social media accounts must make clear that views expressed are their own and do not represent ${a.agency}. Staff must not disclose confidential client or business information on personal accounts.\n\n6. BREACH\n${a.breach}. Breaches may also constitute a breach of the Property and Stock Agents Act 2002 (NSW) and may be reported to the relevant authority.\n\n_________________________\nPrincipal\n${a.agency}`,
  },
  {
    name: "Record Keeping Policy", category: "Compliance",
    description: "Establishes standards for the creation, storage and disposal of agency records.",
    questions: [
      { id: "agency", label: "Agency / business name", placeholder: "e.g. Ray White Bondi Junction" },
      { id: "responsible", label: "Person responsible for records management", placeholder: "e.g. Sarah Mitchell" },
      { id: "recordTypes", label: "Key record types covered", placeholder: "e.g. trust accounting records, agency agreements, sales contracts, AML/CTF records, staff files", multiline: true },
      { id: "storage", label: "Storage systems used", placeholder: "e.g. cloud-based CRM, encrypted server, and locked physical filing" },
      { id: "retention", label: "Standard retention period", placeholder: "e.g. minimum 7 years from date of transaction for financial records; 3 years for operational records" },
      { id: "disposal", label: "Disposal method for sensitive records", placeholder: "e.g. secure shredding for physical documents; verified deletion for digital records" },
    ],
    generate: (a) => `RECORD KEEPING POLICY\n${a.agency}\n\nEFFECTIVE DATE: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n\n1. PURPOSE\nThis policy establishes minimum standards for the creation, maintenance, storage and disposal of records at ${a.agency}, in compliance with the Property and Stock Agents Act 2002 (NSW), Property and Stock Agents Regulation 2014 (NSW), Privacy Act 1988 (Cth), and other applicable legislation.\n\n2. RESPONSIBILITY\n${a.responsible} is responsible for overseeing record keeping practices and ensuring compliance with this policy.\n\n3. RECORDS COVERED\nThis policy applies to all business records including: ${a.recordTypes}.\n\n4. STORAGE\nAll records must be stored securely using: ${a.storage}. Access to records is restricted to authorised personnel only. Digital records must be protected by appropriate access controls and backed up regularly.\n\n5. RETENTION\n${a.retention}. Where specific legislation prescribes a longer retention period, that period applies.\n\n6. DISPOSAL\nRecords that have reached the end of their retention period must be disposed of securely: ${a.disposal}. A record of disposal must be maintained.\n\n7. ACCESS\nAuthorised staff may access records relevant to their role. Clients may request access to their own records in accordance with the Privacy Policy. Records must be made available to regulators on request.\n\n_________________________\n${a.responsible} — Records Manager\n${a.agency}`,
  },
];

function PolicyTemplatesPage() {
  const [view, setView] = useState<"list" | "questionnaire" | "review" | "saved">("list");
  const [selectedTemplate, setSelectedTemplate] = useState<PTConfig | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedPolicies, setSavedPolicies] = useState<string[]>([]);

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

  function savePolicy() {
    if (selectedTemplate) setSavedPolicies(prev => [...prev, selectedTemplate.name]);
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
            const isSaved = savedPolicies.includes(t.name);
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
              style={{ fontSize: "13px", fontWeight: 600, color: "white", background: "var(--rc-primary)", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              Save to library
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

function ReviewSchedulePage() {
  const upcoming = modulePolicies.filter(p => p.status === "review-due");
  const current  = modulePolicies.filter(p => p.status === "current");
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Review Schedule</h1>
          <p style={PAGE_SUB}>{upcoming.length} policies due for review · {current.length} up to date</p>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: "16px", overflowY: "auto" }}>
        {upcoming.length > 0 && (
          <div>
            <p style={{ fontSize: "11.5px", fontWeight: 600, color: "oklch(0.46 0.12 55)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Due for review</p>
            <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
              {upcoming.map((p, i) => (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 130px", alignItems: "center", padding: "14px 20px", borderBottom: i < upcoming.length - 1 ? "1px solid var(--rc-border)" : "none", background: "oklch(0.985 0.012 55)" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)" }}>{p.name}</span>
                  <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Last: {p.lastReviewed}</span>
                  <span style={{ fontSize: "12.5px", color: "oklch(0.46 0.12 55)", fontWeight: 500 }}>Due: {p.nextReview}</span>
                  <div style={{ textAlign: "right" }}>
                    <button style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "color 0.1s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--rc-ink)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>
                      Mark reviewed →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <p style={{ fontSize: "11.5px", fontWeight: 600, color: "oklch(0.42 0.12 145)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", maxWidth: "none" }}>Up to date</p>
          <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
            {current.map((p, i) => (
              <div key={p.name} style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 130px", alignItems: "center", padding: "14px 20px", borderBottom: i < current.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)" }}>{p.name}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Last: {p.lastReviewed}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>Due: {p.nextReview}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                  <GreenDot />
                  <span style={{ fontSize: "12px", color: "oklch(0.42 0.12 145)" }}>Current</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadDocumentPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sales");
  const [effective, setEffective] = useState("");
  const [uploaded, setUploaded] = useState(false);

  function handleFiles(fl: FileList | null) {
    if (!fl) return;
    setFiles(prev => [...prev, ...Array.from(fl).map(f => ({ name: f.name, size: fmtBytes(f.size), addedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) }))]);
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
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-faint)", padding: "2px" }}>
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
          <button
            onClick={() => { if (files.length && name) { setUploaded(true); setTimeout(() => setUploaded(false), 2500); setFiles([]); setName(""); setEffective(""); } }}
            style={{ padding: "11px 20px", borderRadius: "8px", background: uploaded ? "oklch(0.55 0.16 145)" : "var(--rc-primary)", color: "white", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "background 0.2s ease" }}
          >
            {uploaded ? "Uploaded ✓" : "Upload to library"}
          </button>
        </div>
      </div>
    </div>
  );
}

const licenceNumbers = ["REA-102847", "REA-093412", "REA-115632", "REA-087241", "REA-121089", "REA-098754", "—", "REA-074316", "REA-118920", "REA-131045"];
const staffStartDates = ["12 Jan 2019", "3 Mar 2021", "8 Jun 2020", "15 Sep 2022", "1 Feb 2021", "22 Nov 2023", "7 Apr 2018", "10 Aug 2020", "28 Oct 2021", "5 May 2024"];
const staffEmails = ["sarah.mitchell@raywhite.com.au","james.chen@raywhite.com.au","emma.watson@raywhite.com.au","tom.richards@raywhite.com.au","lisa.park@raywhite.com.au","mark.johnson@raywhite.com.au","anna.brown@raywhite.com.au","chris.davis@raywhite.com.au","olivia.taylor@raywhite.com.au","ryan.white@raywhite.com.au"];
const staffPhones = ["0412 001 001","0423 002 002","0434 003 003","0445 004 004","0456 005 005","0467 006 006","0478 007 007","0489 008 008","0490 009 009","0401 010 010"];

const staffDocsByName: Record<string, { title: string; category: string; date: string }[]> = {
  "Sarah Mitchell": [
    { title: "Employment Contract", category: "Contract", date: "12 Jan 2019" },
    { title: "Licence Certificate — REA-102847", category: "Licence", date: "Nov 2024" },
    { title: "Privacy Policy Acknowledgement", category: "Compliance", date: "1 Jul 2024" },
    { title: "WHS Induction Record", category: "WHS", date: "12 Jan 2019" },
    { title: "CPD Completion — 2024 Cycle", category: "CPD", date: "Oct 2024" },
  ],
  "James Chen": [
    { title: "Employment Contract", category: "Contract", date: "3 Mar 2021" },
    { title: "Licence Certificate — REA-093412", category: "Licence", date: "Mar 2025" },
    { title: "Office Induction Record", category: "Induction", date: "3 Mar 2021" },
    { title: "CPD Completion — 2024 Cycle", category: "CPD", date: "Dec 2024" },
  ],
  "Emma Watson": [
    { title: "Employment Contract", category: "Contract", date: "8 Jun 2020" },
    { title: "Licence Certificate — REA-115632", category: "Licence", date: "Jun 2024" },
    { title: "Trust Accounting Training Record", category: "Training", date: "9 Jun 2020" },
    { title: "Privacy Policy Acknowledgement", category: "Compliance", date: "1 Jul 2024" },
    { title: "CPD Completion — 2024 Cycle", category: "CPD", date: "May 2024" },
  ],
  "Tom Richards": [
    { title: "Employment Contract", category: "Contract", date: "15 Sep 2022" },
    { title: "Licence Certificate — REA-087241", category: "Licence", date: "Sep 2024" },
    { title: "WHS Induction Record", category: "WHS", date: "15 Sep 2022" },
  ],
  "Lisa Park": [
    { title: "Employment Contract", category: "Contract", date: "1 Feb 2021" },
    { title: "Licence Certificate — REA-121089", category: "Licence", date: "Feb 2025" },
    { title: "Office Induction Record", category: "Induction", date: "1 Feb 2021" },
    { title: "CPD Completion — 2024 Cycle", category: "CPD", date: "Jan 2025" },
  ],
  "Mark Johnson": [
    { title: "Employment Contract", category: "Contract", date: "22 Nov 2023" },
    { title: "Licence Certificate — REA-098754", category: "Licence", date: "Dec 2024" },
    { title: "Mentor Assignment", category: "Onboarding", date: "22 Nov 2023" },
    { title: "CPD Completion — 2024 Cycle", category: "CPD", date: "Nov 2024" },
  ],
  "Anna Brown": [
    { title: "Employment Contract", category: "Contract", date: "7 Apr 2018" },
    { title: "Privacy Policy Acknowledgement", category: "Compliance", date: "1 Jul 2024" },
    { title: "IT Access Record", category: "Onboarding", date: "7 Apr 2018" },
  ],
  "Chris Davis": [
    { title: "Employment Contract", category: "Contract", date: "10 Aug 2020" },
    { title: "Licence Certificate — REA-074316", category: "Licence", date: "Aug 2024" },
    { title: "CPD Registration — 2025 Cycle", category: "CPD", date: "Sep 2024" },
  ],
  "Olivia Taylor": [
    { title: "Employment Contract", category: "Contract", date: "28 Oct 2021" },
    { title: "Licence Certificate — REA-118920", category: "Licence", date: "Jan 2025" },
    { title: "Trust Accounting Training Record", category: "Training", date: "29 Oct 2021" },
    { title: "CPD Completion — 2024 Cycle", category: "CPD", date: "Dec 2024" },
  ],
  "Ryan White": [
    { title: "Employment Contract", category: "Contract", date: "5 May 2024" },
    { title: "Licence Certificate — REA-131045", category: "Licence", date: "May 2024" },
    { title: "Office Induction Record", category: "Induction", date: "6 May 2024" },
    { title: "Mentor Assignment", category: "Onboarding", date: "5 May 2024" },
  ],
};

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

function renderDocContent(doc: { title: string; category: string; date: string }, s: typeof staffMembers[0], memberIdx: number): React.ReactNode {
  const licNum = licenceNumbers[memberIdx];
  const startDate = staffStartDates[memberIdx];
  const h2: React.CSSProperties = { fontSize: "11px", fontWeight: 700, color: "var(--rc-faint)", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "20px 0 6px" };
  const p: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", lineHeight: 1.7, margin: "0 0 8px", maxWidth: "68ch" };
  const sig: React.CSSProperties = { display: "flex", flexDirection: "column" as const, gap: "4px", marginTop: "6px" };
  const sigLine: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", borderBottom: "1px solid var(--rc-border)", paddingBottom: "18px", marginBottom: "6px", maxWidth: "260px" };
  const sigLabel: React.CSSProperties = { fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none" };

  if (doc.category === "Contract") return (
    <div>
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction · ABN 23 456 789 012</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Employment Agreement</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      <div style={{ display: "flex", gap: "40px", marginBottom: "24px" }}>
        {[["Employee", s.name], ["Position", s.role], ["Commencement", startDate]].map(([l, v]) => (
          <div key={l}><p style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--rc-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px", maxWidth: "none" }}>{l}</p><p style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", margin: 0, maxWidth: "none" }}>{v}</p></div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--rc-border)", paddingTop: "20px" }}>
        <p style={h2}>1. Position</p>
        <p style={p}>Ray White Bondi Junction ("the Employer") engages {s.name} ("the Employee") as {s.role}. The Employee will report to the Principal and perform all duties consistent with this role in accordance with the agency's standards and NSW Fair Trading requirements.</p>
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
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Privacy Policy Acknowledgement</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      <p style={p}>I, <strong>{s.name}</strong>, acknowledge that I have read, understood, and agree to comply with the Ray White Bondi Junction Privacy Policy (v2.1, July 2026) in all aspects of my role as {s.role}.</p>
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
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction</p>
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
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.02em", margin: "0 0 4px", maxWidth: "none" }}>Trust Accounting Training Record</p>
      <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: "0 0 24px", maxWidth: "none" }}>Dated {doc.date}</p>
      {[["Employee", s.name], ["Role", s.role], ["Training date", doc.date], ["Provider", "REINSW — Trust Accounting Module"], ["Duration", "4 hours"], ["Certificate ref", `TA-2026-${memberIdx + 1001}`]].map(([l, v]) => (
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
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction</p>
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
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction</p>
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
      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--rc-faint)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px", maxWidth: "none" }}>Ray White Bondi Junction</p>
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

function StaffFilePage({ memberIdx, onBack }: { memberIdx: number; onBack: () => void }) {
  const s = staffMembers[memberIdx];
  const licNum = licenceNumbers[memberIdx];
  const cpd = cpdData[memberIdx];
  const initials = s.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const licOk = s.licence === "current" || s.licence === "exempt";
  const cpdOk = s.cpd === "complete" || s.cpd === "na";
  const cpdPct = cpd.required === 0 ? null : Math.min(100, Math.round((cpd.completed / cpd.required) * 100));
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
              <p style={PAGE_SUB}>{s.role} · Started {staffStartDates[memberIdx]}</p>
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
            {infoRow("Email", staffEmails[memberIdx])}
            {infoRow("Phone", staffPhones[memberIdx])}
            {infoRow("Start date", staffStartDates[memberIdx])}
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
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-ink)" }}>{cpd.completed}/{cpd.required}</span>
                </div>
                <div style={{ height: "4px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${cpdPct}%`, height: "100%", background: cpdPct === 100 ? "oklch(0.60 0.16 145)" : cpdPct! >= 60 ? "oklch(0.60 0.14 55)" : "var(--rc-primary)", borderRadius: "100px" }} />
                </div>
              </div>
              {infoRow("Deadline", cpd.deadline)}
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

function TeamOverviewPage() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (selectedIdx !== null) {
    return <StaffFilePage memberIdx={selectedIdx} onBack={() => setSelectedIdx(null)} />;
  }

  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Team Overview</h1>
          <p style={PAGE_SUB}>{staffMembers.length} staff members · Ray White Bondi Junction</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", alignContent: "start" }}>
        {staffMembers.map((s, idx) => {
          const initials = s.name.split(" ").map(n => n[0]).join("").slice(0, 2);
          const licOk = s.licence === "current" || s.licence === "exempt";
          const cpdOk = s.cpd === "complete" || s.cpd === "na";
          return (
            <div key={s.name} onClick={() => setSelectedIdx(idx)}
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
    </div>
  );
}

function LicenceTrackingPage() {
  const cols = "minmax(0,1fr) 140px 130px 110px 110px 100px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Licence Tracking</h1>
          <p style={PAGE_SUB}>{staffMembers.filter(s => s.licence !== "exempt").length} licensed agents · 1 renewal due</p>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Name", "Role", "Licence no.", "Type", "Expiry", "Status"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {staffMembers.map((s, i) => (
            <div key={s.name} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < staffMembers.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.role}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", fontFamily: "monospace", padding: "0 20px" }}>{licenceNumbers[i]}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.licence === "exempt" ? "—" : "Class 2"}</span>
              <span style={{ fontSize: "12.5px", color: s.licence === "renewal-due" ? "oklch(0.46 0.12 55)" : "var(--rc-faint)", padding: "0 20px" }}>{s.expiry}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 20px" }}>
                {s.licence === "current" ? <><GreenDot /><span style={{ fontSize: "12px", color: "oklch(0.42 0.12 145)" }}>Current</span></> :
                 s.licence === "renewal-due" ? <><AmberDot /><span style={{ fontSize: "12px", color: "oklch(0.46 0.12 55)" }}>Due</span></> :
                 <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>Exempt</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CPDRecordsPage() {
  const cols = "minmax(0,1fr) 130px 90px 90px 110px 100px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>CPD Records</h1>
          <p style={PAGE_SUB}>Continuing professional development — {new Date().getFullYear()} cycle</p>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Name", "Role", "Required", "Completed", "Deadline", "Status"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cpdData.map((s, i) => {
            const pct = s.required === 0 ? null : Math.min(100, Math.round((s.completed / s.required) * 100));
            const done = s.cpd === "complete" || s.cpd === "na";
            const barColor = done ? "oklch(0.60 0.16 145)" : s.cpd === "due-soon" ? "oklch(0.60 0.14 55)" : "oklch(0.55 0.20 25)";
            return (
              <div key={s.name} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < cpdData.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.role}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", padding: "0 20px" }}>{s.required === 0 ? "—" : `${s.required} hrs`}</span>
                <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {pct !== null ? (
                    <>
                      <span style={{ fontSize: "12.5px", color: "var(--rc-muted)" }}>{s.completed} hrs</span>
                      <div style={{ height: "2px", background: "var(--rc-border)", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "100px" }} />
                      </div>
                    </>
                  ) : <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>—</span>}
                </div>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{s.deadline}</span>
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
    </div>
  );
}

type OnboardingMember = { id: string; name: string; role: string; startDate: string; addedAt: string; checkData: (Record<string, string> | null)[] };

function OnboardingChecklist({ member, onBack }: { member: OnboardingMember; onBack: () => void }) {
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

  function saveItem() {
    if (selectedIdx === null) return;
    const saved = { ...formValues, _savedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) };
    setCheckData(prev => prev.map((d, i) => i === selectedIdx ? saved : d));
    setSavedAnim(true);
    setEditing(false);
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

  const inputSty2: React.CSSProperties = { fontSize: "13px", color: "var(--rc-ink)", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter)", width: "100%", boxSizing: "border-box" };

  function submitAdd() {
    if (!nameInput.trim()) return;
    const m: OnboardingMember = {
      id: `ob${Date.now()}`,
      name: nameInput.trim(),
      role: roleInput.trim(),
      startDate: startInput.trim(),
      addedAt: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      checkData: Array(onboardingItems.length).fill(null),
    };
    setMembers(prev => [...prev, m]);
    setNameInput(""); setRoleInput(""); setStartInput("");
    setShowAdd(false);
  }

  if (selected) {
    return <OnboardingChecklist member={selected} onBack={() => setSelected(null)} />;
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
  const [reconciled, setReconciled] = useState([false, false]);
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Account Reconciliation</h1>
          <p style={PAGE_SUB}>Reconcile trust accounts to confirm balances match records</p>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0 }}>
        {trustAccounts.map((acc, idx) => (
          <div key={acc.name} style={{ flex: 1, border: "1px solid var(--rc-border)", borderRadius: "12px", background: "var(--rc-bg)", boxShadow: "var(--rc-shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rc-border)", background: "var(--rc-surface)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--rc-ink)", margin: 0 }}>{acc.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {reconciled[idx] ? <GreenDot /> : <AmberDot />}
                  <span style={{ fontSize: "12px", color: reconciled[idx] ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{reconciled[idx] ? "Reconciled" : "Pending"}</span>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--rc-faint)", maxWidth: "none", margin: "4px 0 0" }}>{acc.bank}</p>
            </div>
            <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Statement balance", value: acc.balance },
                { label: "System balance", value: idx === 0 ? "$284,500" : "$42,180" },
                { label: "Unreconciled items", value: "0" },
                { label: "Last reconciled", value: acc.lastReconciled },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--rc-border-subtle)", paddingBottom: "12px" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--rc-faint)" }}>{row.label}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.02em" }}>{row.value}</span>
                </div>
              ))}
              <div style={{ padding: "12px 16px", borderRadius: "9px", background: "oklch(0.975 0.006 145)", border: "1px solid oklch(0.88 0.06 145)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <GreenDot />
                  <span style={{ fontSize: "12.5px", fontWeight: 500, color: "oklch(0.38 0.12 145)" }}>Balances match — no discrepancies</span>
                </div>
              </div>
              <button
                onClick={() => setReconciled(prev => prev.map((v, j) => j === idx ? !v : v))}
                style={{ marginTop: "auto", padding: "11px 20px", borderRadius: "8px", background: reconciled[idx] ? "var(--rc-surface)" : "var(--rc-primary)", color: reconciled[idx] ? "var(--rc-muted)" : "white", border: reconciled[idx] ? "1px solid var(--rc-border)" : "none", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.2s ease" }}
              >
                {reconciled[idx] ? "Mark as pending" : "Confirm reconciliation"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditReportsPage() {
  const typeColors: Record<string, { color: string; bg: string }> = {
    Annual:     { color: "oklch(0.38 0.12 260)", bg: "oklch(0.94 0.03 260)" },
    Trust:      { color: "oklch(0.42 0.12 145)", bg: "oklch(0.95 0.025 145)" },
    AML:        { color: "oklch(0.46 0.18 25)",  bg: "oklch(0.96 0.03 25)"  },
    Staff:      { color: "oklch(0.40 0.12 310)", bg: "oklch(0.95 0.025 310)" },
  };
  const cols = "minmax(0,1fr) 90px 130px 60px 80px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Audit Reports</h1>
          <p style={PAGE_SUB}>{auditReports.length} reports generated</p>
        </div>
        <button style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--rc-primary)", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter)" }}>
          Generate report
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Report name", "Type", "Generated", "Pages", ""].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {auditReports.map((r, i) => {
            const tc = typeColors[r.type] ?? typeColors.Annual;
            return (
              <div key={r.name} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < auditReports.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "14px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                <div style={{ padding: "0 20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: tc.color, background: tc.bg, padding: "3px 9px", borderRadius: "100px" }}>{r.type}</span>
                </div>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{r.generated}</span>
                <span style={{ fontSize: "12.5px", color: "var(--rc-faint)", padding: "0 20px" }}>{r.pages}p</span>
                <div style={{ padding: "0 20px" }}>
                  <button style={{ fontSize: "12px", fontWeight: 500, color: "var(--rc-faint)", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-inter)", transition: "color 0.1s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--rc-ink)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--rc-faint)")}>
                    Download →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TransactionLogPage() {
  const [filter, setFilter] = useState("All");
  const accounts = ["All", "Sales Trust", "Rental Trust"];
  const filtered = filter === "All" ? allTransactions : allTransactions.filter(t => t.account === filter);
  const cols = "minmax(0,1fr) 120px 100px 90px 90px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>Transaction Log</h1>
          <p style={PAGE_SUB}>{allTransactions.length} transactions · Jul 2026</p>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "var(--rc-surface)", border: "1px solid var(--rc-border)", borderRadius: "8px", padding: "3px" }}>
          {accounts.map(a => (
            <button key={a} onClick={() => setFilter(a)}
              style={{ padding: "5px 12px", borderRadius: "5px", border: "none", background: filter === a ? "var(--rc-bg)" : "transparent", color: filter === a ? "var(--rc-ink)" : "var(--rc-faint)", fontSize: "12.5px", fontWeight: filter === a ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-inter)", boxShadow: filter === a ? "var(--rc-shadow-sm)" : "none", transition: "all 0.15s ease" }}
            >{a}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Description", "Account", "Date", "Type", "Amount"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((tx, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid var(--rc-border)" : "none", background: "var(--rc-bg)" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</span>
              <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{tx.account}</span>
              <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{tx.date}</span>
              <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: "6px" }}>
                {tx.type === "credit" ? <GreenDot /> : <RedDot />}
                <span style={{ fontSize: "12px", color: tx.type === "credit" ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.18 25)" }}>{tx.type === "credit" ? "Credit" : "Debit"}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: tx.type === "credit" ? "oklch(0.38 0.12 145)" : "oklch(0.46 0.18 25)", padding: "0 20px", textAlign: "right" }}>{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AMLCompliancePage() {
  const verified = amlChecks.filter(c => c.verified).length;
  const cols = "minmax(0,1fr) 150px 80px 80px 140px 130px";
  return (
    <div style={PAGE_WRAP}>
      <div style={PAGE_HEADER}>
        <div>
          <h1 style={PAGE_H1}>AML Compliance</h1>
          <p style={PAGE_SUB}>{verified}/{amlChecks.length} identity checks complete · Anti-Money Laundering &amp; CTF</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", flexShrink: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        {[
          { label: "Total checks", value: String(amlChecks.length), sub: "Properties + tenants" },
          { label: "Verified", value: String(verified), sub: "ID confirmed" },
          { label: "Pending", value: String(amlChecks.length - verified), sub: "Action required" },
          { label: "Method", value: "Doc verify", sub: "Standard process" },
        ].map(({ label, value, sub }, i) => (
          <div key={label} style={{ padding: "18px 20px", borderRight: i < 3 ? "1px solid var(--rc-border)" : "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            <p style={{ fontSize: "11.5px", color: "var(--rc-faint)", maxWidth: "none" }}>{label}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--rc-ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: "11px", color: "var(--rc-faint)", maxWidth: "none" }}>{sub}</p>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--rc-shadow-sm)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, flexShrink: 0, background: "var(--rc-surface)", borderBottom: "1px solid var(--rc-border)" }}>
          {["Property / Address", "Party name", "Type", "Verified", "Date", "Method"].map(h => (
            <span key={h} style={{ fontSize: "11.5px", color: "var(--rc-faint)", padding: "10px 20px" }}>{h}</span>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {amlChecks.map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", borderBottom: i < amlChecks.length - 1 ? "1px solid var(--rc-border)" : "none", background: c.verified ? "var(--rc-bg)" : "oklch(0.985 0.012 55)" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--rc-ink)", padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</span>
              <span style={{ fontSize: "12.5px", color: "var(--rc-muted)", padding: "0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.party}</span>
              <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{c.type}</span>
              <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: "6px" }}>
                {c.verified ? <GreenDot /> : <AmberDot />}
                <span style={{ fontSize: "12px", color: c.verified ? "oklch(0.42 0.12 145)" : "oklch(0.46 0.12 55)" }}>{c.verified ? "Yes" : "No"}</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--rc-faint)", padding: "0 20px" }}>{c.date}</span>
              <span style={{ fontSize: "12px", color: c.verified ? "var(--rc-faint)" : "oklch(0.46 0.12 55)", fontWeight: c.verified ? 400 : 500, padding: "0 20px" }}>{c.method}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaticSubPage({ label }: { label: string }) {
  switch (label) {
    case "All Policies":            return <AllPoliciesPage />;
    case "Policy Templates":        return <PolicyTemplatesPage />;
    case "Review Schedule":         return <ReviewSchedulePage />;
    case "Upload Document":         return <UploadDocumentPage />;
    case "Team Overview":           return <TeamOverviewPage />;
    case "Licence Tracking":        return <LicenceTrackingPage />;
    case "CPD Records":             return <CPDRecordsPage />;
    case "Onboarding":              return <OnboardingPage />;
    case "Account Reconciliation":  return <AccountReconciliationPage />;
    case "Audit Reports":           return <AuditReportsPage />;
    case "Transaction Log":         return <TransactionLogPage />;
    case "AML Compliance":          return <AMLCompliancePage />;
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
  const [salesProps, setSalesProps] = useState<SalesPropItem[]>(initialSalesProperties);

  type SidebarModule =
    | { id: string; label: string; icon: React.ReactNode; type: "properties"; properties: { id: string; address: string }[] }
    | { id: string; label: string; icon: React.ReactNode; type: "static"; children: string[] };

  const modules: SidebarModule[] = [
    { id: "policies", label: "Policies & Procedures", icon: <PolIcon />, type: "static", children: ["All Policies", "Policy Templates", "Review Schedule", "Upload Document"] },
    { id: "sales", label: "Residential Sales", icon: <SalesIcon />, type: "properties", properties: salesProps },
    { id: "management", label: "Residential Management", icon: <MgmtIcon />, type: "properties", properties: managementProperties },
    { id: "staff", label: "Staff", icon: <StaffIcon />, type: "static", children: ["Team Overview", "Licence Tracking", "CPD Records", "Onboarding"] },
    { id: "trust", label: "Trust Accounting", icon: <TrustIcon />, type: "static", children: ["Account Reconciliation", "Audit Reports", "Transaction Log", "AML Compliance"] },
  ];

  const module = modules.find((m) => m.id === activeModule) ?? null;

  function openModule(id: string) { setActiveModule(id); setSelected(null); }
  function goBack() { setActiveModule(null); setSelected(null); }

  return (
    <div style={{ display: "flex", minHeight: "100svh", background: "var(--rc-bg)" }}>
      {/* Sidebar */}
      <aside style={{ width: "252px", flexShrink: 0, background: "var(--rc-nav)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, overflowY: "auto", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", flexShrink: 0 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--rc-primary)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 0 1px oklch(0.55 0.15 260 / 0.35) inset" }}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h6M3 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.03em", color: "oklch(0.97 0.006 260)" }}>RealComply</span>
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
            <p style={{ fontSize: "12.5px", color: "oklch(0.80 0.014 260)", maxWidth: "none", marginTop: "3px", fontWeight: 500, lineHeight: 1.3 }}>Ray White Bondi Junction</p>
          </div>
          <Link href="/signin" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, color: "var(--rc-nav-text)", textDecoration: "none", transition: "color 0.12s ease" }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: "252px", display: "flex", minHeight: "100svh" }}>
        {selected?.type === "property" ? (
          selected.section === "sales" ? (
            <SalesPropertyChecklist key={selected.id} propertyId={selected.id} address={selected.address} />
          ) : (
            <PropertyChecklist key={selected.id} propertyId={selected.id} address={selected.address} type={selected.section} />
          )
        ) : selected?.type === "static" ? (
          <StaticSubPage label={selected.label} />
        ) : activeModule ? (
          <ModuleOverview moduleId={activeModule} onSelectProperty={setSelected} salesProps={salesProps} onAddSalesProperty={(prop) => setSalesProps(prev => [...prev, prop])} />
        ) : (
          <DashboardHome onNavigate={openModule} />
        )}
      </div>
    </div>
  );
}
