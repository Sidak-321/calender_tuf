function ImageSelector({ menuOpen, onToggle, onFetchNew }) {
  return (
    <div className="absolute -left-4 top-6 z-20 sm:-left-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold tracking-wide text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        aria-label="Open image selector"
      >
        IMG
      </button>

      {menuOpen ? (
        <div className="mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-3 shadow-panel">
          <button
            type="button"
            onClick={onFetchNew}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Fetch New Image
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ImageSelector
