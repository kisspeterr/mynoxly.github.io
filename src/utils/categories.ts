import { BarChart2, Beer, Utensils, CalendarCheck, Music, MoreHorizontal } from 'lucide-react';

export const CATEGORY_LABELS: Record<string, string> = {
    Bar: 'Bár',
    Pub: 'Kocsma',
    Restaurant: 'Étterem',
    EventOrganizer: 'Rendezvényszervezés',
    Club: 'Klub',
    Other: 'Egyéb',
};

// Helper to map string icon name to Lucide icon component (for display only)
export const CATEGORY_ICONS: Record<string, React.FC<any>> = {
    Bar: BarChart2,
    Pub: Beer,
    Restaurant: Utensils,
    EventOrganizer: CalendarCheck,
    Club: Music,
    Other: MoreHorizontal,
};