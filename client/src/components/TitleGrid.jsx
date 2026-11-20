import Button from "./Button.jsx";
import MovieCard from "./MovieCard.jsx";
import MovieCardSkeleton from "./MovieCardSkeleton.jsx";
import { useGridColumns } from "../hooks/useGridColumns.js";
import { Fragment } from "react";
import './TitleGrid.css';

function TitleGrid({items,status,genreMap,hasMore,loadingMore,moreFailed,onLoadMore,onRetry,emptyMessage = 'Nothing to show yet',renderItem}) {
    const columns=useGridColumns();
    if (status ==='error') {
        return (
            <div className="title-grid__message" role="alert">
                <p>We couldn't load these titles</p>
                <Button variant="secondary" onClick={onRetry}>
                    Try Again
                </Button>
            </div>
        );
    }

    if(status==='loading'){
        return (
            <div className="title-grid__list" aria-busy="true">
                {Array.from({length:columns*2}, (_,i) => (
                    <MovieCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if(items.length===0){
        return <p className="title-grid__message">{emptyMessage}</p>
    }

    return (
        <div className="title-grid">
            <div className="title-grid__list">
                {items.map((item) => {
                    const key= `${item.mediaType}-${item.tmdbId}`;

                    return renderItem ? (
                        <Fragment key={key}>{renderItem(item)}</Fragment>
                    ) : (
                        <MovieCard key={key} item={item} genreMap={genreMap} />
                    );
                })}

                {loadingMore &&
                    Array.from({length: columns}, (_,i) => <MovieCardSkeleton key={`more-${i}`} />)}
            </div>

            <p className="visually-hidden" role="status" aria-live="polite">
                {items.length} titles shown
            </p>

            <div className="title-grid__footer">
                {moreFailed && (
                    <p className="title-grid__error" role="alert">
                        We couldn't load more titles.
                    </p>
                )}

                {hasMore ? (
                    <Button
                        variant="secondary"
                        onClick={onLoadMore}
                        aria-disabled={loadingMore}
                    >
                        {loadingMore ? 'Loading....' : moreFailed ? 'Try again' : 'Load more'}
                    </Button>
                ) : (
                    <p className="title-grid__end">You've reached the end</p>
                )}
            </div>
        </div>
    );
}

export default TitleGrid;