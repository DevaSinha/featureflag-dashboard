const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    authError?: boolean; // Flag for auth errors that need redirect
}

type AuthErrorCallback = () => void;

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;
    private refreshToken: string | null = null;
    private isRefreshing = false;
    private refreshPromise: Promise<boolean> | null = null;
    private onAuthError: AuthErrorCallback | null = null;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('access_token');
            this.refreshToken = localStorage.getItem('refresh_token');
        }
    }

    setAuthErrorCallback(callback: AuthErrorCallback) {
        this.onAuthError = callback;
    }

    setTokens(accessToken: string | null, refreshToken?: string | null) {
        this.token = accessToken;
        if (refreshToken !== undefined) {
            this.refreshToken = refreshToken;
        }
        if (typeof window !== 'undefined') {
            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
            } else {
                localStorage.removeItem('access_token');
            }
            if (refreshToken !== undefined) {
                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                } else {
                    localStorage.removeItem('refresh_token');
                }
            }
        }
    }

    getToken() {
        return this.token;
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('organization');
            localStorage.removeItem('project');
        }
    }

    private async tryRefreshToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.doRefreshToken();
        const result = await this.refreshPromise;
        this.isRefreshing = false;
        this.refreshPromise = null;
        return result;
    }

    private async doRefreshToken(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this.refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data?.access_token) {
                    this.setTokens(data.data.access_token, data.data.refresh_token);
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    private async request<T>(
        path: string,
        options: RequestInit = {},
        retryOnAuth = true
    ): Promise<ApiResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                ...options,
                headers,
            });

            // Handle 401 - try to refresh token
            if (response.status === 401 && retryOnAuth) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    // Retry the request with new token
                    return this.request<T>(path, options, false);
                } else {
                    // Refresh failed - trigger auth error
                    this.clearTokens();
                    if (this.onAuthError) {
                        this.onAuthError();
                    }
                    return { success: false, error: 'Session expired. Please login again.', authError: true };
                }
            }

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error?.message || data.error || `HTTP ${response.status}` };
            }

            return { success: true, data: data.data || data };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Auth
    async register(email: string, password: string, name: string) {
        return this.request<{ user: any; access_token: string; refresh_token: string }>(
            '/api/v1/auth/register',
            { method: 'POST', body: JSON.stringify({ email, password, name }) }
        );
    }

    async login(email: string, password: string) {
        return this.request<{ user: any; access_token: string; refresh_token: string }>(
            '/api/v1/auth/login',
            { method: 'POST', body: JSON.stringify({ email, password }) }
        );
    }

    // Organizations
    async getOrganizations() {
        return this.request<any[]>('/api/v1/organizations');
    }

    async createOrganization(name: string, slug: string) {
        return this.request<any>('/api/v1/organizations', {
            method: 'POST',
            body: JSON.stringify({ name, slug }),
        });
    }

    async updateOrganization(orgId: string, name: string) {
        return this.request<any>(`/api/v1/organizations/${orgId}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    }

    async deleteOrganization(orgId: string) {
        return this.request<any>(`/api/v1/organizations/${orgId}`, {
            method: 'DELETE',
        });
    }

    // Projects
    async getProjects(orgId: string) {
        return this.request<any[]>(`/api/v1/organizations/${orgId}/projects`);
    }

    async createProject(orgId: string, name: string, description: string) {
        return this.request<any>(`/api/v1/organizations/${orgId}/projects`, {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });
    }

    async updateProject(projectId: string, name: string, description?: string) {
        return this.request<any>(`/api/v1/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description }),
        });
    }

    async deleteProject(projectId: string) {
        return this.request<any>(`/api/v1/projects/${projectId}`, {
            method: 'DELETE',
        });
    }

    // Environments
    async getEnvironments(projectId: string) {
        return this.request<any[]>(`/api/v1/projects/${projectId}/environments`);
    }

    // API Keys
    async getApiKeys(projectId: string) {
        return this.request<any[]>(`/api/v1/projects/${projectId}/api-keys`);
    }

    async createApiKey(projectId: string, environmentId: string, name: string) {
        return this.request<any>(`/api/v1/projects/${projectId}/api-keys`, {
            method: 'POST',
            body: JSON.stringify({ environment_id: environmentId, name }),
        });
    }

    async deleteApiKey(projectId: string, keyId: string) {
        return this.request<any>(`/api/v1/projects/${projectId}/api-keys/${keyId}`, {
            method: 'DELETE',
        });
    }

    // Flags
    async getFlags(projectId: string) {
        return this.request<any[]>(`/api/v1/projects/${projectId}/flags`);
    }

    async getFlag(flagId: string) {
        return this.request<any>(`/api/v1/flags/${flagId}`);
    }

    async createFlag(projectId: string, data: {
        key: string;
        name: string;
        description?: string;
        type: 'BOOLEAN' | 'MULTIVARIATE';
        default_value: any;
        enabled: boolean;
    }) {
        return this.request<any>(`/api/v1/projects/${projectId}/flags`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateFlag(flagId: string, data: Partial<{
        name: string;
        description: string;
        default_value: any;
        enabled: boolean;
    }>) {
        return this.request<any>(`/api/v1/flags/${flagId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async toggleFlag(flagId: string) {
        return this.request<any>(`/api/v1/flags/${flagId}/toggle`, {
            method: 'PATCH',
        });
    }

    async deleteFlag(flagId: string) {
        return this.request<any>(`/api/v1/flags/${flagId}`, {
            method: 'DELETE',
        });
    }

    // Rules
    async getRules(flagId: string) {
        return this.request<any[]>(`/api/v1/flags/${flagId}/rules`);
    }

    async createRule(flagId: string, data: {
        environment_id: string;
        conditions: any[];
        rollout_percentage: number;
        enabled: boolean;
        priority?: number;
    }) {
        return this.request<any>(`/api/v1/flags/${flagId}/rules`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Experiments
    async getExperiments(projectId: string) {
        return this.request<any[]>(`/api/v1/projects/${projectId}/experiments`);
    }

    async getExperiment(expId: string) {
        return this.request<any>(`/api/v1/experiments/${expId}`);
    }

    async getExperimentMetrics(expId: string) {
        return this.request<any>(`/api/v1/experiments/${expId}/metrics`);
    }

    async createExperiment(projectId: string, data: {
        flag_id: string;
        name: string;
        description?: string;
        tracked_events: string[];
    }) {
        return this.request<any>(`/api/v1/projects/${projectId}/experiments`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Audit Logs
    async getAuditLogs(orgId: string, params?: { entity_type?: string; action?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<any[]>(`/api/v1/organizations/${orgId}/audit-logs${query ? `?${query}` : ''}`);
    }

    // Members
    async getMembers(orgId: string) {
        return this.request<any[]>(`/api/v1/organizations/${orgId}/members`);
    }

    async inviteMember(orgId: string, email: string, role: string) {
        return this.request<any>(`/api/v1/organizations/${orgId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email, role }),
        });
    }

    async removeMember(orgId: string, memberId: string) {
        return this.request<any>(`/api/v1/organizations/${orgId}/members/${memberId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();
export default api;
