'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Chapter, Line, Note, NoteType } from '@/lib/types'
import LineItem from './LineItem'

interface ChapterSectionProps {
  chapter: Chapter
  chapterIdx: number
  activeTagFilter: string[]
  activeNoteTypeFilter: NoteType | null
  onUpdateText: (ci: number, li: number, text: string) => void
  onAddTag: (ci: number, li: number, tag: string) => void
  onRemoveTag: (ci: number, li: number, tag: string) => void
  onAddNote: (ci: number, li: number, note: Note) => void
  onUpdateNote: (ci: number, li: number, ni: number, updates: Partial<Note>) => void
  onRemoveNote: (ci: number, li: number, ni: number) => void
  onReorder: (ci: number, oldIdx: number, newIdx: number) => void
}

interface SortableLineItemProps {
  line: Line
  realIdx: number
  chapterIdx: number
  dragDisabled: boolean
  onUpdateText: (ci: number, li: number, text: string) => void
  onAddTag: (ci: number, li: number, tag: string) => void
  onRemoveTag: (ci: number, li: number, tag: string) => void
  onAddNote: (ci: number, li: number, note: Note) => void
  onUpdateNote: (ci: number, li: number, ni: number, updates: Partial<Note>) => void
  onRemoveNote: (ci: number, li: number, ni: number) => void
}

function SortableLineItem({
  line,
  realIdx,
  chapterIdx,
  dragDisabled,
  onUpdateText,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
}: SortableLineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.line_number, disabled: dragDisabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <LineItem
        line={line}
        realLineIdx={realIdx}
        chapterIdx={chapterIdx}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        dragDisabled={dragDisabled}
        onUpdateText={onUpdateText}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onAddNote={onAddNote}
        onUpdateNote={onUpdateNote}
        onRemoveNote={onRemoveNote}
      />
    </div>
  )
}

export default function ChapterSection({
  chapter,
  chapterIdx,
  activeTagFilter,
  activeNoteTypeFilter,
  onUpdateText,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onReorder,
}: ChapterSectionProps) {
  const filterActive = activeTagFilter.length > 0 || activeNoteTypeFilter !== null

  const filteredLines: { line: Line; realIdx: number }[] = chapter.lines
    .map((line, idx) => ({ line, realIdx: idx }))
    .filter(({ line }) => {
      const tagMatch = activeTagFilter.length === 0 || activeTagFilter.every(tag => line.tags.includes(tag))
      const noteMatch = activeNoteTypeFilter === null || line.notes.some(n => n.type === activeNoteTypeFilter)
      return tagMatch && noteMatch
    })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = chapter.lines.findIndex(l => l.line_number === active.id)
    const newIdx = chapter.lines.findIndex(l => l.line_number === over.id)
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorder(chapterIdx, oldIdx, newIdx)
    }
  }

  return (
    <section className="mb-12">
      {/* Chapter header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-slate-800">
            Chapter {chapter.chapter_number}
          </h2>
          {filterActive && (
            <span className="text-sm text-slate-400">
              {filteredLines.length} / {chapter.lines.length} lines
            </span>
          )}
        </div>
        <hr className="mt-2 border-slate-200" />
      </div>

      {/* Tag filter banner */}
      {filterActive && (
        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Reordering disabled while tag filter is active.
        </div>
      )}

      {filteredLines.length === 0 && filterActive ? (
        <p className="text-slate-400 italic text-sm">No lines match the active tag filters.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredLines.map(fl => fl.line.line_number)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-0">
              {filteredLines.map(({ line, realIdx }) => (
                <SortableLineItem
                  key={line.line_number}
                  line={line}
                  realIdx={realIdx}
                  chapterIdx={chapterIdx}
                  dragDisabled={filterActive}
                  onUpdateText={onUpdateText}
                  onAddTag={onAddTag}
                  onRemoveTag={onRemoveTag}
                  onAddNote={onAddNote}
                  onUpdateNote={onUpdateNote}
                  onRemoveNote={onRemoveNote}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  )
}
