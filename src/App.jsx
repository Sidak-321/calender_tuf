import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import ImageSelector from './components/ImageSelector'
import NotesPanel from './components/NotesPanel'
import {
  atStartOfDay,
  buildCalendarDays,
  dateFromKey,
  fromDateInput,
  monthName,
  normalizeRange,
  rangesOverlap,
  shiftMonth,
  toDateKey,
} from './utils/dateUtils'
import heroImage from './assets/hero.png'

const NOTES_STORAGE_KEY = 'wall-calendar-notes'
const GROUP_NOTES_STORAGE_KEY = 'wall-calendar-group-notes'
const INDIA_HOLIDAYS_API_URL = 'https://tallyfy.com/national-holidays/api/IN'
const monthKeyByIndex = {
  0: 'jan',
  1: 'feb',
  2: 'mar',
  3: 'apr',
  4: 'may',
  5: 'jun',
  6: 'jul',
  7: 'aug',
  8: 'sep',
  9: 'oct',
  10: 'nov',
  11: 'dec',
}
const monthThemePlan = {
  0: { title: 'January Winter India' },
  1: { title: 'February Spring Romance' },
  2: { title: 'March Holi Energy' },
  3: { title: 'April Fresh Summer Start' },
  4: { title: 'May Warm Summer' },
  5: { title: 'June Monsoon Mood' },
  6: { title: 'July Heavy Monsoon' },
  7: { title: 'August Independence Fields' },
  8: { title: 'September Festive Culture' },
  9: { title: 'October Diwali Glow' },
  10: { title: 'November Golden Calm' },
  11: { title: 'December Cozy Lights' },
}
const fallbackIndianHolidays = (year) => ([
  { date: `${year}-01-01`, name: "New Year's Day" },
  { date: `${year}-01-26`, name: 'Republic Day' },
  { date: `${year}-05-01`, name: 'Labour Day' },
  { date: `${year}-08-15`, name: 'Independence Day' },
  { date: `${year}-10-02`, name: 'Gandhi Jayanti' },
  { date: `${year}-12-25`, name: 'Christmas Day' },
])

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const rgbToHsl = (r, g, b) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  const l = (max + min) / 2
  let s = 0

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn:
        h = 60 * (((gn - bn) / delta) % 6)
        break
      case gn:
        h = 60 * ((bn - rn) / delta + 2)
        break
      default:
        h = 60 * ((rn - gn) / delta + 4)
        break
    }
  }

  return {
    h: (h + 360) % 360,
    s: s * 100,
    l: l * 100,
  }
}

const shiftHsl = (hsl, { h = 0, s = 0, l = 0 }) => ({
  h: (hsl.h + h + 360) % 360,
  s: clamp(hsl.s + s, 8, 95),
  l: clamp(hsl.l + l, 8, 94),
})

const hslCss = (hsl) => `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`

const getThemePreset = (title = '') => {
  const text = title.toLowerCase()

  if (text.includes('diwali') || text.includes('lights')) {
    return {
      pageStart: '#fff7ed',
      pageEnd: '#fef3c7',
      rangeBg: '#fef3c7',
      rangeBorder: '#f59e0b',
      rangeText: '#92400e',
      edgeBg: '#f59e0b',
      edgeBorder: '#d97706',
      selectedBg: '#ffedd5',
      selectedBorder: '#f59e0b',
      selectedRing: '#fbbf24',
      bubbleBg: '#b45309',
      bubbleText: '#ffffff',
      inRangeBubbleBg: '#fde68a',
      inRangeBubbleText: '#92400e',
      groupDot: '#b45309',
    }
  }

  if (text.includes('holi') || text.includes('color')) {
    return {
      pageStart: '#eff6ff',
      pageEnd: '#fae8ff',
      rangeBg: '#e0f2fe',
      rangeBorder: '#06b6d4',
      rangeText: '#155e75',
      edgeBg: '#67e8f9',
      edgeBorder: '#0891b2',
      selectedBg: '#ecfeff',
      selectedBorder: '#22d3ee',
      selectedRing: '#67e8f9',
      bubbleBg: '#0e7490',
      bubbleText: '#ffffff',
      inRangeBubbleBg: '#cffafe',
      inRangeBubbleText: '#155e75',
      groupDot: '#0e7490',
    }
  }

  if (text.includes('independence') || text.includes('republic') || text.includes('gandhi')) {
    return {
      pageStart: '#fff7ed',
      pageEnd: '#ecfccb',
      rangeBg: '#ffedd5',
      rangeBorder: '#fb923c',
      rangeText: '#9a3412',
      edgeBg: '#fdba74',
      edgeBorder: '#f97316',
      selectedBg: '#dcfce7',
      selectedBorder: '#4ade80',
      selectedRing: '#86efac',
      bubbleBg: '#166534',
      bubbleText: '#ffffff',
      inRangeBubbleBg: '#fed7aa',
      inRangeBubbleText: '#9a3412',
      groupDot: '#166534',
    }
  }

  return {
    pageStart: '#eaf4ff',
    pageEnd: '#f3f4f6',
    rangeBg: '#bfdbfe',
    rangeBorder: '#60a5fa',
    rangeText: '#1e3a8a',
    edgeBg: '#93c5fd',
    edgeBorder: '#3b82f6',
    selectedBg: '#dbeafe',
    selectedBorder: '#60a5fa',
    selectedRing: '#93c5fd',
    bubbleBg: '#2563eb',
    bubbleText: '#ffffff',
    inRangeBubbleBg: '#dbeafe',
    inRangeBubbleText: '#1e3a8a',
    groupDot: '#1d4ed8',
  }
}

function App() {
  const baseUrl = import.meta.env.BASE_URL
  const today = useMemo(() => atStartOfDay(new Date()), [])
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStartDate, setSelectedStartDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [notesByDate, setNotesByDate] = useState({})
  const [groupNotes, setGroupNotes] = useState([])
  const [jumpDateValue, setJumpDateValue] = useState('')
  const [holidayStore, setHolidayStore] = useState({})
  const [themeImageManifest, setThemeImageManifest] = useState({})
  const [imageMenuOpen, setImageMenuOpen] = useState(false)
  const [heroRefreshToken, setHeroRefreshToken] = useState(0)
  const [heroAspectRatio, setHeroAspectRatio] = useState(16 / 9)
  const [heroHeight, setHeroHeight] = useState(300)
  const [heroFitMode, setHeroFitMode] = useState('cover')
  const [imageDerivedTheme, setImageDerivedTheme] = useState(null)
  const [heroState, setHeroState] = useState({
    src: heroImage,
    title: 'Mountain Journal',
    extract: 'Seasonal image from a public API, with local fallback for reliability.',
    candidates: [heroImage],
    candidateIndex: 0,
  })

  const dragAnchorRef = useRef(null)
  const dragPointerStartRef = useRef({ x: 0, y: 0 })
  const didDragRef = useRef(false)
  const suppressClickRef = useRef(false)
  const heroContainerRef = useRef(null)

  useEffect(() => {
    fetch(`${baseUrl}themes/manifest.json`)
      .then((response) => (response.ok ? response.json() : {}))
      .then((payload) => {
        if (payload && typeof payload === 'object') {
          setThemeImageManifest(payload)
        }
      })
      .catch(() => {
        setThemeImageManifest({})
      })
  }, [baseUrl])

  useEffect(() => {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') setNotesByDate(parsed)
    } catch {
      setNotesByDate({})
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(GROUP_NOTES_STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) setGroupNotes(parsed)
    } catch {
      setGroupNotes([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesByDate))
  }, [notesByDate])

  useEffect(() => {
    localStorage.setItem(GROUP_NOTES_STORAGE_KEY, JSON.stringify(groupNotes))
  }, [groupNotes])

  useEffect(() => {
    if (isDragging) {
      document.body.classList.add('select-none')
      document.body.style.cursor = 'crosshair'
    } else {
      document.body.classList.remove('select-none')
      document.body.style.cursor = ''
    }

    return () => {
      document.body.classList.remove('select-none')
      document.body.style.cursor = ''
    }
  }, [isDragging])

  const stopDragSelection = useCallback(() => {
    const anchor = dragAnchorRef.current
    if (!anchor) return

    if (!didDragRef.current) {
      setSelectedStartDate(null)
      setSelectedEndDate(null)
      setSelectedDate(anchor)
      setJumpDateValue(toDateKey(anchor))
    } else {
      setSelectedDate(null)
    }

    suppressClickRef.current = true
    setIsDragging(false)
    dragAnchorRef.current = null
    didDragRef.current = false
  }, [])

  useEffect(() => {
    const onWindowMouseUp = () => stopDragSelection()
    window.addEventListener('mouseup', onWindowMouseUp)
    return () => window.removeEventListener('mouseup', onWindowMouseUp)
  }, [stopDragSelection])

  const onPrevMonth = useCallback(() => setCurrentMonth((prev) => shiftMonth(prev, -1)), [])
  const onNextMonth = useCallback(() => setCurrentMonth((prev) => shiftMonth(prev, 1)), [])

  const onToday = useCallback(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setJumpDateValue(toDateKey(today))
  }, [today])

  const onDragStart = useCallback((clickedDate, clientX, clientY) => {
    const normalized = atStartOfDay(clickedDate)
    setIsDragging(false)
    didDragRef.current = false
    dragAnchorRef.current = normalized
    dragPointerStartRef.current = { x: clientX, y: clientY }

    setSelectedDate(normalized)
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setJumpDateValue(toDateKey(normalized))
  }, [])

  const onDragEnter = useCallback((hoveredDate, buttons, clientX, clientY) => {
    if (!dragAnchorRef.current || buttons !== 1) return

    const normalized = atStartOfDay(hoveredDate)
    const anchor = dragAnchorRef.current

    if (!isDragging && normalized.getTime() !== anchor.getTime()) {
      const dx = clientX - dragPointerStartRef.current.x
      const dy = clientY - dragPointerStartRef.current.y
      const movedDistance = Math.sqrt(dx * dx + dy * dy)
      if (movedDistance < 10) return

      setIsDragging(true)
      setSelectedDate(null)
      setSelectedStartDate(anchor)
      setSelectedEndDate(anchor)
    }

    if (normalized.getTime() === anchor.getTime()) return

    const nextRange = normalizeRange(anchor, normalized)
    setSelectedStartDate(nextRange.start)
    setSelectedEndDate(nextRange.end)
    didDragRef.current = true
  }, [isDragging])

  const onSelectDate = useCallback((clickedDate) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }

    const normalized = atStartOfDay(clickedDate)
    setSelectedDate(normalized)
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setJumpDateValue(toDateKey(normalized))
  }, [])

  const onJumpDateChange = useCallback((value) => {
    setJumpDateValue(value)
    const parsed = fromDateInput(value)
    if (!parsed) return

    const normalized = atStartOfDay(parsed)
    setCurrentMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1))
    setSelectedDate(normalized)
    setSelectedStartDate(null)
    setSelectedEndDate(null)
  }, [])

  const recalculateHeroHeight = useCallback((ratio) => {
    if (!heroContainerRef.current || !ratio) return
    const width = heroContainerRef.current.clientWidth
    if (!width) return
    const nextHeight = width / ratio
    const clampedHeight = Math.max(200, Math.min(nextHeight, 560))
    setHeroHeight(clampedHeight)
  }, [])

  const onHeroImageLoad = useCallback((event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (!naturalWidth || !naturalHeight) return
    const ratio = naturalWidth / naturalHeight
    const clamped = Math.max(0.65, Math.min(ratio, 3.1))
    setHeroAspectRatio(clamped)
    setHeroFitMode(clamped < 1.15 ? 'contain' : 'cover')
    recalculateHeroHeight(clamped)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      const sampleW = 40
      const sampleH = 24
      canvas.width = sampleW
      canvas.height = sampleH
      ctx.drawImage(event.currentTarget, 0, 0, sampleW, sampleH)
      const pixels = ctx.getImageData(0, 0, sampleW, sampleH).data

      let tr = 0
      let tg = 0
      let tb = 0
      let count = 0

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3]
        if (alpha < 140) continue
        tr += pixels[i]
        tg += pixels[i + 1]
        tb += pixels[i + 2]
        count += 1
      }

      if (count === 0) return
      const avg = {
        r: Math.round(tr / count),
        g: Math.round(tg / count),
        b: Math.round(tb / count),
      }

      const base = rgbToHsl(avg.r, avg.g, avg.b)
      const accent = shiftHsl(base, { s: 20, l: -8 })
      const soft = shiftHsl(base, { s: 8, l: 30 })
      const soft2 = shiftHsl(base, { h: 10, s: 6, l: 36 })
      const text = shiftHsl(base, { s: 25, l: -42 })

      setImageDerivedTheme({
        pageStart: hslCss(soft),
        pageEnd: hslCss(soft2),
        rangeBg: hslCss(shiftHsl(base, { s: 18, l: 24 })),
        rangeBorder: hslCss(shiftHsl(accent, { s: 8, l: 6 })),
        rangeText: hslCss(text),
        edgeBg: hslCss(shiftHsl(accent, { s: 10, l: 20 })),
        edgeBorder: hslCss(shiftHsl(accent, { s: 10, l: -4 })),
        selectedBg: hslCss(shiftHsl(base, { s: 16, l: 28 })),
        selectedBorder: hslCss(shiftHsl(accent, { s: 8, l: -2 })),
        selectedRing: hslCss(shiftHsl(accent, { s: 10, l: 12 })),
        bubbleBg: hslCss(shiftHsl(accent, { s: 18, l: -16 })),
        bubbleText: 'hsl(0 0% 100%)',
        inRangeBubbleBg: hslCss(shiftHsl(base, { s: 12, l: 16 })),
        inRangeBubbleText: hslCss(text),
        groupDot: hslCss(shiftHsl(accent, { s: 12, l: -18 })),
      })
    } catch {
    }
  }, [recalculateHeroHeight])

  useEffect(() => {
    recalculateHeroHeight(heroAspectRatio)
  }, [heroAspectRatio, recalculateHeroHeight])

  useEffect(() => {
    if (!heroContainerRef.current) return
    const observer = new ResizeObserver(() => {
      recalculateHeroHeight(heroAspectRatio)
    })
    observer.observe(heroContainerRef.current)
    return () => observer.disconnect()
  }, [heroAspectRatio, recalculateHeroHeight])

  const fetchIndianHolidaysForYear = useCallback(async (year) => {
    try {
      const response = await fetch(`${INDIA_HOLIDAYS_API_URL}/${year}.json`)
      if (!response.ok) throw new Error('India holidays request failed')
      const payload = await response.json()
      const holidays = Array.isArray(payload?.holidays) ? payload.holidays : []
      return holidays
        .map((holiday) => ({
          date: typeof holiday.date === 'string' ? holiday.date.slice(0, 10) : null,
          name: holiday.local_name || holiday.name || 'Holiday',
        }))
        .filter((holiday) => Boolean(holiday.date))
    } catch {
      return fallbackIndianHolidays(year)
    }
  }, [])

  const visibleYears = useMemo(() => [...new Set(buildCalendarDays(currentMonth).map((day) => day.getFullYear()))], [currentMonth])

  useEffect(() => {
    Promise.all(
      visibleYears.map(async (year) => {
        const data = await fetchIndianHolidaysForYear(year)
        return { year, data }
      }),
    )
      .then((results) => {
        setHolidayStore((prev) => {
          const next = { ...prev }
          results.forEach((entry) => {
            next[entry.year] = entry.data
          })
          return next
        })
      })
      .catch(() => {})
  }, [currentMonth, fetchIndianHolidaysForYear, visibleYears])

  const holidaysByDate = useMemo(() => {
    const map = {}
    visibleYears.forEach((year) => {
      const items = holidayStore[year] || []
      items.forEach((holiday) => {
        map[holiday.date] = holiday.name
      })
    })
    return map
  }, [holidayStore, visibleYears])

  const monthHolidayEntries = useMemo(() => Object.entries(holidaysByDate)
    .map(([date, name]) => ({ date, name }))
    .filter((item) => {
      const itemDate = dateFromKey(item.date)
      return itemDate
        && itemDate.getFullYear() === currentMonth.getFullYear()
        && itemDate.getMonth() === currentMonth.getMonth()
    })
    .sort((a, b) => a.date.localeCompare(b.date)), [currentMonth, holidaysByDate])

  const themeContext = useMemo(() => {
    const todayKey = toDateKey(today)
    const upcomingHoliday = monthHolidayEntries.find((entry) => entry.date >= todayKey)
    const primaryHoliday = upcomingHoliday || monthHolidayEntries[0] || null
    const monthPlan = monthThemePlan[currentMonth.getMonth()]

    if (primaryHoliday) {
      return {
        title: `${monthPlan?.title ?? monthName(currentMonth)} - ${primaryHoliday.name}`,
        extract: `Theme inspired by ${primaryHoliday.name} (${primaryHoliday.date}) with Indian seasonal context.`,
      }
    }

    const monthLabel = monthName(currentMonth)
    return {
      title: monthPlan?.title ?? `${monthLabel} Mood`,
      extract: `Indian seasonal moodboard for ${monthLabel}.`,
    }
  }, [currentMonth, monthHolidayEntries, today])

  const currentMonthImageCandidates = useMemo(() => {
    const monthKey = monthKeyByIndex[currentMonth.getMonth()]
    const files = Array.isArray(themeImageManifest?.[monthKey]) ? themeImageManifest[monthKey] : []
    const resolved = files.map((fileName) => encodeURI(`${baseUrl}themes/${monthKey}/${fileName}`))
    return resolved.length > 0 ? resolved : [heroImage]
  }, [baseUrl, currentMonth, themeImageManifest])

  const fetchThemeHeroImage = useCallback(async () => {
    const monthImages = currentMonthImageCandidates
    const imageIndex = heroRefreshToken % monthImages.length
    const primary = monthImages[imageIndex] || heroImage
    const candidates = [...monthImages, heroImage]

    setHeroState({
      src: primary,
      title: themeContext.title,
      extract: `${themeContext.extract} (local monthly theme image ${imageIndex + 1}/${monthImages.length})`,
      candidates,
      candidateIndex: imageIndex,
    })
  }, [currentMonthImageCandidates, heroRefreshToken, themeContext])

  useEffect(() => {
    fetchThemeHeroImage()
  }, [fetchThemeHeroImage])

  const onRefreshHeroImage = useCallback(() => {
    setHeroRefreshToken((prev) => prev + 1)
  }, [])

  const onAddNote = useCallback((dateKey, note) => {
    setNotesByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] ?? []), note],
    }))
  }, [])

  const onDeleteNote = useCallback((dateKey, noteIndex) => {
    setNotesByDate((prev) => {
      const current = prev[dateKey] ?? []
      const updated = current.filter((_, index) => index !== noteIndex)
      const next = { ...prev }

      if (updated.length === 0) {
        delete next[dateKey]
      } else {
        next[dateKey] = updated
      }

      return next
    })
  }, [])

  const onSaveGroupNote = useCallback(({ id, startDate, endDate, content }) => {
    const normalized = normalizeRange(dateFromKey(startDate), dateFromKey(endDate))
    const normalizedStartKey = toDateKey(normalized.start)
    const normalizedEndKey = toDateKey(normalized.end)

    setGroupNotes((prev) => {
      if (id) {
        return prev.map((item) => (item.id === id
          ? { ...item, startDate: normalizedStartKey, endDate: normalizedEndKey, content }
          : item))
      }

      const next = prev.filter((item) => {
        const itemStart = dateFromKey(item.startDate)
        const itemEnd = dateFromKey(item.endDate)
        return !rangesOverlap(itemStart, itemEnd, normalized.start, normalized.end)
      })

      next.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        startDate: normalizedStartKey,
        endDate: normalizedEndKey,
        content,
      })

      return next
    })
  }, [])

  const onDeleteGroupNote = useCallback((id) => {
    setGroupNotes((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const themePreset = useMemo(() => getThemePreset(themeContext.title), [themeContext.title])
  const runtimeTheme = imageDerivedTheme || themePreset
  const noteDateMap = useMemo(() => {
    const map = {}
    Object.entries(notesByDate).forEach(([dateKey, notes]) => {
      if (notes?.length) map[dateKey] = true
    })
    return map
  }, [notesByDate])

  const selectedNotes = useMemo(() => {
    if (!selectedDate) return []
    return notesByDate[toDateKey(selectedDate)] ?? []
  }, [notesByDate, selectedDate])

  const groupNotesForActiveRange = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return []
    return groupNotes.filter((item) => {
      const itemStart = dateFromKey(item.startDate)
      const itemEnd = dateFromKey(item.endDate)
      return rangesOverlap(itemStart, itemEnd, selectedStartDate, selectedEndDate)
    })
  }, [groupNotes, selectedEndDate, selectedStartDate])

  const groupNotesForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return groupNotes.filter((item) => {
      const itemStart = dateFromKey(item.startDate)
      const itemEnd = dateFromKey(item.endDate)
      return rangesOverlap(itemStart, itemEnd, selectedDate, selectedDate)
    })
  }, [groupNotes, selectedDate])

  const groupNoteDateMap = useMemo(() => {
    const map = {}
    groupNotes.forEach((item) => {
      const start = dateFromKey(item.startDate)
      const end = dateFromKey(item.endDate)
      if (!start || !end) return

      for (
        let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        cursor.getTime() <= end.getTime();
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
      ) {
        map[toDateKey(cursor)] = true
      }
    })
    return map
  }, [groupNotes])

  const clearSelection = useCallback(() => {
    setSelectedDate(null)
    setSelectedStartDate(null)
    setSelectedEndDate(null)
  }, [])

  return (
    <main className={[
      'min-h-screen px-4 py-8 sm:px-6 lg:px-8',
      isDragging ? 'select-none cursor-crosshair' : '',
    ].join(' ')}
    style={{
      background: `radial-gradient(circle at top, ${runtimeTheme.pageStart}, transparent 36%), ${runtimeTheme.pageEnd}`,
      '--range-bg': runtimeTheme.rangeBg,
      '--range-border': runtimeTheme.rangeBorder,
      '--range-text': runtimeTheme.rangeText,
      '--edge-bg': runtimeTheme.edgeBg,
      '--edge-border': runtimeTheme.edgeBorder,
      '--selected-bg': runtimeTheme.selectedBg,
      '--selected-border': runtimeTheme.selectedBorder,
      '--selected-ring': runtimeTheme.selectedRing,
      '--bubble-bg': runtimeTheme.bubbleBg,
      '--bubble-text': runtimeTheme.bubbleText,
      '--inrange-bubble-bg': runtimeTheme.inRangeBubbleBg,
      '--inrange-bubble-text': runtimeTheme.inRangeBubbleText,
      '--group-dot': runtimeTheme.groupDot,
    }}>
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-visible rounded-3xl border border-white/70 bg-white/85 shadow-panel backdrop-blur-md">
          <ImageSelector
            menuOpen={imageMenuOpen}
            onToggle={() => setImageMenuOpen((prev) => !prev)}
            onFetchNew={onRefreshHeroImage}
          />

          <div
            ref={heroContainerRef}
            className="relative overflow-hidden rounded-t-3xl transition-[height] duration-500"
            style={{ height: `${heroHeight}px` }}
          >
            <img
              src={heroState.src}
              alt={heroState.title}
              onLoad={onHeroImageLoad}
              onError={() => {
                setHeroState((prev) => {
                  const nextIndex = (prev.candidateIndex ?? 0) + 1
                  const nextSrc = prev.candidates?.[nextIndex]

                  if (nextSrc) {
                    return {
                      ...prev,
                      src: nextSrc,
                      candidateIndex: nextIndex,
                      extract: `${prev.extract} (retry ${nextIndex + 1}/${prev.candidates.length})`,
                    }
                  }

                  return {
                    ...prev,
                    src: heroImage,
                    extract: 'All image sources failed. Showing local fallback image.',
                  }
                })
              }}
              className={[
                'h-full w-full object-top transition-all duration-500',
                heroFitMode === 'contain' ? 'object-contain bg-slate-900' : 'object-cover',
                'scale-100 opacity-100',
              ].join(' ')}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/62 via-slate-900/20 to-transparent p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.23em] text-slate-200">Wall Calendar</p>
              <h2 className="mt-2 max-w-sm text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {monthName(currentMonth)}
              </h2>
              <p className="mt-1 max-w-sm text-sm font-medium text-slate-100/90">
                {themeContext.title}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[300px_1fr]">
            <div className="order-1 lg:order-2">
              <Header
                currentMonth={currentMonth}
                jumpDateValue={jumpDateValue}
                onJumpDateChange={onJumpDateChange}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                onToday={onToday}
              />
              <CalendarGrid
                currentMonth={currentMonth}
                today={today}
                selectedDate={selectedDate}
                isDragging={isDragging}
                rangeStart={selectedStartDate}
                rangeEnd={selectedEndDate}
                noteDateMap={noteDateMap}
                groupNoteDateMap={groupNoteDateMap}
                holidaysByDate={holidaysByDate}
                onSelectDate={onSelectDate}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                transitionKey={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
              />
            </div>

            <div className="order-2 lg:order-1">
              <NotesPanel
                selectedDate={selectedDate}
                notes={selectedNotes}
                rangeStart={selectedStartDate}
                rangeEnd={selectedEndDate}
                groupNotes={groupNotesForActiveRange}
                dateGroupNotes={groupNotesForSelectedDate}
                onAddNote={onAddNote}
                onDeleteNote={onDeleteNote}
                onSaveGroupNote={onSaveGroupNote}
                onDeleteGroupNote={onDeleteGroupNote}
                onClose={clearSelection}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
