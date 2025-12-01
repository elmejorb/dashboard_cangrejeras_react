// Role-based permissions for the Admin Dashboard

export type UserRole = 'Super Admin' | 'Admin' | 'Editor' | 'Moderador';

export type Section =
  | 'dashboard'
  | 'players'
  | 'matches'
  | 'standings'
  | 'voting'
  | 'news'
  | 'media'
  | 'banners'
  | 'settings'
  | 'profile';

// Define which sections each role can access
const ROLE_PERMISSIONS: Record<UserRole, Section[]> = {
  'Super Admin': [
    'dashboard',
    'players',
    'matches',
    'standings',
    'voting',
    'news',
    'media',
    'banners',
    'settings',
    'profile'
  ],
  'Admin': [
    'dashboard',
    'players',
    'matches',
    'standings',
    'voting',
    'news',
    'media',
    'banners',
    'profile'
    // No access to 'settings' (user management)
  ],
  'Editor': [
    'dashboard',
    'matches',
    'voting',
    'profile'
    // Only access to Partidos and Votaciones
  ],
  'Moderador': [
    'dashboard',
    'news',
    'profile'
    // Only access to news moderation
  ]
};

/**
 * Check if a user role has access to a specific section
 */
export function canAccessSection(role: UserRole, section: Section): boolean {
  const allowedSections = ROLE_PERMISSIONS[role];
  return allowedSections?.includes(section) ?? false;
}

/**
 * Get all sections a role can access
 */
export function getAllowedSections(role: UserRole): Section[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get the default section for a role (where to redirect if trying to access unauthorized section)
 */
export function getDefaultSection(role: UserRole): Section {
  const allowed = ROLE_PERMISSIONS[role];
  if (allowed && allowed.length > 0) {
    return allowed[0]; // Return first allowed section (usually dashboard)
  }
  return 'dashboard';
}

/**
 * Check if role can manage users (only Super Admin)
 */
export function canManageUsers(role: UserRole): boolean {
  return role === 'Super Admin';
}

/**
 * Check if role can delete content
 */
export function canDeleteContent(role: UserRole): boolean {
  return role === 'Super Admin' || role === 'Admin';
}

/**
 * Get role display name in Spanish
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    'Super Admin': 'Super Administrador',
    'Admin': 'Administrador',
    'Editor': 'Editor',
    'Moderador': 'Moderador'
  };
  return names[role] || role;
}
