import './MovieCard.css';

function MovieCardSkeleton({ variant = 'poster' }) {
  return (
    <div className={`movie-card ${variant === 'wide' ? 'movie-card--wide' : ''}`.trim()} aria-hidden="true">
      <div className="movie-card__media skeleton" />
      <div className="skeleton skeleton--line" style={{ width: '70%' }} />
      <div className="skeleton skeleton--line" style={{ width: '45%' }} />
    </div>
  );
}

export default MovieCardSkeleton;