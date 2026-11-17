import './PlaceholderPage.css';

function PlaceholderPage({ title }) {
  return (
    <section className="container placeholder-page">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
    </section>
  );
}

export default PlaceholderPage;