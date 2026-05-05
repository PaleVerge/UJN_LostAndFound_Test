import { useState, useEffect } from 'react'
import { Tabs, Form, Input, Button, Upload, Card, List, Tag, Modal, App, Avatar, Spin, Empty, Popconfirm } from 'antd'
import { UserOutlined, EditOutlined, DeleteOutlined, CheckOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../api/user'
import { getMyItems, deleteItem, toggleItemStatus } from '../api/items'
import { useNavigate } from 'react-router-dom'

export default function UserCenterPage() {
  const { message } = App.useApp()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [myItems, setMyItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(true)

  useEffect(() => {
    getMyItems({ limit: 50 }).then((res) => {
      setMyItems(res.data.list)
    }).finally(() => setItemsLoading(false))
  }, [])

  const handleProfileSave = async (values) => {
    setSaving(true)
    try {
      const formData = new FormData()
      if (values.contact !== undefined) formData.append('contact', values.contact)
      if (values.oldPassword && values.newPassword) {
        formData.append('oldPassword', values.oldPassword)
        formData.append('newPassword', values.newPassword)
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      const res = await updateProfile(formData)
      updateUser(res.data)
      setAvatarFile(null)
      message.success('资料更新成功')
      passwordForm.resetFields()
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (itemId) => {
    try {
      await deleteItem(itemId)
      setMyItems((prev) => prev.filter((i) => i.id !== itemId))
      message.success('已删除')
    } catch {
      // handled
    }
  }

  const handleToggleStatus = async (itemId) => {
    try {
      const res = await toggleItemStatus(itemId)
      setMyItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: res.data.status } : i))
      )
      message.success(res.msg)
    } catch {
      // handled
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: '个人资料',
      children: (
        <Card className="max-w-md glass-card" styles={{ background: 'var(--card-bg)', border: '2px solid var(--card-border)' }}>
          <Form form={profileForm} layout="vertical" onFinish={handleProfileSave}
            initialValues={{ contact: user?.contact || '' }}>
            <Form.Item label="头像">
              <div className="flex items-center gap-4">
                <Upload
                  listType="picture-circle"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setAvatarFile(file)
                    return false
                  }}
                >
                  <div className="relative">
                    {avatarFile ? (
                      <Avatar size={72} src={URL.createObjectURL(avatarFile)} />
                    ) : (
                      <Avatar size={72} src={user?.avatar || undefined} icon={!user?.avatar && <UserOutlined />} />
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      +
                    </div>
                  </div>
                </Upload>
                <span className="text-xs text-gray-400">点击头像更换<br/>支持 JPG/PNG</span>
              </div>
            </Form.Item>
            <Form.Item label="用户名">
              <Input value={user?.username} disabled className="text-gray-500" />
            </Form.Item>
            <Form.Item name="contact" label="联系方式">
              <Input placeholder="手机号/微信" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} size="large" className="pill-btn">保存资料</Button>
            </Form.Item>
          </Form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-4">修改密码</h4>
            <Form form={passwordForm} layout="vertical" onFinish={handleProfileSave}>
              <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="旧密码" />
              </Form.Item>
              <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="新密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saving} className="pill-btn">修改密码</Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      ),
    },
    {
      key: 'myItems',
      label: '我的发布',
      children: (
        <div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm text-gray-500">共 {myItems.length} 条发布</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/post')} className="pill-btn">发布新帖子</Button>
          </div>
          {itemsLoading ? (
            <div className="text-center py-12"><Spin size="large" /></div>
          ) : myItems.length === 0 ? (
            <Empty description="暂无发布" />
          ) : (
            <List
              dataSource={myItems}
              className="glass-card overflow-hidden"
              renderItem={(item) => (
                <List.Item
                  className="!px-5 !py-4 hover:bg-gray-50 transition-colors"
                  actions={[
                    <Button key="edit" icon={<EditOutlined />} size="small" onClick={() => navigate(`/post/${item.id}`)}>
                      编辑
                    </Button>,
                    <Popconfirm key="delete" title="确认删除？" onConfirm={() => handleDelete(item.id)}>
                      <Button danger icon={<DeleteOutlined />} size="small">删除</Button>
                    </Popconfirm>,
                    <Button
                      key="status"
                      type={item.status === 0 ? 'primary' : 'default'}
                      icon={<CheckOutlined />}
                      size="small"
                      onClick={() => handleToggleStatus(item.id)}
                    >
                      {item.status === 0 ? '标记已解决' : '重新公开'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span className="font-medium">
                        {item.title}
                        <span className={`ml-2 ${item.status === 1 ? 'tag-closed' : (item.type === 'found' ? 'tag-found' : 'tag-lost')}`}>
                          {item.status === 1 ? '已结案' : (item.type === 'found' ? '招领' : '寻物')}
                        </span>
                      </span>
                    }
                    description={[
                      item.location && <span key="loc" className="mr-3">📍 {item.location}</span>,
                      item.create_time && <span key="time">🕐 {new Date(item.create_time).toLocaleDateString('zh-CN')}</span>,
                    ].filter(Boolean)}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <UserOutlined className="text-blue-500 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">个人中心</h2>
          <p className="text-xs text-gray-400">{user?.username} · {user?.role === 'admin' ? '管理员' : '普通用户'}</p>
        </div>
      </div>
      <Tabs
        items={tabItems}
        className="[&_.ant-tabs-tab]:!text-sm [&_.ant-tabs-tab]:!font-medium"
      />
    </div>
  )
}
