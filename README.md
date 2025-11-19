# Tithe Tracker App

A mobile application built with React Native + Expo to help users track their income and calculate tithes.

## Features

- Track total income
- Automatically calculate 10% tithe
- Save income records with dates
- Mark tithes as pending or done
- Simple and intuitive UI

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Expo Go app on your mobile device

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd tithe-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the App

1. Start the development server:
   ```
   npx expo start
   ```

2. Scan the QR code with the Expo Go app on your Android device, or use the camera app on iOS.

### Building for Production

To build an APK for Android:
```
npx expo build:android
```

## Project Structure

```
tithe-app/
├── screens/
│   ├── Dashboard.js
│   ├── AddIncome.js
│   ├── Reminder.js
│   └── Status.js
├── components/
│   ├── IncomeCard.js
│   └── TitheCard.js
├── App.js
├── app.json
└── package.json
```

## Dependencies

- React Native
- Expo
- React Navigation
- Async Storage