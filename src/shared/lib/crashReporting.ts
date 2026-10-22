import * as Sentry from '@sentry/react-native';

/**
 * Anonymous crash reports (Sentry), on by default, and the user can turn them off in Settings.
 *
 * What is sent: the error, its stack trace, the app version and the device model / OS. Never the user's data:
 * no personal info (`sendDefaultPii: false`), no breadcrumbs (they could carry a barcode or a tapped label with a value),
 * no sessions, and database errors lose the query parameters Drizzle appends to their message (they hold the values).
 *
 * Turning it off closes the SDK, native side included: a native crash is caught by the native SDK, which never sees
 * our JavaScript `beforeSend`, so a flag there would not be enough.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN; // public by design; unset in tests, local and CI builds → no reporting

/** "preview" or "production", set per EAS build profile in eas.json; "development" in local builds. */
const SENTRY_ENV = process.env.EXPO_PUBLIC_SENTRY_ENV || 'development';

let running = false;

/** Drizzle errors read "Failed query: … params: 72.5,…": keep the query (placeholders only), drop the values. */
export function scrubMessage(message: string): string {
  return message.replace(/params:[\s\S]*$/, 'params: [removed]');
}

export function scrubEvent<E extends Sentry.ErrorEvent>(event: E): E {
  delete event.user;
  delete event.request;
  delete event.breadcrumbs;
  if (event.message) event.message = scrubMessage(event.message);
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = scrubMessage(exception.value);
  }
  return event;
}

/** Starts or stops crash reporting to match the user's setting. Does nothing without a DSN. */
export function setCrashReporting(enabled: boolean, dsn = DSN): void {
  if (!dsn) return;
  if (enabled && !running) {
    Sentry.init({
      dsn,
      environment: SENTRY_ENV, // testers' reports (preview) and users' (production) filtered apart in Sentry
      sendDefaultPii: false,
      enableAutoSessionTracking: false,
      maxBreadcrumbs: 0,
      beforeBreadcrumb: () => null,
      beforeSend: (event) => scrubEvent(event),
    });
    running = true;
  } else if (!enabled && running) {
    void Sentry.close();
    running = false;
  }
}

/** Reports an error the app caught and showed (error screens). No-op when reporting is off. */
export function reportError(error: unknown): void {
  if (running) Sentry.captureException(error);
}
