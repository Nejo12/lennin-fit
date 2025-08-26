
import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 grid grid-rows-[auto,1fr]">
      <header className="border-b border-neutral-800 px-4 h-14 flex items-center justify-between">
        <div className="font-bold">Lennin</div>
        <nav className="flex gap-4 text-neutral-300">
          <NavLink to="/app" end>Dashboard</NavLink>
          <NavLink to="/app/clients">Clients</NavLink>
          <NavLink to="/app/projects">Projects</NavLink>
          <NavLink to="/app/tasks">Tasks</NavLink>
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="text-neutral-300">Sign out</button>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
