import { useNavigate } from 'react-router-dom';
import { IconClose } from './Icons';

export default function PickModal({ movie, onClose, onRemove, onKeep }) {
  const navigate = useNavigate();

  if (!movie) return null;

  function handleRateNow() {
    onKeep?.();
    navigate(`/ratings?movie=${movie.id}`);
  }

  return (
    <div className="modal-overlay" onClick={onKeep} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="pick-title"
        aria-modal="true"
      >
        <button type="button" className="modal-close" onClick={onKeep} aria-label="Close">
          <IconClose size={18} />
        </button>

        <p className="modal-eyebrow">Tonight&apos;s pick</p>
        <h2 id="pick-title" className="modal-title">{movie.title}</h2>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleRateNow}
          >
            Rate it now
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            Mark as watched
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={onKeep}
          >
            Keep on wheel
          </button>
        </div>
      </div>
    </div>
  );
}
