"use client";

import { useEffect, useState } from "react";
import { api, Meeting } from "@/lib/api";
import { Plus, Search, Trash2, Edit2, X, Clock } from "lucide-react";

const statusLabels: Record<string, string> = {
  scheduled: "Запланировано", in_progress: "В процессе", completed: "Завершено", cancelled: "Отменено",
};
const priorityLabels: Record<string, string> = {
  low: "Низкий", medium: "Средний", high: "Высокий", urgent: "Срочный",
};
const statusColors: Record<string, string> = {
  scheduled: "#7FE0F5", in_progress: "#1B2A6B", completed: "#22c55e", cancelled: "#94a3b8",
};
const priorityColors: Record<string, string> = {
  low: "#94a3b8", medium: "#7FE0F5", high: "#f59e0b", urgent: "#ef4444",
};

const emptyForm = {
  title: "", description: "", idea: "", priority: "medium", status: "scheduled",
  participants: "", scheduled_at: "", duration_minutes: 60,
};

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: color + "20", color }}>
      {label}
    </span>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Meeting | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    api.meetings.list(params.toString()).then(setMeetings).catch(() => {});
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (m: Meeting) => {
    setEditingId(m.id);
    setForm({ title: m.title, description: m.description, idea: m.idea, priority: m.priority,
      status: m.status, participants: m.participants,
      scheduled_at: m.scheduled_at.replace("Z", "").slice(0, 16), duration_minutes: m.duration_minutes });
    setShowForm(true); setShowDetail(null);
  };

  const handleSubmit = async () => {
    const data = { ...form, scheduled_at: new Date(form.scheduled_at).toISOString() };
    if (editingId) await api.meetings.update(editingId, data);
    else await api.meetings.create(data);
    setShowForm(false); load();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить совещание?")) { await api.meetings.delete(id); setShowDetail(null); load(); }
  };

  const getUserName = (u?: { first_name?: string; last_name?: string; username: string } | null) => {
    if (!u) return "—";
    if (u.first_name) return `${u.first_name} ${u.last_name || ""}`.trim();
    return u.username;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1B2A6B" }}>Совещания</h1>
          <p className="mt-1 text-sm" style={{ color: "#1B2A6B", opacity: 0.7 }}>Планирование и проведение совещаний</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90"
          style={{ backgroundColor: "#1B2A6B", color: "#F3EFE6" }}>
          <Plus size={18} /> Новое совещание
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#1B2A6B", opacity: 0.4 }} />
          <input type="text" placeholder="Поиск совещаний..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
            style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
          style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }}>
          <option value="">Все статусы</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: "#1B2A6B30" }}>
          <Clock size={48} className="mx-auto mb-3" style={{ color: "#1B2A6B", opacity: 0.3 }} />
          <p style={{ color: "#1B2A6B", opacity: 0.5 }}>Нет совещаний</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} onClick={() => setShowDetail(m)}
              className="rounded-xl border-2 px-5 py-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              style={{ borderColor: "#1B2A6B20" }}>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base" style={{ color: "#1B2A6B" }}>{m.title}</h3>
                <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "#1B2A6B", opacity: 0.5 }}>
                  <span>{getUserName(m.organizer_detail)}</span>
                  <span>•</span>
                  <span>{new Date(m.scheduled_at).toLocaleString("ru-RU")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge color={statusColors[m.status] || "#94a3b8"} label={statusLabels[m.status] || m.status} />
                <Badge color={priorityColors[m.priority] || "#94a3b8"} label={priorityLabels[m.priority] || m.priority} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#F3EFE6" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b-2" style={{ borderColor: "#1B2A6B" }}>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold" style={{ color: "#1B2A6B" }}>{showDetail.title}</h2>
                <p className="text-xs mt-1" style={{ color: "#1B2A6B", opacity: 0.5 }}>
                  {new Date(showDetail.scheduled_at).toLocaleString("ru-RU")} · {showDetail.duration_minutes} мин · {getUserName(showDetail.organizer_detail)}
                </p>
              </div>
              <div className="flex gap-1 ml-3">
                <button onClick={() => openEdit(showDetail)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: "#7FE0F520" }}>
                  <Edit2 size={16} style={{ color: "#1B2A6B" }} />
                </button>
                <button onClick={() => handleDelete(showDetail.id)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: "#ef444420" }}>
                  <Trash2 size={16} style={{ color: "#ef4444" }} />
                </button>
                <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg" style={{ backgroundColor: "#1B2A6B10" }}>
                  <X size={16} style={{ color: "#1B2A6B" }} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <Badge color={statusColors[showDetail.status] || "#94a3b8"} label={statusLabels[showDetail.status] || showDetail.status} />
                <Badge color={priorityColors[showDetail.priority] || "#94a3b8"} label={priorityLabels[showDetail.priority] || showDetail.priority} />
              </div>
              {showDetail.description && (
                <div><p className="text-xs font-medium mb-1" style={{ color: "#1B2A6B", opacity: 0.5 }}>Описание</p>
                  <p className="text-sm" style={{ color: "#1B2A6B" }}>{showDetail.description}</p></div>
              )}
              {showDetail.idea && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#7FE0F515", color: "#1B2A6B" }}>
                  <span className="font-medium">Идея:</span> {showDetail.idea}
                </div>
              )}
              {showDetail.participants && (
                <div><p className="text-xs font-medium mb-1" style={{ color: "#1B2A6B", opacity: 0.5 }}>Участники</p>
                  <p className="text-sm" style={{ color: "#1B2A6B" }}>{showDetail.participants}</p></div>
              )}
              <div className="text-sm" style={{ color: "#1B2A6B", opacity: 0.6 }}>
                Длительность: {showDetail.duration_minutes} мин
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#F3EFE6" }}>
            <div className="flex items-center justify-between p-5 border-b-2" style={{ borderColor: "#1B2A6B" }}>
              <h2 className="text-lg font-bold" style={{ color: "#1B2A6B" }}>{editingId ? "Редактировать совещание" : "Новое совещание"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#1B2A6B10" }}>
                <X size={18} style={{ color: "#1B2A6B" }} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Название *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} placeholder="Название совещания" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Описание</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none resize-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} rows={2} placeholder="Описание" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Идея</label>
                <textarea value={form.idea} onChange={(e) => setForm({ ...form, idea: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none resize-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} rows={2} placeholder="Опишите идею для совещания..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Статус</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Приоритет</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }}>
                    {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Дата и время</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} /></div>
                <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Длительность (мин)</label>
                  <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Участники</label>
                <input value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} placeholder="Через запятую: Али, Бекзод, Жамшид" /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t-2" style={{ borderColor: "#1B2A6B" }}>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium border-2"
                style={{ borderColor: "#1B2A6B20", color: "#1B2A6B" }}>Отмена</button>
              <button onClick={handleSubmit} disabled={!form.title} className="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#1B2A6B", color: "#F3EFE6" }}>{editingId ? "Сохранить" : "Создать"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
