import Button from './Button.jsx';
import Card from './Card.jsx';
import CastCrew from './CastCrew.jsx';
import WhereToWatch from './WhereToWatch.jsx';
import './MovieCard.css';
import './TitleInfo.css';

function PeopleSkeleton() {
  return (
    <div className="cast-crew__list" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="cast-crew__person">
          <div className="skeleton cast-crew__photo" />
          <div className="skeleton skeleton--line" style={{ width: '80%' }} />
          <div className="skeleton skeleton--line" style={{ width: '55%' }} />
        </div>
      ))}
    </div>
  );
}

function ProvidersSkeleton() {
  return (
    <div className="where-to-watch" aria-hidden="true">
      <div className="skeleton skeleton--line" style={{ width: '40%' }} />
      <div className="skeleton skeleton--line" style={{ width: '100%', height: '2.5rem' }} />
      <div className="skeleton skeleton--line" style={{ width: '70%' }} />
    </div>
  );
}

function TitleInfo({ extras }) {
  if (extras.status === 'error') {
    return (
      <Card as="section" padding="lg" className="title-info title-info--message" role="alert">
        <p>We couldn’t load the cast and availability for this title.</p>
        <Button variant="secondary" onClick={extras.retry}>
          Try again
        </Button>
      </Card>
    );
  }

  const loading = extras.status === 'loading';

  return (
    <Card as="section" padding="lg" className="title-info" aria-busy={loading}>
      {loading && (
        <p className="visually-hidden" role="status">
          Loading cast and availability…
        </p>
      )}

      <div className="title-info__column">
        <div className="title-info__head">
          <h2 className="eyebrow title-info__heading">Cast &amp; crew</h2>
          <p className="title-info__hint">The people behind the story</p>
        </div>

        {loading ? (
          <PeopleSkeleton />
        ) : (
          <CastCrew crew={extras.data.crew} cast={extras.data.cast} />
        )}
      </div>

      <div className="title-info__column title-info__column--aside">
        <h2 className="eyebrow title-info__heading">Where to watch</h2>

        {loading ? <ProvidersSkeleton /> : <WhereToWatch watch={extras.data.watch} />}
      </div>
    </Card>
  );
}

export default TitleInfo;