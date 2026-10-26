import { useAuth } from './useAuth';
import { workspaceFor, workspacePath } from '@/lib/workspace';

// Espace de travail de l'utilisateur, déduit de son rôle (voir src/lib/workspace.ts)
export function useWorkspace() {
  const { user, loading } = useAuth();

  const workspace = workspaceFor(user?.role);
  const pole = user?.pole ?? '';
  const getBackLink = () => workspacePath(user ? { role: user.role, pole: user.pole } : null);

  return { workspace, pole, loading, getBackLink };
}
