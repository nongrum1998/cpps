import { RoleT } from '@sharedTypes/auth';
import { useAuthStore } from '@stores/auth.store';

/**
 * useAccess hook
 * Centralizes role-based access control (RBAC) logic for UI elements.
 *
 * @param allowedRoles - Optional role or array of roles that are allowed.
 * @returns { hasAccess, checkAccess, currentRole }
 *
 * Usage:
 * const { hasAccess } = useAccess(['SUPER_ADMIN', 'ADMIN']);
 * if (hasAccess) return <AdminButton />;
 *
 * Or:
 * const { checkAccess } = useAccess();
 * <Button disabled={!checkAccess('SUPER_ADMIN')} />
 */
export const useAccess = (allowedRoles?: RoleT | RoleT[]) => {
  const { role: currentRole } = useAuthStore();

  /**
   * Internal function to check if the current user has one of the required roles.
   */
  const checkAccess = (requiredRoles: RoleT | RoleT[]) => {
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.includes(currentRole);
  };

  // If allowedRoles is provided, we pre-calculate the result.
  const hasAccess = allowedRoles ? checkAccess(allowedRoles) : false;

  return {
    hasAccess,
    checkAccess,
    currentRole,
  };
};
