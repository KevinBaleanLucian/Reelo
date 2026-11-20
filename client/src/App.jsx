import { Routes, Route, useLocation } from 'react-router';
import AuthDrawer from './components/AuthDrawer.jsx';
import MainLayout from './components/MainLayout.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import TitleDetailsPage from './pages/TitleDetailsPage.jsx';
import WatchlistPage from './pages/WatchlistPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';

const AUTH_PATHS = ['/login', '/signup'];
const HOME = { pathname: '/', search: '', hash: '' };

function App() {
  const location = useLocation();
  const onAuthPage = AUTH_PATHS.includes(location.pathname);

  const stored = location.state?.background;
  const background = onAuthPage ? stored && !AUTH_PATHS.includes(stored.pathname)
      ? stored
      : HOME
    : location;

  return (
    <>
      <Routes location={background}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<BrowsePage key="movie" type="movie" />} />
          <Route path="/series" element={<BrowsePage key="tv" type="tv" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/title/:type/:id" element={<TitleDetailsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />

          <Route element={<RequireAuth />}>
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      {onAuthPage && <AuthDrawer />}
    </>
  );
}

export default App;