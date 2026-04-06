'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(
  () => import('react-quill'),
  { ssr: false }
)

if (typeof window !== 'undefined') {
  require('quill/dist/quill.snow.css')
}

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
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [showFeedbacks, setShowFeedbacks] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!isLoggedIn) {
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!isLoggedIn || !showFeedbacks) return

    async function fetchFeedbacks() {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取反馈失败:', error)
      } else {
        setFeedbacks(data)
      }
    }

    fetchFeedbacks()
  }, [showFeedbacks])

  async function handleApprove(id: any) {
    console.log('开始审核通过文献，ID:', id, '类型:', typeof id)
    setActionLoading(id)

    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      console.log('API 响应结果:', result)

      if (!response.ok || result.error) {
        console.error('审核通过失败:', result.error)
        alert('审核通过失败，请重试')
      } else {
        console.log('审核通过成功，ID:', id)
        setPendingDocuments(pendingDocuments.filter(doc => doc.id !== id))
      }
    } catch (error) {
      console.error('审核通过过程中发生错误:', error)
      alert('审核通过失败，请重试')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: any) {
    console.log('开始审核拒绝文献，ID:', id, '类型:', typeof id)
    setActionLoading(id)

    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })

      const result = await response.json()
      console.log('API 响应结果:', result)

      if (!response.ok || result.error) {
        console.error('审核拒绝失败:', result.error)
        alert('审核拒绝失败，请重试')
      } else {
        console.log('审核拒绝成功，ID:', id)
        setPendingDocuments(pendingDocuments.filter(doc => doc.id !== id))
      }
    } catch (error) {
      console.error('审核拒绝过程中发生错误:', error)
      alert('审核拒绝失败，请重试')
    } finally {
      setActionLoading(null)
    }
  }

  function handleEdit(doc: any) {
    setEditMode(doc.id)
    setEditedDocument({ ...doc })
  }

  async function handleSaveEdit(id: string) {
    setActionLoading(id)

    const { error } = await supabase
      .from('documents')
      .update({
        title: editedDocument.title,
        document_number: editedDocument.document_number,
        period: editedDocument.period,
        content: editedDocument.content,
        page_number: editedDocument.page_number,
        comment: editedDocument.comment
      })
      .eq('id', id)

    if (error) {
      console.error('保存编辑失败:', error)
      alert('保存编辑失败，请重试')
    } else {
      setPendingDocuments(pendingDocuments.map(doc => 
        doc.id === id ? editedDocument : doc
      ))
      setEditMode(null)
      setEditedDocument(null)
    }

    setActionLoading(null)
  }

  function handleCancelEdit() {
    setEditMode(null)
    setEditedDocument(null)
  }

  async function handleEditAndApprove(id: any) {
    console.log('开始编辑并通过文献，ID:', id, '类型:', typeof id)
    setActionLoading(id)

    try {
      // 首先更新文献内容
      const updateResponse = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          title: editedDocument.title,
          document_number: editedDocument.document_number,
          period: editedDocument.period,
          content: editedDocument.content,
          page_number: editedDocument.page_number,
          comment: editedDocument.comment,
          status: 'approved'
        })
      })

      const updateResult = await updateResponse.json()
      console.log('更新文献 API 响应结果:', updateResult)

      if (!updateResponse.ok || updateResult.error) {
        console.error('编辑并通过失败:', updateResult.error)
        alert('编辑并通过失败，请重试')
      } else {
        console.log('编辑并通过成功，ID:', id)
        setPendingDocuments(pendingDocuments.filter(doc => doc.id !== id))
        setEditMode(null)
        setEditedDocument(null)
      }
    } catch (error) {
      console.error('编辑并通过过程中发生错误:', error)
      alert('编辑并通过失败，请重试')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      return
    }

    const storedPassword = localStorage.getItem('adminPassword') || 'admin123'

    if (currentPassword !== storedPassword) {
      setPasswordError('当前密码错误')
      return
    }

    localStorage.setItem('adminPassword', newPassword)
    setPasswordSuccess('密码修改成功')
    setPasswordError('')
    
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    
    setTimeout(() => {
      setPasswordSuccess('')
    }, 3000)
  }

  async function handleMarkFeedbackAsProcessed(feedbackId: string) {
    const { error } = await supabase
      .from('feedbacks')
      .update({ status: 'processed' })
      .eq('id', feedbackId)

    if (error) {
      console.error('标记反馈为已处理失败:', error)
      alert('操作失败，请重试')
    } else {
      setFeedbacks(feedbacks.map(feedback => 
        feedback.id === feedbackId ? { ...feedback, status: 'processed' } : feedback
      ))
    }
  }

  function handleEditDocumentFromFeedback(documentId: string) {
    const document = pendingDocuments.find(doc => doc.id === documentId)
    if (document) {
      setEditMode(document.id)
      setEditedDocument({ ...document })
      setShowFeedbacks(false)
    } else {
      alert('该文献可能已经处理，无法直接编辑')
    }
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-white/70 border-b border-paper-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-ink-900 font-serif font-semibold text-lg">
              吐鲁番出土文献检索系统
            </a>
            <a
              href="/admin"
              className="px-5 py-2 bg-ink-800/90 text-white rounded-xl font-medium text-sm hover:bg-ink-900 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              管理
            </a>
          </div>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto py-16 px-6 sm:px-8 lg:px-12 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <div className="decorative-line mb-6"></div>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-ink-900">
              管理员审核
            </h1>
            <p className="mt-3 text-ink-700/60">
              审核待处理的文献与用户反馈
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFeedbacks(!showFeedbacks)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                showFeedbacks 
                  ? 'bg-accent-jade text-white shadow-paper' 
                  : 'bg-paper-100 text-ink-800 border border-paper-200 hover:bg-paper-200'
              }`}
            >
              {showFeedbacks ? '查看待审核文献' : '查看用户反馈'}
            </button>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                showPasswordForm 
                  ? 'bg-ink-800 text-white shadow-paper' 
                  : 'bg-paper-100 text-ink-800 border border-paper-200 hover:bg-paper-200'
              }`}
            >
              {showPasswordForm ? '取消修改密码' : '修改密码'}
            </button>
          </div>
        </div>

        {showPasswordForm && (
          <div className="paper-card p-8 mb-10">
            <h2 className="text-xl font-serif font-semibold text-ink-900 mb-6">修改管理员密码</h2>
            
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="bg-accent-jade/10 border border-accent-jade/20 text-accent-jade px-5 py-4 rounded-xl mb-6 text-sm">
                {passwordSuccess}
              </div>
            )}
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ink-800 mb-3">
                  当前密码
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="input-field"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-ink-800 mb-3">
                  新密码
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-800 mb-3">
                  确认新密码
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary"
              >
                确认修改
              </button>
            </form>
          </div>
        )}

        {showFeedbacks && (
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="section-title">用户反馈</h2>
              <div className="flex-1 h-px bg-paper-200"></div>
            </div>
            {feedbacks.length === 0 ? (
              <div className="paper-card p-10 text-center">
                <p className="text-ink-700/60">暂无用户反馈</p>
              </div>
            ) : (
              <div className="space-y-5">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="paper-card p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-serif font-medium text-ink-900">
                          {feedback.document_title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-ink-700/60">
                          <span>{new Date(feedback.created_at).toLocaleDateString('zh-CN')}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feedback.status === 'pending' 
                              ? 'bg-accent-gold/10 text-accent-gold' 
                              : 'bg-accent-jade/10 text-accent-jade'
                          }`}>
                            {feedback.status === 'pending' ? '待处理' : '已处理'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDocumentFromFeedback(feedback.document_id)}
                          className="px-4 py-2 bg-ink-800 text-white rounded-xl text-sm font-medium hover:bg-ink-900 transition-all duration-300"
                        >
                          编辑文献
                        </button>
                        {feedback.status === 'pending' && (
                          <button
                            onClick={() => handleMarkFeedbackAsProcessed(feedback.id)}
                            className="px-4 py-2 bg-accent-jade text-white rounded-xl text-sm font-medium hover:bg-accent-jade/90 transition-all duration-300"
                          >
                            标记已处理
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-paper-200">
                      <p className="text-ink-700/80 text-sm whitespace-pre-line leading-relaxed">{feedback.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!showFeedbacks && loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-ink-700/60">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>加载中...</span>
            </div>
          </div>
        ) : !showFeedbacks && pendingDocuments.length === 0 ? (
          <div className="paper-card p-10 text-center">
            <p className="text-ink-700/60">暂无待审核的文献</p>
          </div>
        ) : !showFeedbacks && (
          <div className="space-y-6">
            {pendingDocuments.map((doc) => (
              <div key={doc.id} className="paper-card p-6">
                {editMode === doc.id ? (
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-ink-900 mb-6">编辑文献</h3>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-ink-800 mb-3">
                          文书标题
                        </label>
                        <input
                          type="text"
                          id="title"
                          className="input-field"
                          value={editedDocument?.title || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, title: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="document_number" className="block text-sm font-medium text-ink-800 mb-3">
                          文书编号
                        </label>
                        <input
                          type="text"
                          id="document_number"
                          className="input-field"
                          value={editedDocument?.document_number || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, document_number: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="period" className="block text-sm font-medium text-ink-800 mb-3">
                          所属年代
                        </label>
                        <input
                          type="text"
                          id="period"
                          className="input-field"
                          value={editedDocument?.period || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, period: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-ink-800 mb-3">
                          文书释文
                        </label>
                        <div className="bg-white border border-paper-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-bronze/20 focus-within:border-accent-bronze/40 transition-all duration-200">
                          <ReactQuill
                            id="content"
                            value={editedDocument?.content || ''}
                            onChange={(value) => setEditedDocument({ ...editedDocument, content: value })}
                            placeholder="请输入文书释文"
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],
                                ['blockquote', 'code-block'],
                                [{ 'header': 1 }, { 'header': 2 }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                [{ 'script': 'sub' }, { 'script': 'super' }],
                                [{ 'indent': '-1' }, { 'indent': '+1' }],
                                [{ 'direction': 'rtl' }],
                                [{ 'size': ['small', false, 'large', 'huge'] }],
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'font': [] }],
                                [{ 'align': [] }],
                                ['clean'],
                                ['image']
                              ]
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-ink-800 mb-3">
                          文献注释
                        </label>
                        <textarea
                          id="comment"
                          className="input-field min-h-[6rem]"
                          value={editedDocument?.comment || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, comment: e.target.value })}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label htmlFor="page_number" className="block text-sm font-medium text-ink-800 mb-3">
                          所在页码
                        </label>
                        <input
                          type="text"
                          id="page_number"
                          className="input-field"
                          value={editedDocument?.page_number || ''}
                          onChange={(e) => setEditedDocument({ ...editedDocument, page_number: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-8">
                      <button
                        onClick={() => handleEditAndApprove(doc.id)}
                        className="px-5 py-2.5 bg-accent-jade text-white rounded-xl font-medium hover:bg-accent-jade/90 transition-all duration-300"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '保存并通过'}
                      </button>
                      <button
                        onClick={() => handleSaveEdit(doc.id)}
                        className="px-5 py-2.5 bg-ink-800 text-white rounded-xl font-medium hover:bg-ink-900 transition-all duration-300"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-secondary"
                        disabled={actionLoading === doc.id}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="document-title text-xl mb-4">{doc.title}</h3>
                      <div className="space-y-2 text-sm text-ink-700/80">
                        <p className="flex items-start gap-2">
                          <span className="text-ink-700/50 min-w-[5rem]">文书编号</span>
                          <span className="font-serif">{doc.document_number}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-ink-700/50 min-w-[5rem]">所属年代</span>
                          <span className="font-serif">{doc.period}</span>
                        </p>
                        <div className="mt-3 pt-3 border-t border-paper-200">
                          <div className="document-content text-sm" dangerouslySetInnerHTML={{ __html: doc.content.substring(0, 300) + '...' }}></div>
                        </div>
                        <p className="flex items-start gap-2 mt-3">
                          <span className="text-ink-700/50 min-w-[5rem]">所在页码</span>
                          <span>{doc.page_number}</span>
                        </p>
                        {doc.comment && (
                          <p className="mt-3 pt-3 border-t border-paper-200 whitespace-pre-line text-ink-700/70">
                            <span className="text-ink-700/50">注释：</span>{doc.comment}
                          </p>
                        )}

                      </div>
                      <p className="mt-5 pt-4 border-t border-paper-200 text-xs text-ink-700/40">
                        提交时间: {new Date(doc.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="px-4 py-2 bg-ink-800 text-white rounded-xl text-sm font-medium hover:bg-ink-900 transition-all duration-300"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-4 py-2 bg-accent-jade text-white rounded-xl text-sm font-medium hover:bg-accent-jade/90 transition-all duration-300"
                        disabled={actionLoading === doc.id}
                      >
                        {actionLoading === doc.id ? '处理中...' : '通过'}
                      </button>
                      <button
                        onClick={() => handleReject(doc.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-300"
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

        <div className="mt-12 text-center">
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

        <footer className="mt-16 pt-8 border-t border-paper-200 text-center">
          <p className="text-ink-700/40 text-sm">
            敦煌吐鲁番文献检索与上传系统 © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  )
}
