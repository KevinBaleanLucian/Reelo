import { useParams } from 'react-router';
import Button from '../components/Button.jsx';
import TitleHero from '../components/TitleHero.jsx';
import TitleHeroSkeleton from '../components/TitleHeroSkeleton.jsx';
import { useTitleDetails } from '../hooks/useTitleDetails.js';
import { useTitleExtras } from '../hooks/useTitleExtras.js';
import TitleInfo from '../components/TitleInfo.jsx';
import Trailer from '../components/Trailer.jsx';
import SimilarTitles from '../components/SimilarTitles.jsx';
import {useGenreMap} from '../hooks/useGenreMap.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatYear } from '../utils/format.js';
import './TitleDetailsPage.css';

function PageMessage({ heading, text, children }) {
  return (
    <section className="container title-page__message">
      <h1>{heading}</h1>
      <p>{text}</p>
      <div className="title-page__actions">{children}</div>
    </section>
  );
}

function scrollToTrailer() {
  const section = document.getElementById('trailer');
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

  const target = section.querySelector('button, iframe') ?? section;
  target.focus({ preventScroll: true });
}

function TitleDetailsPage() {
  const { type, id } = useParams();
  const details = useTitleDetails(type, id);
  const extras = useTitleExtras(type, id);
  const genreMap=useGenreMap();

  let pageTitle = 'Loading…';
  if (details.status === 'ready') {
    const year = formatYear(details.title.releaseDate);
    pageTitle = year ? `${details.title.title} (${year})` : details.title.title;
  } else if (details.status === 'not-found') {
    pageTitle = 'Title not found';
  } else if (details.status === 'error') {
    pageTitle = 'Something went wrong';
  }

  useDocumentTitle(pageTitle);

  if (details.status === 'loading') {
    return <TitleHeroSkeleton />;
  }

  if (details.status === 'not-found') {
    return (
      <PageMessage
        heading="We couldn’t find this title"
        text="It may have been removed, or the link may be wrong."
      >
        <Button to="/">Back to discover</Button>
      </PageMessage>
    );
  }

  if (details.status === 'error') {
    return (
      <PageMessage heading="Something went wrong" text="We couldn’t load this title right now.">
        <Button onClick={details.retry}>Try again</Button>
        <Button to="/" variant="secondary">
          Back to discover
        </Button>
      </PageMessage>
    );
  }

  return (
    <>
      <TitleHero
        title={details.title}
        tagline={extras.data?.tagline}
        certification={extras.data?.certification}
        onWatchTrailer={extras.data?.trailer ? scrollToTrailer : undefined}
      />

      <div className="container title-page__sections">
        <TitleInfo extras={extras} />

        {extras.data?.trailer && (
          <Trailer key={`${type}-${id}`} trailer={extras.data.trailer} title={details.title.title} backdropPath={details.title.backdropPath} />
        )}

        <SimilarTitles key={`${type}-${id}`} title={details.title} status={extras.status} items={extras.data?.similar} genreMap={genreMap} />
      </div>
    </>
  );
}

export default TitleDetailsPage;