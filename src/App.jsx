import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import JourneyPage from './pages/JourneyPage.jsx';
import OperatorPage from './pages/OperatorPage.jsx';
import DataPage from './pages/DataPage.jsx';

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<JourneyPage />} />
          <Route path="/operator" element={<OperatorPage />} />
          <Route path="/data" element={<DataPage />} />
        </Routes>
      </main>
      <Footer />
    </HashRouter>
  );
}
