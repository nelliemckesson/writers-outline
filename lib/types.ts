export const NOTE_TYPES = ['new', 'todo', 'question', 'research', 'revision', 'continuity', 'cut'] as const;
export type NoteType = typeof NOTE_TYPES[number];

export const NOTE_TYPE_CONFIG: Record<NoteType, {
  label: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  bodyText: string;
}> = {
  new:        { label: 'New Content',  bg: 'bg-blue-50',   border: 'border-blue-400',   badgeBg: 'bg-blue-500',   badgeText: 'text-white', bodyText: 'text-blue-900' },
  todo:       { label: 'To Do',        bg: 'bg-amber-50',  border: 'border-amber-400',  badgeBg: 'bg-amber-500',  badgeText: 'text-white', bodyText: 'text-amber-900' },
  question:   { label: 'Question',     bg: 'bg-purple-50', border: 'border-purple-400', badgeBg: 'bg-purple-600', badgeText: 'text-white', bodyText: 'text-purple-900' },
  research:   { label: 'Research',     bg: 'bg-orange-50', border: 'border-orange-400', badgeBg: 'bg-orange-500', badgeText: 'text-white', bodyText: 'text-orange-900' },
  revision:   { label: 'Revision',     bg: 'bg-red-50',    border: 'border-red-400',    badgeBg: 'bg-red-500',    badgeText: 'text-white', bodyText: 'text-red-900' },
  continuity: { label: 'Continuity',   bg: 'bg-green-50',  border: 'border-green-400',  badgeBg: 'bg-green-600',  badgeText: 'text-white', bodyText: 'text-green-900' },
  cut:        { label: 'Consider Cut', bg: 'bg-gray-100',  border: 'border-gray-400',   badgeBg: 'bg-gray-500',   badgeText: 'text-white', bodyText: 'text-gray-800' },
};

export interface Note {
  type: NoteType;
  text: string;
}

export interface Line {
  line_number: string;
  text: string;
  tags: string[];
  notes: Note[];
}

export interface Chapter {
  chapter_number: number;
  lines: Line[];
}

export interface Outline {
  chapters: Chapter[];
}
