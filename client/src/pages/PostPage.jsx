import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Upload, Radio, Card, App, Spin } from 'antd'
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { createItem, updateItem, getItemDetail } from '../api/items'
import { useAuth } from '../contexts/AuthContext'

const { TextArea } = Input
const { Option } = Select

export default function PostPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [fileList, setFileList] = useState([])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id } = useParams()
  const { user } = useAuth()

  const defaultType = searchParams.get('type') === 'found' ? 'found' : 'lost'

  useEffect(() => {
    if (!id) {
      form.setFieldValue('type', defaultType)
    }
  }, [defaultType, id, form])

  useEffect(() => {
    if (id) {
      setEditing(true)
      getItemDetail(id).then((res) => {
        const item = res.data
        form.setFieldsValue({
          type: item.type,
          category: item.category,
          title: item.title,
          description: item.description,
          location: item.location,
          contact_info: item.contact_info,
        })
        if (item.image_url) {
          setFileList([{ uid: '-1', name: 'current', status: 'done', url: item.image_url }])
        }
      }).catch(() => message.error('加载帖子失败'))
    }
  }, [id, form])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', values.title)
      fd.append('type', values.type)
      fd.append('category', values.category)
      fd.append('description', values.description || '')
      fd.append('location', values.location || '')
      fd.append('contact_info', values.contact_info || user?.contact || '')
      if (fileList.length > 0 && fileList[0] instanceof File) {
        fd.append('image', fileList[0])
      }

      if (editing) {
        await updateItem(id, fd)
        message.success('更新成功')
      } else {
        await createItem(fd)
        message.success('发布成功')
      }
      navigate('/')
    } catch (err) {
      message.error(err?.response?.data?.msg || err?.message || '发布失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-4 px-0 text-gray-500 hover:text-blue-500"
      >
        返回
      </Button>
      <Card
        title={
          <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editing ? '编辑帖子' : '发布信息'}
          </span>
        }
        className="glass-card"
        styles={{ body: { padding: '28px', background: 'transparent' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: defaultType,
            category: undefined,
            contact_info: user?.contact || '',
          }}
        >
          <Form.Item name="type" label="信息类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group optionType="button" buttonStyle="solid" size="middle">
              <Radio.Button value="lost">🔍 失物寻物</Radio.Button>
              <Radio.Button value="found"><img src="/logo.png" alt="logo" className="w-4 h-4 inline-block object-contain mr-1 align-[-2px]" />失物招领</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="category" label="物品分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类" size="large">
              <Option value="证件">证件</Option>
              <Option value="电子产品">电子产品</Option>
              <Option value="生活用品">生活用品</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item name="title" label="物品名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：蓝色钱包、学生证" maxLength={100} />
          </Form.Item>

          <Form.Item name="description" label="详细描述">
            <TextArea rows={3} placeholder="描述物品的外观特征、丢失/拾获的具体情况等" maxLength={500} />
          </Form.Item>

          <Form.Item name="location" label="地点">
            <Input placeholder="如：图书馆三楼、二食堂附近" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="contact_info"
            label="联系方式"
            extra={<span className="text-xs text-gray-400">默认使用您个人资料中的联系方式，可临时修改</span>}
          >
            <Input placeholder="手机号/微信" maxLength={100} />
          </Form.Item>

          <Form.Item label="物品图片" extra={<span className="text-xs text-gray-400">支持 JPG/PNG/WebP，不超过 5MB</span>}>
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={fileList}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/')
                if (!isImage) {
                  message.error('只能上传图片文件')
                  return Upload.LIST_IGNORE
                }
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('图片大小不能超过 5MB')
                  return Upload.LIST_IGNORE
                }
                setFileList([file])
                return false
              }}
              onRemove={() => setFileList([])}
            >
              {fileList.length === 0 && (
                <div className="text-gray-400">
                  <UploadOutlined className="text-2xl" />
                  <div className="mt-2 text-xs">上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block size="large" loading={loading} className="pill-btn">
              {editing ? '保存修改' : '发布'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
