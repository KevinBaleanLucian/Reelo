import './TitleHero.css';
import './MovieCard.css';

function TitleHeroSkeleton() {
  return (
    <section className="title-hero" aria-busy="true">
      <p className="visually-hidden" role="status">
        Loading title…
      </p>

      <div className="container title-hero__inner" aria-hidden="true">
        <div className="skeleton skeleton--line" style={{ width: '16rem' }} />

        <div className="title-hero__bottom">
          <div className="title-hero__body" style={{ width: '100%' }}>
            <div className="skeleton skeleton--line" style={{ width: '6rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '28rem', height: '4rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '16rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '32rem', height: '5rem' }} />
            <div className="skeleton skeleton--line" style={{ width: '5rem', height: '2.5rem' }} />
            <div className="title-hero__actions">
              <div className="skeleton skeleton--line" style={{ width: '11rem', height: '2.75rem' }} />
              <div className="skeleton skeleton--line" style={{ width: '9rem', height: '2.75rem' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TitleHeroSkeleton;