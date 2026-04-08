# Wall Calendar (React + Vite + Tailwind)

A modern, interactive wall-calendar web app with Indian context styling, drag date-range selection, notes, group notes, holiday highlights, and dynamic monthly hero images.

## Live Demo

- Deployed on GitHub Pages: [https://sidak-321.github.io/calender_tuf/](https://sidak-321.github.io/calender_tuf/)

## What This App Includes

- Monthly calendar grid (Monday to Sunday)
- Today highlight + selected-date highlight
- Drag-to-select range (real-time blue range highlight)
- Reverse drag support (end -> start)
- Single-date notes (add/delete, persisted in localStorage)
- Group notes for selected ranges (add/edit/delete, persisted in localStorage)
- Group-note indicator dots on calendar dates
- Indian holidays integration (API + fallback holidays)
- Holiday label and hover tooltip on date cells
- Dynamic hero image area (month-based local image sets)
- Dynamic color theme generated from current hero image
- Responsive layout:
  - Desktop: notes + calendar in split view
  - Mobile: stacked view

## Why These Choices

- **Vite + React hooks**: fast development and simple state-driven UI.
- **Tailwind only**: consistent styling, easy iteration, minimal CSS overhead.
- **LocalStorage for notes**: no backend needed, instant persistence.
- **Range selection via mouse events**: smoother UX like text selection.
- **Holiday API with fallback**: better reliability if API/CORS/network fails.
- **Local monthly image manifest**: avoids unstable random APIs and keeps visual quality consistent.
- **Theme from image colors**: UI mood automatically matches the active month image.

## Project Structure

```txt
src/
  App.jsx
  index.css
  components/
    Header.jsx
    CalendarGrid.jsx
    DayCell.jsx
    NotesPanel.jsx
    ImageSelector.jsx
  utils/
    dateUtils.js

public/
  themes/
    manifest.json
    jan/, feb/, mar/, ... dec/   (monthly local image folders)
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the local URL shown in terminal (usually `http://localhost:5173`).

4. Production build:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

## Image Setup (Monthly Themes)

- Add images inside `public/themes/<month-key>/`
- Valid month keys: `jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`
- Update `public/themes/manifest.json` to list filenames for each month.

Example:

```json
{
  "jan": ["image1.jpg", "image2.jpg"],
  "feb": ["image3.jpg"]
}
```

## Notes

- No backend is used.
- Notes and group notes are stored in browser `localStorage`.
- If holiday API is unavailable, fallback Indian holidays are still shown.
