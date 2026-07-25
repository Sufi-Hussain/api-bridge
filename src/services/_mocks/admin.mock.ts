// Mock enterprise data for the System Administration & IT module.
// Pure functions – no side effects. Swap for real APIs later without touching UI.
export interface AdminKPIs {
  organizations: number;
  employees: number;
  activeUsers: number;
  pendingInvitations: number;
  applications: number;
  devices: number;
  securityAlerts: number;
  failedLogins: number;
  storageUsedGB: number;
  storageQuotaGB: number;
  apiCalls24h: number;
  apiQuota24h: number;
  licensesUsed: number;
  licensesTotal: number;
  auditEvents24h: number;
  pendingAccessRequests: number;
  systemHealthPct: number;
}
export function getAdminKPIs(): AdminKPIs {
  return {
    organizations: 8,
    employees: 4218,
    activeUsers: 3841,
    pendingInvitations: 27,
    applications: 148,
    devices: 3612,
    securityAlerts: 12,
    failedLogins: 214,
    storageUsedGB: 1842,
    storageQuotaGB: 4096,
    apiCalls24h: 1_284_902,
    apiQuota24h: 2_500_000,
    licensesUsed: 3720,
    licensesTotal: 4500,
    auditEvents24h: 8421,
    pendingAccessRequests: 34,
    systemHealthPct: 99.94,
  };
}
export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: number;
  latencyMs: number;
}
export function getServiceStatus(): ServiceStatus[] {
  return [
    { name: "Web Application", status: "operational", uptime: 99.99, latencyMs: 142 },
    { name: "API Gateway", status: "operational", uptime: 99.98, latencyMs: 88 },
    { name: "Identity Provider", status: "operational", uptime: 99.99, latencyMs: 61 },
    { name: "Database Cluster", status: "operational", uptime: 100, latencyMs: 12 },
    { name: "File Storage", status: "degraded", uptime: 99.72, latencyMs: 310 },
    { name: "Notification Service", status: "operational", uptime: 99.95, latencyMs: 174 },
    { name: "Background Jobs", status: "operational", uptime: 99.9, latencyMs: 220 },
    { name: "Analytics Pipeline", status: "maintenance", uptime: 99.8, latencyMs: 405 },
  ];
}
export interface AdminActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: "user" | "role" | "device" | "app" | "security" | "config";
  timestamp: string;
}
export function getAdminActivity(): AdminActivity[] {
  return [
    { id: "a1", actor: "Priya Nair", action: "granted role", target: "Finance Admin → Rahul Iyer", category: "role", timestamp: "2m ago" },
    { id: "a2", actor: "System", action: "auto-suspended user", target: "guest.contractor@acme.com", category: "user", timestamp: "14m ago" },
    { id: "a3", actor: "Kenji Tanaka", action: "rotated API key", target: "svc-analytics", category: "security", timestamp: "38m ago" },
    { id: "a4", actor: "Sofia Almeida", action: "provisioned device", target: "MacBook Pro · MBP-2181", category: "device", timestamp: "1h ago" },
    { id: "a5", actor: "Marcus Chen", action: "installed application", target: "Figma · 220 licenses", category: "app", timestamp: "2h ago" },
    { id: "a6", actor: "Compliance Bot", action: "flagged policy violation", target: "Data export by ext-user-84", category: "security", timestamp: "3h ago" },
    { id: "a7", actor: "Aarav Sharma", action: "updated password policy", target: "Global · min length 14", category: "config", timestamp: "5h ago" },
    { id: "a8", actor: "Nora Berg", action: "approved access request", target: "Read-only SQL for BI Team", category: "role", timestamp: "6h ago" },
  ];
}
export interface AccessRequest {
  id: string;
  requester: string;
  resource: string;
  reason: string;
  requestedAt: string;
  risk: "low" | "medium" | "high";
}
export function getAccessRequests(): AccessRequest[] {
  return [
    { id: "r1", requester: "Amelia Rossi", resource: "Snowflake · Prod Warehouse", reason: "Q3 analytics rebuild", requestedAt: "10m ago", risk: "medium" },
    { id: "r2", requester: "Diego Fernandez", resource: "Admin Console · Billing", reason: "Vendor invoice reconciliation", requestedAt: "42m ago", risk: "high" },
    { id: "r3", requester: "Yuki Watanabe", resource: "GitHub · payments-service", reason: "Onboarding to platform team", requestedAt: "1h ago", risk: "low" },
    { id: "r4", requester: "Fatima Idris", resource: "Salesforce · Enterprise", reason: "Regional sales expansion", requestedAt: "3h ago", risk: "medium" },
    { id: "r5", requester: "Luca Moretti", resource: "AWS · production account", reason: "Incident response rotation", requestedAt: "5h ago", risk: "high" },
  ];
}
export interface SecurityAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  source: string;
  when: string;
}
export function getSecurityAlerts(): SecurityAlert[] {
  return [
    { id: "s1", severity: "critical", title: "Impossible travel detected", source: "Identity", when: "6m ago" },
    { id: "s2", severity: "high", title: "5 failed MFA challenges", source: "IAM", when: "22m ago" },
    { id: "s3", severity: "medium", title: "New OAuth consent granted", source: "Apps", when: "58m ago" },
    { id: "s4", severity: "medium", title: "Unmanaged device sign-in", source: "Devices", when: "2h ago" },
    { id: "s5", severity: "low", title: "Password reset spike", source: "Identity", when: "4h ago" },
  ];
}
export interface AiInsight {
  id: string;
  title: string;
  description: string;
  category: "security" | "licensing" | "compliance" | "cost" | "usage";
  impact: "high" | "medium" | "low";
}
export function getAiInsights(): AiInsight[] {
  return [
    { id: "i1", title: "Reclaim 118 idle licenses", description: "Adobe Creative Cloud seats unused > 60 days across Marketing and Design.", category: "licensing", impact: "high" },
    { id: "i2", title: "42 accounts inactive > 90 days", description: "Recommend automatic deactivation to reduce attack surface.", category: "security", impact: "high" },
    { id: "i3", title: "Password policy below baseline", description: "3 legal entities still allow 8-character passwords. Align to CIS L1.", category: "compliance", impact: "medium" },
    { id: "i4", title: "Duplicate integrations detected", description: "Slack and Teams both wired to the same alerting channel — consolidate.", category: "cost", impact: "medium" },
    { id: "i5", title: "Device compliance drift", description: "27 laptops missing latest OS patch — auto-remediation available.", category: "security", impact: "medium" },
  ];
}
// Time series for charts
export function getApiUsageSeries() {
  const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  const base = [42, 28, 22, 36, 78, 132, 168, 184, 172, 148, 96, 62];
  return hours.map((h, i) => ({ hour: h, calls: base[i] * 1000 + Math.round(Math.random() * 6000) }));
}
export function getLoginActivitySeries() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => ({
    day: d,
    successful: 3200 + i * 42 + Math.round(Math.random() * 200),
    failed: 20 + Math.round(Math.random() * 40) + (i === 3 ? 80 : 0),
  }));
}
export function getLicenseDistribution() {
  return [
    { name: "Microsoft 365", value: 1420 },
    { name: "Google Workspace", value: 980 },
    { name: "Adobe CC", value: 320 },
    { name: "Figma", value: 440 },
    { name: "Slack", value: 560 },
  ];
}
export function getDeviceComplianceDistribution() {
  return [
    { name: "Compliant", value: 3184 },
    { name: "At Risk", value: 296 },
    { name: "Non-Compliant", value: 92 },
    { name: "Unenrolled", value: 40 },
  ];
}
