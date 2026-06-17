// Stub for @workspace/api-client-react
import { useMutation, useQuery } from "@tanstack/react-query";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "analyst";
};

// Auth token getter
let _tokenGetter: (() => string | null) | null = null;
export function setAuthTokenGetter(fn: () => string | null) {
  _tokenGetter = fn;
}

// ── Query key helpers ──────────────────────────────────────────────
export const getListTransactionsQueryKey = () => ["transactions"];
export const getGetTransactionQueryKey = (id: unknown) => ["transaction", id];
export const getListCardsQueryKey = () => ["cards"];
export const getListAlertsQueryKey = () => ["alerts"];
export const getListNotificationsQueryKey = () => ["notifications"];
export const getListFraudCasesQueryKey = () => ["fraudCases"];
export const getListVirtualCardsQueryKey = () => ["virtualCards"];
export const getAdminListUsersQueryKey = () => ["adminUsers"];
export const getGetTrustedDevicesQueryKey = () => ["trustedDevices"];
export const getGetLoginHistoryQueryKey = () => ["loginHistory"];
export const getGetCommandCenterStatsQueryKey = () => ["commandCenterStats"];
export const getGetLiveFeedQueryKey = () => ["liveFeed"];

// ── Shared no-op mutation helper ───────────────────────────────────
function noopMutation<T = void>() {
  return useMutation<T, Error, unknown>({
    mutationFn: async () => ({}) as T,
  });
}

// ── Auth hooks ─────────────────────────────────────────────────────
export function useGetMe(opts?: { query?: object }) {
  return useQuery<User, Error>({
    queryKey: ["me"],
    queryFn: async () => {
      const token = _tokenGetter?.();
      if (!token) throw new Error("No token");
      return { id: 1, email: "admin@bank.com", name: "Admin User", role: "admin" };
    },
    ...(opts?.query ?? {}),
  });
}

export function useLogin() {
  return useMutation<{ token: string }, Error, { data: { email: string; password: string } }>({
    mutationFn: async ({ data }) => {
      if (data.email && data.password) return { token: "mock-token-123" };
      throw new Error("Invalid credentials");
    },
  });
}

export function useRegister() {
  return useMutation<{ token: string }, Error, { data: object }>({
    mutationFn: async () => ({ token: "mock-token-123" }),
  });
}

// ── Dashboard hooks ────────────────────────────────────────────────
export function useGetDashboardSummary() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => ({
      totalTransactions: 12843,
      fraudRate: 3.2,
      totalFlagged: 214,
      totalDeclined: 197,
      blockedCards: 8,
      activeAlerts: 5,
      avgRiskScore: 28,
      totalAmount: 4821000,
    }),
  });
}

export function useGetFraudTrend() {
  return useQuery({
    queryKey: ["fraudTrend"],
    queryFn: async () =>
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toISOString().split("T")[0],
          flagged: Math.floor(Math.random() * 20 + 5),
          approved: Math.floor(Math.random() * 400 + 300),
        };
      }),
  });
}

export function useGetRiskBreakdown() {
  return useQuery({
    queryKey: ["riskBreakdown"],
    queryFn: async () => [
      { level: "low", count: 8200 },
      { level: "medium", count: 3100 },
      { level: "high", count: 1100 },
      { level: "critical", count: 443 },
    ],
  });
}

export function useGetRecentFraud() {
  return useQuery({
    queryKey: ["recentFraud"],
    queryFn: async () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        merchant: ["AmazonPay", "ShopFast", "CryptoEx", "QuickTransfer", "GlobalMart"][i % 5],
        merchantCategory: ["E-commerce", "Retail", "Crypto", "Wire", "Grocery"][i % 5],
        amount: parseFloat((Math.random() * 2000 + 100).toFixed(2)),
        riskLevel: ["high", "critical", "high", "medium", "critical"][i % 5],
        status: ["flagged", "declined", "flagged", "pending", "declined"][i % 5],
        fraudProbability: Math.random() * 0.4 + 0.6,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      })),
  });
}

// ── Transaction hooks ──────────────────────────────────────────────
export function useListTransactions(opts?: { query?: object }) {
  return useQuery({
    queryKey: getListTransactionsQueryKey(),
    queryFn: async () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        merchant: ["AmazonPay", "Uber", "Netflix", "Walmart", "Apple"][i % 5],
        merchantCategory: ["E-commerce", "Transport", "Streaming", "Retail", "Tech"][i % 5],
        amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
        riskLevel: ["low", "medium", "high", "critical", "low"][i % 5],
        status: ["approved", "flagged", "declined", "pending", "approved"][i % 5],
        fraudProbability: Math.random() * 0.5,
        createdAt: new Date(Date.now() - i * 7200000).toISOString(),
        cardId: i + 1,
        userId: 1,
        description: "Purchase",
        currency: "USD",
        country: ["US", "UK", "CA", "DE", "FR"][i % 5],
      })),
    ...(opts?.query ?? {}),
  });
}

export function useGetTransaction(id: unknown, opts?: { query?: object }) {
  return useQuery({
    queryKey: getGetTransactionQueryKey(id),
    queryFn: async () => ({
      id,
      merchant: "AmazonPay",
      merchantCategory: "E-commerce",
      amount: 249.99,
      riskLevel: "high",
      status: "flagged",
      fraudProbability: 0.82,
      createdAt: new Date().toISOString(),
      cardId: 1,
      userId: 1,
      description: "Online Purchase",
      currency: "USD",
      country: "US",
      reviewNotes: null,
      reviewedBy: null,
      reviewedAt: null,
    }),
    ...(opts?.query ?? {}),
  });
}

export function useCreateTransaction() {
  return noopMutation();
}

export function useReviewTransaction() {
  return noopMutation();
}

// ── Card hooks ─────────────────────────────────────────────────────
export function useListCards(opts?: { query?: object }) {
  return useQuery({
    queryKey: getListCardsQueryKey(),
    queryFn: async () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        last4: String(1000 + i * 1111).slice(-4),
        brand: ["Visa", "Mastercard", "Amex"][i % 3],
        status: i === 2 ? "blocked" : "active",
        expiryMonth: 12,
        expiryYear: 2027,
        userId: 1,
        createdAt: new Date().toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

export function useCreateCard() {
  return noopMutation();
}

export function useBlockCard() {
  return noopMutation();
}

// ── Alert hooks ────────────────────────────────────────────────────
export function useListAlerts(opts?: { query?: object }) {
  return useQuery({
    queryKey: getListAlertsQueryKey(),
    queryFn: async () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: ["fraud_detected", "high_risk", "velocity_alert", "geo_anomaly"][i % 4],
        message: ["Unusual transaction pattern detected", "High risk score transaction", "Multiple rapid transactions", "Transaction from new country"][i % 4],
        severity: ["critical", "high", "medium", "low"][i % 4],
        read: i > 4,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        transactionId: i + 1,
      })),
    ...(opts?.query ?? {}),
  });
}

export function useMarkAlertRead() {
  return noopMutation();
}

// ── Notification hooks ─────────────────────────────────────────────
export function useListNotifications(opts?: { query?: object }) {
  return useQuery({
    queryKey: getListNotificationsQueryKey(),
    queryFn: async () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        title: ["New fraud alert", "Card blocked", "Login from new device", "Report ready"][i % 4],
        message: ["A high-risk transaction was flagged", "Card ending in 4242 was blocked", "New login from Chrome/Mac", "Monthly fraud report is ready"][i % 4],
        read: i > 3,
        createdAt: new Date(Date.now() - i * 7200000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

export function useMarkNotificationRead() {
  return noopMutation();
}

export function useMarkAllNotificationsRead() {
  return noopMutation();
}

// ── Fraud case hooks ───────────────────────────────────────────────
export function useListFraudCases(opts?: { query?: object }) {
  return useQuery({
    queryKey: getListFraudCasesQueryKey(),
    queryFn: async () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        caseNumber: `FC-2024-${String(i + 1).padStart(4, "0")}`,
        status: ["open", "investigating", "resolved", "closed"][i % 4],
        priority: ["critical", "high", "medium", "low"][i % 4],
        description: "Suspected fraudulent transaction pattern",
        assignedTo: i % 2 === 0 ? "Admin User" : null,
        transactionId: i + 1,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

export function useUpdateFraudCase() {
  return noopMutation();
}

// ── Virtual card hooks ─────────────────────────────────────────────
export function useListVirtualCards(opts?: { query?: object }) {
  return useQuery({
    queryKey: getListVirtualCardsQueryKey(),
    queryFn: async () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        last4: String(2000 + i * 1111).slice(-4),
        brand: "Visa",
        status: i === 1 ? "inactive" : "active",
        spendLimit: (i + 1) * 500,
        expiryMonth: 12,
        expiryYear: 2025,
        userId: 1,
        createdAt: new Date().toISOString(),
        label: `Virtual Card ${i + 1}`,
      })),
    ...(opts?.query ?? {}),
  });
}

export function useGenerateVirtualCard() {
  return noopMutation();
}

export function useDeactivateVirtualCard() {
  return noopMutation();
}

// ── Admin hooks ────────────────────────────────────────────────────
export function useGetAdminStats() {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => ({
      totalUsers: 42,
      activeUsers: 38,
      totalTransactions: 12843,
      fraudRate: 3.2,
      totalAlerts: 156,
      resolvedCases: 89,
    }),
  });
}

export function useAdminListUsers(opts?: { query?: object }) {
  return useQuery({
    queryKey: getAdminListUsersQueryKey(),
    queryFn: async () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        email: `user${i + 1}@bank.com`,
        name: `User ${i + 1}`,
        role: i === 0 ? "admin" : "analyst",
        status: i === 3 ? "suspended" : "active",
        createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
        lastLogin: new Date(Date.now() - i * 3600000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

export function useAdminUpdateUser() {
  return noopMutation();
}

export function useListFraudLogs(opts?: { query?: object }) {
  return useQuery({
    queryKey: ["fraudLogs"],
    queryFn: async () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        action: ["flag_transaction", "block_card", "create_case", "resolve_case"][i % 4],
        performedBy: "Admin User",
        targetId: i + 1,
        details: "Automated fraud detection",
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

// ── Audit log hooks ────────────────────────────────────────────────
export function useListAuditLogs(opts?: { query?: object }) {
  return useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        action: ["LOGIN", "TRANSACTION_REVIEW", "CARD_BLOCK", "CASE_UPDATE", "USER_UPDATE"][i % 5],
        userId: 1,
        userName: "Admin User",
        details: "Action performed successfully",
        ipAddress: "192.168.1." + (i + 1),
        userAgent: "Mozilla/5.0 Chrome/120",
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

// ── Security hooks ─────────────────────────────────────────────────
export function useGetTrustedDevices(opts?: { query?: object }) {
  return useQuery({
    queryKey: getGetTrustedDevicesQueryKey(),
    queryFn: async () => [
      { id: 1, name: "MacBook Pro", browser: "Chrome", os: "macOS", lastUsed: new Date().toISOString(), trusted: true },
      { id: 2, name: "iPhone 15", browser: "Safari", os: "iOS", lastUsed: new Date(Date.now() - 86400000).toISOString(), trusted: true },
    ],
    ...(opts?.query ?? {}),
  });
}

export function useGetLoginHistory(opts?: { query?: object }) {
  return useQuery({
    queryKey: getGetLoginHistoryQueryKey(),
    queryFn: async () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        ipAddress: "192.168.1." + (i + 1),
        country: ["US", "UK", "CA"][i % 3],
        city: ["New York", "London", "Toronto"][i % 3],
        device: "Chrome on macOS",
        success: i !== 2,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}

export function useRemoveDevice() {
  return noopMutation();
}

// ── Command center hooks ───────────────────────────────────────────
export function useGetCommandCenterStats(opts?: { query?: object }) {
  return useQuery({
    queryKey: getGetCommandCenterStatsQueryKey(),
    queryFn: async () => ({
      activeIncidents: 3,
      pendingReview: 12,
      resolvedToday: 8,
      alertsTriggered: 24,
      systemHealth: "operational",
    }),
    ...(opts?.query ?? {}),
  });
}

export function useGetLiveFeed(opts?: { query?: object }) {
  return useQuery({
    queryKey: getGetLiveFeedQueryKey(),
    queryFn: async () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: ["transaction", "alert", "case", "login"][i % 4],
        message: ["New high-risk transaction", "Fraud alert triggered", "Case escalated", "Admin login"][i % 4],
        severity: ["critical", "high", "medium", "low"][i % 4],
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      })),
    ...(opts?.query ?? {}),
  });
}
