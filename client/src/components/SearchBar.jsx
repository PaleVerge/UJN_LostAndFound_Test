import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export default function SearchBar({ onSearch }) {
  const handleChange = (e) => {
    onSearch?.(e.target.value)
  }

  return (
    <Input
      prefix={<SearchOutlined className="text-gray-400" />}
      placeholder="搜索物品名称、地点..."
      allowClear
      size="large"
      onChange={handleChange}
      className="max-w-lg mb-4"
    />
  )
}
