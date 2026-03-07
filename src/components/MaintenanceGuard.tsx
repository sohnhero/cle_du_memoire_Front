'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import MaintenancePage from './MaintenancePage';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const { config, user, settingsLoading } = useAuth();
    const pathname = usePathname();

    const isMaintenance = config.maintenanceMode === 'true';
    const isAdmin = user?.role === 'ADMIN';
    const isLoginPage = pathname === '/login';

    // Wait for settings to load to avoid "flashing" the app
    if (settingsLoading) {
        return null;
    }

    // Block non-admins if maintenance is active
    // Allow access to login page for everyone (admins need it to log in)
    if (isMaintenance && !isAdmin && !isLoginPage) {
        return <MaintenancePage />;
    }

    return <>{children}</>;
}
