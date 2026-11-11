import { Link } from 'react-router';
import Card from '../components/Card.jsx';

function HomePage() {
  return (
    <div
      className="container"
      style={{ paddingBlock: 'var(--space-7)', display: 'grid', gap: 'var(--space-5)', maxWidth: 560 }}
    >
      <Card as="article">
        <p style={{ fontWeight: 500 }}>The Last Horizon</p>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
          The kind of science fiction that remembers to be human.
        </p>
      </Card>

      <Card padding="lg">
        <p className="eyebrow">The person behind the picks</p>
        <h2 style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-3)' }}>About Kevin</h2>
      </Card>

      <Card as={Link} to="/profile/oliverk" interactive>
        <p style={{ fontWeight: 500 }}>Oliver Kim</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          12 films in common
        </p>
      </Card>

      <Card padding="none">
        <div style={{ background: 'var(--color-field)', height: 80 }} />
        <p style={{ padding: 'var(--space-4)' }}>A card without padding</p>
      </Card>
    </div>
  );
}

export default HomePage;