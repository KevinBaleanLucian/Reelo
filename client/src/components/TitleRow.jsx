import { useId } from 'react';
import { Link } from 'react-router';
import Button from './Button.jsx';
import MovieCard from './MovieCard.jsx';
import MovieCardSkeleton from './MovieCardSkeleton.jsx';
import { ArrowUpRightIcon } from './Icons.jsx';
import { useTitleList } from '../hooks/useTitleList.js';
import './TitleRow.css';

function TitleRow({eyebrow,title,linkTo,linkLabel,source,type,limit=5,variant='poster',genreMap,filters,}){
    const headingId=useId();
    const {items,status,retry}=useTitleList(source,type,limit);
    const columns=variant ==='wide' ? 3:5;

    return (
        <section className="title-row" aria-label={headingId}>
            <div className="title-row__header">
                <div>
                    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                    <h2 id={headingId} className="title-row__title">
                        {title}
                    </h2>
                </div>

                {linkTo && (
                    <Link to={linkTo} className="title-row__link">
                        {linkLabel}
                        <ArrowUpRightIcon size={16} />
                    </Link>
                )}
            </div>

            {filters}

            {status==='error' ? (
                <div className="title-row__message" role="alert">
                    <p>We couldn't load these titles</p>
                    <Button variant="secondary" onClick={retry}>
                        Try again
                    </Button>
                </div>
            ) : status ==='ready' && items.length===0 ? (
                <p className="title-row__message">Nothing to show yet</p>
            ) : (
                <div className="title-row__grid" style={{ '--columns':columns}} aria-busy={status ==='loading'}>
                    {status==='loading'
                    ? Array.from({length:limit}, (_,i) => <MovieCardSkeleton key={i} variant={variant} />)
                    : items.map((item) => (
                        <MovieCard key={`${item.mediaType}-${item.tmdbId}`}
                            item={item} genreMap={genreMap} variant={variant} 
                            />
                    ))}
                </div>
            )}
        </section>
    );
}

export default TitleRow;