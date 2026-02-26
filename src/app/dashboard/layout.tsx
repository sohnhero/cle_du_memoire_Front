'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    SquaresFour as LayoutDashboard, BookOpen, FileText, ChatCircle as MessageCircle, User, Gear as Settings,
    Users, ChartBar as BarChart3, ShieldCheck as Shield, SignOut as LogOut, CaretLeft as ChevronLeft, Bell, MagnifyingGlass as Search,
    List as Menu, X, GraduationCap, Package, Pulse as Activity, CaretDown as ChevronDown, CalendarBlank as CalendarDays
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import Logo from '@/components/Logo';
import Loader from '@/components/Loader';
import PaymentGate from '@/components/PaymentGate';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<any>;
}

const navByRole: Record<string, NavItem[]> = {
    STUDENT: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Mes Packs', href: '/dashboard/packs', icon: Package },
        { label: 'Suivi du Mémoire', href: '/dashboard/memoire', icon: BookOpen },
        { label: 'Ressources', href: '/dashboard/resources', icon: BookOpen },
        { label: 'Calendrier', href: '/dashboard/calendar', icon: CalendarDays },
        { label: 'Documents', href: '/dashboard/documents', icon: FileText },
        { label: 'Export PDF', href: '/dashboard/export', icon: FileText },
        { label: 'Messagerie', href: '/dashboard/messages', icon: MessageCircle },
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { label: 'Mon Profil', href: '/dashboard/profile', icon: User },
    ],
    ACCOMPAGNATEUR: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Mes Étudiants', href: '/dashboard/students', icon: Users },
        { label: 'Documents', href: '/dashboard/documents', icon: FileText },
        { label: 'Messagerie', href: '/dashboard/messages', icon: MessageCircle },
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { label: 'Mon Profil', href: '/dashboard/profile', icon: User },
    ],
    ADMIN: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Utilisateurs', href: '/dashboard/users', icon: Users },
        { label: 'Gestion Packs', href: '/dashboard/packs-admin', icon: Package },
        { label: 'Suivi Global', href: '/dashboard/tracking', icon: BarChart3 },
        { label: 'Messagerie', href: '/dashboard/messages', icon: MessageCircle },
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { label: 'Paramètres', href: '/dashboard/settings', icon: Settings },
        { label: 'Logs & Sécurité', href: '/dashboard/logs', icon: Shield },
    ],
};

const roleLabels: Record<string, string> = {
    STUDENT: 'Étudiant',
    ACCOMPAGNATEUR: 'Accompagnateur',
    ADMIN: 'Administrateur',
};

const roleBadgeColors: Record<string, string> = {
    STUDENT: 'bg-info/10 text-info',
    ACCOMPAGNATEUR: 'bg-success/10 text-success',
    ADMIN: 'bg-accent/10 text-accent',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return <Loader fullScreen show={true} text="Ouverture de votre espace..." />;
    }

    if (!user) return null;

    const navItems = navByRole[user.role] || [];

    return (
        <div className="min-h-screen bg-bg-light flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-primary z-40 overflow-hidden`}
            >
                {/* Logo */}
                <div className={`flex items-center justify-center h-20 border-b border-white/10 shrink-0`}>
                    <Link href="/dashboard" className="flex items-center justify-center w-full overflow-hidden px-4">
                        <Logo className={`h-auto transition-all duration-300 ${sidebarOpen ? 'w-20' : 'w-12'}`} variant="icon" monochrome />
                    </Link>
                </div>

                {/* Role Badge */}
                <div className="h-16 flex items-center justify-center shrink-0">
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${roleBadgeColors[user.role]}`}
                            >
                                {roleLabels[user.role]}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!sidebarOpen ? item.label : undefined}
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-accent/10 text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    } ${sidebarOpen ? 'gap-3' : 'justify-center'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-indicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-accent"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-accent' : 'group-hover:text-white'}`} />
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 shrink-0">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title={!sidebarOpen ? 'Agrandir' : undefined}
                        className={`flex items-center px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 w-full text-sm transition-colors ${sidebarOpen ? 'gap-3' : 'justify-center'}`}
                    >
                        <ChevronLeft className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    Réduire
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    <button
                        onClick={logout}
                        title={!sidebarOpen ? 'Déconnexion' : undefined}
                        className={`flex items-center px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 w-full text-sm transition-colors mt-1 ${sidebarOpen ? 'gap-3' : 'justify-center'}`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    Déconnexion
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            className="fixed top-0 left-0 h-full w-72 bg-primary z-50 lg:hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
                                <div className="flex items-center justify-center w-full">
                                    <Logo className="w-20 h-auto" variant="icon" monochrome />
                                </div>
                                <button onClick={() => setMobileSidebarOpen(false)} className="text-white/50 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="px-6 py-4">
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${roleBadgeColors[user.role]}`}>
                                    {roleLabels[user.role]}
                                </span>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link key={item.href} href={item.href}
                                            onClick={() => setMobileSidebarOpen(false)}
                                            className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-accent/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }`}>
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                                            )}
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-white/10">
                                <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 w-full text-sm">
                                    <LogOut className="w-5 h-5" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={false}
                animate={{ marginLeft: sidebarOpen ? 280 : 80 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'}`}
            >
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-black/[0.04]">
                    <div className="flex items-center justify-between px-4 sm:px-8 h-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-primary p-2">
                                <Menu className="w-6 h-6" />
                            </button>
                            <Logo className="w-32 h-auto lg:hidden" monochrome={false} variant="full" />
                            <div className="hidden sm:flex items-center gap-3 bg-bg-light/80 rounded-2xl px-4 py-3 w-72 border border-border/50 focus-within:border-accent/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-accent/10 transition-all shadow-sm">
                                <Search className="w-4 h-4 text-text-muted" />
                                <input type="text" placeholder="Rechercher..." className="bg-transparent text-sm outline-none flex-1 text-text-primary placeholder:text-text-muted" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2.5 rounded-xl hover:bg-bg-light transition-colors">
                                <Bell className="w-5 h-5 text-text-secondary" />
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-white" />
                            </button>

                            {/* User menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl hover:bg-bg-light transition-all border border-transparent hover:border-border/50 group"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left">
                                        <div className="text-sm font-semibold text-primary">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-text-muted">{roleLabels[user.role]}</div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-border-light p-2"
                                        >
                                            <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-bg-light">
                                                <User className="w-4 h-4" /> Mon Profil
                                            </Link>
                                            <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-bg-light">
                                                <Settings className="w-4 h-4" /> Paramètres
                                            </Link>
                                            <hr className="my-2 border-border-light" />
                                            <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full">
                                                <LogOut className="w-4 h-4" /> Déconnexion
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-8">
                    <PaymentGate user={user}>
                        {children}
                    </PaymentGate>
                </main>
            </motion.div>
        </div >
    );
}
