import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ManualMode from './pages/ManualMode';
import { DataProvider } from './components/data/DataContext';
import LandingPage from './pages/LandingPage/LandingPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manualmode" element={<ManualMode />} />
        </Routes>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App