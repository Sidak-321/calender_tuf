import { monthLabel } from '../utils/dateUtils'

function Header({ currentMonth, jumpDateValue, onJumpDateChange, onPrevMonth, onNextMonth, onToday }) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Wall Calendar</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{monthLabel(currentMonth)}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-xl bg-[var(--selected-bg)] px-3 py-2 text-sm font-semibold text-[var(--range-text)] shadow-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      </div>

      <div className="glass-panel flex flex-wrap items-end gap-3 rounded-2xl p-3 soft-elevated">
        <label className="space-y-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Jump To Date
          <input
            type="date"
            value={jumpDateValue}
            onChange={(event) => onJumpDateChange(event.target.value)}
            className="w-44 rounded-lg border border-slate-200 bg-white/95 px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>
    </header>
  )
}

export default Header
