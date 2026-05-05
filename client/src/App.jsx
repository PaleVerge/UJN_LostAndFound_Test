import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, Result, Button, App as AntdApp, theme as antTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PostPage from './pages/PostPage'
import UserCenterPage from './pages/UserCenterPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center py-20">
      <Result
        status="404"
        title="404"
        subTitle="页面不存在"
        extra={<Button type="primary" onClick={() => navigate('/')} className="pill-btn">返回大厅</Button>}
      />
    </div>
  )
}

function ThemedApp() {
  const { isDark } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#3B82F6',
          borderRadius: 24,
          fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
          colorBgContainer: isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.55)',
        },
        components: {
          Button: {
            borderRadius: 999,
            controlHeight: 36,
            paddingContentHorizontal: 20,
          },
        },
      }}
    >
      <AntdApp>
        <div className="mesh-bg" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Auth pages without NavBar */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Pages with NavBar */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/post"
                  element={
                    <ProtectedRoute>
                      <PostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/:id"
                  element={
                    <ProtectedRoute>
                      <PostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user"
                  element={
                    <ProtectedRoute>
                      <UserCenterPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}

export default App
