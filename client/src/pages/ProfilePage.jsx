import { useParams } from 'react-router';
import PlaceholderPage from './PlaceholderPage.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function ProfilePage() {
  const { username } = useParams();
  useDocumentTitle(`@${username}`);

  return <PlaceholderPage title={`@${username}`} />;
}

export default ProfilePage;