import { useState, useEffect, useCallback, useRef } from 'react'
import { Spin, Tabs } from 'antd'
import { getItems } from '../api/items'
import ItemCard from '../components/ItemCard'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'

export default function HomePage() {
  const [foundItems, setFoundItems] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const debounceRef = useRef(null)

  const fetchItems = useCallback(async (kw) => {
    setLoading(true)
    try {
      const [foundRes, lostRes] = await Promise.all([
        getItems({ type: 'found', keyword: kw, limit: 20 }),
        getItems({ type: 'lost', keyword: kw, limit: 20 }),
      ])
      setFoundItems(foundRes.data.list)
      setLostItems(lostRes.data.list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems('')
  }, [fetchItems])

  useEffect(() => {
    const handler = (e) => handleSearch(e.detail)
    window.addEventListener('search:change', handler)
    return () => window.removeEventListener('search:change', handler)
  }, [])

  const handleSearch = (value) => {
    setKeyword(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchItems(value)
    }, 300)
  }

  const TrendBoard = () => (
    <div className="glass-card p-5 space-y-4" style={{ height: 'fit-content' }}>
      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        🔥 丢拾趋势
      </h4>
      <div className="space-y-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex justify-between items-center">
          <span>📱 电子产品</span>
          <span className="font-semibold tag-lost">多</span>
        </div>
        <div className="flex justify-between items-center">
          <span>🪪 证件</span>
          <span className="font-semibold tag-found">找得快</span>
        </div>
        <div className="flex justify-between items-center">
          <span>🔑 生活用品</span>
          <span className="font-semibold tag-lost">新增+3</span>
        </div>
      </div>
      <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          📊 今日招领 <span style={{ color: '#16A34A' }}>{foundItems.length}</span> 条 · 寻物 <span style={{ color: '#DC2626' }}>{lostItems.length}</span> 条
        </p>
      </div>
    </div>
  )

  const desktopView = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 280px', gap: '0' }}>
      <section style={{ paddingRight: '40px' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--tag-found-bg)' }}>
            <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>失物招领栏</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>他人捡到</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12"><Spin /></div>
        ) : foundItems.length === 0 ? (
          <EmptyState description="暂无招领信息" />
        ) : (
          <div className="grid gap-4">
            {foundItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
      <div className="column-divider" />
      <section style={{ paddingLeft: '40px', paddingRight: '24px' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--tag-lost-bg)' }}>
            <span className="text-lg">&#128270;</span>
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>失物寻物栏</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>物品丢失</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12"><Spin /></div>
        ) : lostItems.length === 0 ? (
          <EmptyState description="暂无寻物信息" />
        ) : (
          <div className="grid gap-4">
            {lostItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
      <aside className="hidden lg:block" style={{ paddingLeft: '24px' }}>
        <TrendBoard />
      </aside>
    </div>
  )

  const tabs = [
    {
      key: 'found',
      label: '🔍 失物招领',
      children: (
        <div className="grid gap-4">
          {loading ? <div className="text-center py-12"><Spin /></div> :
            foundItems.length === 0 ? <EmptyState description="暂无招领信息" /> :
              foundItems.map((item) => <ItemCard key={item.id} item={item} />)
          }
        </div>
      ),
    },
    {
      key: 'lost',
      label: '📢 失物寻物',
      children: (
        <div className="grid gap-4">
          {loading ? <div className="text-center py-12"><Spin /></div> :
            lostItems.length === 0 ? <EmptyState description="暂无寻物信息" /> :
              lostItems.map((item) => <ItemCard key={item.id} item={item} />)
          }
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="md:hidden">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="md:hidden mb-4">
        <Tabs defaultActiveKey="found" items={tabs} />
      </div>
      <div className="hidden md:block">{desktopView}</div>
    </div>
  )
}
