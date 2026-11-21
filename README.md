# HealthMate – Personal Health & Wellness Tracker

HealthMate is a React Native (Expo) mobile app for recording, managing,
searching and reviewing daily health activities: **steps walked**,
**calories burned** and **water intake**. All data is stored locally in an
embedded **SQLite** database (`expo-sqlite`).

## Features

### Core
- **Dashboard** – today's totals (e.g. *Today – 18 August 2026: 7,850 steps,
  420 kcal, 2,000 ml*) with progress bars towards daily goals.
- **Add record** – validated form (required, whole numbers, maximum limits,
  no future dates, at least one value above 0).
- **Record list** – all past records with dates, newest first.
- **Update / delete** – tap a record (or ✏️) to edit; 🗑️ to delete with a
  confirmation dialog and **Undo**.
- **Search / filter by date** – single date or a date range, plus quick
  filters (Today, Last 7 days, This month) with totals for the period.
- **Dummy data** – 14 days of sample records are inserted on first launch.

### Additional features
- Weekly bar chart (last 7 days) per metric with a goal line.
- Configurable daily goals and light / dark / system theme (saved with AsyncStorage).
- Quick "+250 ml / +500 ml water" on the dashboard and in the form.
- Logging streak and 7-day averages.
- Sort newest/oldest, pull-to-refresh, empty states, error messages.
- "Reset to sample data" in Settings.

## Architecture – MVC

```
 ┌──────────── VIEW (src/views) ────────────┐
 │ Screens + reusable components            │
 │ display state, forward user actions      │
 └───────────────┬──────────────────────────┘
                 │ calls controller methods          ▲ re-render with new state
                 ▼                                   │
 ┌──────── CONTROLLER (src/controllers) ────┐   ┌────┴── STORE (src/store) ──────┐
 │ validate input, call models,             │──►│ React Context + useReducer      │
 │ dispatch results to the store            │   │ (records, filter, week, settings)│
 └───────────────┬──────────────────────────┘   └─────────────────────────────────┘
                 │ calls
                 ▼
 ┌──────────── MODEL (src/models) ──────────┐
 │ HealthRecord (entity + rules)            │
 │ HealthRecordModel (all SQL) ──► SQLite   │
 │ SettingsModel ──► AsyncStorage           │
 └──────────────────────────────────────────┘
```

```
HealthMate/
├── App.js                        # root: providers + navigator
├── src/
│   ├── config/                   # constants (limits, metrics), theme colours
│   ├── database/database.js      # open SQLite, create table/index, seed data
│   ├── models/                   # MODEL
│   │   ├── HealthRecord.js       #   entity: create, map rows, validation rules
│   │   ├── HealthRecordModel.js  #   CRUD + search SQL for health_records
│   │   └── SettingsModel.js      #   goals + theme in AsyncStorage
│   ├── controllers/              # CONTROLLER
│   │   ├── RecordController.js   #   CRUD, search/filter, sort, undo
│   │   ├── DashboardController.js#   today totals, week, averages, streak
│   │   └── SettingsController.js #   theme + goals
│   ├── store/                    # STATE MANAGEMENT
│   │   ├── appReducer.js         #   pure reducer + action types
│   │   └── AppContext.js         #   Context provider, models injection, theme
│   ├── views/                    # VIEW
│   │   ├── screens/              #   Dashboard, RecordList, RecordForm, Settings
│   │   └── components/           #   Card, MetricChip, FormField, DateField, …
│   ├── navigation/AppNavigator.js# bottom tabs + stack
│   └── utils/                    # dates, validators, number formatting
└── __tests__/                    # Jest tests
```

## Database

Table `health_records`

| Field    | Type    | Notes                                   |
|----------|---------|-----------------------------------------|
| id       | INTEGER | PRIMARY KEY AUTOINCREMENT               |
| date     | TEXT    | `YYYY-MM-DD`, NOT NULL (sorts correctly)|
| steps    | INTEGER | NOT NULL, CHECK ≥ 0                     |
| calories | INTEGER | kcal, NOT NULL, CHECK ≥ 0               |
| water    | INTEGER | ml, NOT NULL, CHECK ≥ 0                 |

An index on `date` speeds up searching/sorting. `PRAGMA user_version`
tracks the schema version.

## Libraries

| Package | Why |
|---|---|
| expo | Managed React Native toolchain, runs in Expo Go, builds APKs |
| expo-sqlite | Embedded SQLite database (CRUD) |
| @react-native-async-storage/async-storage | Small key–value settings (goals, theme) |
| @react-navigation/native, bottom-tabs, native-stack | Navigation (tabs + form screen) |
| @react-native-community/datetimepicker | Native Android/iOS date picker |
| @expo/vector-icons | Material Community Icons |
| react-native-safe-area-context, react-native-screens | Required by React Navigation |
| jest-expo, @testing-library/react-native (dev) | Unit and component tests |

## Getting started (Windows + Android Studio emulator)

Requirements: **Node.js 22 LTS** (or newer) and an Android emulator from
Android Studio's Device Manager.

```bash
npm install
```

Start the emulator, then:

```bash
npx expo start --android
```

Expo installs **Expo Go** on the emulator and opens the app. Press `r` in
the terminal to reload.

### Tests and lint

```bash
npm test
```

```bash
npm run lint
```

## Building the release APK

**Option A – locally with Android Studio's SDK** (needs `ANDROID_HOME` set
and JDK 17, both installed with Android Studio):

```bash
npx expo prebuild --platform android
```

```bash
cd android && .\gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

**Option B – Expo EAS cloud build** (free Expo account):

```bash
npx eas-cli@latest build -p android --profile preview
```

Download the `.apk` from the link it prints.
