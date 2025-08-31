import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import History from './pages/History'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Dashboard />} />
          <Route path='/generator' element={<Generator />} />
          <Route path='/history' element={<History />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App