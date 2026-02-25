const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cle-du-memoire-back.vercel.app/api';

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
    async getUsers() {
        return this.request<{ users: any[] }>('/users');
    }

    async updateUser(id: string, data: any) {
        return this.request<{ user: any }>(`/users/${id}`, {
            method: 'PATCH',
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
    async getDocuments() {
        return this.request<{ documents: any[] }>('/documents');
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

    async getAllSubscriptions() {
        return this.request<{ subscriptions: any[] }>('/admin/subscriptions');
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
    async getMyMemoire() {
        return this.request<{ memoire: any; memoires?: any[] }>('/memoires');
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
    async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; university?: string; field?: string }) {
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
    async getNotifications() {
        return this.request<{ notifications: any[] }>('/notifications');
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

    async createEvent(data: { title: string; description?: string; date: string; type?: string }) {
        return this.request<{ event: any }>('/calendar', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteEvent(id: string) {
        return this.request<{ message: string }>(`/calendar/${id}`, { method: 'DELETE' });
    }

    async toggleEvent(id: string) {
        return this.request<{ event: any }>(`/calendar/${id}/toggle`, { method: 'PATCH' });
    }

    async getNextEvent() {
        return this.request<{ event: any }>('/calendar/next');
    }

    // Resources
    async getResources(category?: string) {
        const url = category && category !== 'ALL' ? `/resources?category=${category}` : '/resources';
        return this.request<{ resources: any[] }>(url);
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
