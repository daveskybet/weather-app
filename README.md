# Weather App

A React Native weather app built with Expo, TypeScript, and the open-meteo API. Shows current conditions and a 7-day hourly forecast for any city in the world.

---

## Running the app

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ (managed via [asdf](https://asdf-vm.com/) — see `.tool-versions`)
- [Yarn](https://yarnpkg.com/) 1.x
- [Expo Go](https://expo.dev/go) installed on your iOS or Android device

### Install dependencies

```bash
yarn install
```

### Start the development server

```bash
yarn start
```

Expo will print a QR code. Open the **Expo Go** app on your device and scan it. The app will bundle and load on your device over your local network.

Platform-specific shortcuts:

```bash
yarn ios      # Open in iOS Simulator (requires Xcode)
yarn android  # Open in Android Emulator (requires Android Studio)
yarn web      # Open in a browser
```

### Other useful commands

```bash
yarn test           # Run the test suite once
yarn test:watch     # Run tests in watch mode
yarn test:coverage  # Run tests with coverage report
yarn lint           # ESLint
yarn lint:fix       # ESLint with auto-fix
yarn typecheck      # TypeScript type check (no emit)
```

---

## Project structure

```
weather-app/
├── App.tsx                        # App entry point
├── src/
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types (WeatherData, DailyForecast, HourlyForecast, ...)
│   ├── services/
│   │   ├── geocodingService.ts    # Resolves a city name to lat/lng via open-meteo geocoding API
│   │   └── forecastService.ts     # Fetches current + 7-day daily + hourly forecast from open-meteo
│   ├── hooks/
│   │   └── useWeather.ts          # Composes geocoding + forecast with SWR (caching, revalidation)
│   ├── screens/
│   │   └── HomeScreen.tsx         # Single screen: owns layout, wires hook to components
│   ├── components/
│   │   ├── WeatherCard.tsx        # Current conditions display
│   │   ├── ForecastTabs.tsx       # Composes ForecastTab list + ForecastDetail panel
│   │   ├── ForecastTab.tsx        # A single scrollable day tab (emoji, temp range, description)
│   │   ├── ForecastDetail.tsx     # Horizontal hourly scroll for the selected day
│   │   ├── ForecastRow.tsx        # (unused in main UI, kept for alternative list layout)
│   │   ├── CityInput.tsx          # Search input + submit button
│   │   ├── ErrorMessage.tsx       # Error display with retry button
│   │   └── LoadingSpinner.tsx     # Loading indicator
│   ├── utils/
│   │   ├── formatDay.ts           # Formats an ISO date string to "Today" / "Mon" etc.
│   │   ├── emojis.ts              # WeatherCondition → emoji mapping
│   │   └── wmo.ts                 # WMO weather code → WeatherCondition + description
│   └── __mocks__/
│       └── react-native-safe-area-context.tsx  # Jest manual mock (plain View wrappers)
└── __tests__/                     # Mirrors src/ structure
    ├── components/
    ├── hooks/
    ├── screens/
    ├── services/
    └── utils/
```

---

## Architectural decisions

### Separation of concerns

The codebase is layered deliberately:

- **Types** — plain TypeScript interfaces, no logic, imported everywhere.
- **Services** — pure async functions that talk to external APIs. `geocodingService` handles one concern (city → coordinates); `forecastService` handles another (coordinates → weather data). Splitting them keeps each function small and independently testable without mocking the other.
- **Hooks** — the Custom Hooks pattern ensures that data/state/logic remains reparate from the view layer which can remain clean. `useWeather` is the only place that knows about SWR. It sequences the two API calls (geocoding then forecast) and exposes a stable interface (`data`, `isLoading`, `error`, `city`, `setCity`, `refresh`) to the UI.
- **Components** — the component composition pattern ensures each component is small enough to be understood in isolation. Components receive data as props and render. No network calls, no business logic. 
- **Screen** — composes components and calls the hook. It does not know what services exist.

### SWR for data fetching

SWR provides caching, deduplication, and revalidation without requiring extra logic in the app. The two `useSWR` calls are chained — the forecast key is the resolved `GeoLocation` object, so the forecast only fetches once geocoding has succeeded and returns `null` (skipped) if geocoding is still in flight or has errored.

The cache key for the forecast is the `GeoLocation` object. SWR uses deep-equal comparison on keys by default (via `dequal`), which prevents redundant refetches when the city name resolves to the same coordinates.

### Input sanitisation

`geocodingService.sanitiseCity` validates and normalises city input before it reaches the network:

1. Rejects control characters
2. Trims whitespace and collapses internal runs
3. Rejects empty/blank strings
4. Enforces a 100-character length cap
5. Allowlists valid characters: letters in any Unicode script, digits, spaces, hyphens, apostrophes, periods, commas

This keeps the concern close to where the risk is — the network boundary — rather than scattering validation across components.

### Path aliases

All imports use `@/` (mapping to `src/`) rather than relative paths. This keeps imports readable regardless of directory depth and makes file moves safe.

### Single `tsconfig.json`

There is no separate test tsconfig. A single config with `"types": ["jest"]` satisfies the IDE, the type checker, and the test runner.

---

## Scalability thoughts

If the app was to be expanded/productionised, scalability concerns/thoughts would fall in to a couple of categories:

### Data Sources/3rd party integrations

**API rate limiting/commercial use** — open-meteo is free and unkeyed, but has limits and is limited to non-commercial use, so would require either a commercial licence, self-hosting (in the case of Geocoding), or an alternative provider, which the choice of which would depend on scale required and cost.

**Fallback/Redundancy** - as the app usage grows, downtime becomes a concern, a fallback/redundancy service should be implemented so service can be maintained seamlessly. 

### Client improvements

**Multiple cities / saved locations** — `useWeather` currently holds a single city in local state. A saved-locations feature would promote that state to a context or a store. SWR would naturally cache each city independently, so switching between saved locations would be instant after the first fetch.

**Offline support** — SWR keeps its last-known data in memory. Persisting the SWR cache to AsyncStorage would let the app show stale data on launch with no network, then revalidate in the background when connectivity returns, improving UX while reducing network traffic to 3rd party data sources.

**Multiple themes / Design System** — as things stand at the moment, the components are understandable/maintainable in a single components directory with components that handle their own styling. If the app functionality was to grow then this would slowly become unsustainable and a more structured design system approach would be better.



---

## Monitoring approach

For a production version of this app:

- **Crash reporting** — Sentry (`@sentry/react-native`) would capture unhandled JS errors and native crashes with full stack traces and device context. Sentry's source map upload in CI maps minified frames back to original TypeScript.
- **API error tracking** — fetch errors in `geocodingService` and `forecastService` would be logged to Sentry as breadcrumbs, with the sanitised city name as context.
- **Performance** — Expo's built-in performance marks and Sentry's React Native tracing would track screen load time and API latency. The two-step geocoding + forecast pattern creates a natural trace with two child spans.
- **Availability** — since open-meteo is a third-party dependency, an uptime monitor (e.g. Better Uptime or a simple CloudWatch alarm) would alert before users notice an outage.
- **User analytics** — for product decisions (which cities are searched, how often the retry button is pressed), a lightweight analytics library such as Expo's built-in analytics or PostHog would be useful.

---

## What I'd improve with more time

- **Error UX** — the current error state shows a raw API message. A production app would map known error conditions (city not found, network offline, rate limited) to user-friendly copy with actionable guidance.
- **Accessibility** — `accessibilityLabel` and `accessibilityRole` on interactive elements, VoiceOver/TalkBack testing.
- **Localisation** — all display strings are hardcoded in English. Wrapping them in an i18n library (e.g. `i18next`) from the start is much easier than retrofitting it later.
- **Unit of measure toggle** — the API supports Fahrenheit and mph natively; exposing a toggle and persisting the preference to AsyncStorage would be a small change.
- **Forecast visualisation** — the hourly data would lend itself well to a small sparkline or bar chart (e.g. via `react-native-svg`), giving users a quick visual sense of temperature curve through the day.
- **E2E tests** — the current suite covers unit and integration tests. Adding Detox or Maestro tests for key user journeys (search a city, view forecast, retry after error) would give confidence before releases.
- **CI pipeline** — a GitHub Actions workflow running `typecheck`, `lint`, and `test` on every push and pull request.
