import { useState } from 'react';
import { useMovies } from '../context/MovieContext';
import { IconTrash } from '../components/Icons';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingsPage() {
  const { movies, people, addMovie, removeMovie, addPerson, removePerson } = useMovies();

  const [newMovie, setNewMovie] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [personError, setPersonError] = useState('');
  const [movieToDelete, setMovieToDelete] = useState(null);

  function handleAddMovie(e) {
    e.preventDefault();
    if (addMovie(newMovie)) setNewMovie('');
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
      <section className="section">
        <h2 className="section-title">Watch group</h2>
        <p className="section-desc">People who rate movies. Up to 10.</p>

        <form className="form-row" onSubmit={handleAddPerson}>
          <input
            type="text"
            placeholder="Name"
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
          <ul className="list">
            {people.map((name) => (
              <li key={name} className="list-item">
                <span>{name}</span>
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
          <p className="empty-hint">No people added yet.</p>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Movies</h2>
        <p className="section-desc">{movies.length} on the wheel</p>

        <form className="form-row" onSubmit={handleAddMovie}>
          <input
            type="text"
            placeholder="Movie title"
            value={newMovie}
            onChange={(e) => setNewMovie(e.target.value)}
            aria-label="Movie title"
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>

        {movies.length === 0 ? (
          <p className="empty-hint">No movies yet.</p>
        ) : (
          <ul className="list">
            {movies.map((movie) => (
              <li key={movie.id} className="list-item">
                <span className="list-item-title">{movie.title}</span>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setMovieToDelete(movie)}
                  aria-label={`Remove ${movie.title}`}
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {movieToDelete && (
        <ConfirmModal
          title="Remove movie?"
          message={`Remove "${movieToDelete.title}" from the wheel? Ratings for this movie will also be deleted.`}
          confirmLabel="Remove"
          onConfirm={() => {
            removeMovie(movieToDelete.id);
            setMovieToDelete(null);
          }}
          onCancel={() => setMovieToDelete(null)}
        />
      )}
    </div>
  );
}
