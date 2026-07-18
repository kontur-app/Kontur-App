"use client";

import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { Plus, Search, Trash2, Edit2, X } from "lucide-react";

const statusLabels: Record<string, string> = {
  idea: "Идея", in_progress: "В работе", sold: "Продан",
  completed: "Завершён", cancelled: "Отменён", problematic: "Проблемный",
};
const priorityLabels: Record<string, string> = {
  low: "Низкий", medium: "Средний", high: "Высокий", urgent: "Срочный",
};
const statusColors: Record<string, string> = {
  idea: "#7FE0F5", in_progress: "#1B2A6B", sold: "#22c55e",
  completed: "#10b981", cancelled: "#94a3b8", problematic: "#ef4444",
};
const priorityColors: Record<string, string> = {
  low: "#94a3b8", medium: "#7FE0F5", high: "#f59e0b", urgent: "#ef4444",
};

interface UserBrief { id: number; username: string; first_name: string; last_name: string; }

const emptyForm = {
  name: "", description: "", status: "idea", priority: "medium",
  client: "", budget: 0, deadline: "", assigned_users: [] as number[],
};

function getUserName(u: { first_name?: string; last_name?: string; username: string }) {
  if (u.first_name) return `${u.first_name} ${u.last_name || ""}`.trim();
  return u.username;
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: color + "20", color }}>
      {label}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<UserBrief[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Project | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    api.projects.list(params.toString()).then(setProjects).catch(() => {});
  };

  useEffect(() => {
    load();
    api.auth.users().then(setAllUsers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); setUserDropdownOpen(false); };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, status: p.status, priority: p.priority,
      client: p.client, budget: Number(p.budget), deadline: p.deadline || "", assigned_users: p.assigned_users || [] });
    setShowForm(true); setShowDetail(null); setUserDropdownOpen(false);
  };

  const handleSubmit = async () => {
    const data = { ...form, deadline: form.deadline || null };
    if (editingId) await api.projects.update(editingId, data);
    else await api.projects.create(data);
    setShowForm(false); load();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить проект?")) { await api.projects.delete(id); setShowDetail(null); load(); }
  };

  const toggleUser = (userId: number) => {
    setForm((prev) => {
      const has = prev.assigned_users.includes(userId);
      return { ...prev, assigned_users: has ? prev.assigned_users.filter((id) => id !== userId) : [...prev.assigned_users, userId] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1B2A6B" }}>Проекты</h1>
          <p className="mt-1 text-sm" style={{ color: "#1B2A6B", opacity: 0.7 }}>Управление всеми проектами</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90"
          style={{ backgroundColor: "#1B2A6B", color: "#F3EFE6" }}>
          <Plus size={18} /> Новый проект
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#1B2A6B", opacity: 0.4 }} />
          <input type="text" placeholder="Поиск проектов..." value={search} onChange={(e) => setSearch(e.target.value)}
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

      {/* Minimal Cards */}
      {projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: "#1B2A6B30" }}>
          <p style={{ color: "#1B2A6B", opacity: 0.5 }}>Нет проектов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} onClick={() => setShowDetail(p)}
              className="rounded-xl border-2 px-5 py-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              style={{ borderColor: "#1B2A6B20" }}>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base" style={{ color: "#1B2A6B" }}>{p.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: "#1B2A6B", opacity: 0.5 }}>
                  {p.created_by_detail ? `Создал: ${getUserName(p.created_by_detail)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge color={statusColors[p.status] || "#94a3b8"} label={statusLabels[p.status] || p.status} />
                <Badge color={priorityColors[p.priority] || "#94a3b8"} label={priorityLabels[p.priority] || p.priority} />
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
                <h2 className="text-xl font-bold" style={{ color: "#1B2A6B" }}>{showDetail.name}</h2>
                <p className="text-xs mt-1" style={{ color: "#1B2A6B", opacity: 0.5 }}>
                  {showDetail.created_by_detail ? `Создал: ${getUserName(showDetail.created_by_detail)}` : ""}
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
              <div className="grid grid-cols-2 gap-4 text-sm">
                {showDetail.client && <div><p className="text-xs font-medium mb-0.5" style={{ color: "#1B2A6B", opacity: 0.5 }}>Клиент</p><p style={{ color: "#1B2A6B" }}>{showDetail.client}</p></div>}
                {Number(showDetail.budget) > 0 && <div><p className="text-xs font-medium mb-0.5" style={{ color: "#1B2A6B", opacity: 0.5 }}>Бюджет</p><p style={{ color: "#1B2A6B" }}>{Number(showDetail.budget).toLocaleString("ru-RU")} сум</p></div>}
                {showDetail.deadline && <div><p className="text-xs font-medium mb-0.5" style={{ color: "#1B2A6B", opacity: 0.5 }}>Дедлайн</p><p style={{ color: "#1B2A6B" }}>{new Date(showDetail.deadline).toLocaleDateString("ru-RU")}</p></div>}
              </div>
              {showDetail.assigned_users_detail && showDetail.assigned_users_detail.length > 0 && (
                <div><p className="text-xs font-medium mb-1" style={{ color: "#1B2A6B", opacity: 0.5 }}>Ответственные</p>
                  <div className="flex flex-wrap gap-1">
                    {showDetail.assigned_users_detail.map((u) => (
                      <span key={u.id} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#1B2A6B15", color: "#1B2A6B" }}>{getUserName(u)}</span>
                    ))}
                  </div></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#F3EFE6" }}>
            <div className="flex items-center justify-between p-5 border-b-2" style={{ borderColor: "#1B2A6B" }}>
              <h2 className="text-lg font-bold" style={{ color: "#1B2A6B" }}>{editingId ? "Редактировать проект" : "Новый проект"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg" style={{ backgroundColor: "#1B2A6B10" }}>
                <X size={18} style={{ color: "#1B2A6B" }} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Название *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} placeholder="Название проекта" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Описание</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none resize-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} rows={3} placeholder="Описание" /></div>
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
              <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Клиент</label>
                <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                  style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} placeholder="Имя клиента" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Бюджет (сум)</label>
                  <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} /></div>
                <div><label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Дедлайн</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2A6B" }}>Ответственные</label>
                <div className="relative">
                  <button type="button" onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm text-left flex items-center justify-between"
                    style={{ borderColor: "#1B2A6B20", backgroundColor: "#F3EFE6", color: "#1B2A6B" }}>
                    <span>{form.assigned_users.length === 0 ? "Выберите пользователей..." : `${form.assigned_users.length} выбрано`}</span>
                    <svg className={`w-4 h-4 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 rounded-lg border-2 max-h-48 overflow-y-auto"
                      style={{ backgroundColor: "#F3EFE6", borderColor: "#1B2A6B20" }}>
                      {allUsers.map((u) => {
                        const sel = form.assigned_users.includes(u.id);
                        return (
                          <button key={u.id} type="button" onClick={() => toggleUser(u.id)}
                            className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:opacity-80"
                            style={{ backgroundColor: sel ? "#1B2A6B15" : "transparent", color: "#1B2A6B" }}>
                            <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: sel ? "#1B2A6B" : "#1B2A6B40", backgroundColor: sel ? "#1B2A6B" : "transparent" }}>
                              {sel && <svg className="w-3 h-3" viewBox="0 0 20 20" fill="#F3EFE6"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            {getUserName(u)} <span className="text-xs opacity-50">@{u.username}</span>
                          </button>);
                      })}
                    </div>
                  )}
                </div>
                {form.assigned_users.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.assigned_users.map((uid) => {
                      const u = allUsers.find((u) => u.id === uid);
                      if (!u) return null;
                      return <span key={u.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer"
                        style={{ backgroundColor: "#1B2A6B15", color: "#1B2A6B" }} onClick={() => toggleUser(u.id)}>{getUserName(u)} <X size={10} /></span>;
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t-2" style={{ borderColor: "#1B2A6B" }}>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium border-2"
                style={{ borderColor: "#1B2A6B20", color: "#1B2A6B" }}>Отмена</button>
              <button onClick={handleSubmit} disabled={!form.name} className="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#1B2A6B", color: "#F3EFE6" }}>{editingId ? "Сохранить" : "Создать"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
