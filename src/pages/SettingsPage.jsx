import { useState } from 'react';
import { useMovies } from '../context/MovieContext';
import { IconTrash } from '../components/Icons';
import ConfirmModal from '../components/ConfirmModal';
import { getAverageRating, getRatingCount } from '../utils/storage';

function getInitials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function SettingsPage() {
  const {
    movies,
    watched,
    people,
    addMovie,
    removeMovie,
    addWatchedMovie,
    removeWatchedMovie,
    addPerson,
    removePerson,
  } = useMovies();

  const [newMovie, setNewMovie] = useState('');
  const [newWatched, setNewWatched] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [personError, setPersonError] = useState('');
  const [poolToDelete, setPoolToDelete] = useState(null);
  const [watchedToDelete, setWatchedToDelete] = useState(null);

  function handleAddMovie(e) {
    e.preventDefault();
    if (addMovie(newMovie)) setNewMovie('');
  }

  function handleAddWatched(e) {
    e.preventDefault();
    if (addWatchedMovie(newWatched)) setNewWatched('');
  }

  function handleAddPerson(e) {
    e.preventDefault();
    if (people.length >= 10) {
      setPersonError('Maximum 10 people');
      return;
    }
    const result = addPerson(newPerson);
    if (result.ok) {
      setNewPerson('');
      setPersonError('');
    } else {
      setPersonError(result.error || 'Could not add');
    }
  }

  return (
    <div className="page settings-page">
      <div className="settings-intro">
        <h2 className="settings-page-title">Settings</h2>
        <p className="settings-page-desc">Manage your group, wheel, and watched movies.</p>
      </div>

      <section className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Watch group</h3>
        </div>

        <form className="form-row" onSubmit={handleAddPerson}>
          <input
            type="text"
            placeholder="Add a name"
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            maxLength={24}
            aria-label="Person name"
          />
          <button type="submit" className="btn btn-secondary" disabled={people.length >= 10}>
            Add
          </button>
        </form>
        {personError && <p className="form-error">{personError}</p>}

        {people.length > 0 ? (
          <ul className="user-list">
            {people.map((name) => (
              <li key={name} className="user-row">
                <span className="user-avatar" aria-hidden="true">{getInitials(name)}</span>
                <span className="user-name">{name}</span>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => removePerson(name)}
                  aria-label={`Remove ${name}`}
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-hint">No one in the watch group yet.</p>
        )}
      </section>

      <section className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Wheel</h3>
        </div>

        <form className="form-row" onSubmit={handleAddMovie}>
          <input
            type="text"
            placeholder="Add a movie"
            value={newMovie}
            onChange={(e) => setNewMovie(e.target.value)}
            aria-label="Movie title"
          />
          <button type="submit" className="btn btn-secondary">
            Add
          </button>
        </form>

        {movies.length === 0 ? (
          <p className="empty-hint">No movies on the wheel.</p>
        ) : (
          <ul className="settings-list">
            {movies.map((movie) => (
              <li key={movie.id} className="settings-list-item">
                <span className="settings-list-label">{movie.title}</span>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setPoolToDelete(movie)}
                  aria-label={`Remove ${movie.title}`}
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Watched</h3>
        </div>

        <form className="form-row" onSubmit={handleAddWatched}>
          <input
            type="text"
            placeholder="Add a watched movie"
            value={newWatched}
            onChange={(e) => setNewWatched(e.target.value)}
            aria-label="Watched movie title"
          />
          <button type="submit" className="btn btn-secondary">
            Add
          </button>
        </form>

        {watched.length === 0 ? (
          <p className="empty-hint">No watched movies yet. Mark one from the wheel or add here.</p>
        ) : (
          <ul className="settings-list">
            {watched.map((movie) => {
              const avg = getAverageRating(movie.ratings);
              const count = getRatingCount(movie.ratings);
              return (
                <li key={movie.id} className="settings-list-item">
                  <div className="settings-list-meta">
                    <span className="settings-list-label">{movie.title}</span>
                    {avg != null && (
                      <span className="settings-list-sub">
                        Avg {avg} · {count} rating{count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setWatchedToDelete(movie)}
                    aria-label={`Remove ${movie.title}`}
                  >
                    <IconTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {poolToDelete && (
        <ConfirmModal
          title="Remove from wheel?"
          message={`Remove "${poolToDelete.title}" from the wheel?`}
          confirmLabel="Remove"
          onConfirm={() => {
            removeMovie(poolToDelete.id);
            setPoolToDelete(null);
          }}
          onCancel={() => setPoolToDelete(null)}
        />
      )}

      {watchedToDelete && (
        <ConfirmModal
          title="Remove from watched?"
          message={`Remove "${watchedToDelete.title}" from watched? Its ratings will be deleted.`}
          confirmLabel="Remove"
          onConfirm={() => {
            removeWatchedMovie(watchedToDelete.id);
            setWatchedToDelete(null);
          }}
          onCancel={() => setWatchedToDelete(null)}
        />
      )}
    </div>
  );
}
