import { create } from "zustand";
import type { Organization, User } from "@/types";
import { PERMISSIONS } from "@/config/permissions";

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const DEFAULT_USER: User = {
  id: "usr_001",
  name: "Aarav Sharma",
  email: "aarav.sharma@acme.com",
  jobTitle: "Senior Product Designer",
  department: "Design",
  employeeId: "EMP-10428",
  avatarUrl: undefined,
  roles: ["employee"],
  permissions: ALL_PERMISSIONS,
  organizationId: "org_acme",
};

const ORGS: Organization[] = [
  { id: "org_acme", name: "Acme Corporation", domain: "acme.com" },
  { id: "org_northwind", name: "Northwind Traders", domain: "northwind.com" },
];

interface AuthState {
  user: User;
  organizations: Organization[];
  activeOrgId: string;
  setActiveOrg: (id: string) => void;
  hasPermission: (permission?: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  organizations: ORGS,
  activeOrgId: DEFAULT_USER.organizationId,
  setActiveOrg: (id) => set({ activeOrgId: id }),
  hasPermission: (permission) => {
    if (!permission) return true;
    return get().user.permissions.includes(permission);
  },
}));
