import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fraud-9lts.onrender.com/api";

let _tokenGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(fn: () => string | null) {
  _tokenGetter = fn;
}

function getHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = _tokenGetter?.();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Query keys
export const getListVirtualCardsQueryKey = () => ["virtualCards"];
export const getListTransactionsQueryKey = () => ["transactions"];
export const getGetTransactionQueryKey = (id: unknown) => ["transaction", id];
export const getListCardsQueryKey = () => ["cards"];
export const getListAlertsQueryKey = () => ["alerts"];
export const getListNotificationsQueryKey = () => ["notifications"];
export const getListFraudCasesQueryKey = () => ["fraudCases"];
export const getAdminListUsersQueryKey = () => ["adminUsers"];
export const getGetTrustedDevicesQueryKey = () => ["trustedDevices"];
export const getGetLoginHistoryQueryKey = () => ["loginHistory"];
export const getGetCommandCenterStatsQueryKey = () => ["commandCenterStats"];
export const getGetLiveFeedQueryKey = () => ["liveFeed"];

// Auth hooks
export function useGetMe(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => fetchAPI("/auth/me"),
    ...opts?.query,
  });
}

export function useLogin(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

export function useRegister(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string; name: string } }) =>
      fetchAPI("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

// Virtual Cards hooks
export function useListVirtualCards(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getListVirtualCardsQueryKey(),
    queryFn: () => fetchAPI("/virtual-cards"),
    ...opts?.query,
  });
}

export function useGenerateVirtualCard(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ data }: { data: { usageLimit?: number; validHours?: number; note?: string } }) =>
      fetchAPI("/virtual-cards/generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

export function useDeactivateVirtualCard(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      fetchAPI(`/virtual-cards/${id}/deactivate`, {
        method: "PATCH",
      }),
    ...opts?.mutation,
  });
}

// Dashboard hooks
export function useGetDashboardSummary(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => fetchAPI("/dashboard/summary"),
    ...opts?.query,
  });
}

export function useGetFraudTrend(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["fraudTrend"],
    queryFn: () => fetchAPI("/dashboard/fraud-trend"),
    ...opts?.query,
  });
}

export function useGetRiskBreakdown(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["riskBreakdown"],
    queryFn: () => fetchAPI("/dashboard/risk-breakdown"),
    ...opts?.query,
  });
}

export function useGetRecentFraud(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["recentFraud"],
    queryFn: () => fetchAPI("/dashboard/recent-fraud"),
    ...opts?.query,
  });
}

// Transaction hooks
export function useListTransactions(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getListTransactionsQueryKey(),
    queryFn: () => fetchAPI("/transactions"),
    ...opts?.query,
  });
}

export function useGetTransaction(id: unknown, opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getGetTransactionQueryKey(id),
    queryFn: () => fetchAPI(`/transactions/${id}`),
    ...opts?.query,
  });
}

export function useCreateTransaction(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      fetchAPI("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

export function useReviewTransaction(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetchAPI(`/transactions/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

// Card hooks
export function useListCards(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getListCardsQueryKey(),
    queryFn: () => fetchAPI("/cards"),
    ...opts?.query,
  });
}

export function useCreateCard(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      fetchAPI("/cards", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

export function useBlockCard(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { blocked: boolean; reason?: string } }) =>
      fetchAPI(`/cards/${id}/block`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

// Alert hooks
export function useListAlerts(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getListAlertsQueryKey(),
    queryFn: () => fetchAPI("/alerts"),
    ...opts?.query,
  });
}

export function useMarkAlertRead(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      fetchAPI(`/alerts/${id}/read`, {
        method: "PATCH",
      }),
    ...opts?.mutation,
  });
}

// Notification hooks
export function useListNotifications(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getListNotificationsQueryKey(),
    queryFn: () => fetchAPI("/notifications"),
    ...opts?.query,
  });
}

export function useMarkNotificationRead(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      fetchAPI(`/notifications/${id}/read`, {
        method: "PATCH",
      }),
    ...opts?.mutation,
  });
}

export function useMarkAllNotificationsRead(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: () =>
      fetchAPI("/notifications/read-all", {
        method: "PATCH",
      }),
    ...opts?.mutation,
  });
}

// Fraud case hooks
export function useListFraudCases(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getListFraudCasesQueryKey(),
    queryFn: () => fetchAPI("/fraud-cases"),
    ...opts?.query,
  });
}

export function useUpdateFraudCase(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetchAPI(`/fraud-cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

// Admin hooks
export function useGetAdminStats(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: () => fetchAPI("/admin/stats"),
    ...opts?.query,
  });
}

export function useAdminListUsers(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getAdminListUsersQueryKey(),
    queryFn: () => fetchAPI("/admin/users"),
    ...opts?.query,
  });
}

export function useAdminUpdateUser(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetchAPI(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

export function useListFraudLogs(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["fraudLogs"],
    queryFn: () => fetchAPI("/admin/fraud-logs"),
    ...opts?.query,
  });
}

// Audit log hooks
export function useListAuditLogs(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => fetchAPI("/audit-logs"),
    ...opts?.query,
  });
}

// Security hooks
export function useGetTrustedDevices(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getGetTrustedDevicesQueryKey(),
    queryFn: () => fetchAPI("/security/devices"),
    ...opts?.query,
  });
}

export function useGetLoginHistory(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getGetLoginHistoryQueryKey(),
    queryFn: () => fetchAPI("/security/login-history"),
    ...opts?.query,
  });
}

export function useRemoveDevice(opts?: { mutation?: Partial<UseMutationOptions<any, Error, any>> }) {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      fetchAPI(`/security/devices/${id}/remove`, {
        method: "DELETE",
      }),
    ...opts?.mutation,
  });
}

// Command center hooks
export function useGetCommandCenterStats(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getGetCommandCenterStatsQueryKey(),
    queryFn: () => fetchAPI("/command-center/stats"),
    ...opts?.query,
  });
}

export function useGetLiveFeed(opts?: { query?: Partial<UseQueryOptions> }) {
  return useQuery({
    queryKey: getGetLiveFeedQueryKey(),
    queryFn: () => fetchAPI("/live-feed"),
    ...opts?.query,
  });
}
