import type { AppRole, Pole } from '@/types';

export type Workspace = 'dashboard' | 'commercial' | 'finance' | 'pole' | 'admin';

export function workspaceFor(role: AppRole | null | undefined): Workspace {
  switch (role) {
    case 'direction_generale':
      return 'dashboard';
    case 'commercial':
      return 'commercial';
    case 'finance_comptabilite':
      return 'finance';
    case 'responsable_pole':
      return 'pole';
    case 'back_office':
      return 'admin';
    case 'admin':
      return 'admin';
    default:
      return 'dashboard';
  }
}

export function workspacePath(profile: { role: AppRole; pole: Pole | null } | null | undefined): string {
  if (!profile) return '/dashboard';
  switch (workspaceFor(profile.role)) {
    case 'commercial':
      return '/commercial';
    case 'finance':
      return '/finance';
    case 'pole':
      return profile.pole ? `/poles/${encodeURIComponent(profile.pole)}` : '/dashboard';
    case 'admin':
      return '/admin/utilisateurs';
    default:
      return '/dashboard';
  }
}
