import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export type GlobalSettings = {
    platformName: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    maintenanceMode: string;
    allowRegistrations: string;
    facebookUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    [key: string]: string | undefined;
};

const DEFAULT_SETTINGS: GlobalSettings = {
    platformName: 'Clé du Mémoire',
    contactEmail: 'cledumemoire.sn@gmail.com',
    contactPhone: '+221 77 470 7413',
    contactAddress: 'Dakar, Sénégal — Almadies',
    maintenanceMode: 'false',
    allowRegistrations: 'true',
    facebookUrl: '#',
    instagramUrl: '#',
    linkedinUrl: '#',
    twitterUrl: '#',
    tiktokUrl: '#',
    youtubeUrl: '#',
};

export function useGlobalSettings() {
    const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await api.getPublicSettings();
                if (res && res.settings) {
                    setSettings(prev => ({
                        ...prev,
                        ...res.settings
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch public settings:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    return { settings, loading };
}
