const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) {
  if (isDev) {
    // In development, use local Django backend
    // Temporarily set to http://localhost:8000/api
  }
}
const _API_BASE: string = API_BASE || (isDev ? "http://localhost:8000/api" : "");

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!_API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. " +
      "Set it in Vercel Dashboard (e.g. https://your-backend.vercel.app/api) " +
      "or create a .env.local file with NEXT_PUBLIC_API_URL=http://localhost:8000/api"
    );
  }
  const res = await fetch(`${_API_BASE}${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || data?.username?.[0] || `API error: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export interface UserProfile {
  direction: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
  direction?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  client: string;
  budget: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_detail: { id: number; username: string; first_name: string; last_name: string } | null;
  assigned_users: number[];
  assigned_users_detail: { id: number; username: string; first_name: string; last_name: string }[];
  comments: Comment[];
}

export interface Comment {
  id: number;
  project: number;
  text: string;
  author: number | null;
  author_detail: { id: number; username: string; first_name: string; last_name: string } | null;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  description: string;
  idea: string;
  priority: string;
  status: string;
  organizer: number | null;
  organizer_detail: { id: number; username: string; first_name: string; last_name: string } | null;
  participants: string;
  scheduled_at: string;
  duration_minutes: number;
  created_by: number | null;
  created_by_detail: { id: number; username: string; first_name: string; last_name: string } | null;
  created_at: string;
  updated_at: string;
  notes: Note[];
}

export interface Note {
  id: number;
  meeting: number;
  text: string;
  author: number | null;
  author_detail: { id: number; username: string; first_name: string; last_name: string } | null;
  created_at: string;
}

export interface AppSettings {
  id: number;
  app_name: string;
  logo: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  updated_at: string;
}

export interface ProjectStats {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  total_budget: number;
}

export interface MeetingStats {
  total: number;
  upcoming: number;
  by_status: Record<string, number>;
}

export const api = {
  auth: {
    register: (data: {
      username: string;
      password: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      direction?: string;
    }) => fetchAPI<User>("/auth/register/", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      fetchAPI<User>("/auth/login/", { method: "POST", body: JSON.stringify(data) }),
    logout: () =>
      fetchAPI<void>("/auth/logout/", { method: "POST" }),
    me: () => fetchAPI<User | { user: null }>("/auth/me/"),
    users: () => fetchAPI<{ id: number; username: string; first_name: string; last_name: string }[]>("/users/"),
  },
  projects: {
    list: (params?: string) => fetchAPI<Project[]>(`/projects/${params ? `?${params}` : ""}`),
    get: (id: number) => fetchAPI<Project>(`/projects/${id}/`),
    create: (data: Partial<Project>) =>
      fetchAPI<Project>("/projects/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Project>) =>
      fetchAPI<Project>(`/projects/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchAPI<void>(`/projects/${id}/`, { method: "DELETE" }),
    stats: () => fetchAPI<ProjectStats>("/projects/stats/"),
  },
  meetings: {
    list: (params?: string) => fetchAPI<Meeting[]>(`/meetings/${params ? `?${params}` : ""}`),
    get: (id: number) => fetchAPI<Meeting>(`/meetings/${id}/`),
    create: (data: Partial<Meeting>) =>
      fetchAPI<Meeting>("/meetings/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Meeting>) =>
      fetchAPI<Meeting>(`/meetings/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetchAPI<void>(`/meetings/${id}/`, { method: "DELETE" }),
    upcoming: () => fetchAPI<Meeting[]>("/meetings/upcoming/"),
    stats: () => fetchAPI<MeetingStats>("/meetings/stats/"),
  },
  settings: {
    get: () => fetchAPI<AppSettings>("/settings/"),
    update: (data: Partial<AppSettings>) =>
      fetchAPI<AppSettings>("/settings/", { method: "POST", body: JSON.stringify(data) }),
  },
};
