import { Routes, Route } from 'react-router-dom'
import Root from './Root'
import Home from './Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App