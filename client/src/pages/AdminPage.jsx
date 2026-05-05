import { useState, useEffect } from 'react'
import {
  Tabs, Table, Button, Tag, Popconfirm, App, Input, Space, Modal, Form, Select, Upload,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import {
  getAdminItems, adminCreateItem, adminUpdateItem, adminDeleteItem,
  getAdminUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
} from '../api/admin'

const { Option } = Select

export default function AdminPage() {
  const { message } = App.useApp()
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [itemKeyword, setItemKeyword] = useState('')
  const [userKeyword, setUserKeyword] = useState('')

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemFileList, setItemFileList] = useState([])
  const [itemForm] = Form.useForm()

  // User modal state
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm] = Form.useForm()

  // ======== Data fetching ========
  const fetchItems = async (kw = '') => {
    setItemsLoading(true)
    try {
      const res = await getAdminItems({ limit: 50, keyword: kw })
      setItems(res.data.list)
    } finally {
      setItemsLoading(false)
    }
  }

  const fetchUsers = async (kw = '') => {
    setUsersLoading(true)
    try {
      const res = await getAdminUsers({ limit: 50, keyword: kw })
      setUsers(res.data.list)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])
  useEffect(() => { fetchUsers() }, [])

  // ======== Item CRUD ========
  const openCreateItem = () => {
    setEditingItem(null)
    itemForm.resetFields()
    setItemFileList([])
    setItemModalOpen(true)
  }

  const openEditItem = (record) => {
    setEditingItem(record)
    itemForm.setFieldsValue({
      title: record.title,
      type: record.type,
      category: record.category,
      description: record.description,
      location: record.location,
      status: record.status,
    })
    setItemFileList(record.image_url ? [{ uid: '-1', name: 'current', status: 'done', url: record.image_url }] : [])
    setItemModalOpen(true)
  }

  const handleItemSubmit = async () => {
    try {
      const values = await itemForm.validateFields()
      const fd = new FormData()
      fd.append('title', values.title)
      fd.append('type', values.type)
      fd.append('category', values.category)
      fd.append('description', values.description || '')
      fd.append('location', values.location || '')
      if (values.status !== undefined) fd.append('status', values.status)
      if (itemFileList.length > 0 && itemFileList[0] instanceof File) {
        fd.append('image', itemFileList[0])
      }

      if (editingItem) {
        await adminUpdateItem(editingItem.id, fd)
        message.success('更新成功')
      } else {
        await adminCreateItem(fd)
        message.success('创建成功')
      }
      setItemModalOpen(false)
      fetchItems(itemKeyword)
    } catch {
      // handled by interceptor or validation
    }
  }

  const handleDeleteItem = async (id) => {
    await adminDeleteItem(id)
    message.success('已删除')
    fetchItems(itemKeyword)
  }

  // ======== User CRUD ========
  const openCreateUser = () => {
    setEditingUser(null)
    userForm.resetFields()
    setUserModalOpen(true)
  }

  const openEditUser = (record) => {
    setEditingUser(record)
    userForm.setFieldsValue({
      username: record.username,
      contact: record.contact,
      role: record.role,
      status: record.status,
      password: '',
    })
    setUserModalOpen(true)
  }

  const handleUserSubmit = async () => {
    try {
      const values = await userForm.validateFields()
      const data = {
        username: values.username,
        contact: values.contact || '',
        role: values.role,
        status: values.status,
      }
      if (values.password) {
        data.password = values.password
      }

      if (editingUser) {
        await adminUpdateUser(editingUser.id, data)
        message.success('更新成功')
      } else {
        await adminCreateUser(data)
        message.success('创建成功')
      }
      setUserModalOpen(false)
      fetchUsers(userKeyword)
    } catch {
      // handled
    }
  }

  const handleDeleteUser = async (id) => {
    await adminDeleteUser(id)
    message.success('已删除')
    fetchUsers(userKeyword)
  }

  // ======== Table columns ========
  const itemColumns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '类型', dataIndex: 'type', width: 70,
      render: (v) => <Tag color={v === 'found' ? 'green' : 'blue'}>{v === 'found' ? '招领' : '寻物'}</Tag>,
    },
    { title: '分类', dataIndex: 'category', width: 80 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v) => <Tag color={v === 1 ? 'default' : 'green'}>{v === 1 ? '已结案' : '展示中'}</Tag>,
    },
    {
      title: '发布者', width: 80,
      render: (_, r) => r.User?.username || '-',
    },
    {
      title: '创建时间', dataIndex: 'create_time', width: 110,
      render: (v) => v ? new Date(v).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作', width: 180, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditItem(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteItem(record.id)}>
            <Button danger icon={<DeleteOutlined />} size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const userColumns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '用户名', dataIndex: 'username' },
    { title: '联系方式', dataIndex: 'contact', ellipsis: true },
    {
      title: '角色', dataIndex: 'role', width: 80,
      render: (v) => <Tag color={v === 'admin' ? 'red' : 'blue'}>{v === 'admin' ? '管理员' : '用户'}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v) => <Tag color={v === 1 ? 'red' : 'green'}>{v === 1 ? '已封禁' : '正常'}</Tag>,
    },
    {
      title: '操作', width: 180, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditUser(record)}>编辑</Button>
          {record.role !== 'admin' && (
            <Popconfirm title="确认删除该用户？" onConfirm={() => handleDeleteUser(record.id)}>
              <Button danger icon={<DeleteOutlined />} size="small">删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'items',
      label: '内容管理',
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <Space>
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索帖子标题"
                allowClear
                value={itemKeyword}
                onChange={(e) => setItemKeyword(e.target.value)}
                onPressEnter={() => fetchItems(itemKeyword)}
                style={{ width: 240 }}
              />
              <Button onClick={() => fetchItems(itemKeyword)} className="pill-btn">搜索</Button>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateItem} className="pill-btn">新增帖子</Button>
          </div>
          <Table
            dataSource={items}
            columns={itemColumns}
            rowKey="id"
            loading={itemsLoading}
            size="small"
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: 'users',
      label: '用户管理',
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <Space>
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索用户名"
                allowClear
                value={userKeyword}
                onChange={(e) => setUserKeyword(e.target.value)}
                onPressEnter={() => fetchUsers(userKeyword)}
                style={{ width: 240 }}
              />
              <Button onClick={() => fetchUsers(userKeyword)} className="pill-btn">搜索</Button>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateUser} className="pill-btn">新增用户</Button>
          </div>
          <Table
            dataSource={users}
            columns={userColumns}
            rowKey="id"
            loading={usersLoading}
            size="small"
            scroll={{ x: 700 }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-full">
      <h2 className="text-xl font-semibold mb-4">管理后台</h2>
      <Tabs items={tabItems} />

      {/* Item Create/Edit Modal */}
      <Modal
        title={editingItem ? '编辑帖子' : '新增帖子'}
        open={itemModalOpen}
        onOk={handleItemSubmit}
        onCancel={() => setItemModalOpen(false)}
        destroyOnHidden
        width={520}
      >
        <Form form={itemForm} layout="vertical" initialValues={{ type: 'found', status: 0 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Space className="w-full" size="middle">
            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Option value="lost">寻物</Option>
                <Option value="found">招领</Option>
              </Select>
            </Form.Item>
            <Form.Item name="category" label="分类" rules={[{ required: true }]}>
              <Select style={{ width: 140 }}>
                <Option value="证件">证件</Option>
                <Option value="电子产品">电子产品</Option>
                <Option value="生活用品">生活用品</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
            {editingItem && (
              <Form.Item name="status" label="状态">
                <Select style={{ width: 120 }}>
                  <Option value={0}>展示中</Option>
                  <Option value={1}>已结案</Option>
                </Select>
              </Form.Item>
            )}
          </Space>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="图片">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={itemFileList}
              beforeUpload={(file) => {
                if (!file.type.startsWith('image/')) { message.error('只能上传图片'); return Upload.LIST_IGNORE }
                if (file.size / 1024 / 1024 > 5) { message.error('图片不超过5MB'); return Upload.LIST_IGNORE }
                setItemFileList([file])
                return false
              }}
              onRemove={() => setItemFileList([])}
            >
              {itemFileList.length === 0 && <div><UploadOutlined /><div className="mt-2">上传图片</div></div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Create/Edit Modal */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={userModalOpen}
        onOk={handleUserSubmit}
        onCancel={() => setUserModalOpen(false)}
        destroyOnHidden
        width={420}
      >
        <Form form={userForm} layout="vertical" initialValues={{ role: 'user', status: 0 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingUser ? '新密码（留空不修改）' : '密码'}
            rules={editingUser ? [] : [{ required: true, min: 6, message: '密码至少6位' }]}
          >
            <Input.Password maxLength={100} />
          </Form.Item>
          <Form.Item name="contact" label="联系方式">
            <Input maxLength={100} />
          </Form.Item>
          <Space size="middle">
            <Form.Item name="role" label="角色">
              <Select style={{ width: 120 }}>
                <Option value="user">普通用户</Option>
                <Option value="admin">管理员</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select style={{ width: 120 }}>
                <Option value={0}>正常</Option>
                <Option value={1}>封禁</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
