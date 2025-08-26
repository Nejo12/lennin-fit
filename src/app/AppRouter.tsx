import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { useInitUser } from '../lib/initUser'
import Landing from '../landing/Landing'
import Login from './auth/Login'
import Verify from './auth/Verify'
import AppShell from './layout/AppShell'
import DashboardPage from './dashboard/DashboardPage'
import ClientsPage from './clients/ClientsPage'
import ProjectsPage from './projects/ProjectsPage'
import TasksPage from './tasks/TasksPage'
import Privacy from '../pages/Privacy'
import Terms from '../pages/Terms'
import Success from '../pages/Success'

function Protected() {
  const { user, loading } = useAuth()
  useInitUser()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #10b981', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading your account...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/verify', element: <Verify /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '/terms', element: <Terms /> },
  { path: '/success', element: <Success /> },
  {
    path: '/app', element: <Protected />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'clients', element: <ClientsPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'tasks', element: <TasksPage /> },
        ]
      }
    ]
  }
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
