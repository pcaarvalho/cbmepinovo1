// ==============================================================================
// TYPES - AUTH & USERS DOMAIN
// ==============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  position?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: string;
  loginCount: number;
  organizationId: string;
  organization?: Organization;
  roles: UserRole[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings: OrganizationSettings;
  isActive: boolean;
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  features: {
    analytics: boolean;
    collaboration: boolean;
    api: boolean;
    customBranding: boolean;
    sso: boolean;
  };
  limits: {
    users: number;
    storage: number; // in GB
    apiCalls: number;
  };
  branding: {
    primaryColor: string;
    logoUrl?: string;
    customDomain?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  type: SubscriptionType;
  filter: Record<string, unknown>;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
}

export enum UserRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER'
}

export enum PermissionType {
  // Instructions
  INSTRUCTIONS_READ = 'INSTRUCTIONS_READ',
  INSTRUCTIONS_CREATE = 'INSTRUCTIONS_CREATE',
  INSTRUCTIONS_UPDATE = 'INSTRUCTIONS_UPDATE',
  INSTRUCTIONS_DELETE = 'INSTRUCTIONS_DELETE',

  // Analysis
  ANALYSIS_READ = 'ANALYSIS_READ',
  ANALYSIS_CREATE = 'ANALYSIS_CREATE',
  ANALYSIS_DELETE = 'ANALYSIS_DELETE',

  // Users
  USERS_READ = 'USERS_READ',
  USERS_CREATE = 'USERS_CREATE',
  USERS_UPDATE = 'USERS_UPDATE',
  USERS_DELETE = 'USERS_DELETE',

  // Analytics
  ANALYTICS_READ = 'ANALYTICS_READ',
  ANALYTICS_EXPORT = 'ANALYTICS_EXPORT',

  // System
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  AUDIT_LOGS = 'AUDIT_LOGS'
}

export enum SubscriptionType {
  NEW_INSTRUCTION = 'NEW_INSTRUCTION',
  INSTRUCTION_UPDATE = 'INSTRUCTION_UPDATE',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}