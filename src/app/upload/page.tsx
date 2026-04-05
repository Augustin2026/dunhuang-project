'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('请填写完整的文献信息')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        content,
        status: 'pending' // 自动设置为待审核状态
      })
      .select()
      .single()

    if (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } else {
      setSuccess(true)
      // 清空表单
      setTitle('')
      setContent('')
      // 3秒后跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            文献上传
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            上传敦煌吐鲁番文献，提交后将进入审核流程
          </p>
        </div>

        {success ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">上传成功</h2>
            <p className="text-gray-500">您的文献已提交，正在等待审核</p>
            <p className="mt-4 text-sm text-gray-400">3秒后自动跳转到首页...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  文献名称
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入文献名称"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  文献正文
                </label>
                <textarea
                  id="content"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入文献正文"
                  required
                ></textarea>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? '上传中...' : '提交上传'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            返回首页
          </a>
        </div>
      </main>
    </div>
  )
}