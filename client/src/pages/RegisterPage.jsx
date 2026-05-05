import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Form, Input, Button, Card, App } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { message } = App.useApp()
  const { isLoggedIn, register } = useAuth()
  const navigate = useNavigate()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  const onFinish = async (values) => {
    try {
      await register(values.username, values.password, values.contact)
      message.success('注册成功')
      navigate('/')
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
        <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>用户注册</h3>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="用户名" className="glass-input" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="密码" className="glass-input" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('两次密码输入不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="确认密码" className="glass-input" />
          </Form.Item>
          <Form.Item name="contact">
            <Input prefix={<PhoneOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="联系方式（选填）" className="glass-input" />
          </Form.Item>
          <Form.Item className="mb-3">
            <Button type="primary" htmlType="submit" block size="large" className="pill-btn">
              注册
            </Button>
          </Form.Item>
          <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            已有账号？<Link to="/login" className="text-blue-500 font-medium">立即登录</Link>
          </div>
        </Form>
      </Card>

      <p className="mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>&copy; 2026 校园失物招领平台</p>
    </div>
  )
}
