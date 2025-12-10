import { create } from 'zustand';

export interface PresetMessageTemplate {
  id: string;
  category: 'standard' | 'emergency' | 'custom';
  name: string;
  message: string;
  isDefault: boolean;
}

interface PresetMessageStore {
  templates: PresetMessageTemplate[];
  addTemplate: (template: Omit<PresetMessageTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<PresetMessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
}

export const usePresetMessageStore = create<PresetMessageStore>((set) => ({
  templates: [
    {
      id: 'pm-t-1',
      category: 'standard',
      name: 'Daily Check-in',
      message: 'All good, on schedule',
      isDefault: true,
    },
    {
      id: 'pm-t-2',
      category: 'standard',
      name: 'Delayed but Safe',
      message: 'Delayed but safe, continuing as planned',
      isDefault: true,
    },
    {
      id: 'pm-t-3',
      category: 'standard',
      name: 'Made Camp',
      message: 'Made it to camp safely',
      isDefault: true,
    },
    {
      id: 'pm-t-4',
      category: 'standard',
      name: 'Weather Delay',
      message: 'Weather delay, sheltering in place',
      isDefault: true,
    },
    {
      id: 'pm-t-5',
      category: 'emergency',
      name: 'Need Pickup',
      message: 'Need pickup at current coordinates',
      isDefault: true,
    },
    {
      id: 'pm-t-6',
      category: 'emergency',
      name: 'Send Help',
      message: 'Emergency - send help immediately',
      isDefault: true,
    },
    {
      id: 'pm-t-7',
      category: 'emergency',
      name: 'Medical Emergency',
      message: 'Medical emergency - require evacuation',
      isDefault: true,
    },
    {
      id: 'pm-t-8',
      category: 'standard',
      name: 'Returning Early',
      message: 'Returning to base earlier than planned',
      isDefault: true,
    },
  ],
  addTemplate: (template) =>
    set((state) => ({
      templates: [
        ...state.templates,
        {
          ...template,
          id: `pm-t-${Date.now()}`,
        },
      ],
    })),
  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
}));
