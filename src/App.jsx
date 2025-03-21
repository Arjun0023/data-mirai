import { Routes, Route } from 'react-router-dom'
import Root from './Root'
import Home from './Home'
import Dashboard from './Dashboard'
import ManualMode from './ManualMode'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/manualmode" element={<ManualMode />} />
    </Routes>
  )
}

export default App