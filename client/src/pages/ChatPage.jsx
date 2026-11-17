import PlaceholderPage from './PlaceholderPage.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function ChatPage() {
  useDocumentTitle('Messages');

  return <PlaceholderPage title="Messages" />;
}

export default ChatPage;