---
name: translations
description: >
  Work on internationalization and localization. Use when adding translations,
  creating new language keys, modifying the translation system, adding i18n strings
  to Portuguese/English/Spanish, using the t() function, adding a new language,
  fixing missing translations, or any locale/i18n-related task.
---

# Internationalization — VolleyScore-Pro

## Decision Tree

```
i18n need → What type?
    ├─ Add new translation keys → Adding New Translation Keys below
    ├─ New feature i18n → Template for New Feature below
    ├─ Add new language → Adding a New Language workflow below
    ├─ Fix missing translations → Check all 3 locale files (en/pt/es)
    ├─ Dynamic interpolation → t('key', { name: value }) syntax
    └─ Translation system architecture → LanguageContext.tsx
```

## Supported Languages
| Code | Language | File | Size |
|------|----------|------|------|
| `pt` | Portuguese (BR) | `src/locales/pt.json` | ~27KB |
| `en` | English | `src/locales/en.json` | ~32KB |
| `es` | Spanish | `src/locales/es.json` | ~28KB |

## System (Custom, No Library)

### LanguageContext.tsx
Provides `t()` translation function:
```tsx
const { t, language, setLanguage } = useTranslation();

// Usage
<span>{t('game.score')}</span>
<span>{t('game.setWin', { team: 'Team A' })}</span>
```

### Translation Key Structure
```json
{
  "game": {
    "score": "Score",
    "point": "Point",
    "set": "Set",
    "match": "Match",
    "timeout": "Timeout",
    "serve": "Serve"
  },
  "teams": {
    "teamA": "Team A",
    "addPlayer": "Add Player",
    "substitute": "Substitute"
  },
  "settings": { ... },
  "voice": { ... },
  "history": { ... },
  "tutorial": { ... },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "close": "Close",
    "confirm": "Confirm"
  }
}
```

## Adding New Translation Keys

### Step-by-step
1. Add key to ALL three locale files (`en.json`, `pt.json`, `es.json`)
2. Use descriptive, nested key paths: `feature.section.label`
3. Use the key in components: `t('feature.section.label')`

### Rules
- NEVER hardcode user-facing strings — always use `t()`
- Keep keys organized by feature module
- Use interpolation for dynamic values: `t('key', { name: value })`
- Portuguese is the primary language (developed by Brazilian team)
- All three files must stay in sync

### Template for New Feature
```json
// en.json
"newFeature": {
  "title": "Feature Title",
  "description": "Feature description",
  "actions": {
    "start": "Start",
    "stop": "Stop"
  },
  "errors": {
    "notFound": "Not found"
  }
}
```

## Adding a New Language
1. Create `src/locales/{code}.json` (copy structure from `en.json`)
2. Translate all keys
3. Register in `LanguageContext.tsx`:
   ```tsx
   const LANGUAGES = ['pt', 'en', 'es', 'NEW_CODE'];
   ```
4. Add language name to selector UI
5. Update voice command patterns for the language (VoiceCommandParser)
6. Test TTS pronunciation

## Key Files
- `src/locales/en.json` — English translations
- `src/locales/pt.json` — Portuguese translations
- `src/locales/es.json` — Spanish translations
- `src/contexts/LanguageContext.tsx` — Translation provider
