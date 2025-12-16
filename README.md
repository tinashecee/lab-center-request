# Vue Sample Collection Request App

A lightweight Vue.js application for centers to request sample collections. This app integrates with the existing Firebase collections and uses the same design system as the main application.

## Features

- Firebase Authentication (email/password)
- Submit sample collection requests
- Select tests from the tests collection
- View request history
- Same color themes and design as main app

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

The app uses the same Firebase configuration as the main application:
- Project: labpartners-bc8e7
- Collections: `collectionRequests`, `tests`, `users`

## Project Structure

```
vue-sample-app/
├── src/
│   ├── main.js              # App entry point
│   ├── App.vue              # Root component
│   ├── router/              # Vue Router configuration
│   ├── views/               # Page components
│   ├── components/          # Reusable components
│   ├── composables/         # Vue composables
│   ├── services/            # Firebase services
│   └── styles/             # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Notes

- Requests are saved to `collectionRequests` collection
- No driver assignment is included (as per requirements)
- App can be moved to a separate folder later

