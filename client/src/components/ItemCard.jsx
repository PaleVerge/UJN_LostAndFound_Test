import { useState } from 'react'
import { Card, Tag, Button, Modal, Spin, Typography, Image } from 'antd'
import { EnvironmentOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'
import ContactModal from './ContactModal'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getItemDetail } from '../api/items'

const { Text, Paragraph } = Typography

const CATEGORY_COLORS = {
  '证件': 'blue',
  '电子产品': 'purple',
  '生活用品': 'orange',
  '其他': 'default',
}

export default function ItemCard({ item }) {
  const [contactOpen, setContactOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const handleAction = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setContactOpen(true)
  }

  const handleCardClick = async () => {
    setDetailOpen(true)
    if (!detail) {
      setDetailLoading(true)
      try {
        const res = await getItemDetail(item.id)
        setDetail(res.data)
      } finally {
        setDetailLoading(false)
      }
    }
  }

  const isFound = item.type === 'found'
  const displayItem = detail || item

  return (
    <>
      <Card
        hoverable
        className="glass-card cursor-pointer"
        styles={{ body: { padding: '16px', background: 'transparent' } }}
        cover={
          item.image_url ? (
            <div className="card-img-wrapper h-44">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="img-placeholder">暂无图片</div>
          )
        }
        onClick={handleCardClick}
        actions={[
          <Button
            key="action"
            type={isFound ? 'primary' : 'default'}
            className={`pill-btn ${isFound ? '' : '!border-blue-300 !text-blue-500'}`}
            onClick={(e) => { e.stopPropagation(); handleAction() }}
          >
            {isFound ? '我要认领' : '联系失主'}
          </Button>,
        ]}
      >
        <div className="flex items-start justify-between mb-2">
          <Tag color={CATEGORY_COLORS[item.category] || 'default'}>{item.category}</Tag>
          <span className={item.status === 1 ? 'tag-closed' : (isFound ? 'tag-found' : 'tag-lost')}>
            {item.status === 1 ? '已结案' : (isFound ? '待认领' : '寻找中')}
          </span>
        </div>
        <Card.Meta
          title={<span className="text-base">{item.title}</span>}
          description={
            <div className="text-xs text-gray-500 space-y-1 mt-1">
              <div><EnvironmentOutlined className="mr-1" />{item.location || '未知地点'}</div>
              <div><ClockCircleOutlined className="mr-1" />{item.create_time ? new Date(item.create_time).toLocaleDateString('zh-CN') : ''}</div>
              {item.User && (
                <div className="truncate"><UserOutlined className="mr-1" />{item.User.username}</div>
              )}
            </div>
          }
        />
      </Card>

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        contact={item.contact_info || (item.User?.contact ? '通过用户中心查看' : '暂无联系方式')}
        publisher={item.User?.username}
      />

      <Modal
        title={displayItem.title}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        destroyOnHidden
        centered
      >
        {detailLoading ? (
          <div className="text-center py-12"><Spin size="large" /></div>
        ) : (
          <div className="space-y-4">
            {displayItem.image_url ? (
              <Image
                src={displayItem.image_url}
                alt={displayItem.title}
                className="w-full rounded-lg"
                style={{ maxHeight: 400, objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                暂无图片
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Tag color={CATEGORY_COLORS[displayItem.category] || 'default'}>{displayItem.category}</Tag>
              <span className={displayItem.type === 'found' ? 'tag-found' : 'tag-lost'}>
                {displayItem.type === 'found' ? '失物招领' : '失物寻物'}
              </span>
              <span className={displayItem.status === 1 ? 'tag-closed' : 'tag-found'}>
                {displayItem.status === 1 ? '已结案' : '展示中'}
              </span>
            </div>
            {displayItem.description && (
              <div>
                <Text type="secondary">详细描述</Text>
                <Paragraph className="mt-1 whitespace-pre-wrap">{displayItem.description}</Paragraph>
              </div>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              {displayItem.location && (
                <span><EnvironmentOutlined className="mr-1" />{displayItem.location}</span>
              )}
              {displayItem.create_time && (
                <span><ClockCircleOutlined className="mr-1" />{new Date(displayItem.create_time).toLocaleString('zh-CN')}</span>
              )}
              {displayItem.User && (
                <span><UserOutlined className="mr-1" />{displayItem.User.username}</span>
              )}
            </div>
            <div className="border-t pt-3">
              <Button
                type={isFound ? 'primary' : 'default'}
                block
                className="pill-btn"
                onClick={() => { setDetailOpen(false); handleAction() }}
              >
                {isFound ? '我要认领' : '联系失主'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
