import { Routes, Route,Link } from "react-router";
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import TitleDetailsPage from './pages/TitleDetailsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WatchlistPage from './pages/WatchlistPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';


function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/signup">Sign Up</Link> |{' '}
        <Link to="/title/tv/1396">Breaking Bad</Link> |{' '}
        <Link to="/profile/kevin.b">Profile</Link> |{' '}
        <Link to="/watchlist">Watchlist</Link> |{' '}
        <Link to="/chat">Chat</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/title/:type/:id" element={<TitleDetailsPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App
