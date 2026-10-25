'use client'

import { useState } from 'react'
import { Note, NoteType, NOTE_TYPES, NOTE_TYPE_CONFIG } from '@/lib/types'

interface NoteItemProps {
  note: Note
  noteIdx: number
  chapterIdx: number
  lineIdx: number
  onUpdate: (ci: number, li: number, ni: number, updates: Partial<Note>) => void
  onRemove: (ci: number, li: number, ni: number) => void
}

export default function NoteItem({
  note,
  noteIdx,
  chapterIdx,
  lineIdx,
  onUpdate,
  onRemove,
}: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(note.text)

  const config = NOTE_TYPE_CONFIG[note.type]

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed) {
      onUpdate(chapterIdx, lineIdx, noteIdx, { text: trimmed })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(note.text)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') handleCancel()
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(chapterIdx, lineIdx, noteIdx, { type: e.target.value as NoteType })
  }

  return (
    <div className={`rounded-lg border-l-4 p-3 ${config.bg} ${config.border}`}>
      {/* Top row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`${config.badgeBg} ${config.badgeText} text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded flex-shrink-0`}
        >
          {config.label}
        </span>
        <select
          value={note.type}
          onChange={handleTypeChange}
          className="text-xs bg-transparent border border-transparent hover:border-gray-300 rounded px-1 py-0.5 text-gray-600 cursor-pointer focus:outline-none focus:border-gray-400"
        >
          {NOTE_TYPES.map(t => (
            <option key={t} value={t}>
              {NOTE_TYPE_CONFIG[t].label}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => onRemove(chapterIdx, lineIdx, noteIdx)}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none"
          title="Delete note"
        >
          ×
        </button>
      </div>

      {/* Note body */}
      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full text-sm ${config.bodyText} bg-white bg-opacity-60 border border-gray-200 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300`}
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={handleSave}
              className="text-xs px-2 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-sm ${config.bodyText} cursor-pointer hover:opacity-80 whitespace-pre-wrap`}
          onClick={() => {
            setEditText(note.text)
            setIsEditing(true)
          }}
          title="Click to edit"
        >
          {note.text}
        </p>
      )}
    </div>
  )
}
