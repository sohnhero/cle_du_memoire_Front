'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import MaintenancePage from './MaintenancePage';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const { config, user } = useAuth();
    const pathname = usePathname();

    const isMaintenance = config.maintenanceMode === 'true';
    const isAdmin = user?.role === 'ADMIN';
    const isLoginPage = pathname === '/login';

    // Allow access to login page even in maintenance
    if (isMaintenance && !isAdmin && !isLoginPage) {
        return <MaintenancePage />;
    }

    return <>{children}</>;
}
