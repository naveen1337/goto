import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MappingsEditor from './pages/MappingsEditor'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mappings" element={<MappingsEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
