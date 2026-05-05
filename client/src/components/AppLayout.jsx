import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function AppLayout() {
  return (
    <div className="min-h-screen relative">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
