import Breadcrumb from "./Breadcrumb.jsx";
import Button from "./Button.jsx";
import { PlayIcon,StarIcon } from "./Icons.jsx";
import { backdropUrl } from "../utils/images.js";
import { formatGenreNames,formatRating,formatRuntime,formatSeasons,formatYear } from "../utils/format.js";
import WatchlistButton from "./WatchlistButton.jsx";
import './TitleHero.css';

function TitleHero({title,tagline,certification,onWatchTrailer}) {
    const isMovie=title.mediaType==='movie';
    const image=backdropUrl(title.backdropPath);
    const rating=formatRating(title.tmdbRating);
    const length=isMovie ? formatRuntime(title.runtime) : formatSeasons(title.numberOfSeasons);
    const facts= [formatYear(title.releaseDate), formatGenreNames(title.genres), length].filter(Boolean);
    const isLong=title.title.length>24;

    const crumbs=[
        {label: 'Discover', to: '/'},
        {label: isMovie ? 'Movies' : 'Series', to: isMovie ? '/movies': '/series'},
        {label: title.title},
    ];

    return (
        <section className="title-hero" aria-labelledby="title-hero-heading">
            {image && <img src={image} alt="" className="title-hero__image" />}
            <div className="title-hero__shade"/>

            <div className="container title-hero__inner">
                <Breadcrumb items={crumbs} />
                <div className="title-hero__bottom">
                    <div className="title-hero_body">
                        <p className="eyebrow title-hero__eyebrow">{isMovie ? 'Movie' : 'Series'}</p>

                        <h1 id="title-hero-heading" className={`title-hero__title ${isLong ? 'title-hero__title--long' : ''}`.trim()}>
                            {title.title}
                        </h1>

                        {(facts.length > 0 || certification) && (
                            <div className="title-hero__meta">
                                <div className="title-hero__facts">
                                    {facts.map((fact) => (
                                        <span key={fact}>{fact}</span>
                                    ))}
                                </div>

                                {certification && (
                                    <span className="title-hero__cert">
                                        <span className="visually-hidden">Age rating</span>
                                        {certification}
                                    </span>
                                )}
                            </div>
                        )}

                        {title.overview && <p className="title-hero__overview">{title.overview}</p>}

                        {rating && (
                            <div className="title-hero__rating">
                                <p className="title-hero__label">TMDB rating</p>
                                <p className="title-hero__score">
                                    <StarIcon size={18} />
                                    {rating}
                                    <span className="title-hero__score-max">/ 10</span>
                                </p>
                            </div>

                        )}

                        <div className="title-hero__actions">
                            <WatchlistButton
                                item={title}
                                variant="full"
                                className="btn btn--primary"
                                activeClassName="title-hero__watchlist--active"
                            />

                            {onWatchTrailer && (
                                <Button variant="secondary" onClick={onWatchTrailer}>
                                    <PlayIcon size={18} />
                                    Watch trailer
                                </Button>
                            )}
                        </div>
                    </div>

                    {tagline && <p className="title-hero__tagline">{tagline}</p>}
                </div>
            </div>
        </section>
    );
}

export default TitleHero;