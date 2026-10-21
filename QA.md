# Manual QA checklist (run before every release)

Automated: `npm run check` (types, lint, unit tests + coverage gates), `npm run e2e:web` (Playwright), `npm run e2e:mobile`
(Maestro, on an installed build). This list covers what they can't.

| Check                                                                | iOS | Android | Web |
| -------------------------------------------------------------------- | --- | ------- | --- |
| Small phone + large phone layouts                                    |     |         | —   |
| Dark mode                                                            |     |         |     |
| Largest font size                                                    |     |         |     |
| VoiceOver / TalkBack: add a weight                                   |     |         | —   |
| French language                                                      |     |         |     |
| Reminder notification fires and opens Add                            |     |         | —   |
| Export opens the share sheet (web: downloads a file)                 |     |         |     |
| Airplane mode (offline-first: everything works)                      |     |         |     |
| Upgrade from the previous build keeps data (migrations)              |     |         | —   |
| Splash: icon → animated arrow → app, no black screen (release build) |     |         | —   |
| With the keyboard open, one tap on Save saves                        |     |         |     |
| Web: data persists after a reload (COOP/COEP headers present)        | —   | —       |     |
