import Button from '../components/Button.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './PlaceholderPage.css';

function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <section className="container placeholder-page">
      <p className="eyebrow">Error 404</p>
      <h1>This page doesn't exist</h1>
      <p>The link may be wrong, or the page may have moved.</p>
      <div className="placeholder-page__actions">
        <Button to="/">Back to discover</Button>
      </div>
    </section>
  );
}

export default NotFoundPage;