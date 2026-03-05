const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            if (typeof window !== 'undefined') localStorage.setItem('cdm_token', token);
        } else {
            if (typeof window !== 'undefined') localStorage.removeItem('cdm_token');
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cdm_token');
        }
        return null;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();
        const headers: any = {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        };

        if (typeof window !== 'undefined' && options.body instanceof FormData) {
            // Let the browser set the Content-Type with the boundary automatically
        } else {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        return this.request<{ user: any; token: string; refreshToken: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(data: any) {
        return this.request<{ user: any; token: string; refreshToken: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMe() {
        return this.request<{ user: any }>('/auth/me');
    }

    // Users
    async getUsers(page = 1, limit = 5, search = '', role = 'ALL', isActive?: boolean) {
        let url = `/users?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (role && role !== 'ALL') url += `&role=${role}`;
        if (isActive !== undefined) url += `&isActive=${isActive}`;
        return this.request<{ users: any[]; total: number; page: number; totalPages: number }>(url);
    }

    async updateUser(id: string, data: any) {
        return this.request<{ user: any }>(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async createUser(data: any) {
        return this.request<{ user: any }>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async assignCoach(studentId: string, coachId: string) {
        return this.request<{ message: string, memoire: any }>(`/users/${studentId}/assign-coach`, {
            method: 'POST',
            body: JSON.stringify({ coachId }),
        });
    }

    // Packs
    async getPacks() {
        return this.request<{ packs: any[] }>('/packs');
    }

    async subscribePack(packId: string) {
        return this.request('/packs/subscribe', {
            method: 'POST',
            body: JSON.stringify({ packId }),
        });
    }

    async notifyPayment(data: { method: string, reference: string, amount: number }) {
        return this.request('/packs/pay', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Documents
    async getDocuments(page = 1, limit = 5, search = '', category = 'ALL', status = 'ALL') {
        let url = `/documents?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category && category !== 'ALL') url += `&category=${category}`;
        if (status && status !== 'ALL') url += `&status=${status}`;
        return this.request<{ documents: any[]; total: number; page: number; totalPages: number }>(url);
    }

    async uploadDocument(data: FormData) {
        return this.request<{ document: any }>('/documents/upload', {
            method: 'POST',
            body: data,
        });
    }

    async reviewDocument(id: string, status: string, feedback: string) {
        return this.request<{ document: any }>(`/documents/${id}/review`, {
            method: 'PATCH',
            body: JSON.stringify({ status, feedback }),
        });
    }

    // Messaging
    async getConversations() {
        return this.request<{ conversations: any[] }>('/messaging/conversations');
    }

    async getChatPartners() {
        return this.request<{ partners: any[] }>('/messaging/partners');
    }

    async getMessages(conversationId: string) {
        return this.request<{ messages: any[] }>(`/messaging/conversations/${conversationId}/messages`);
    }

    async sendMessage(receiverId: string, content: string, file?: File | null) {
        if (file) {
            const formData = new FormData();
            formData.append('receiverId', receiverId);
            if (content) formData.append('content', content);
            formData.append('attachment', file);

            return this.request('/messaging/send', {
                method: 'POST',
                body: formData,
            });
        }

        return this.request('/messaging/send', {
            method: 'POST',
            body: JSON.stringify({ receiverId, content }),
        });
    }

    // Admin
    async getAdminStats() {
        return this.request<{ stats: any; recentUsers: any[]; recentActivity: any[] }>('/admin/stats');
    }

    async getTrackingData(page = 1, limit = 5, search = '', phase = 'ALL', coachId = '') {
        let url = `/admin/tracking?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (phase && phase !== 'ALL') url += `&phase=${phase}`;
        if (coachId) url += `&coachId=${coachId}`;
        return this.request<{
            memoires: any[]; total: number; page: number; totalPages: number;
            stats: any; coaches: any[];
        }>(url);
    }

    async getGlobalSettings() {
        return this.request<{ settings: any[] }>('/admin/config');
    }

    async getPublicSettings() {
        return this.request<{ settings: Record<string, string> }>('/admin/config/public');
    }

    async updateGlobalSettings(settings: { key: string, value: any }[]) {
        return this.request<{ settings: any[] }>('/admin/config', {
            method: 'PATCH',
            body: JSON.stringify({ settings }),
        });
    }

    async getAdminLogs(page = 1, limit = 5, search = '', type = 'ALL') {
        let url = `/admin/logs?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (type && type !== 'ALL') url += `&type=${type}`;
        return this.request<{ logs: any[]; total: number; page: number; totalPages: number }>(url);
    }

    async getAllSubscriptions(page = 1, limit = 5, search = '', status = 'ALL') {
        let url = `/admin/subscriptions?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status && status !== 'ALL') url += `&status=${status}`;
        return this.request<{ subscriptions: any[]; total: number; page: number; totalPages: number }>(url);
    }

    async activateSubscription(subscriptionId: string) {
        return this.request<{ subscription: any }>(`/packs/${subscriptionId}/activate`, {
            method: 'PATCH'
        });
    }

    async recordPayment(subscriptionId: string, amount: number) {
        return this.request<{ subscription: any }>(`/packs/subscriptions/${subscriptionId}/payment`, {
            method: 'PATCH',
            body: JSON.stringify({ amount }),
        });
    }

    async createPack(data: any) {
        return this.request<{ pack: any }>('/packs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Memoires
    async getMyMemoire(page = 1, limit = 5, search = '') {
        let url = `/memoires?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return this.request<{ memoire: any; memoires?: any[]; total?: number; page?: number; totalPages?: number }>(url);
    }

    async updateMemoire(id: string, data: Partial<{ title: string; phase: string; progressPercent: number; notes: string }>) {
        return this.request<{ memoire: any }>(`/memoires/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // Subscriptions (Student)
    async getMySubscriptions() {
        return this.request<{ subscriptions: any[] }>('/packs/my-subscriptions');
    }

    // Profile
    async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; university?: string; field?: string; studyLevel?: string; targetDefenseDate?: string }) {
        return this.request<{ user: any }>('/users/me/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async updateAvatar(avatar: string) {
        return this.request<{ user: any }>('/users/me/avatar', {
            method: 'PATCH',
            body: JSON.stringify({ avatar }),
        });
    }

    async changePassword(currentPassword: string, newPassword: string) {
        return this.request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    // Notifications
    async getNotifications(page = 1, limit = 5, unreadOnly = false) {
        let url = `/notifications?page=${page}&limit=${limit}`;
        if (unreadOnly) url += `&unread=true`;
        return this.request<{ notifications: any[]; total: number; page: number; totalPages: number }>(url);
    }

    async markNotificationRead(id: string) {
        return this.request<{ notification: any }>(`/notifications/${id}/read`, { method: 'PATCH' });
    }

    async markAllNotificationsRead() {
        return this.request<{ message: string }>('/notifications/read-all', { method: 'PATCH' });
    }

    // AI
    async aiCorrect(text: string) {
        return this.request<{ original: string; corrected: string; feedback: string }>('/ai/correct', {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }

    // Calendar
    async getEvents() {
        return this.request<{ events: any[] }>('/calendar');
    }

    async createEvent(data: { title: string; description?: string; date: string; type?: string; studentId?: string }) {
        return this.request<{ event: any }>('/calendar', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCoachStudents() {
        return this.request<{ students: any[] }>('/calendar/students');
    }

    async deleteEvent(id: string) {
        return this.request<{ message: string }>(`/calendar/${id}`, { method: 'DELETE' });
    }

    async toggleEvent(id: string) {
        return this.request<{ event: any }>(`/calendar/${id}/toggle`, { method: 'PATCH' });
    }

    async updateEvent(id: string, data: any) {
        return this.request<{ event: any }>(`/calendar/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async getNextEvent() {
        return this.request<{ event: any }>('/calendar/next');
    }

    // Resources
    async getResources(category?: string, page = 1, limit = 5, search = '') {
        let url = `/resources?page=${page}&limit=${limit}`;
        if (category && category !== 'ALL') {
            url += `&category=${category}`;
        }
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return this.request<{ resources: any[]; total: number; page: number; totalPages: number }>(url);
    }

    async createResource(data: FormData) {
        return this.request<{ resource: any }>('/resources', {
            method: 'POST',
            body: data,
        });
    }

    async deleteResource(id: string) {
        return this.request<{ message: string }>(`/resources/${id}`, { method: 'DELETE' });
    }

    async updateResource(id: string, data: any) {
        return this.request<{ resource: any }>(`/resources/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // Export PDF
    async exportPdf(title: string, content: string): Promise<Blob> {
        const token = this.getToken();
        const headers: any = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch(`${API_URL}/export`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de l'export PDF");
        }

        return response.blob();
    }
}

export const api = new ApiClient();
