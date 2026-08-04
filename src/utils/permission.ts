import type { User } from '@/types';

export const PERMISSIONS = {
  systemSettings: 'system:settings',
  systemPermission: 'system:permission',
  systemPermissionCreate: 'system:permission:create',
  systemPermissionEdit: 'system:permission:edit',
  systemPermissionDelete: 'system:permission:delete',
} as const;

export function hasPermission(user: User | null, permission: string): boolean {
  return user?.username === 'admin' || user?.permissions?.includes(permission) === true;
}
