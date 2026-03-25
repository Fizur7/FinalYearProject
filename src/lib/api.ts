const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running on port 8000.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

function formRequest(path: string, form: FormData) {
  const token = getToken();
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(async (r) => {
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: r.statusText }));
      throw new Error(err.detail ?? "Request failed");
    }
    return r.json();
  });
}

export const api = {
  auth: {
    register: (data: object) => request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: object) => request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    registerDriver: (data: object) => request("/api/auth/register-driver", { method: "POST", body: JSON.stringify(data) }),
    drivers: () => request("/api/auth/drivers"),
  },
  reports: {
    list: () => request("/api/reports/"),
    get: (id: string) => request(`/api/reports/${id}`),
    timeline: (id: string) => request(`/api/reports/${id}/timeline`),
    create: (form: FormData) => formRequest("/api/reports/", form),
  },
  dashboard: {
    stats: () => request("/api/dashboard/stats"),
    wasteDistribution: () => request("/api/dashboard/waste-distribution"),
    recentReports: () => request("/api/dashboard/recent-reports"),
  },
  rewards: {
    list: () => request("/api/rewards/"),
    redeem: (id: string) => request(`/api/rewards/${id}/redeem`, { method: "POST" }),
    leaderboard: () => request("/api/rewards/leaderboard"),
    myStats: () => request("/api/rewards/my-stats"),
  },
  admin: {
    reports: (status?: string) => request(`/api/admin/reports${status ? `?status=${status}` : ""}`),
    approve: (reportId: string, driverId: string) =>
      request(`/api/admin/reports/${reportId}/approve?driver_id=${driverId}`, { method: "POST" }),
    reject: (reportId: string, reason?: string) =>
      request(`/api/admin/reports/${reportId}/reject?reason=${encodeURIComponent(reason || "Does not meet criteria")}`, { method: "POST" }),
    drivers: () => request("/api/admin/drivers"),
  },
  driver: {
    tasks: () => request("/api/driver/tasks"),
    history: () => request("/api/driver/tasks/history"),
    update: (reportId: string, form: FormData) => formRequest(`/api/driver/tasks/${reportId}/update`, form),
    complete: (reportId: string, form: FormData) => formRequest(`/api/driver/tasks/${reportId}/complete`, form),
  },
};
