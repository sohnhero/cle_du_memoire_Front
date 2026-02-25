// User types
export type Role = 'STUDENT' | 'ACCOMPAGNATEUR' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    university?: string;
    field?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

// Auth
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'STUDENT' | 'ACCOMPAGNATEUR';
    university?: string;
    field?: string;
}

// Packs
export interface Pack {
    id: string;
    name: string;
    description: string;
    price: number;
    installment1?: number;
    installment2?: number;
    features: string;
    isActive: boolean;
    sortOrder: number;
}

export type SubscriptionStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'ACTIVE' | 'EXPIRED';

export interface Subscription {
    id: string;
    userId: string;
    packId: string;
    status: SubscriptionStatus;
    amountPaid: number;
    activatedAt?: string;
    expiresAt?: string;
    pack: Pack;
}

// Memoire
export type MemoirePhase = 'TOPIC' | 'OUTLINE' | 'INTRO' | 'CHAPTER1' | 'CHAPTER2' | 'CHAPTER3' | 'CONCLUSION' | 'REVIEW' | 'FINAL';

export interface MemoireProgress {
    id: string;
    studentId: string;
    accompagnateurId?: string;
    title: string;
    phase: MemoirePhase;
    progressPercent: number;
    notes?: string;
    student?: User;
    accompagnateur?: User;
}

// Documents
export type DocumentStatus = 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISION_NEEDED';

export interface Document {
    id: string;
    uploaderId: string;
    memoireId?: string;
    filename: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    status: DocumentStatus;
    feedback?: string;
    uploader?: User;
}

// Messaging
export interface Conversation {
    id: string;
    participant1: User;
    participant2: User;
    lastMessageAt: string;
    messages: Message[];
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender?: User;
}

// Notifications
export interface Notification {
    id: string;
    title: string;
    content: string;
    isRead: boolean;
    type: string;
    createdAt: string;
}

// Dashboard stats
export interface AdminStats {
    totalUsers: number;
    totalStudents: number;
    totalAccompagnateurs: number;
    totalPacks: number;
    activeSubscriptions: number;
    totalDocuments: number;
    totalMessages: number;
}
