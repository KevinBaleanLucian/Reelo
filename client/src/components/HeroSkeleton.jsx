import './Hero.css';
import './MovieCard.css';

function HeroSkeleton() {
  return (
    <section className="hero" aria-hidden="true">
      <div className="container hero__content">
        <div className="skeleton skeleton--line" style={{ width: '9rem' }} />
        <div className="skeleton skeleton--line" style={{ width: '26rem', height: '3.5rem' }} />
        <div className="skeleton skeleton--line" style={{ width: '14rem' }} />
        <div className="skeleton skeleton--line" style={{ width: '30rem', height: '4.5rem' }} />
        <div className="hero__actions">
          <div className="skeleton skeleton--line" style={{ width: '8rem', height: '2.75rem' }} />
          <div className="skeleton skeleton--line" style={{ width: '11rem', height: '2.75rem' }} />
        </div>
      </div>
    </section>
  );
}

export default HeroSkeleton;