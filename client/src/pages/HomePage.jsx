import { useState } from 'react';
import Button from '../components/Button.jsx';
import FilterTabs from '../components/FilterTabs.jsx';
import Hero from '../components/Hero.jsx';
import HeroSkeleton from '../components/HeroSkeleton.jsx';
import TitleRow from '../components/TitleRow.jsx';
import { ArrowUpRightIcon } from '../components/Icons.jsx';
import { useGenreMap } from '../hooks/useGenreMap.js';
import { useTitleList } from '../hooks/useTitleList.js';
import './HomePage.css';

const typeOptions = [
  { value: 'all', label: 'All titles' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'Series' },
];

function HomePage() {
  const [trendingType, setTrendingType] = useState('all');
  const genreMap = useGenreMap();
  const popular = useTitleList('popular', 'movie', 20);

  const featured =
    popular.items.find((movie) => movie.backdropPath && movie.overview) || popular.items[0];

  return (
    <>
      {popular.status === 'loading' && <HeroSkeleton />}

      {popular.status === 'error' && (
        <section className="container home__hero-error" role="alert">
          <p>We couldn’t load today’s featured film.</p>
          <Button variant="secondary" onClick={popular.retry}>
            Try again
          </Button>
        </section>
      )}

      {popular.status === 'ready' && featured && <Hero item={featured} genreMap={genreMap} />}

      <div className="container home__sections">
        <TitleRow
          eyebrow="Trending this week"
          title="Worth the hype."
          linkTo="/movies"
          linkLabel="Explore all titles"
          source="trending"
          type={trendingType}
          genreMap={genreMap}
          filters={
            <FilterTabs
              label="Filter trending titles"
              options={typeOptions}
              value={trendingType}
              onChange={setTrendingType}
            />
          }
        />

        <TitleRow
          eyebrow="One more episode"
          title="Get lost in a great series."
          linkTo="/series"
          linkLabel="Explore all series"
          source="top-rated"
          type="tv"
          variant="wide"
          genreMap={genreMap}
        />

        <section className="home__cta">
          <div>
            <h2 className="home__cta-title">Good taste deserves a home.</h2>
            <p className="home__cta-text">
              Save your discoveries. Build your watchlist. Find your next favorite.
            </p>
          </div>

          <div className="home__cta-action">
            <p className="home__cta-note">For the love of cinema. Always free.</p>
            <Button to="/signup">
              <ArrowUpRightIcon size={18} />
              Join Reelo
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

export default HomePage;