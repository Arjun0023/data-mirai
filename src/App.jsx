import { Routes, Route } from 'react-router-dom'
import Root from './Root'
import Home from './Home'
import Dashboard from './Dashboard'
import ManualMode from './ManualMode'
import { DataProvider } from './DataContext'
import Ask from './Ask'

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