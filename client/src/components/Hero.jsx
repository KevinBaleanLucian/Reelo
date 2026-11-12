import Button from './Button.jsx';
import { PlusIcon,StarIcon } from './Icons.jsx';
import { backdropUrl } from '../utils/images.js';
import { formatGenres,formatRating,formatYear } from '../utils/format.js';
import './Hero.css';

function Hero({item,genreMap}){
    const image=backdropUrl(item.backdropPath);
    const rating=formatRating(item.tmdbRating);
    const year=formatYear(item.releaseDate);
    const genres=formatGenres(item.genreIds,genreMap);
    const isLong=item.title.length>24;

    return (
        <section className="hero" aria-labelledby="hero-title">
            {image && <img src={image} alt="" className="hero__image" />}
            <div className="hero__shade"/>

            <div className="container hero__content">
                <p className="eyebrow">Most popular right now</p>

                <h1 id="hero-title" className={`hero__title ${isLong ? 'hero__title--long' : ''}`.trim()}>
                    {item.title}
                </h1>

                <div className="hero__meta">
                    {rating && (
                        <span className="hero__rating">
                            <StarIcon size={16} />
                            {rating}
                        </span>
                    )}
                    {year && <span>{year}</span>}
                    {genres && <span>{genres}</span>}
                </div>

                {item.overview && <p className="hero__overview">{item.overview}</p>}

                <div className="hero__actions">
                    <Button to={`/title/${item.mediaType}/${item.tmdbId}`}>View details</Button>
                    <Button variant="secondary" disabled>
                        <PlusIcon size={18}/>
                        Add to watchlist

                    </Button>
                </div>
            </div>
        </section>    
        );
}

export default Hero;