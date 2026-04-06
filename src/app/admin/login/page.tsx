'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!password) {
      setError('请输入密码')
      return
    }

    setLoading(true)
    setError('')

    const storedPassword = localStorage.getItem('adminPassword') || 'admin123'

    if (password === storedPassword) {
      localStorage.setItem('adminLoggedIn', 'true')
      router.push('/admin')
    } else {
      setError('密码错误')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-white/70 border-b border-paper-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-ink-900 font-serif font-semibold text-lg">
              敦煌文献检索
            </a>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center px-6 min-h-screen pt-24">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="decorative-line mx-auto mb-8"></div>
            <h2 className="text-3xl font-serif font-semibold text-ink-900">
              管理员登录
            </h2>
            <p className="mt-3 text-ink-700/60">
              请输入管理员密码
            </p>
          </div>

        <form onSubmit={handleSubmit} className="paper-card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-ink-800 mb-3">
              密码
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理员密码"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-ink-700/60 hover:text-ink-800 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
