import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Avatar, Dropdown, Input } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCallback } from 'react'

export default function NavBar() {
  const { isLoggedIn, user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const showSearch = location.pathname === '/'

  const handleSearch = useCallback((value) => {
    window.dispatchEvent(new CustomEvent('search:change', { detail: value }))
  }, [])

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/user') },
      ...(user?.role === 'admin'
        ? [{ key: 'admin', icon: <UserOutlined />, label: '管理后台', onClick: () => navigate('/admin') }]
        : []),
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => { logout(); navigate('/login') } },
    ],
  }

  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white no-underline">
            <img src="/logo.png" alt="logo" className="w-7 h-7 object-contain" />
            <span>失物招领</span>
          </Link>
          {location.pathname !== '/' && (
            <Button icon={<SearchOutlined />} onClick={() => navigate('/')} size="small" className="pill-btn text-white border-white/30">
              大厅
            </Button>
          )}
        </div>

        {showSearch && (
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="搜索物品名称、地点..."
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/post?type=lost')} className="pill-btn">
                我要挂失
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => navigate('/post?type=found')} className="pill-btn">
                我发现了
              </Button>
              <Dropdown menu={userMenu} placement="bottomRight">
                <Avatar
                  size="small"
                  src={user?.avatar || undefined}
                  icon={!user?.avatar && <UserOutlined />}
                  className="cursor-pointer bg-blue-400 ml-1"
                />
              </Dropdown>
            </>
          ) : (
            <>
              <Button type="primary" onClick={() => navigate('/login')} className="pill-btn">
                登录
              </Button>
              <Button onClick={() => navigate('/register')} className="pill-btn">
                注册
              </Button>
            </>
          )}
          <button className="theme-toggle ml-1" onClick={toggleTheme} title={isDark ? '切换日间模式' : '切换暗黑模式'}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
