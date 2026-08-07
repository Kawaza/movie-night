import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import Layout from './components/Layout';
import WheelPage from './pages/WheelPage';
import RatingsPage from './pages/RatingsPage';
import RankingsPage from './pages/RankingsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <MovieProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<WheelPage />} />
            <Route path="ratings" element={<RatingsPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MovieProvider>
  );
}
