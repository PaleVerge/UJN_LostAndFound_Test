import { Empty } from 'antd'

const JOKES = [
  '这里比我的钱包还干净...',
  '你的东西可能穿越了，去图书馆看看？',
  '暂时没有物品漂到这里来~',
  '空空如也，就像考试前的脑子...',
]

export default function EmptyState({ description }) {
  const joke = JOKES[Math.floor(Math.random() * JOKES.length)]

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="empty-float mb-6">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 身体 */}
          <ellipse cx="60" cy="65" rx="28" ry="24" fill="var(--text-muted)" opacity="0.25" />
          <ellipse cx="60" cy="62" rx="28" ry="24" fill="url(#octoBody)" />
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="octoBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="tentacle1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>
            <linearGradient id="tentacle2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#FDBA74" />
            </linearGradient>
          </defs>
          {/* 触手 */}
          <path d="M40 78 Q35 95 28 95 Q22 95 24 88" stroke="url(#tentacle1)" strokeWidth="6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 40 78;5 40 78;0 40 78;-5 40 78;0 40 78" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M48 80 Q45 98 40 100 Q36 100 38 92" stroke="url(#tentacle2)" strokeWidth="6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 48 80;-4 48 80;0 48 80;4 48 80;0 48 80" dur="2.5s" repeatCount="indefinite" />
          </path>
          <path d="M56 82 Q58 100 56 102 Q52 102 54 94" stroke="url(#tentacle1)" strokeWidth="5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 56 82;3 56 82;0 56 82;-3 56 82;0 56 82" dur="3.5s" repeatCount="indefinite" />
          </path>
          <path d="M64 82 Q62 100 64 102 Q68 102 66 94" stroke="url(#tentacle2)" strokeWidth="5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 64 82;-3 64 82;0 64 82;3 64 82;0 64 82" dur="2.8s" repeatCount="indefinite" />
          </path>
          <path d="M72 80 Q75 98 80 100 Q84 100 82 92" stroke="url(#tentacle1)" strokeWidth="6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 72 80;4 72 80;0 72 80;-4 72 80;0 72 80" dur="3.2s" repeatCount="indefinite" />
          </path>
          <path d="M80 78 Q85 95 92 95 Q98 95 96 88" stroke="url(#tentacle2)" strokeWidth="6" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 80 78;-5 80 78;0 80 78;5 80 78;0 80 78" dur="2.7s" repeatCount="indefinite" />
          </path>
          {/* 眼睛 */}
          <ellipse cx="52" cy="56" rx="5" ry="6" fill="white" />
          <ellipse cx="68" cy="56" rx="5" ry="6" fill="white" />
          <circle cx="53" cy="57" r="2.5" fill="#1E293B">
            <animate attributeName="cy" values="57;55;57" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="69" cy="57" r="2.5" fill="#1E293B">
            <animate attributeName="cy" values="57;55;57" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* 微笑 */}
          <path d="M55 65 Q60 70 65 65" stroke="#F43F5E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* 腮红 */}
          <ellipse cx="46" cy="62" rx="4" ry="2.5" fill="#FB7185" opacity="0.4" />
          <ellipse cx="74" cy="62" rx="4" ry="2.5" fill="#FB7185" opacity="0.4" />
        </svg>
      </div>
      <Empty
        description={
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {description || joke}
          </span>
        }
      />
    </div>
  )
}
