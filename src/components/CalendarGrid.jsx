import { useMemo } from 'react'
import DayCell from './DayCell'
import { WEEK_DAYS, buildCalendarDays, isSameDay, isWithinRange, toDateKey } from '../utils/dateUtils'

function CalendarGrid({
  currentMonth,
  today,
  selectedDate,
  isDragging,
  rangeStart,
  rangeEnd,
  noteDateMap,
  groupNoteDateMap,
  holidaysByDate,
  onSelectDate,
  onDragStart,
  onDragEnter,
  transitionKey,
}) {
  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth])

  return (
    <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-sm">
      <div className="grid grid-cols-7 gap-2 px-1 pb-2">
        {WEEK_DAYS.map((dayName) => (
          <p key={dayName} className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {dayName}
          </p>
        ))}
      </div>
      <div key={transitionKey} className="grid grid-cols-7 gap-2 animate-monthFade">
        {days.map((day) => {
          const dayKey = toDateKey(day)
          const hasNote = Boolean(noteDateMap[dayKey])
          const hasGroupNote = Boolean(groupNoteDateMap[dayKey])
          const isRangeStart = isSameDay(day, rangeStart)
          const isRangeEnd = isSameDay(day, rangeEnd)

          return (
            <DayCell
              key={dayKey}
              day={day}
              isCurrentMonth={day.getMonth() === currentMonth.getMonth()}
              isToday={isSameDay(day, today)}
              isSelectedDate={isSameDay(day, selectedDate)}
              isDragging={isDragging}
              isRangeStart={isRangeStart}
              isRangeEnd={isRangeEnd}
              isInRange={isWithinRange(day, rangeStart, rangeEnd)}
              hasNote={hasNote}
              hasGroupNote={hasGroupNote}
              holidayName={holidaysByDate[dayKey]}
              onSelect={onSelectDate}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
            />
          )
        })}
      </div>
    </section>
  )
}

export default CalendarGrid
