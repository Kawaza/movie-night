import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { fetchData, saveData, defaultData } from '../utils/api';
import { generateId, getAverageRating } from '../utils/storage';

const MovieContext = createContext(null);
const SAVE_DELAY = 600;
const POLL_INTERVAL = 15000;

export function MovieProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('loading');
  const pendingSave = useRef(false);
  const saveTimer = useRef(null);
  const dataRef = useRef(data);

  dataRef.current = data;

  const persist = useCallback(async (nextData) => {
    pendingSave.current = true;
    setSyncStatus('saving');
    try {
      const saved = await saveData(nextData);
      setData((prev) => {
        if (prev === nextData || dataRef.current === nextData) {
          return { ...nextData, updatedAt: saved.updatedAt };
        }
        return prev;
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    } finally {
      pendingSave.current = false;
    }
  }, []);

  const scheduleSave = useCallback(
    (nextData) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(nextData), SAVE_DELAY);
    },
    [persist]
  );

  const applyChange = useCallback(
    (updater) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const refresh = useCallback(async () => {
    if (pendingSave.current) return;
    try {
      const remote = await fetchData();
      setData((prev) => {
        if (pendingSave.current) return prev;
        if (remote.updatedAt && prev.updatedAt === remote.updatedAt) return prev;
        return remote;
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchData()
      .then((remote) => {
        setData(remote);
        setSyncStatus('synced');
      })
      .catch(() => setSyncStatus('error'))
      .finally(() => setLoading(false));

    const poll = setInterval(refresh, POLL_INTERVAL);

    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    });

    return () => {
      clearInterval(poll);
      clearTimeout(saveTimer.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const addMovie = useCallback(
    (title) => {
      const trimmed = title.trim();
      if (!trimmed) return false;
      applyChange((prev) => ({
        ...prev,
        movies: [...prev.movies, { id: generateId(), title: trimmed, ratings: {} }],
      }));
      return true;
    },
    [applyChange]
  );

  const removeMovie = useCallback(
    (id) => {
      applyChange((prev) => ({
        ...prev,
        movies: prev.movies.filter((m) => m.id !== id),
      }));
    },
    [applyChange]
  );

  const addPerson = useCallback(
    (name) => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: 'Name is required' };
      if (trimmed.length > 24) return { ok: false, error: 'Name too long' };

      const current = dataRef.current;
      if (current.people.length >= 10) {
        return { ok: false, error: 'Maximum 10 people' };
      }
      if (current.people.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
        return { ok: false, error: 'Name already exists' };
      }

      applyChange((prev) => ({
        ...prev,
        people: [...prev.people, trimmed],
      }));
      return { ok: true };
    },
    [applyChange]
  );

  const removePerson = useCallback(
    (name) => {
      applyChange((prev) => ({
        ...prev,
        people: prev.people.filter((p) => p !== name),
        movies: prev.movies.map((m) => {
          const { [name]: _, ...rest } = m.ratings;
          return { ...m, ratings: rest };
        }),
      }));
    },
    [applyChange]
  );

  const setRating = useCallback(
    (movieId, person, rating) => {
      applyChange((prev) => ({
        ...prev,
        movies: prev.movies.map((m) => {
          if (m.id !== movieId) return m;
          const ratings = { ...m.ratings };
          if (rating === '' || rating === null || rating === undefined) {
            delete ratings[person];
          } else {
            ratings[person] = Math.min(10, Math.max(0, Number(rating)));
          }
          return { ...m, ratings };
        }),
      }));
    },
    [applyChange]
  );

  const getSortedMovies = useCallback(
    (filterPerson = null) => {
      const withAvg = data.movies.map((m) => ({
        ...m,
        average:
          filterPerson && m.ratings[filterPerson] != null
            ? m.ratings[filterPerson]
            : filterPerson
              ? null
              : getAverageRating(m.ratings),
      }));

      return withAvg
        .filter((m) => m.average != null)
        .sort((a, b) => b.average - a.average);
    },
    [data.movies]
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading movie list…</p>
      </div>
    );
  }

  return (
    <MovieContext.Provider
      value={{
        movies: data.movies,
        people: data.people,
        syncStatus,
        refresh,
        addMovie,
        removeMovie,
        addPerson,
        removePerson,
        setRating,
        getSortedMovies,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies() {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error('useMovies must be used within MovieProvider');
  return ctx;
}
