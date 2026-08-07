import Wheel from '../components/Wheel';
import { useMovies } from '../context/MovieContext';
import { Link } from 'react-router-dom';

export default function WheelPage() {
  const { movies, people, removeMovie } = useMovies();

  return (
    <div className="page wheel-page">
      <div className="wheel-header">
        <p className="wheel-greeting">Tonight&apos;s pick</p>
        <p className="wheel-sub">
          {movies.length === 0
            ? 'Add movies in Settings to get started.'
            : `${movies.length} movie${movies.length !== 1 ? 's' : ''} in the pool`}
        </p>
      </div>

      <Wheel movies={movies} onRemoveMovie={removeMovie} />

      {movies.length === 0 && (
        <Link to="/settings" className="btn btn-secondary btn-block wheel-cta">
          Add movies
        </Link>
      )}

      {people.length === 0 && movies.length > 0 && (
        <p className="wheel-footnote">
          Add people in <Link to="/settings">Settings</Link> to start rating.
        </p>
      )}
    </div>
  );
}
