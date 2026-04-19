import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Schedule from './pages/Schedule'
import BookSeat from './pages/BookSeat'
import MyBookings from './pages/MyBookings'
import Admin from './pages/Admin'

function App() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-900 font-sans">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected layout with Navbar */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Navbar />
              <div className="max-w-4xl mx-auto p-6 md:p-8">
                <Routes>
                  <Route path="/" element={<Schedule />} />
                  <Route path="/book/:slotId" element={<BookSeat />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  
                  {/* Admin Only Route */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute adminOnly>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App
