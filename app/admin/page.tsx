"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const SECRET_KEY = "referalka_admin_secret";

type RequestStatus = "PENDING" | "REFERRER_FOUND" | "PAID";
type UserRole = "CANDIDATE" | "REFERRER" | "LEAD";

interface AdminUserRef {
  id: number;
  firstName: string;
  username: string | null;
  photoUrl?: string | null;
}

interface AdminRequest {
  id: string;
  companySlug: string;
  companyName: string;
  status: string;
  referrerName: string | null;
  referrerUsername: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: AdminUserRef;
}

interface AdminUser {
  id: number;
  firstName: string;
  username: string | null;
  photoUrl: string | null;
  createdAt: string;
  role: UserRole;
  requestsCount: number;
  profile: {
    role: string;
    roles: string[];
    experience: number;
    companies: string[];
    isPublic: boolean;
    applicationSubmittedAt: string | null;
    telegramContact: string | null;
    linkedinUrl: string | null;
    location: string | null;
  } | null;
  referrer: {
    company: string | null;
    companies: string[];
    role: string | null;
    roles: string[];
    telegramContact: string | null;
  } | null;
}

interface AdminConnection {
  id: string;
  companyName: string;
  status: string;
  adminApprovalToken: string;
  adminApprovedAt: string | null;
  introEmailSentAt: string | null;
  createdAt: string;
  candidateUser: AdminUserRef;
  referrerUser: AdminUserRef;
}

interface AdminStats {
  totalUsers: number;
  candidates: number;
  referrers: number;
  leads: number;
  publicProfiles: number;
  submittedApplications: number;
  totalRequests: number;
  requestsPending: number;
  requestsReferrerFound: number;
  requestsPaid: number;
  totalConnections: number;
  connectionsPendingPayment: number;
  connectionsApproved: number;
  newUsers7d: number;
  newRequests7d: number;
}

interface OverviewPayload {
  stats: AdminStats;
  requests: AdminRequest[];
  users: AdminUser[];
  connections: AdminConnection[];
}

const REQUEST_STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Ожидает", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  REFERRER_FOUND: { label: "Реферер найден", cls: "bg-blue-50 text-[#1863e5] border-blue-200" },
  PAID: { label: "Оплачено", cls: "bg-green-50 text-green-700 border-green-200" },
};

const CONNECTION_STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: "Ждёт оплаты", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Одобрено", cls: "bg-green-50 text-green-700 border-green-200" },
};

const ROLE_META: Record<UserRole, { label: string; cls: string }> = {
  CANDIDATE: { label: "Кандидат", cls: "bg-[#EBF4FF] text-[#1863e5]" },
  REFERRER: { label: "Реферер", cls: "bg-purple-50 text-purple-700" },
  LEAD: { label: "Лид", cls: "bg-gray-100 text-gray-500" },
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF4FF] text-[11px] font-bold text-[#1863e5]">
      {initials(name)}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-[#1863e5]/30 bg-[#1863e5]/[0.04]" : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium text-[#718096]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        {value.toLocaleString("ru-RU")}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] text-[#A0AEC0]">{sub}</p> : null}
    </div>
  );
}

type TabKey = "requests" | "users" | "connections";

export default function AdminDashboardPage() {
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabKey>("requests");

  const [reqStatus, setReqStatus] = useState<"ALL" | RequestStatus>("ALL");
  const [reqSearch, setReqSearch] = useState("");
  const [userRole, setUserRole] = useState<"ALL" | UserRole>("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/overview?secret=${encodeURIComponent(key)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Ошибка загрузки");
        setData(null);
        return false;
      }
      setData(json as OverviewPayload);
      return true;
    } catch {
      setError("Сеть недоступна");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-login if a secret was stored in a previous session.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.sessionStorage.getItem(SECRET_KEY) : null;
    if (stored) {
      setSecret(stored);
      void load(stored).then((ok) => {
        if (!ok) window.sessionStorage.removeItem(SECRET_KEY);
      });
    }
  }, [load]);

  const handleLogin = async () => {
    const ok = await load(secret);
    if (ok) window.sessionStorage.setItem(SECRET_KEY, secret);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(SECRET_KEY);
    setData(null);
    setSecret("");
  };

  const updateRequestStatus = async (id: string, status: RequestStatus) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/requests?secret=${encodeURIComponent(secret)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Не удалось обновить статус");
        return;
      }
      setData((prev) =>
        prev
          ? { ...prev, requests: prev.requests.map((r) => (r.id === id ? { ...r, status } : r)) }
          : prev,
      );
    } finally {
      setBusyId(null);
    }
  };

  const approveConnection = async (conn: AdminConnection) => {
    if (!confirm(`Одобрить мэтч и отправить интро-письма?\n${conn.candidateUser.firstName} ↔ ${conn.referrerUser.firstName} (${conn.companyName})`))
      return;
    setBusyId(conn.id);
    try {
      const res = await fetch("/api/admin/referral-connections/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: conn.adminApprovalToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error ?? "Не удалось одобрить мэтч");
        return;
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              connections: prev.connections.map((c) =>
                c.id === conn.id
                  ? { ...c, status: "APPROVED", introEmailSentAt: new Date().toISOString() }
                  : c,
              ),
            }
          : prev,
      );
    } finally {
      setBusyId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!data) return [];
    const q = reqSearch.trim().toLowerCase();
    return data.requests.filter((r) => {
      if (reqStatus !== "ALL" && r.status !== reqStatus) return false;
      if (!q) return true;
      return (
        r.companyName.toLowerCase().includes(q) ||
        r.user.firstName.toLowerCase().includes(q) ||
        (r.user.username ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, reqStatus, reqSearch]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = userSearch.trim().toLowerCase();
    return data.users.filter((u) => {
      if (userRole !== "ALL" && u.role !== userRole) return false;
      if (!q) return true;
      return (
        u.firstName.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q) ||
        (u.profile?.companies ?? []).some((c) => c.toLowerCase().includes(q)) ||
        (u.referrer?.companies ?? []).some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [data, userRole, userSearch]);

  // ---- Auth gate ----
  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="h-16" />
        <div className="mx-auto max-w-sm px-4 py-16">
          <h1
            className="mb-6 text-2xl font-black text-[#171923]"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
          >
            Referalka · Админка
          </h1>
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <label className="mb-2 block text-sm font-medium text-[#4A5568]">Admin secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1863e5]"
            />
            {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading || !secret}
              className="w-full rounded-xl bg-[#1863e5] py-2.5 font-semibold text-white transition-colors hover:bg-[#1550c0] disabled:opacity-50"
            >
              {loading ? "Загрузка..." : "Войти"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="h-16" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-[#171923]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Referalka · Дашборд
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/candidates"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#4A5568] transition-colors hover:border-[#1863e5] hover:text-[#1863e5]"
            >
              Кандидаты ↗
            </Link>
            <button
              onClick={() => load(secret)}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#4A5568] transition-colors hover:border-[#1863e5] hover:text-[#1863e5] disabled:opacity-50"
            >
              {loading ? "…" : "Обновить"}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#718096] transition-colors hover:border-red-300 hover:text-red-500"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* KPI — users */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">Пользователи</p>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Всего юзеров" value={stats.totalUsers} sub={`+${stats.newUsers7d} за 7 дней`} highlight />
          <StatCard label="Кандидаты" value={stats.candidates} sub={`${stats.submittedApplications} отправили анкету`} />
          <StatCard label="Рефереры" value={stats.referrers} />
          <StatCard label="Публичные профили" value={stats.publicProfiles} />
        </div>

        {/* KPI — requests */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">Заявки на реферал</p>
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Всего заявок" value={stats.totalRequests} sub={`+${stats.newRequests7d} за 7 дней`} highlight />
          <StatCard label="Ожидают" value={stats.requestsPending} />
          <StatCard label="Реферер найден" value={stats.requestsReferrerFound} />
          <StatCard label="Оплачено" value={stats.requestsPaid} />
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(
            [
              { key: "requests", label: `Заявки · ${data.requests.length}` },
              { key: "users", label: `Юзеры · ${data.users.length}` },
              { key: "connections", label: `Мэтчи · ${data.connections.length}` },
            ] as { key: TabKey; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-[#1863e5] text-white" : "text-[#4A5568] hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---- Requests tab ---- */}
        {tab === "requests" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                placeholder="Поиск по кандидату или компании…"
                className="flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#1863e5]"
              />
              {(["ALL", "PENDING", "REFERRER_FOUND", "PAID"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setReqStatus(s)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    reqStatus === s
                      ? "border-[#1863e5] bg-[#1863e5] text-white"
                      : "border-gray-200 bg-white text-[#4A5568] hover:border-[#1863e5]"
                  }`}
                >
                  {s === "ALL" ? "Все" : REQUEST_STATUS_META[s].label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-[#A0AEC0]">
                    <th className="px-4 py-3 font-semibold">Кандидат</th>
                    <th className="px-4 py-3 font-semibold">Компания</th>
                    <th className="px-4 py-3 font-semibold">Статус</th>
                    <th className="px-4 py-3 font-semibold">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.user.firstName} photoUrl={r.user.photoUrl} />
                          <div>
                            <p className="font-semibold text-[#171923]">{r.user.firstName}</p>
                            {r.user.username && (
                              <p className="text-xs text-[#A0AEC0]">{r.user.username}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4A5568]">{r.companyName}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          disabled={busyId === r.id}
                          onChange={(e) => updateRequestStatus(r.id, e.target.value as RequestStatus)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold outline-none ${
                            REQUEST_STATUS_META[r.status]?.cls ?? "border-gray-200 text-gray-500"
                          }`}
                        >
                          {(["PENDING", "REFERRER_FOUND", "PAID"] as const).map((s) => (
                            <option key={s} value={s}>
                              {REQUEST_STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[#718096]">{fmtDate(r.createdAt)}</td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#A0AEC0]">
                        Заявок не найдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-[#A0AEC0]">Показано: {filteredRequests.length} из {data.requests.length}</p>
          </div>
        )}

        {/* ---- Users tab ---- */}
        {tab === "users" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Поиск по имени, email или компании…"
                className="flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#1863e5]"
              />
              {(["ALL", "CANDIDATE", "REFERRER", "LEAD"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    userRole === r
                      ? "border-[#1863e5] bg-[#1863e5] text-white"
                      : "border-gray-200 bg-white text-[#4A5568] hover:border-[#1863e5]"
                  }`}
                >
                  {r === "ALL" ? "Все" : ROLE_META[r].label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-[#A0AEC0]">
                    <th className="px-4 py-3 font-semibold">Юзер</th>
                    <th className="px-4 py-3 font-semibold">Роль</th>
                    <th className="px-4 py-3 font-semibold">Профиль</th>
                    <th className="px-4 py-3 font-semibold">Заявок</th>
                    <th className="px-4 py-3 font-semibold">Регистрация</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const roles = u.profile?.roles?.length
                      ? u.profile.roles
                      : u.profile?.role
                        ? [u.profile.role]
                        : u.referrer?.roles?.length
                          ? u.referrer.roles
                          : u.referrer?.role
                            ? [u.referrer.role]
                            : [];
                    const companies = u.profile?.companies?.length
                      ? u.profile.companies
                      : u.referrer?.companies?.length
                        ? u.referrer.companies
                        : u.referrer?.company
                          ? [u.referrer.company]
                          : [];
                    return (
                      <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={u.firstName} photoUrl={u.photoUrl} />
                            <div>
                              <p className="font-semibold text-[#171923]">{u.firstName}</p>
                              {u.username && <p className="text-xs text-[#A0AEC0]">{u.username}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_META[u.role].cls}`}>
                            {ROLE_META[u.role].label}
                          </span>
                          {u.profile?.isPublic && (
                            <span className="ml-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">
                              публ.
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#4A5568]">
                          {roles.length || companies.length ? (
                            <div className="flex flex-col gap-1">
                              {roles.length > 0 && (
                                <span className="text-xs text-[#171923]">
                                  {roles.slice(0, 2).join(", ")}
                                  {u.profile ? ` · ${u.profile.experience} лет` : ""}
                                </span>
                              )}
                              {companies.length > 0 && (
                                <span className="text-xs text-[#A0AEC0]">{companies.slice(0, 3).join(", ")}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[#CBD5E0]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[#171923]">{u.requestsCount}</span>
                        </td>
                        <td className="px-4 py-3 text-[#718096]">{fmtDate(u.createdAt)}</td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#A0AEC0]">
                        Юзеров не найдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-[#A0AEC0]">Показано: {filteredUsers.length} из {data.users.length}</p>
          </div>
        )}

        {/* ---- Connections tab ---- */}
        {tab === "connections" && (
          <div className="space-y-3">
            {data.connections.map((c) => {
              const meta = CONNECTION_STATUS_META[c.status] ?? {
                label: c.status,
                cls: "bg-gray-100 text-gray-500 border-gray-200",
              };
              const approved = c.status === "APPROVED" || !!c.introEmailSentAt;
              return (
                <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
                          {meta.label}
                        </span>
                        <span className="text-sm font-bold text-[#171923]">{c.companyName}</span>
                      </div>
                      <p className="text-sm text-[#4A5568]">
                        <span className="font-semibold text-[#171923]">{c.candidateUser.firstName}</span>
                        {c.candidateUser.username ? ` (${c.candidateUser.username})` : ""}
                        <span className="mx-2 text-[#CBD5E0]">↔</span>
                        <span className="font-semibold text-[#171923]">{c.referrerUser.firstName}</span>
                        {c.referrerUser.username ? ` (${c.referrerUser.username})` : ""}
                      </p>
                      <p className="mt-1 text-xs text-[#A0AEC0]">
                        Создан: {fmtDateTime(c.createdAt)}
                        {c.introEmailSentAt ? ` · Интро отправлено: ${fmtDateTime(c.introEmailSentAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {approved ? (
                        <span className="text-sm font-semibold text-green-600">✓ Одобрено</span>
                      ) : (
                        <button
                          onClick={() => approveConnection(c)}
                          disabled={busyId === c.id}
                          className="rounded-xl bg-[#1863e5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1550c0] disabled:opacity-50"
                        >
                          {busyId === c.id ? "Отправка…" : "Одобрить и свести"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {data.connections.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-[#A0AEC0]">
                Мэтчей пока нет
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
