import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string, organizations: Organization[]) => void;
  setCurrentOrganization: (org: Organization) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      organizations: [],
      currentOrganization: null,
      isAuthenticated: false,

      setAuth: (user, token, organizations) => {
        set({
          user,
          token,
          organizations,
          currentOrganization: organizations[0] || null,
          isAuthenticated: true,
        });
      },

      setCurrentOrganization: (org) => {
        set({ currentOrganization: org });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          organizations: [],
          currentOrganization: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
