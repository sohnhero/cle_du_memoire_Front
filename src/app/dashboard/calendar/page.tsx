'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    CalendarBlank as CalendarIcon, Clock, Plus, Trash as Trash2, CalendarBlank as CalendarDays, Warning as AlertTriangle, Video, X, CaretLeft as ChevronLeft, CaretRight as ChevronRight, CheckCircle as CheckCircle2, Circle, UserCircle, ArrowSquareOut
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { useAuth } from '@/context/AuthContext';

export default function CalendarPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const res = await api.getEvents();
            setEvents(res.events || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
        try {
            await api.deleteEvent(id);
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const toggleEvent = async (id: string) => {
        try {
            const res = await api.toggleEvent(id);
            setEvents(events.map(e => e.id === id ? res.event : e));
        } catch (error) {
            console.error(error);
        }
    };

    const getEventIcon = (type: string, isCompleted: boolean) => {
        if (isCompleted) return <CheckCircle2 className="w-5 h-5 text-success" />;
        switch (type) {
            case 'DEADLINE': return <AlertTriangle className="w-5 h-5 text-error" />;
            case 'MEETING': return <Video className="w-5 h-5 text-info" />;
            default: return <Clock className="w-5 h-5 text-accent" />;
        }
    };

    const getEventStatusStyle = (event: any) => {
        const date = new Date(event.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (event.isCompleted) return 'border-border-light grayscale opacity-60';
        if (date < now) return 'border-error/30 bg-error/5';

        // Priority
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2 && event.type === 'DEADLINE') return 'border-error/30 bg-white ring-1 ring-error/20';

        return 'border-border-light bg-white hover:border-accent/40';
    };

    const getRelativeDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const eventDay = new Date(date);
        eventDay.setHours(0, 0, 0, 0);

        if (eventDay.getTime() === today.getTime()) return "Aujourd'hui";
        if (eventDay.getTime() === tomorrow.getTime()) return "Demain";

        const diffDays = Math.ceil((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 7) return `Dans ${diffDays} jours`;
        if (diffDays < 0) return `Il y a ${Math.abs(diffDays)} jours`;

        return eventDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    };

    const isUrgent = (event: any) => {
        if (event.isCompleted) return false;
        if (event.type !== 'DEADLINE') return false;
        const date = new Date(event.date);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    };

    // Calendar logic
    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start
    };

    const years = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(month, years);
    const firstDay = getFirstDayOfMonth(month, years);
    const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    const nextMonth = () => setCurrentDate(new Date(years, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(years, month - 1, 1));

    const eventsByDate: Record<string, any[]> = {};
    events.forEach(e => {
        const d = new Date(e.date).toDateString();
        if (!eventsByDate[d]) eventsByDate[d] = [];
        eventsByDate[d].push(e);
    });

    const upcomingEvents = events.filter(e => !e.isCompleted).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const completedEvents = events.filter(e => e.isCompleted).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!mounted || loading) {
        return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">
                        Calendrier & Échéances
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Organisez votre travail et suivez vos jalons importants</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary py-3 px-6 text-sm flex items-center gap-2 shadow-lg shadow-accent/20">
                    <Plus className="w-5 h-5" /> Ajouter une échéance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Calendar Widget */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="card-premium p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-primary capitalize">{monthNames[month]} {years}</h3>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-1.5 hover:bg-bg-light rounded-lg transition-colors border border-border-light"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={nextMonth} className="p-1.5 hover:bg-bg-light rounded-lg transition-colors border border-border-light"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                            {['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map(d => (
                                <span key={d} className="text-[10px] font-bold uppercase text-text-muted tracking-widest">{d}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dayNum = i + 1;
                                const dateObj = new Date(years, month, dayNum);
                                const isToday = dateObj.toDateString() === new Date().toDateString();
                                const hasEvents = !!eventsByDate[dateObj.toDateString()];
                                const hasUrgent = eventsByDate[dateObj.toDateString()]?.some(isUrgent);

                                return (
                                    <div key={dayNum}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative transition-all
                                            ${isToday ? 'bg-primary text-white font-bold shadow-md' : 'text-text-primary hover:bg-bg-light/80'}
                                            ${hasEvents && !isToday ? 'font-semibold' : ''}
                                        `}>
                                        {dayNum}
                                        {hasEvents && (
                                            <div className={`absolute bottom-1 w-1 h-1 rounded-full ${hasUrgent ? 'bg-error' : 'bg-accent'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-6 border-t border-border-light flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2 text-error"><div className="w-2 h-2 rounded-full bg-error" /> Urgent</div>
                            <div className="flex items-center gap-2 text-accent"><div className="w-2 h-2 rounded-full bg-accent" /> À venir</div>
                            <div className="flex items-center gap-2 text-text-muted"><div className="w-2 h-2 rounded-full bg-success" /> Terminée</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Event Lists */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Upcoming */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <BrandIcon icon={Clock} size={32} className="shadow-sm" />
                            <h2 className="text-xl font-bold text-primary">Prochaines échéances</h2>
                            <span className="px-2 py-0.5 rounded-full bg-bg-light border border-border text-xs font-bold text-text-secondary">
                                {upcomingEvents.length}
                            </span>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="card-premium p-12 text-center border-dashed border-2 bg-transparent">
                                <BrandIcon icon={Plus} size={56} className="mx-auto mb-3 opacity-30 grayscale" />
                                <p className="text-text-secondary">Aucune tâche prévue. Profitez-en pour avancer !</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingEvents.map(event => (
                                    <motion.div
                                        layout
                                        key={event.id}
                                        className={`card-premium p-4 flex items-center gap-4 transition-all group ${getEventStatusStyle(event)}`}
                                    >
                                        <button
                                            onClick={() => toggleEvent(event.id)}
                                            className="flex-shrink-0 hover:scale-110 transition-transform"
                                            disabled={event.isFromCoach}
                                        >
                                            <Circle className="w-6 h-6 text-border-dark group-hover:text-accent" />
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-bold text-primary truncate leading-tight">{event.title}</h3>
                                                {event.type === 'DEADLINE' && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Révision</span>}
                                                {event.type === 'MEETING' && <span className="bg-info/10 text-info text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Réunion</span>}
                                                {isUrgent(event) && <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Urgent</span>}
                                                {event.isFromCoach && <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-bold">Par {event.coachName}</span>}
                                            </div>
                                            {/* Student name for coach view */}
                                            {event.student && (
                                                <div className="flex items-center gap-1.5 text-xs text-info font-medium mb-1">
                                                    <UserCircle className="w-3.5 h-3.5" weight="fill" />
                                                    {event.student.firstName} {event.student.lastName}
                                                </div>
                                            )}
                                            {event.description && <p className="text-sm text-text-secondary line-clamp-1 mb-2">{event.description}</p>}
                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-bold text-accent">
                                                    <div className="w-1 h-1 rounded-full bg-accent" />
                                                    {getRelativeDateLabel(event.date)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Join meeting button */}
                                        {event.type === 'MEETING' && event.meetingLink && (
                                            <a
                                                href={event.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 bg-info text-white text-xs font-bold rounded-xl hover:bg-info/90 transition-colors shrink-0"
                                            >
                                                <Video className="w-4 h-4" weight="fill" /> Rejoindre
                                            </a>
                                        )}

                                        {!event.isFromCoach && (
                                            <button onClick={() => handleDelete(event.id)} className="p-2 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-error/5">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Completed */}
                    {completedEvents.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <BrandIcon icon={CheckCircle2} size={32} className="shadow-sm grayscale opacity-80" />
                                <h2 className="text-xl font-bold text-primary">Terminées</h2>
                                <span className="px-2 py-0.5 rounded-full bg-bg-light border border-border text-xs font-bold text-text-secondary">
                                    {completedEvents.length}
                                </span>
                            </div>

                            <div className="space-y-3 opacity-60">
                                {completedEvents.map(event => (
                                    <div key={event.id} className="card-premium p-4 flex items-center gap-4 bg-bg-light/40 border-dashed border-border group">
                                        <button onClick={() => toggleEvent(event.id)} className="flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-success" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-primary/50 text-sm line-through decoration-primary/30">{event.title}</h3>
                                            <p className="text-xs text-text-muted">Complété le {new Date(event.updatedAt).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <button onClick={() => handleDelete(event.id)} className="p-2 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && <AddEventModal onClose={() => setIsAddModalOpen(false)} onAdd={loadEvents} />}
            </AnimatePresence>
        </div>
    );
}

function AddEventModal({ onClose, onAdd }: { onClose: () => void, onAdd: () => void }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState('REMINDER');
    const [studentId, setStudentId] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCoach = user?.role === 'ACCOMPAGNATEUR' || user?.role === 'ADMIN';

    useEffect(() => {
        if (isCoach) {
            api.getCoachStudents().then(res => setStudents(res.students || [])).catch(() => { });
        }
    }, [isCoach]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !time) return;
        if (type === 'MEETING' && isCoach && !studentId) {
            toast.error('Veuillez sélectionner un étudiant pour la réunion');
            return;
        }
        setIsSubmitting(true);
        try {
            const dateTime = new Date(`${date}T${time}`).toISOString();
            await api.createEvent({
                title,
                description,
                date: dateTime,
                type,
                ...(type === 'MEETING' && studentId ? { studentId } : {}),
            });
            onAdd();
            onClose();
            toast.success(type === 'MEETING' ? 'Réunion planifiée ! L\'étudiant a été notifié.' : 'Événement créé !');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la création");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
                <div className="relative p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-primary tracking-tight">Nouvelle tâche</h3>
                        <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Titre de la tâche</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Révision biblio" className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all text-sm font-medium" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Type d'échéance</label>
                            <select value={type} onChange={e => setType(e.target.value)} disabled={user?.role === 'STUDENT'} className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm font-semibold appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                                <option value="REMINDER">📌 Rappel personnel</option>
                                {user?.role !== 'STUDENT' && (
                                    <>
                                        <option value="DEADLINE">🚨 Échéance de rendu</option>
                                        <option value="MEETING">👥 Réunion / Séance</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Student picker for coaches on MEETING type */}
                        {type === 'MEETING' && isCoach && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Étudiant concerné</label>
                                {students.length === 0 ? (
                                    <p className="text-xs text-text-muted px-1">Aucun étudiant assigné</p>
                                ) : (
                                    <select
                                        value={studentId}
                                        onChange={e => setStudentId(e.target.value)}
                                        required
                                        className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Choisir un étudiant...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                        ))}
                                    </select>
                                )}
                                <p className="text-[10px] text-info px-1 flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Un lien de réunion Jitsi sera généré automatiquement
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm font-semibold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Heure</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm font-semibold" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Notes</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Précisez votre objectif ici..." rows={3} className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all text-sm font-medium resize-none" />
                        </div>

                        <div className="pt-4 grid grid-cols-2 gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-3.5 text-sm font-bold text-text-secondary hover:bg-bg-light rounded-2xl transition-colors">
                                Annuler
                            </button>
                            <button type="submit" disabled={isSubmitting || !title || !date || !time} className="btn-primary px-6 py-3.5 text-sm shadow-lg shadow-accent/20">
                                {isSubmitting ? '...' : type === 'MEETING' ? 'Planifier' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
