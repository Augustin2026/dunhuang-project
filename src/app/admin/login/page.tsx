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

    // 获取存储的密码，默认为 admin123
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123'

    // 验证密码
    if (password === storedPassword) {
      // 存储登录状态到 localStorage
      localStorage.setItem('adminLoggedIn', 'true')
      // 跳转到审核页面
      router.push('/admin')
    } else {
      setError('密码错误')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            管理员登录
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            请输入管理员密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>


        </form>
      </div>
    </div>
  )
}