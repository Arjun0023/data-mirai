import { Routes, Route } from 'react-router-dom'
import Root from './pages/Root'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ManualMode from './pages/ManualMode'
import { DataProvider } from './components/data/DataContext'
import Ask from './pages/Ask'

function App() {
  return (
    <DataProvider>
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/manualmode" element={<ManualMode />} />
      <Route path="/ask" element={<Ask />} />
    </Routes>
    </DataProvider>
  )
}

export default App