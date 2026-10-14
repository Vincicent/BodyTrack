import { getTableName, type Table } from 'drizzle-orm';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

/** Wait after a change before re-reading: a burst of writes (an import) then costs one query, not one per row. */
const REFRESH_DELAY_MS = 50;
const RETRY_DELAY_MS = 100;
const MAX_RETRIES = 30; // ~3 s

/**
 * On web, SQLite runs in a Web Worker and every synchronous call gives up after ~20 ms with this error.
 * Right after a write the worker is often still saving to browser storage, so a read can hit it.
 * Retrying is safe because a live query only reads.
 */
const isWorkerBusy = (e: unknown) =>
  e instanceof Error && e.message.includes('Sync operation timeout');

/**
 * Runs `query`, then runs it again whenever a row of `table` changes (like Drizzle's useLiveQuery, but web-safe):
 * the re-run is slightly delayed, "worker busy" errors are retried, and any other error is returned.
 * `refresh` runs the query again by hand (a "Try again" button).
 */
export function useLiveQuery<T>(query: PromiseLike<T>, table: Table, deps: DependencyList = []) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [updatedAt, setUpdatedAt] = useState<Date>();
  const runRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = (attempt = 0) => {
      Promise.resolve()
        .then(() => query)
        .then((result) => {
          if (cancelled) return;
          setData(result);
          setError(undefined);
          setUpdatedAt(new Date());
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          if (isWorkerBusy(e) && attempt < MAX_RETRIES) {
            timer = setTimeout(() => run(attempt + 1), RETRY_DELAY_MS);
          } else {
            setError(e instanceof Error ? e : new Error(String(e)));
          }
        });
    };
    const schedule = (delay: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => run(), delay);
    };

    runRef.current = () => schedule(0);
    run();
    const tableName = getTableName(table);
    const subscription = addDatabaseChangeListener((event) => {
      if (event.tableName === tableName) schedule(REFRESH_DELAY_MS);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- like Drizzle's hook: the query is rebuilt every render, `deps` say when it really changes
  }, deps);

  const refresh = useCallback(() => runRef.current(), []);
  return { data, error, updatedAt, refresh };
}
