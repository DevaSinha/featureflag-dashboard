"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
}

interface Organization {
    id: string;
    name: string;
    slug: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
}

interface AuthContextValue {
    user: User | null;
    organization: Organization | null;
    project: Project | null;
    organizations: Organization[];
    projects: Project[];
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setOrganization: (org: Organization | null) => void;
    setProject: (project: Project | null) => void;
    refreshOrganizations: () => Promise<void>;
    refreshProjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Handle auth errors (token expired and refresh failed)
    const handleAuthError = () => {
        setUser(null);
        setOrganization(null);
        setProject(null);
        setOrganizations([]);
        setProjects([]);
        // Only redirect if not already on a public page
        if (!publicRoutes.includes(pathname)) {
            router.push('/login?expired=true');
        }
    };

    // Fetch organizations list
    const refreshOrganizations = useCallback(async () => {
        const response = await api.getOrganizations();
        if (response.success && response.data) {
            setOrganizations(response.data);
            // Auto-select first org if none selected
            if (response.data.length > 0 && !organization) {
                handleSetOrganization(response.data[0]);
            }
        }
    }, [organization]);

    // Fetch projects list for current org
    const refreshProjects = useCallback(async () => {
        if (!organization) {
            setProjects([]);
            return;
        }
        const response = await api.getProjects(organization.id);
        if (response.success && response.data) {
            setProjects(response.data);
            // Auto-select first project if none selected
            if (response.data.length > 0 && !project) {
                handleSetProject(response.data[0]);
            }
        }
    }, [organization, project]);

    useEffect(() => {
        // Set auth error callback on API client
        api.setAuthErrorCallback(handleAuthError);

        // Check for existing token on mount
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        const savedOrg = localStorage.getItem('organization');
        const savedProject = localStorage.getItem('project');

        if (token && savedUser) {
            try {
                api.setTokens(token, localStorage.getItem('refresh_token'));
                setUser(JSON.parse(savedUser));
                if (savedOrg) setOrganization(JSON.parse(savedOrg));
                if (savedProject) setProject(JSON.parse(savedProject));
            } catch (e) {
                // Invalid stored data, clear it
                api.clearTokens();
            }
        }
        setIsLoading(false);
    }, []);

    // Fetch orgs when user is authenticated
    useEffect(() => {
        if (user) {
            refreshOrganizations();
        }
    }, [user]);

    // Fetch projects when org changes
    useEffect(() => {
        if (organization) {
            refreshProjects();
        } else {
            setProjects([]);
        }
    }, [organization]);

    // Redirect to login if accessing protected route without auth
    useEffect(() => {
        if (!isLoading && !user && !publicRoutes.includes(pathname) && pathname.startsWith('/dashboard')) {
            router.push('/login');
        }
    }, [isLoading, user, pathname, router]);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        if (response.success && response.data) {
            api.setTokens(response.data.access_token, response.data.refresh_token);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return { success: true };
        }
        return { success: false, error: response.error };
    };

    const register = async (email: string, password: string, name: string) => {
        const response = await api.register(email, password, name);
        if (response.success && response.data) {
            api.setTokens(response.data.access_token, response.data.refresh_token);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return { success: true };
        }
        return { success: false, error: response.error };
    };

    const logout = () => {
        api.clearTokens();
        setUser(null);
        setOrganization(null);
        setProject(null);
        setOrganizations([]);
        setProjects([]);
        router.push('/login');
    };

    const handleSetOrganization = (org: Organization | null) => {
        setOrganization(org);
        if (org) {
            localStorage.setItem('organization', JSON.stringify(org));
        } else {
            localStorage.removeItem('organization');
        }
        // Reset project when org changes
        setProject(null);
        setProjects([]);
        localStorage.removeItem('project');
    };

    const handleSetProject = (proj: Project | null) => {
        setProject(proj);
        if (proj) {
            localStorage.setItem('project', JSON.stringify(proj));
        } else {
            localStorage.removeItem('project');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                organization,
                project,
                organizations,
                projects,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                setOrganization: handleSetOrganization,
                setProject: handleSetProject,
                refreshOrganizations,
                refreshProjects,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
