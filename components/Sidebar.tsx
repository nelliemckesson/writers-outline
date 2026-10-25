'use client'

import { Chapter, NoteType, NOTE_TYPES, NOTE_TYPE_CONFIG } from '@/lib/types'

interface SidebarProps {
  chapters: Chapter[]
  allTags: string[]
  tagCounts: Record<string, number>
  activeView: 'all' | number
  activeTagFilter: string[]
  activeNoteTypeFilter: NoteType | null
  availableFiles: string[]
  activeFile: string | null
  saving: boolean
  onViewChange: (v: 'all' | number) => void
  onTagToggle: (tag: string) => void
  onTagsClear: () => void
  onNoteTypeFilter: (type: NoteType) => void
  onFileChange: (file: string) => void
}

export default function Sidebar({
  chapters,
  allTags,
  tagCounts,
  activeView,
  activeTagFilter,
  activeNoteTypeFilter,
  availableFiles,
  activeFile,
  saving,
  onViewChange,
  onTagToggle,
  onTagsClear,
  onNoteTypeFilter,
  onFileChange,
}: SidebarProps) {
  return (
    <aside className="bg-slate-800 text-slate-100 h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-700">
        <h1 className="font-bold text-lg text-white leading-tight">Writers Outline</h1>
        <div className="mt-1 h-5">
          {saving ? (
            <span className="text-xs text-amber-400">Saving…</span>
          ) : (
            <span className="text-xs text-green-500 opacity-60">Saved</span>
          )}
        </div>
      </div>

      {/* File picker — only if multiple files */}
      {availableFiles.length > 1 && (
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">File</p>
          <div className="flex flex-col gap-1">
            {availableFiles.map(f => (
              <button
                key={f}
                onClick={() => onFileChange(f)}
                className={`text-left text-sm px-3 py-1.5 rounded transition-colors truncate ${
                  f === activeFile
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chapters */}
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Chapters</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onViewChange('all')}
            className={`text-left text-sm px-3 py-1.5 rounded transition-colors ${
              activeView === 'all'
                ? 'bg-slate-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            All chapters
          </button>
          {chapters.map(ch => (
            <button
              key={ch.chapter_number}
              onClick={() => onViewChange(ch.chapter_number)}
              className={`text-left text-sm px-3 py-1.5 rounded transition-colors ${
                activeView === ch.chapter_number
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Chapter {ch.chapter_number}
            </button>
          ))}
        </div>
      </div>

      {/* Note type filter */}
      <div className="px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Filter by note type</p>
          {activeNoteTypeFilter && (
            <button
              onClick={() => onNoteTypeFilter(activeNoteTypeFilter)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {NOTE_TYPES.map(type => {
            const cfg = NOTE_TYPE_CONFIG[type]
            const active = activeNoteTypeFilter === type
            return (
              <button
                key={type}
                onClick={() => onNoteTypeFilter(type)}
                className={`text-left text-sm px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${
                  active ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${cfg.badgeBg}`} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Filter by tag</p>
          {activeTagFilter.length > 0 && (
            <button
              onClick={onTagsClear}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {allTags.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No tags yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => {
              const active = activeTagFilter.includes(tag)
              const count = tagCounts[tag] || 0
              return (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
                    active
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{tag}</span>
                  <span className={`opacity-70 text-[10px]`}>({count})</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
