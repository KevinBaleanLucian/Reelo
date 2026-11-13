import { useSearchParams } from "react-router";
import TitleGrid from "../components/TitleGrid.jsx";
import { useGenreMap } from "../hooks/useGenreMap.js";
import { usePagedTitles } from "../hooks/usePagedTitles.js";
import { searchTitles } from "../services/titleApi.js";
import './SearchPage.css';

function SearchResults({term}){
    const genreMap=useGenreMap();
    const list=usePagedTitles(`search:${term}`, (page)=> searchTitles(term,page));

    return (
        <TitleGrid
            items={list.items}
            status={list.status}
            genreMap={genreMap}
            hasMore={list.hasMore}
            loadingMore={list.loadingMore}
            moreFailed={list.moreFailed}
            onLoadMore={list.loadMore}
            onRetry={list.retry}
            emptyMessage={`No results for "${term}". Check the spelling or try a different title`}
        />
    );
}

function SearchPage() {
    const [searchParams] =useSearchParams();
    const term= (searchParams.get('q') ?? '').trim().slice(0,100);

    return (
        <div className="container search-page">
            <header className="search-page__header">
                <p className="eyebrow">Search</p>
                <h1 className="search-page__title">
                    {term ? `Results for "${term}"` : 'Search Reelo'}
                </h1>

            </header>

            {term ? (
                <SearchResults key={term} term={term} />
            ) : (
                <p className="search-page__prompt">
                    Use the search bar at the top to find movies and series
                </p>
            )}
        </div>
    );
}

export default SearchPage;