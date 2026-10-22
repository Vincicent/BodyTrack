import * as Sentry from '@sentry/react-native';
import { reportError, scrubEvent, scrubMessage, setCrashReporting } from './crashReporting';

const DSN = 'https://key@o0.ingest.sentry.io/0';
const init = jest.mocked(Sentry.init);
const close = jest.mocked(Sentry.close);
const capture = jest.mocked(Sentry.captureException);

describe('crash reporting', () => {
  beforeEach(() => setCrashReporting(false, DSN)); // every test starts with the SDK stopped

  it('does nothing without a DSN (tests, local and CI builds)', () => {
    init.mockClear();
    setCrashReporting(true, undefined);
    expect(init).not.toHaveBeenCalled();
  });

  it('starts without personal data, breadcrumbs or sessions', () => {
    init.mockClear();
    setCrashReporting(true, DSN);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: DSN,
        environment: 'development', // local build: no EXPO_PUBLIC_SENTRY_ENV
        sendDefaultPii: false,
        enableAutoSessionTracking: false,
        maxBreadcrumbs: 0,
      }),
    );
  });

  it('starts once, and closes the SDK (native side included) when the user opts out', () => {
    init.mockClear();
    close.mockClear();
    setCrashReporting(true, DSN);
    setCrashReporting(true, DSN);
    expect(init).toHaveBeenCalledTimes(1);
    setCrashReporting(false, DSN);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('reports caught errors only while it runs', () => {
    capture.mockClear();
    reportError(new Error('off'));
    expect(capture).not.toHaveBeenCalled();
    setCrashReporting(true, DSN);
    const error = new Error('on');
    reportError(error);
    expect(capture).toHaveBeenCalledWith(error);
  });
});

describe('scrubbing', () => {
  it('removes the values Drizzle appends to a failed query', () =>
    expect(
      scrubMessage(
        'Failed query: insert into "weight_entries" values (?, ?)\nparams: 72.5,1792657075062',
      ),
    ).toBe('Failed query: insert into "weight_entries" values (?, ?)\nparams: [removed]'));

  it('keeps other messages as they are', () =>
    expect(scrubMessage('Cannot read property x of undefined')).toBe(
      'Cannot read property x of undefined',
    ));

  it('drops the user, the request and the breadcrumbs from an event', () => {
    const event = scrubEvent({
      type: undefined,
      user: { id: 'abc' },
      request: { url: 'https://example.com' },
      breadcrumbs: [{ message: 'tapped Waist, 84 cm' }],
      exception: { values: [{ type: 'Error', value: 'Failed query: x\nparams: 84' }] },
    });
    expect(event.user).toBeUndefined();
    expect(event.request).toBeUndefined();
    expect(event.breadcrumbs).toBeUndefined();
    expect(event.exception?.values?.[0]?.value).toBe('Failed query: x\nparams: [removed]');
  });
});
