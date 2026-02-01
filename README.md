# Mental Models Deck

A swipeable, flipable deck of mental models with a clean, editorial card design.  
Built with React + TypeScript + Vite.

## Features
- **Swipe navigation:** Left/right swipes move through the deck with a stacked-card animation.
- **Tap to flip:** Front shows the headline and principle; back shows the full details.
- **Related models jump:** Related tags on the back are clickable and jump to that model.
- **Progress + index:** Top-right index and bottom progress bar show how far you are in the deck.
- **In-app updates:** The app checks for new data 10 minutes after it becomes active and offers a “Load now” update.
- **PWA-ready:** Manifest and service worker configuration for installable, cached assets.

## Data
The deck content lives in `public/models-latest.json`:
- `models`: array of mental models
- `generatedAt`: timestamp used to detect updates

To rebuild the dataset:
```bash
npm run build:models
```

## Development
Install dependencies and run the dev server:
```bash
npm install
npm run dev
```

Build and preview:
```bash
npm run build
npm run preview
```

## Project Structure
- `src/App.tsx`: main deck logic and swipe/flip interactions
- `src/lib/`: deck helpers, theming, icon mapping, and text helpers
- `public/models-latest.json`: mental model data payload

