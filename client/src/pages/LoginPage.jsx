import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Form, Input, Button, Card, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { message } = App.useApp()
  const { isLoggedIn, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  const onFinish = async (values) => {
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate(location.state?.from || '/')
    } catch {
      // error handled by interceptor
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{
        background: 'url(/backUjnImg.jpg) center / cover no-repeat',
      }}
    >
      <Link to="/" className="mb-8 flex flex-col items-center gap-2 no-underline">
        <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 p-1.5">
          <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>校园失物招领</span>
      </Link>

      <Card
        className="w-full max-w-sm glass-card"
        styles={{ body: { padding: '32px', background: 'transparent' } }}
      >
        <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>用户登录</h3>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="用户名" className="glass-input" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="密码" className="glass-input" />
          </Form.Item>
          <Form.Item className="mb-3">
            <Button type="primary" htmlType="submit" block size="large" className="pill-btn">
              登录
            </Button>
          </Form.Item>
          <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            还没有账号？<Link to="/register" className="text-blue-500 font-medium">立即注册</Link>
          </div>
        </Form>
      </Card>

      <p className="mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>&copy; 2026 校园失物招领平台</p>
    </div>
  )
}
