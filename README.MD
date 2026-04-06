# Eride Taxi Frontend

Vue 3 + TypeScript + Vite frontend for the Eride EV Taxi app, with Capacitor Android integration.

## Tech Stack
- Vue 3 (`vue-router`, `pinia`)
- TypeScript (strict mode)
- Vite
- Capacitor (`@capacitor/android`, Google Maps, Geolocation)

## Prerequisites
- Node.js 18+
- npm 9+
- Android Studio + Android SDK (for native builds)
- JDK 17+ (for Gradle/Android)

## Getting Started
1. Install dependencies:
```bash
npm install
```
2. Create local env from `.env.example` and set values:
```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```
3. Start dev server:
```bash
npm run dev
```
App runs on `http://localhost:5173`.

## Available Scripts
- `npm run dev` - start Vite dev server
- `npm run build` - production web build
- `npm run preview` - preview production build locally
- `npm run android:sync` - sync web assets + Capacitor plugins to Android
- `npm run android:apk:debug` - build and generate debug APK
- `npm run android:apk:release` - build and generate release APK

## Project Structure
- `src/pages/` route-level screens by feature (`auth`, `booking`, `driver`, `driver-apply`)
- `src/components/` reusable UI components
- `src/store/` Pinia stores
- `src/services/` API/socket/http modules
- `src/styles/` tokens and global styles
- `android/` native Android project

## Notes
- Keep secrets out of git; do not commit real API keys.
- For Android emulator networking, use `10.0.2.2` values shown in `.env.example`.
- If map rendering fails, verify `VITE_GOOGLE_MAPS_API_KEY` and platform restrictions in Google Cloud.
