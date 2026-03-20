import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AppLayout() {
  const { user, clearAuth } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">📈 Folio</span>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'text-green-400 font-medium' : 'text-gray-400 hover:text-white transition-colors'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? 'text-green-400 font-medium' : 'text-gray-400 hover:text-white transition-colors'
            }
          >
            Transactions
          </NavLink>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{user?.name ?? 'Account'}</span>
          <button
            onClick={clearAuth}
            className="text-gray-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}