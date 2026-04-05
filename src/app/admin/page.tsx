'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<string | null>(null)
  const [editedDocument, setEditedDocument] = useState<any>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const router = useRouter()

  // 身份验证检查
  useEffect(() => {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!isLoggedIn) {
      // 跳转到登录页面
      router.push('/admin/login')
    }
  }, [router])

  // 获取待审核文献
  useEffect(() => {
    // 只有登录后才获取数据
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!isLoggedIn) return

    async function fetchPendingDocuments() {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'pending')

      if (error) {
        console.error('获取待审核文献失败:', error)
      } else {
        setPendingDocuments(data)
      }

      setLoading(false)
    }

    fetchPendingDocuments()
  }, [])

  // 审核通过
  async function handleApprove(id: string) {
    setActionLoading(id)

    const { error } = await supabase
      .from('documents')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) {
      console.error('审核通过失败:', error)
      alert('审核通过失败，请重试')
    } else {
      // 更新本地状态
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== id))
    }

    setActionLoading(null)
  }

  // 审核拒绝
  async function handleReject(id: string) {
    setActionLoading(id)

    const { error } = await supabase
      .from('documents')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      console.error('审核拒绝失败:', error)
      alert('审核拒绝失败，请重试')
    } else {
      // 更新本地状态
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== id))
    }

    setActionLoading(null)
  }

  // 进入编辑模式
  function handleEdit(doc: any) {
    setEditMode(doc.id)
    setEditedDocument({ ...doc })
  }

  // 保存编辑
  async function handleSaveEdit(id: string) {
    setActionLoading(id)

    const { error } = await supabase
      .from('documents')
      .update({
        title: editedDocument.title,
        document_number: editedDocument.document_number,
        period: editedDocument.period,
        content: editedDocument.content,
        page_number: editedDocument.page_number
      })
      .eq('id', id)

    if (error) {
      console.error('保存编辑失败:', error)
      alert('保存编辑失败，请重试')
    } else {
      // 更新本地状态
      setPendingDocuments(pendingDocuments.map(doc => 
        doc.id === id ? editedDocument : doc
      ))
      setEditMode(null)
      setEditedDocument(null)
    }

    setActionLoading(null)
  }

  // 取消编辑
  function handleCancelEdit() {
    setEditMode(null)
    setEditedDocument(null)
  }

  // 编辑后通过
  async function handleEditAndApprove(id: string) {
    setActionLoading(id)

    const { error } = await supabase
      .from('documents')
      .update({
        title: editedDocument.title,
        document_number: editedDocument.document_number,
        period: editedDocument.period,
        content: editedDocument.content,
        page_number: editedDocument.page_number,
        status: 'approved'
      })
      .eq('id', id)

    if (error) {
      console.error('编辑并通过失败:', error)
      alert('编辑并通过失败，请重试')
    } else {
      // 更新本地状态
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== id))
      setEditMode(null)
      setEditedDocument(null)
    }

    setActionLoading(null)
  }

  // 修改密码
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    
    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      return
    }

    // 获取当前存储的密码
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123'

    if (currentPassword !== storedPassword) {
      setPasswordError('当前密码错误')
      return
    }

    // 保存新密码
    localStorage.setItem('adminPassword', newPassword)
    setPasswordSuccess('密码修改成功')
    setPasswordError('')
    
    // 重置表单
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    
    // 3秒后清除成功提示
    setTimeout(() => {
      setPasswordSuccess('')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              管理员审核
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              审核待处理的文献
            </p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showPasswordForm ? '取消修改密码' : '修改密码'}
          </button>
        </div>

        {/* 密码修改表单 */}
        {showPasswordForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">修改管理员密码</h2>
            
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{passwordError}</p>
              </div>
            )}
            
            {passwordSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>{passwordSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                确认修改
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : pendingDocuments.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">暂无待审核的文献</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingDocuments.map((doc) => (
              <div key={doc.id} className="bg-white p-6 rounded-lg shadow">
                {editMode === doc.id ? (
                  // 编辑模式
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">编辑文献</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          文书标题
                        </label>
                        <input
                          type="text"
                          id="title"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editedDocument?.title || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, title: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="document_number" className="block text-sm font-medium text-gray-700 mb-1">
                          文书编号
                        </label>
                        <input
                          type="text"
                          id="document_number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editedDocument?.document_number || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, document_number: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                          所属年代
                        </label>
                        <input
                          type="text"
                          id="period"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editedDocument?.period || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, period: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                          文书释文
                        </label>
                        <textarea
                          id="content"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={6}
                          value={editedDocument?.content || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, content: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="page_number" className="block text-sm font-medium text-gray-700 mb-1">
                          所在页码
                        </label>
                        <input
                          type="text"
                          id="page_number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editedDocument?.page_number || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, page_number: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-6">
                      <button
                        onClick={() => handleEditAndApprove(doc.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '保存并通过'}
                      </button>
                      <button
                        onClick={() => handleSaveEdit(doc.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        disabled={actionLoading === doc.id}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  // 查看模式
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900">{doc.title}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>文书编号: {doc.document_number}</p>
                        <p>所属年代: {doc.period}</p>
                        <p className="mt-2">{doc.content.substring(0, 200)}...</p>
                        <p>所在页码: {doc.page_number}</p>
                      </div>
                      <p className="mt-4 text-sm text-gray-500">
                        提交时间: {new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '通过'}
                      </button>
                      <button
                        onClick={() => handleReject(doc.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '拒绝'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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