import { Modal, Typography, Button, App } from 'antd'
import { CopyOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

export default function ContactModal({ open, onClose, contact, publisher }) {
  const { message } = App.useApp()
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact)
      message.success('已复制到剪贴板')
    } catch {
      message.info(`联系方式: ${contact}`)
    }
  }

  return (
    <Modal
      title={<span className="text-lg font-semibold">联系方式</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      destroyOnHidden
    >
      <div className="py-4 space-y-4">
        {publisher && (
          <div className="flex items-center gap-2">
            <Text type="secondary">发布者</Text>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-500 text-sm font-medium">{publisher[0]}</span>
            </div>
            <Text strong>{publisher}</Text>
          </div>
        )}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
          <div className="text-center mb-4">
            <Text type="secondary" className="text-xs">联系方式</Text>
          </div>
          <Paragraph className="text-xl text-center font-mono font-bold text-blue-600 mb-4 tracking-wider">
            {contact}
          </Paragraph>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            block
            size="large"
            className="pill-btn"
            onClick={handleCopy}
          >
            一键复制
          </Button>
        </div>
      </div>
    </Modal>
  )
}
