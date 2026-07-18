"use client";

import { useEffect, useState } from "react";
import { api, ProjectStats, MeetingStats, Project, Meeting } from "@/lib/api";
import {
  FolderKanban,
  CalendarClock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  idea: "Идея",
  in_progress: "В работе",
  sold: "Продан",
  completed: "Завершён",
  cancelled: "Отменён",
  problematic: "Проблемный",
  scheduled: "Запланировано",
};

const statusColors: Record<string, string> = {
  idea: "#7FE0F5",
  in_progress: "#1B2A6B",
  sold: "#22c55e",
  completed: "#10b981",
  cancelled: "#94a3b8",
  problematic: "#ef4444",
  scheduled: "#7FE0F5",
};

export default function Dashboard() {
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [meetingStats, setMeetingStats] = useState<MeetingStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    api.projects.stats().then(setProjectStats).catch(() => {});
    api.meetings.stats().then(setMeetingStats).catch(() => {});
    api.projects.list().then((p) => setRecentProjects(p.slice(0, 5))).catch(() => {});
    api.meetings.upcoming().then(setUpcomingMeetings).catch(() => {});
  }, []);

  const statCards = [
    {
      title: "Всего проектов",
      value: projectStats?.total ?? 0,
      icon: FolderKanban,
      color: "#1B2A6B",
    },
    {
      title: "Бюджет",
      value: `${(projectStats?.total_budget ?? 0).toLocaleString("ru-RU")} сум`,
      icon: DollarSign,
      color: "#22c55e",
    },
    {
      title: "Ближайшие совещания",
      value: meetingStats?.upcoming ?? 0,
      icon: CalendarClock,
      color: "#7FE0F5",
    },
    {
      title: "Всего совещаний",
      value: meetingStats?.total ?? 0,
      icon: TrendingUp,
      color: "#1B2A6B",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#1B2A6B" }}>
          Дашборд
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#1B2A6B", opacity: 0.7 }}>
          Обзор проектов и совещаний
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl p-5 border-2 shadow-sm"
            style={{ backgroundColor: "#F3EFE6", borderColor: card.color + "30" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "#1B2A6B", opacity: 0.7 }}>
                  {card.title}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#1B2A6B" }}>
                  {card.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.color + "20" }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div
          className="rounded-xl border-2 p-6"
          style={{ borderColor: "#1B2A6B20" }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2A6B" }}>
            Последние проекты
          </h2>
          {recentProjects.length === 0 ? (
            <p className="text-sm" style={{ color: "#1B2A6B", opacity: 0.5 }}>
              Пока нет проектов
            </p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#1B2A6B20" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: "#1B2A6B" }}>
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ color: "#1B2A6B", opacity: 0.6 }}>
                      {p.client || "Без клиента"}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: (statusColors[p.status] || "#94a3b8") + "20",
                      color: statusColors[p.status] || "#94a3b8",
                    }}
                  >
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div
          className="rounded-xl border-2 p-6"
          style={{ borderColor: "#1B2A6B20" }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2A6B" }}>
            Ближайшие совещания
          </h2>
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm" style={{ color: "#1B2A6B", opacity: 0.5 }}>
              Нет запланированных совещаний
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#1B2A6B15" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: "#1B2A6B" }}>
                      {m.title}
                    </p>
                    <p className="text-xs" style={{ color: "#1B2A6B", opacity: 0.6 }}>
                      {new Date(m.scheduled_at).toLocaleString("ru-RU")} • {m.organizer_detail?.first_name || m.organizer_detail?.username || ""}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1"
                    style={{
                      backgroundColor:
                        m.priority === "urgent"
                          ? "#ef444420"
                          : m.priority === "high"
                          ? "#f59e0b20"
                          : "#7FE0F520",
                      color:
                        m.priority === "urgent"
                          ? "#ef4444"
                          : m.priority === "high"
                          ? "#f59e0b"
                          : "#1B2A6B",
                    }}
                  >
                    {m.priority === "urgent" ? (
                      <Zap size={12} />
                    ) : m.priority === "high" ? (
                      <AlertTriangle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {m.priority === "urgent"
                      ? "Срочно"
                      : m.priority === "high"
                      ? "Высокий"
                      : "Средний"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      {projectStats && Object.keys(projectStats.by_status).length > 0 && (
        <div
          className="rounded-xl border-2 p-6"
          style={{ borderColor: "#1B2A6B20" }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2A6B" }}>
            Распределение проектов по статусам
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(projectStats.by_status).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: (statusColors[status] || "#94a3b8") + "15",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[status] || "#94a3b8" }}
                />
                <span className="text-sm font-medium" style={{ color: "#1B2A6B" }}>
                  {statusLabels[status] || status}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
