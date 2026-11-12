import {Link} from 'react-router';
import { PlusIcon,StarIcon } from './Icons.jsx';
import { backdropUrl,posterUrl } from '../utils/images.js';
import { formatGenres,formatRating,formatYear } from '../utils/format.js';
import './MovieCard.css';

function MovieCard({item,genreMap,variant='poster'}){
    const wide=variant ==='wide';
    const to=`/title/${item.mediaType}/${item.tmdbId}`;
    const poster = wide ? backdropUrl(item.backdropPath, 'w780') : posterUrl(item.posterPath);
    const rating=formatRating(item.tmdbRating);
    const year=formatYear(item.releaseDate);
    const genres=formatGenres(item.genreIds,genreMap);
    const meta=[year,genres].filter(Boolean).join(' · ');

    return (
        <article className={`movie-card ${wide ? 'movie-card--wide' : ''}`.trim()}>
            <div className="movie-card__media">
                <Link to={to} className="movie-card__poster-link" tabIndex={-1} aria-hidden="true">
                    {poster ? (
                        <img src={poster} alt="" className="movie-card__img" loading="lazy" />
                    ) : (
                        <div className="movie-card__placeholder">{item.title}</div>
                    )}
                </Link>

                <span className="movie-card__badge">{item.mediaType === 'tv' ? 'Series' : 'Movie'}</span>

                <button type="button" className="movie-card__add" disabled aria-label={`Add ${item.title} to watchlist`}>
                    <PlusIcon size={16}/>
                </button>
            </div>

            <div className="movie-card__info">
                <div className="movie-card__row">
                    <h3 className="movie-card__title">
                        <Link to={to} title={item.title}>
                            {item.title}
                        </Link>
                    </h3>

                    {rating && (
                        <span className="movie-card__rating">
                            <StarIcon size={14} />
                            {rating}
                        </span>
                    )}
                </div>

                {meta && <p className="movie-card__meta">{meta}</p>}
            </div>
        </article>
    );
}

export default MovieCard;

