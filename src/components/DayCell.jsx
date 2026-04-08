import { memo } from 'react'

function DayCell({
  day,
  isCurrentMonth,
  isToday,
  isSelectedDate,
  isDragging,
  isRangeStart,
  isRangeEnd,
  isInRange,
  hasNote,
  hasGroupNote,
  holidayName,
  onSelect,
  onDragStart,
  onDragEnter,
}) {
  const isEdge = isRangeStart || isRangeEnd

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      onMouseDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        onDragStart(day, event.clientX, event.clientY)
      }}
      onMouseEnter={(event) => onDragEnter(day, event.buttons, event.clientX, event.clientY)}
      className={[
        'group relative min-h-[82px] rounded-2xl border p-2.5 text-left align-top transition duration-200',
        'hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300',
        isDragging ? 'cursor-crosshair select-none' : 'cursor-pointer',
        isCurrentMonth ? 'border-slate-200 bg-white text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' : 'border-slate-100 bg-slate-50/70 text-slate-400',
        isInRange ? 'bg-[var(--range-bg)] border-[var(--range-border)] text-[var(--range-text)]' : '',
        isEdge ? 'border-[var(--edge-border)] bg-[var(--edge-bg)] text-[var(--range-text)]' : '',
        isSelectedDate ? 'border-[var(--selected-border)] bg-[var(--selected-bg)] ring-2 ring-[var(--selected-ring)] shadow-sm' : '',
      ].join(' ')}
      aria-label={`Select ${day.toDateString()}`}
    >
      <span
        className={[
          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition',
          isToday ? 'bg-ink text-white' : 'group-hover:bg-slate-100',
          isInRange ? 'bg-[var(--inrange-bubble-bg)] text-[var(--inrange-bubble-text)] group-hover:bg-[var(--inrange-bubble-bg)]' : '',
          isEdge ? 'bg-[var(--bubble-bg)] text-[var(--bubble-text)] group-hover:bg-[var(--bubble-bg)]' : '',
          isSelectedDate ? 'bg-[var(--bubble-bg)] text-[var(--bubble-text)] group-hover:bg-[var(--bubble-bg)]' : '',
        ].join(' ')}
      >
        {day.getDate()}
      </span>
      {holidayName ? (
        <>
          <p className="mt-2 truncate text-[10px] font-semibold leading-tight text-rose-600">{holidayName}</p>
          <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-md group-hover:block">
            {holidayName}
          </span>
        </>
      ) : null}
      {hasNote ? <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-amber-500" /> : null}
      {hasGroupNote ? <span className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[var(--group-dot)]" /> : null}
    </button>
  )
}

export default memo(DayCell)
