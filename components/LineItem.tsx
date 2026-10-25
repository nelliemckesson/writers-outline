'use client'

import { useState } from 'react'
import { Line, Note, NoteType, NOTE_TYPES, NOTE_TYPE_CONFIG } from '@/lib/types'
import NoteItem from './NoteItem'

interface LineItemProps {
  line: Line
  realLineIdx: number
  chapterIdx: number
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
  dragDisabled?: boolean
  onUpdateText: (ci: number, li: number, text: string) => void
  onAddTag: (ci: number, li: number, tag: string) => void
  onRemoveTag: (ci: number, li: number, tag: string) => void
  onAddNote: (ci: number, li: number, note: Note) => void
  onUpdateNote: (ci: number, li: number, ni: number, updates: Partial<Note>) => void
  onRemoveNote: (ci: number, li: number, ni: number) => void
}

export default function LineItem({
  line,
  realLineIdx,
  chapterIdx,
  dragHandleProps,
  isDragging,
  dragDisabled,
  onUpdateText,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
}: LineItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(line.text)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteType, setNewNoteType] = useState<NoteType>('new')

  const handleTextSave = () => {
    const trimmed = editText.trim()
    if (trimmed !== line.text) {
      onUpdateText(chapterIdx, realLineIdx, trimmed || line.text)
    }
    setIsEditing(false)
  }

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setEditText(line.text)
      setIsEditing(false)
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleTextSave()
    }
  }

  const handleTagSubmit = () => {
    const tag = newTag.toLowerCase().trim()
    if (tag && !line.tags.includes(tag)) {
      onAddTag(chapterIdx, realLineIdx, tag)
    }
    setNewTag('')
    setIsAddingTag(false)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTagSubmit()
    if (e.key === 'Escape') {
      setNewTag('')
      setIsAddingTag(false)
    }
  }

  const handleNoteSubmit = () => {
    const text = newNoteText.trim()
    if (text) {
      onAddNote(chapterIdx, realLineIdx, { type: newNoteType, text })
    }
    setNewNoteText('')
    setNewNoteType('new')
    setIsAddingNote(false)
  }

  const handleNoteCancel = () => {
    setNewNoteText('')
    setNewNoteType('new')
    setIsAddingNote(false)
  }

  return (
    <div
      className={`group py-2.5 px-2 rounded-lg hover:bg-white hover:shadow-sm transition-all ${
        isDragging ? 'shadow-lg ring-1 ring-slate-200' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {!dragDisabled && (
          <button
            {...(dragHandleProps as React.HTMLAttributes<HTMLButtonElement>)}
            className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity touch-none"
            tabIndex={-1}
            aria-label="Drag to reorder"
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" className="text-slate-500">
              <circle cx="3" cy="3" r="1.5" />
              <circle cx="9" cy="3" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="9" cy="8" r="1.5" />
              <circle cx="3" cy="13" r="1.5" />
              <circle cx="9" cy="13" r="1.5" />
            </svg>
          </button>
        )}
        {dragDisabled && <div className="w-3 flex-shrink-0" />}

        {/* Line number */}
        <span className="text-xs font-mono text-gray-400 w-14 flex-shrink-0 pt-0.5 select-none">
          {line.line_number}
        </span>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Text */}
          {isEditing ? (
            <div>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={handleTextKeyDown}
                onBlur={handleTextSave}
                className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={3}
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">Cmd+Enter to save · Esc to cancel</p>
            </div>
          ) : (
            <p
              className="text-sm text-slate-700 cursor-text hover:text-slate-900 leading-relaxed"
              onClick={() => {
                setEditText(line.text)
                setIsEditing(true)
              }}
            >
              {line.text}
            </p>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {line.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(chapterIdx, realLineIdx, tag)}
                  className="ml-0.5 text-slate-400 hover:text-red-500 leading-none transition-colors"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}

            {isAddingTag ? (
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (newTag.trim()) handleTagSubmit()
                  else {
                    setNewTag('')
                    setIsAddingTag(false)
                  }
                }}
                placeholder="tag name"
                className="text-xs border border-slate-300 rounded px-2 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-blue-300"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-xs text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                + tag
              </button>
            )}
          </div>

          {/* Notes */}
          {line.notes.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {line.notes.map((note, ni) => (
                <NoteItem
                  key={ni}
                  note={note}
                  noteIdx={ni}
                  chapterIdx={chapterIdx}
                  lineIdx={realLineIdx}
                  onUpdate={onUpdateNote}
                  onRemove={onRemoveNote}
                />
              ))}
            </div>
          )}

          {/* Add note */}
          <div className="mt-2">
            {isAddingNote ? (
              <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                <div className="mb-2">
                  <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-1">
                    Note type
                  </label>
                  <select
                    value={newNoteType}
                    onChange={e => setNewNoteType(e.target.value as NoteType)}
                    className="text-sm border border-slate-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
                  >
                    {NOTE_TYPES.map(t => (
                      <option key={t} value={t}>
                        {NOTE_TYPE_CONFIG[t].label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Note text…"
                  className="w-full text-sm border border-slate-300 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                  rows={3}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Escape') handleNoteCancel()
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleNoteSubmit}
                    className="text-xs px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleNoteCancel}
                    className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingNote(true)}
                className="text-xs text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                + note
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
