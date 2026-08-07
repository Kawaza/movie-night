import { useState } from 'react';
import { useMovies } from '../context/MovieContext';
import { getRatingCount } from '../utils/storage';

export default function RankingsPage() {
  const { people, getSortedMovies } = useMovies();
  const [filter, setFilter] = useState('all');

  const sorted = getSortedMovies(filter === 'all' ? null : filter);

  return (
    <div className="page rankings-page">
      <div className="field">
        <label htmlFor="person-filter">Show rankings for</label>
        <select
          id="person-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Everyone (average)</option>
          {people.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>No rated movies yet.</p>
          <p className="empty-hint">Add ratings on the Ratings tab.</p>
        </div>
      ) : (
        <ol className="ranking-list">
          {sorted.map((movie, index) => {
            const count = filter === 'all' ? getRatingCount(movie.ratings) : 1;
            return (
              <li key={movie.id} className="ranking-item">
                <span className="ranking-pos">{index + 1}</span>
                <div className="ranking-info">
                  <span className="ranking-title">{movie.title}</span>
                  <span className="ranking-sub">
                    {filter === 'all'
                      ? `${count} rating${count !== 1 ? 's' : ''}`
                      : filter}
                  </span>
                </div>
                <span className="ranking-score">{movie.average}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
