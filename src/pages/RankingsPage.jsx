import { useState } from 'react';
import { useMovies } from '../context/MovieContext';
import { getRatingCount } from '../utils/storage';

function getRatingsList(ratings) {
  return Object.entries(ratings || {})
    .filter(([, value]) => typeof value === 'number' && value >= 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export default function RankingsPage() {
  const { people, getSortedMovies } = useMovies();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const sorted = getSortedMovies(filter === 'all' ? null : filter);

  function toggleExpanded(movieId) {
    setExpandedId((current) => (current === movieId ? null : movieId));
  }

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
            const ratingsList = getRatingsList(movie.ratings);
            const isExpanded = expandedId === movie.id;

            return (
              <li key={movie.id} className={`ranking-entry${isExpanded ? ' ranking-entry-expanded' : ''}`}>
                <button
                  type="button"
                  className="ranking-item"
                  onClick={() => toggleExpanded(movie.id)}
                  aria-expanded={isExpanded}
                >
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
                </button>

                {isExpanded && (
                  <ul className="ranking-details">
                    {ratingsList.map(([name, score]) => (
                      <li key={name} className="ranking-detail-row">
                        <span className="ranking-detail-name">{name}</span>
                        <span className="ranking-detail-score">{score}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
