import type { LucideIcon } from "lucide-react";

export type Permission = string;

export type Role = "employee" | "manager" | "hr" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  avatarUrl?: string;
  roles: Role[];
  permissions: Permission[];
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
}

export interface NavItem {
  label: string;
  path?: string;
  icon?: LucideIcon;
  permission?: Permission;
  badge?: string;
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export type StatusTone =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "muted";
