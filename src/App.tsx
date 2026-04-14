import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import AdminPage from './AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
