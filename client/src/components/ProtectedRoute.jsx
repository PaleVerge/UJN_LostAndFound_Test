import { Navigate, useLocation } from 'react-router-dom'
import { Spin, App } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoggedIn, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <RedirectWithMessage to="/login" state={{ from: location }} msg="请先登录" />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <RedirectWithMessage to="/" msg="你没有权限" />
  }

  return children
}

function RedirectWithMessage({ to, state, msg }) {
  const { message } = App.useApp()
  useEffect(() => {
    message.warning(msg)
  }, [msg, message])

  return <Navigate to={to} state={state} replace />
}
