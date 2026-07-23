"use client";
import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Ev = {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  visibility: "private" | "team";
  color: string;
  created_by: string;
};

type ModalState =
  | null
  | { mode: "create"; date: Date; hour: number }
  | { mode: "view"; event: Ev }
  | { mode: "edit"; event: Ev };

const USER_COLORS = ["#533afd", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
function hashColor(str: string) {
  let h = 0;
  for (const c of str) h = ((h * 31) + c.charCodeAt(0)) >>> 0;
  return USER_COLORS[h % USER_COLORS.length];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toLocalDTStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const SLOT_H = 64; // px per hour in day view

export default function CalendarModule({
  orgOwnerId,
  userId,
}: {
  orgOwnerId: string | null;
  userId: string | null;
}) {
  const supabase = createClientComponentClient();
  const [view, setView] = useState<"month" | "day">("month");
  const [anchor, setAnchor] = useState(new Date());
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState({ title: "", description: "", start_at: "", end_at: "", all_day: false, visibility: "private" as "private" | "team" });
  const [saving, setSaving] = useState(false);

  const myColor = userId ? hashColor(userId) : "#533afd";

  const fetchEvents = useCallback(async () => {
    if (!orgOwnerId || !userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("org_owner_id", orgOwnerId)
      .order("start_at");
    if (data) {
      setEvents(data.filter((e: Ev) => e.created_by === userId || e.visibility === "team"));
    }
    setLoading(false);
  }, [supabase, orgOwnerId, userId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  function eventsForDay(d: Date) {
    return events.filter(e => sameDay(new Date(e.start_at), d));
  }

  function openCreate(date: Date, hour = 9) {
    const start = new Date(date); start.setHours(hour, 0, 0, 0);
    const end = new Date(start); end.setHours(hour + 1, 0, 0, 0);
    setForm({ title: "", description: "", start_at: toLocalDTStr(start), end_at: toLocalDTStr(end), all_day: false, visibility: "private" });
    setModal({ mode: "create", date, hour });
  }

  function openEdit(e: Ev) {
    setForm({
      title: e.title, description: e.description || "",
      start_at: toLocalDTStr(new Date(e.start_at)), end_at: toLocalDTStr(new Date(e.end_at)),
      all_day: e.all_day, visibility: e.visibility,
    });
    setModal({ mode: "edit", event: e });
  }

  async function saveEvent() {
    if (!form.title.trim() || !orgOwnerId || !userId) return;
    setSaving(true);
    const payload = {
      org_owner_id: orgOwnerId, created_by: userId,
      title: form.title.trim(), description: form.description,
      start_at: new Date(form.start_at).toISOString(), end_at: new Date(form.end_at).toISOString(),
      all_day: form.all_day, visibility: form.visibility, color: myColor,
    };
    if (modal?.mode === "edit") {
      await supabase.from("calendar_events").update(payload).eq("id", (modal as { mode: "edit"; event: Ev }).event.id);
    } else {
      await supabase.from("calendar_events").insert(payload);
    }
    setSaving(false);
    setModal(null);
    fetchEvents();
  }

  async function deleteEvent(id: string) {
    await supabase.from("calendar_events").delete().eq("id", id);
    setModal(null);
    fetchEvents();
  }

  function evColor(e: Ev) { return e.color || hashColor(e.created_by); }

  const today = new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  // ── Month view ─────────────────────────────────────────────────────────────
  function MonthView() {
    const total = daysInMonth(year, month);
    const cells: (number | null)[] = Array(firstWeekday(year, month)).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #e3e8ee", flexShrink: 0 }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#8898aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: wi < weeks.length - 1 ? "1px solid #e3e8ee" : "none", minHeight: "110px" }}>
              {week.map((day, di) => {
                if (!day) return <div key={di} style={{ background: "#fafbfc", borderRight: di < 6 ? "1px solid #e3e8ee" : "none" }} />;
                const cellDate = new Date(year, month, day);
                const isToday = sameDay(cellDate, today);
                const dayEvs = eventsForDay(cellDate);
                return (
                  <div
                    key={di}
                    onClick={() => { setAnchor(cellDate); setView("day"); }}
                    style={{ padding: "6px 6px 4px", borderRight: di < 6 ? "1px solid #e3e8ee" : "none", cursor: "pointer", background: "white", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8f9ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = "white")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "24px", height: "24px", borderRadius: "50%", fontSize: "12px", fontWeight: isToday ? 700 : 400,
                        background: isToday ? "#533afd" : "transparent", color: isToday ? "white" : "#1c1e54",
                      }}>{day}</span>
                      <button
                        onClick={ev => { ev.stopPropagation(); openCreate(cellDate); }}
                        style={{ border: "none", background: "none", color: "#c0cad8", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0 2px", borderRadius: "4px" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#533afd")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#c0cad8")}
                      >+</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {dayEvs.slice(0, 3).map(e => (
                        <div
                          key={e.id}
                          onClick={ev => { ev.stopPropagation(); setModal({ mode: "view", event: e }); }}
                          style={{
                            background: evColor(e) + "18", borderLeft: `3px solid ${evColor(e)}`, borderRadius: "3px",
                            padding: "1px 4px", fontSize: "11px", fontWeight: 500, color: evColor(e),
                            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                          }}
                        >
                          {!e.all_day && new Date(e.start_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true }) + " "}
                          {e.title}
                        </div>
                      ))}
                      {dayEvs.length > 3 && <div style={{ fontSize: "10px", color: "#8898aa", paddingLeft: "3px" }}>+{dayEvs.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Day view ───────────────────────────────────────────────────────────────
  function DayView() {
    const allEvs = eventsForDay(anchor);
    const allDayEvs = allEvs.filter(e => e.all_day);
    const timedEvs = allEvs.filter(e => !e.all_day);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const nowPct = (today.getHours() + today.getMinutes() / 60) / 24;

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* All-day strip */}
        {allDayEvs.length > 0 && (
          <div style={{ borderBottom: "1px solid #e3e8ee", padding: "8px 16px 8px 64px", display: "flex", gap: "6px", flexWrap: "wrap", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: "#8898aa", alignSelf: "center", marginRight: "4px" }}>All day</span>
            {allDayEvs.map(e => (
              <div key={e.id} onClick={() => setModal({ mode: "view", event: e })} style={{ background: evColor(e) + "18", borderLeft: `3px solid ${evColor(e)}`, borderRadius: "3px", padding: "2px 8px", fontSize: "12px", fontWeight: 500, color: evColor(e), cursor: "pointer" }}>{e.title}</div>
            ))}
          </div>
        )}
        {/* Time grid */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{ position: "relative", minHeight: `${24 * SLOT_H}px` }}>
            {hours.map(h => (
              <div key={h} onClick={() => openCreate(anchor, h)} style={{ position: "absolute", top: `${h * SLOT_H}px`, left: 0, right: 0, height: `${SLOT_H}px`, borderBottom: "1px solid #f0f2f5", display: "flex", cursor: "pointer" }}>
                <div style={{ width: "56px", flexShrink: 0, paddingRight: "10px", paddingTop: "3px", textAlign: "right", fontSize: "11px", color: "#a0aec0", userSelect: "none", letterSpacing: "0.02em" }}>
                  {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                </div>
                <div style={{ flex: 1, borderLeft: "1px solid #e3e8ee" }} />
              </div>
            ))}
            {/* Current time indicator */}
            {sameDay(anchor, today) && (
              <div style={{ position: "absolute", top: `${nowPct * 24 * SLOT_H}px`, left: "56px", right: 0, height: "2px", background: "#ef4444", zIndex: 5, pointerEvents: "none" }}>
                <div style={{ position: "absolute", left: "-5px", top: "-4px", width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              </div>
            )}
            {/* Event blocks */}
            {timedEvs.map((e, i) => {
              const start = new Date(e.start_at);
              const end = new Date(e.end_at);
              const topPx = (start.getHours() + start.getMinutes() / 60) * SLOT_H;
              const durH = Math.max((end.getTime() - start.getTime()) / 3600000, 0.25);
              const hPx = durH * SLOT_H;
              const col = evColor(e);
              return (
                <div
                  key={e.id}
                  onClick={ev => { ev.stopPropagation(); setModal({ mode: "view", event: e }); }}
                  style={{
                    position: "absolute", top: `${topPx + 1}px`, left: `${64 + (i % 2) * 6}px`, right: "12px",
                    height: `${hPx - 3}px`, background: col + "1a", borderLeft: `3px solid ${col}`,
                    borderRadius: "5px", padding: "4px 8px", cursor: "pointer", zIndex: 2, overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: col, lineHeight: 1.3 }}>{e.title}</div>
                  {hPx > 28 && (
                    <div style={{ fontSize: "11px", color: col, opacity: 0.75, marginTop: "1px" }}>
                      {start.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })} – {end.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </div>
                  )}
                  {hPx > 44 && e.visibility === "team" && (
                    <div style={{ fontSize: "10px", color: col, opacity: 0.6, marginTop: "2px" }}>👥 Team</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Event modal ────────────────────────────────────────────────────────────
  function EventModal() {
    if (!modal) return null;
    const isView = modal.mode === "view";
    const ev = (modal.mode === "view" || modal.mode === "edit") ? modal.event : null;
    const canEdit = !ev || ev.created_by === userId;

    return (
      <>
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(28,30,84,0.25)", zIndex: 200, backdropFilter: "blur(3px)" }} />
        <div style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "white", borderRadius: "16px", boxShadow: "0 24px 64px rgba(28,30,84,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          width: "min(460px, calc(100vw - 32px))", zIndex: 201, overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e3e8ee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1c1e54", margin: 0 }}>
              {isView ? ev!.title : modal.mode === "create" ? "New Event" : "Edit Event"}
            </h3>
            <button onClick={() => setModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#a0aec0", fontSize: "22px", lineHeight: 1, padding: "0 2px" }}>×</button>
          </div>

          <div style={{ padding: "20px 24px 24px" }}>
            {isView ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: evColor(ev!), flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#8898aa", fontWeight: 500 }}>
                    {ev!.visibility === "team" ? "👥 Visible to whole team" : "🔒 Only visible to you"}
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#1c1e54", lineHeight: 1.6, marginBottom: "6px" }}>
                  {ev!.all_day ? (
                    <>{new Date(ev!.start_at).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · All day</>
                  ) : (
                    <>
                      {new Date(ev!.start_at).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}<br />
                      {new Date(ev!.start_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })} – {new Date(ev!.end_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </>
                  )}
                </div>
                {ev!.description && <p style={{ fontSize: "13px", color: "#8898aa", lineHeight: 1.65, marginTop: "12px", maxWidth: "none" }}>{ev!.description}</p>}
                {canEdit && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                    <button onClick={() => openEdit(ev!)} style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid #e3e8ee", background: "white", color: "#1c1e54", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Edit</button>
                    <button onClick={() => deleteEvent(ev!.id)} style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Delete</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input
                  autoFocus placeholder="Event title"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && saveEvent()}
                  style={{ width: "100%", border: "1px solid #e3e8ee", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#1c1e54", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                {/* All-day toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setForm(f => ({ ...f, all_day: !f.all_day }))}>
                  <div style={{ width: "38px", height: "22px", borderRadius: "11px", background: form.all_day ? "#533afd" : "#e3e8ee", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "3px", left: form.all_day ? "19px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }} />
                  </div>
                  <span style={{ fontSize: "13px", color: "#1c1e54", fontWeight: 500, userSelect: "none" }}>All day</span>
                </div>
                {/* Date/time */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {["start_at", "end_at"].map(k => (
                    <div key={k}>
                      <label style={{ fontSize: "11px", color: "#8898aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "5px" }}>
                        {k === "start_at" ? "Start" : "End"}
                      </label>
                      <input
                        type={form.all_day ? "date" : "datetime-local"}
                        value={form.all_day ? (form as Record<string, string>)[k].slice(0, 10) : (form as Record<string, string>)[k]}
                        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                        style={{ width: "100%", border: "1px solid #e3e8ee", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", color: "#1c1e54", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>
                  ))}
                </div>
                {/* Description */}
                <textarea
                  placeholder="Add notes (optional)" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} style={{ width: "100%", border: "1px solid #e3e8ee", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#1c1e54", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
                {/* Visibility */}
                <div>
                  <div style={{ fontSize: "11px", color: "#8898aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Who can see this?</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["private", "team"] as const).map(v => (
                      <button
                        key={v} onClick={() => setForm(f => ({ ...f, visibility: v }))}
                        style={{
                          flex: 1, padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                          border: form.visibility === v ? "2px solid #533afd" : "2px solid #e3e8ee",
                          background: form.visibility === v ? "#533afd12" : "white",
                          color: form.visibility === v ? "#533afd" : "#8898aa",
                        }}
                      >
                        {v === "private" ? "🔒 Only me" : "👥 Whole team"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e3e8ee", background: "white", color: "#1c1e54", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                  <button
                    onClick={saveEvent} disabled={!form.title.trim() || saving}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: 500, transition: "all 0.15s", cursor: form.title.trim() ? "pointer" : "not-allowed", background: form.title.trim() ? "#533afd" : "#e3e8ee", color: form.title.trim() ? "white" : "#8898aa" }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Toolbar ────────────────────────────────────────────────────────────────
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;
  const dayLabel = anchor.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const navBtnStyle: React.CSSProperties = {
    width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "8px", border: "1px solid #e3e8ee", background: "white", color: "#1c1e54",
    fontSize: "16px", cursor: "pointer", lineHeight: 1,
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", height: "100%", minHeight: 0 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", borderBottom: "1px solid #e3e8ee", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          <button style={navBtnStyle} onClick={view === "month" ? () => setAnchor(new Date(year, month - 1, 1)) : () => { const d = new Date(anchor); d.setDate(d.getDate() - 1); setAnchor(d); }}>‹</button>
          <button style={navBtnStyle} onClick={view === "month" ? () => setAnchor(new Date(year, month + 1, 1)) : () => { const d = new Date(anchor); d.setDate(d.getDate() + 1); setAnchor(d); }}>›</button>
        </div>
        <span style={{ fontSize: "16px", fontWeight: 600, color: "#1c1e54", letterSpacing: "-0.02em", minWidth: "220px" }}>
          {view === "month" ? monthLabel : dayLabel}
        </span>
        <button
          onClick={() => setAnchor(new Date())}
          style={{ padding: "6px 14px", borderRadius: "7px", border: "1px solid #e3e8ee", background: "white", color: "#1c1e54", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
        >Today</button>
        {/* View toggle */}
        <div style={{ marginLeft: "auto", display: "flex", background: "#f3f4f8", borderRadius: "9px", padding: "3px", gap: "2px" }}>
          {(["day", "month"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 16px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              background: view === v ? "white" : "transparent", color: view === v ? "#1c1e54" : "#8898aa",
              boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}>
              {v === "day" ? "Day" : "Month"}
            </button>
          ))}
        </div>
        <button
          onClick={() => openCreate(anchor)}
          style={{ padding: "7px 18px", borderRadius: "8px", border: "none", background: "#533afd", color: "white", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
        >+ New</button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#a0aec0", fontSize: "14px" }}>Loading…</div>
      ) : view === "month" ? <MonthView /> : <DayView />}

      <EventModal />
    </div>
  );
}
