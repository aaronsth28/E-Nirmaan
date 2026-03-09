export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function setAuth(user: User, token: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('role', user.role);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getRole(): string | null {
  return localStorage.getItem('role');
}

export function getUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
}

/** Return the dashboard path for a given role */
export function dashboardFor(role: string | null): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'STORE_MANAGER':
      return '/store';
    case 'SITE_ENGINEER':
      return '/engineer';
    default:
      return '/login';
  }
}
