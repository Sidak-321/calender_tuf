import { useEffect, useMemo, useState } from 'react'
import { dayLabel, toDateKey } from '../utils/dateUtils'

function NotesPanel({
  selectedDate,
  notes,
  rangeStart,
  rangeEnd,
  groupNotes,
  dateGroupNotes,
  onAddNote,
  onDeleteNote,
  onSaveGroupNote,
  onDeleteGroupNote,
  onClose,
}) {
  const [draft, setDraft] = useState('')
  const [groupDraft, setGroupDraft] = useState('')
  const [editingGroupId, setEditingGroupId] = useState(null)
  const dateKey = useMemo(() => (selectedDate ? toDateKey(selectedDate) : null), [selectedDate])
  const isRangeMode = Boolean(rangeStart && rangeEnd)

  useEffect(() => {
    setGroupDraft('')
    setEditingGroupId(null)
  }, [rangeEnd?.getTime(), rangeStart?.getTime()])

  const submitNote = (event) => {
    event.preventDefault()
    if (!draft.trim() || !dateKey) return
    onAddNote(dateKey, draft.trim())
    setDraft('')
  }

  const submitGroupNote = (event) => {
    event.preventDefault()
    if (!groupDraft.trim() || !rangeStart || !rangeEnd) return

    onSaveGroupNote({
      id: editingGroupId,
      startDate: toDateKey(rangeStart),
      endDate: toDateKey(rangeEnd),
      content: groupDraft.trim(),
    })

    setGroupDraft('')
    setEditingGroupId(null)
  }

  const addQuickRangeNote = (content) => {
    if (!rangeStart || !rangeEnd) return
    onSaveGroupNote({
      id: null,
      startDate: toDateKey(rangeStart),
      endDate: toDateKey(rangeEnd),
      content,
    })
  }

  const addQuickSingleNote = (content) => {
    if (!dateKey || !content?.trim()) return
    onAddNote(dateKey, content.trim())
  }

  return (
    <aside className="glass-panel soft-elevated rounded-3xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</p>
          <h2 className="text-lg font-semibold text-ink">
            {isRangeMode
              ? `${dayLabel(rangeStart)} - ${dayLabel(rangeEnd)}`
              : selectedDate
                ? dayLabel(selectedDate)
                : 'Select a date or drag a range'}
          </h2>
        </div>
        {(selectedDate || isRangeMode) ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Clear
          </button>
        ) : null}
      </div>

      {isRangeMode ? (
        <form onSubmit={submitGroupNote} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGroupDraft('Plan:\n- ')}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Use as Plan
            </button>
            <button
              type="button"
              onClick={() => addQuickRangeNote('Busy')}
              className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Mark Busy
            </button>
            <button
              type="button"
              onClick={() => {
                const latest = groupNotes[groupNotes.length - 1]
                if (latest?.content) setGroupDraft(`${latest.content} (copy)`)
              }}
              className="rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
            >
              Duplicate Last
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Range
            </button>
          </div>
          <textarea
            value={groupDraft}
            onChange={(event) => setGroupDraft(event.target.value)}
            rows={3}
            placeholder="Add note for this full selected range..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--bubble-bg)] px-4 py-2 text-sm font-semibold text-[var(--bubble-text)] hover:brightness-110"
          >
            {editingGroupId ? 'Update Group Note' : 'Save Group Note'}
          </button>
        </form>
      ) : selectedDate ? (
        <form onSubmit={submitNote} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDraft('Plan:\n- ')}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Use as Plan
            </button>
            <button
              type="button"
              onClick={() => addQuickSingleNote('Busy')}
              className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Mark Busy
            </button>
            <button
              type="button"
              onClick={() => {
                const latest = notes[notes.length - 1]
                if (latest) setDraft(`${latest} (copy)`)
              }}
              className="rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
            >
              Duplicate Last
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Date
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Add a note or todo..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add Note
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white/75 p-3 text-sm text-slate-500">
          Click a date for individual notes, or drag across dates for a group note.
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {isRangeMode ? (
          groupNotes.length === 0 ? (
            <li className="rounded-xl border border-slate-200 bg-white/75 p-3 text-sm text-slate-500">No group notes for this range yet.</li>
          ) : (
            groupNotes.map((item, index) => (
              <li key={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #{index + 1} - {item.startDate} - {item.endDate}
                </p>
                <p className="text-sm text-slate-700">{item.content}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroupId(item.id)
                      setGroupDraft(item.content)
                    }}
                    className="rounded-lg border border-sky-200 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteGroupNote(item.id)}
                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )
        ) : selectedDate ? (
          <>
            {notes.length === 0 ? (
              <li className="rounded-xl border border-slate-200 bg-white/75 p-3 text-sm text-slate-500">No individual notes yet.</li>
            ) : (
              notes.map((note, index) => (
                <li
                  key={`${note.slice(0, 12)}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3"
                >
                  <p className="text-sm text-slate-700">{note}</p>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(dateKey, index)}
                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}

            {dateGroupNotes.length > 0 ? (
              <>
                <li className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Group Notes Covering This Date
                </li>
                {dateGroupNotes.map((item) => (
                  <li key={`single-date-group-${item.id}`} className="space-y-1 rounded-xl border border-sky-200 bg-sky-50/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                      {item.startDate} - {item.endDate}
                    </p>
                    <p className="text-sm text-slate-700">{item.content}</p>
                  </li>
                ))}
              </>
            ) : null}
          </>
        ) : null}
      </ul>
    </aside>
  )
}

export default NotesPanel
