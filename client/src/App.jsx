import { Routes, Route } from 'react-router';
import MainLayout from './components/MainLayout.jsx';
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
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/title/:type/:id" element={<TitleDetailsPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  );
}

export default App;