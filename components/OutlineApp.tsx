'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { Outline, Chapter, Note, NoteType } from '@/lib/types'
import Sidebar from './Sidebar'
import ChapterSection from './ChapterSection'

export default function OutlineApp() {
  const [outline, setOutline] = useState<Outline | null>(null)
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [activeView, setActiveView] = useState<'all' | number>('all')
  const [activeTagFilter, setActiveTagFilter] = useState<string[]>([])
  const [activeNoteTypeFilter, setActiveNoteTypeFilter] = useState<NoteType | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch file list on mount
  useEffect(() => {
    fetch('/api/outline')
      .then(r => r.json())
      .then(data => {
        const files: string[] = data.files || []
        setAvailableFiles(files)
        if (files.length === 1) {
          loadFile(files[0])
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFile = useCallback((name: string) => {
    setLoading(true)
    fetch(`/api/outline?file=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => {
        setOutline(data)
        setActiveFile(name)
        setActiveView('all')
        setActiveTagFilter([])
        setActiveNoteTypeFilter(null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const debouncedSave = useCallback((data: Outline, file: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaving(true)
    saveTimerRef.current = setTimeout(() => {
      fetch(`/api/outline?file=${encodeURIComponent(file)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).finally(() => setSaving(false))
    }, 1500)
  }, [])

  const mutate = useCallback((updater: (prev: Outline) => Outline) => {
    setOutline(prev => {
      if (!prev || !activeFile) return prev
      const next = updater(prev)
      debouncedSave(next, activeFile)
      return next
    })
  }, [activeFile, debouncedSave])

  const updateLineText = useCallback((ci: number, li: number, text: string) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return {
          ...ch,
          lines: ch.lines.map((line, lIdx) =>
            lIdx === li ? { ...line, text } : line
          ),
        }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  const addTag = useCallback((ci: number, li: number, tag: string) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return {
          ...ch,
          lines: ch.lines.map((line, lIdx) => {
            if (lIdx !== li) return line
            if (line.tags.includes(tag)) return line
            return { ...line, tags: [...line.tags, tag] }
          }),
        }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  const removeTag = useCallback((ci: number, li: number, tag: string) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return {
          ...ch,
          lines: ch.lines.map((line, lIdx) =>
            lIdx === li ? { ...line, tags: line.tags.filter(t => t !== tag) } : line
          ),
        }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  const addNote = useCallback((ci: number, li: number, note: Note) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return {
          ...ch,
          lines: ch.lines.map((line, lIdx) =>
            lIdx === li ? { ...line, notes: [...line.notes, note] } : line
          ),
        }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  const updateNote = useCallback((ci: number, li: number, ni: number, updates: Partial<Note>) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return {
          ...ch,
          lines: ch.lines.map((line, lIdx) => {
            if (lIdx !== li) return line
            return {
              ...line,
              notes: line.notes.map((n, nIdx) =>
                nIdx === ni ? { ...n, ...updates } : n
              ),
            }
          }),
        }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  const removeNote = useCallback((ci: number, li: number, ni: number) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return {
          ...ch,
          lines: ch.lines.map((line, lIdx) =>
            lIdx === li ? { ...line, notes: line.notes.filter((_, nIdx) => nIdx !== ni) } : line
          ),
        }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  const reorderLines = useCallback((ci: number, oldIndex: number, newIndex: number) => {
    mutate(prev => {
      const chapters = prev.chapters.map((ch, cIdx) => {
        if (cIdx !== ci) return ch
        return { ...ch, lines: arrayMove(ch.lines, oldIndex, newIndex) }
      })
      return { ...prev, chapters }
    })
  }, [mutate])

  // Compute all unique tags across all chapters/lines
  const allTags = outline
    ? Array.from(
        new Set(
          outline.chapters.flatMap(ch => ch.lines.flatMap(l => l.tags))
        )
      ).sort()
    : []

  // Compute tag counts across visible chapters (or all)
  const tagCounts: Record<string, number> = {}
  if (outline) {
    const chaptersToCount = activeView === 'all'
      ? outline.chapters
      : outline.chapters.filter(ch => ch.chapter_number === activeView)
    for (const ch of chaptersToCount) {
      for (const line of ch.lines) {
        for (const tag of line.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        }
      }
    }
  }

  const handleTagToggle = (tag: string) => {
    setActiveTagFilter(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleTagsClear = () => setActiveTagFilter([])

  const handleNoteTypeFilter = (type: NoteType) => {
    setActiveNoteTypeFilter(prev => (prev === type ? null : type))
  }

  // Visible chapters
  const visibleChapters: { chapter: Chapter; chapterIdx: number }[] = outline
    ? outline.chapters
        .map((ch, idx) => ({ chapter: ch, chapterIdx: idx }))
        .filter(({ chapter }) =>
          activeView === 'all' || chapter.chapter_number === activeView
        )
    : []

  // No outline loaded — file picker or loading
  if (!outline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Writers Outline</h1>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-slate-500 mt-6">
              <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading…
            </div>
          ) : availableFiles.length === 0 ? (
            <div className="mt-6">
              <p className="text-slate-500 mb-4">No outline files found.</p>
              <p className="text-sm text-slate-400">
                Place a <code className="bg-gray-100 px-1 rounded">.json</code> file in the{' '}
                <code className="bg-gray-100 px-1 rounded">data/</code> directory and refresh.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-slate-500 mb-4">Choose an outline file to open:</p>
              <div className="flex flex-col gap-2">
                {availableFiles.map(f => (
                  <button
                    key={f}
                    onClick={() => loadFile(f)}
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <Sidebar
          chapters={outline.chapters}
          allTags={allTags}
          tagCounts={tagCounts}
          activeView={activeView}
          activeTagFilter={activeTagFilter}
          activeNoteTypeFilter={activeNoteTypeFilter}
          availableFiles={availableFiles}
          activeFile={activeFile}
          saving={saving}
          onViewChange={setActiveView}
          onTagToggle={handleTagToggle}
          onTagsClear={handleTagsClear}
          onNoteTypeFilter={handleNoteTypeFilter}
          onFileChange={loadFile}
        />
      </div>
      <main className="flex-1 overflow-y-auto px-6 py-8">
        {activeFile && (
          <h2 className="text-sm font-medium text-slate-400 mb-6 tracking-wide">
            {activeFile}
          </h2>
        )}
        {visibleChapters.map(({ chapter, chapterIdx }) => (
          <ChapterSection
            key={chapter.chapter_number}
            chapter={chapter}
            chapterIdx={chapterIdx}
            activeTagFilter={activeTagFilter}
            activeNoteTypeFilter={activeNoteTypeFilter}
            onUpdateText={updateLineText}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onRemoveNote={removeNote}
            onReorder={reorderLines}
          />
        ))}
      </main>
    </div>
  )
}
