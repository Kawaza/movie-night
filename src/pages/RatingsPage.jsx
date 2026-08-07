import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';

export default function RatingsPage() {
  const { movies, people, setRating } = useMovies();
  const [searchParams, setSearchParams] = useSearchParams();

  const [movieId, setMovieId] = useState('');
  const [person, setPerson] = useState('');
  const [score, setScore] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prefillMovie = searchParams.get('movie');
    if (prefillMovie && movies.some((m) => m.id === prefillMovie)) {
      setMovieId(prefillMovie);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, movies, setSearchParams]);

  useEffect(() => {
    if (movieId && person) {
      const movie = movies.find((m) => m.id === movieId);
      const existing = movie?.ratings[person];
      setScore(existing != null ? String(existing) : '');
    } else {
      setScore('');
    }
    setSaved(false);
  }, [movieId, person, movies]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!movieId || !person || score === '') return;
    setRating(movieId, person, score);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (movies.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Add movies in Settings first.</p>
        </div>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Add people in Settings first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page ratings-page">
      <form className="rating-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="rating-movie">Movie</label>
          <select
            id="rating-movie"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            required
          >
            <option value="">Select a movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rating-person">Person</label>
          <select
            id="rating-person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            required
          >
            <option value="">Select a person</option>
            {people.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rating-score">Score</label>
          <div className="score-input">
            <input
              id="rating-score"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="0 – 10"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
            <span className="score-suffix">/ 10</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!movieId || !person || score === ''}>
          Save rating
        </button>

        {saved && <p className="form-success">Rating saved.</p>}
      </form>
    </div>
  );
}
