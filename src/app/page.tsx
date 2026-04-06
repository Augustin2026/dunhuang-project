'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(
  () => import('react-quill'),
  { ssr: false }
)

if (typeof window !== 'undefined') {
  require('quill/dist/quill.snow.css')
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentResults, setDocumentResults] = useState<any[]>([])
  const [dictionaryResults, setDictionaryResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [title, setTitle] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [period, setPeriod] = useState('')
  const [content, setContent] = useState('')
  const [comment, setComment] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [currentDocumentId, setCurrentDocumentId] = useState('')
  const [currentDocumentTitle, setCurrentDocumentTitle] = useState('')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  async function handleSearch() {
    if (!searchTerm.trim()) return

    setLoading(true)
    setShowResults(true)

    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'approved')
      .ilike('title', `%${searchTerm}%`)
      .or(`ilike(document_number, %${searchTerm}%),ilike(period, %${searchTerm}%),ilike(content, %${searchTerm}%),ilike(page_number, %${searchTerm}%),ilike(comment, %${searchTerm}%)`)

    if (docsError) {
      console.error('搜索文献失败:', docsError)
      setDocumentResults([])
    } else {
      setDocumentResults(docs)
    }

    const { data: dict, error: dictError } = await supabase
      .from('dictionary')
      .select('*')
      .ilike('word', `%${searchTerm}%`)
      .or(`ilike(definition, %${searchTerm}%)`)

    if (dictError) {
      console.error('搜索词典失败:', dictError)
      setDictionaryResults([])
    } else {
      setDictionaryResults(dict)
    }

    setLoading(false)
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  function highlightText(text: string, keyword: string): React.ReactNode {
    if (!keyword.trim()) return text
    
    const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    
    return parts.map((part, index) => 
      part.toLowerCase() === keyword.toLowerCase() 
        ? <span key={index} className="bg-yellow-200/50 font-semibold">{part}</span>
        : part
    )
  }

  function highlightHTML(html: string, keyword: string): string {
    if (!keyword.trim()) return html
    
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return html.replace(regex, '<span class="bg-yellow-200/50 font-semibold">$1</span>')
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim() || !documentNumber.trim() || !period.trim() || !content.trim() || !pageNumber.trim()) {
      alert('请填写完整的文献信息')
      return
    }

    setUploading(true)

    const { data: existingDocs, error: checkError } = await supabase
      .from('documents')
      .select('id')
      .or(`title.eq.${title},document_number.eq.${documentNumber}`)
      .limit(1)

    if (checkError) {
      console.error('检查重复失败:', checkError)
      alert('检查失败，请重试')
      setUploading(false)
      return
    }

    if (existingDocs && existingDocs.length > 0) {
      alert('此条已经在数据库中，请检查。')
      setUploading(false)
      return
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        document_number: documentNumber,
        period,
        content,
        page_number: pageNumber,
        comment,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } else {
      setUploadSuccess(true)
      setTitle('')
      setDocumentNumber('')
      setPeriod('')
      setContent('')
      setComment('')
      setPageNumber('')
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    }

    setUploading(false)
  }

  function handleReportError(docId: string, docTitle: string) {
    setCurrentDocumentId(docId)
    setCurrentDocumentTitle(docTitle)
    setFeedbackContent('')
    setShowFeedbackForm(true)
  }

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault()

    if (!feedbackContent.trim()) {
      alert('请填写反馈内容')
      return
    }

    setSubmittingFeedback(true)

    const { error } = await supabase
      .from('feedbacks')
      .insert({
        document_id: currentDocumentId,
        document_title: currentDocumentTitle,
        content: feedbackContent,
        status: 'pending'
      })

    if (error) {
      console.error('提交反馈失败:', error)
      alert('提交反馈失败，请重试')
    } else {
      setFeedbackSuccess(true)
      setTimeout(() => {
        setFeedbackSuccess(false)
        setShowFeedbackForm(false)
      }, 3000)
    }

    setSubmittingFeedback(false)
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <main className="max-w-6xl mx-auto py-20 px-6 sm:px-8 lg:px-12">
        <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-white/70 border-b border-paper-200/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <div className="flex justify-between items-center">
              <a href="/" className="text-ink-900 font-serif font-semibold text-lg">
                敦煌文献检索
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
        
        <div className="pt-24"></div>
        
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="mb-12">
            <div className="decorative-line mx-auto mb-10"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 tracking-wide leading-tight gradient-text">
            敦煌吐鲁番出土文献检索系统
          </h1>
          <p className="text-lg text-ink-700/70 mb-16 max-w-2xl mx-auto leading-relaxed font-light">
            汇聚敦煌吐鲁番历史文献，为研究人员和爱好者提供便捷的文献访问方式
          </p>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="搜索文献标题、编号、年代或内容..."
                className="w-full px-8 py-6 pr-20 bg-white border border-paper-200 rounded-full text-ink-800 placeholder-ink-700/40 focus:outline-none focus:ring-3 focus:ring-accent-bronze/30 focus:border-accent-bronze/50 shadow-md transition-all duration-300 focus:shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-ink-800 text-white p-4 rounded-full hover:bg-ink-900 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="section-title">搜索结果</h2>
              <div className="flex-1 h-px bg-paper-200"></div>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-serif font-medium text-ink-800 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-accent-gold rounded-full"></span>
                    文献结果
                  </h3>
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-paper-100">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-paper-200 rounded animate-pulse"></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className="w-20 h-6 bg-paper-200 rounded-full animate-pulse"></div>
                            <div className="w-20 h-6 bg-paper-200 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="space-y-3 mt-4">
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-paper-100">
                          <div className="flex flex-wrap gap-4">
                            <div className="w-32 h-4 bg-paper-200 rounded animate-pulse"></div>
                            <div className="w-40 h-4 bg-paper-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-ink-800 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-accent-jade rounded-full"></span>
                    词典结果
                  </h3>
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-paper-100">
                        <div className="h-6 bg-paper-200 rounded animate-pulse mb-4"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-paper-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-serif font-medium text-ink-800 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-accent-gold rounded-full"></span>
                    文献结果
                  </h3>
                  {documentResults.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-paper-100">
                      <p className="text-ink-700/60">未找到相关文献</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {documentResults.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm border border-paper-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <h4 className="document-title text-lg font-bold flex-1">{highlightText(doc.title, searchTerm)}</h4>
                            <div className="flex flex-wrap gap-2">
                              {doc.period && (
                                <span className="px-3 py-1 bg-paper-100 text-ink-700 text-xs rounded-full">
                                  {highlightText(doc.period, searchTerm)}
                                </span>
                              )}
                              {doc.document_number && (
                                <span className="px-3 py-1 bg-paper-100 text-ink-700 text-xs rounded-full">
                                  {highlightText(doc.document_number, searchTerm)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="document-content text-sm text-ink-700/70 line-clamp-3" dangerouslySetInnerHTML={{ __html: highlightHTML(doc.content, searchTerm) }}></div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-paper-100">
                            <div className="flex flex-wrap gap-4 text-sm text-ink-700/60">
                              <span>页码: {highlightText(doc.page_number, searchTerm)}</span>
                              {doc.comment && (
                                <span className="line-clamp-1">注释: {highlightText(doc.comment, searchTerm)}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-paper-100 flex justify-between items-center">
                            <p className="text-xs text-ink-700/40">
                              {new Date(doc.created_at).toLocaleDateString('zh-CN')}
                            </p>
                            <button
                              onClick={() => handleReportError(doc.id, doc.title)}
                              className="text-sm text-accent-bronze hover:text-accent-gold transition-colors font-medium"
                            >
                              发现错误
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-serif font-medium text-ink-800 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-accent-jade rounded-full"></span>
                    词典结果
                  </h3>
                  {dictionaryResults.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-paper-100">
                      <p className="text-ink-700/60">未找到相关词典条目</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {dictionaryResults.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-paper-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                          <h4 className="document-title text-lg font-bold mb-4">{highlightText(item.word, searchTerm)}</h4>
                          <p className="text-ink-700/70 text-sm leading-relaxed line-clamp-4">{highlightText(item.definition, searchTerm)}</p>
                          <p className="mt-4 pt-4 border-t border-paper-100 text-xs text-ink-700/40">
                            {new Date(item.created_at).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="decorative-line mx-auto mb-6"></div>
            <h2 className="section-title">文献上传</h2>
            <p className="mt-4 text-ink-700/60">为数据库贡献新的文献资料</p>
          </div>
          
          {uploadSuccess ? (
            <div className="paper-card p-12 text-center">
              <div className="h-16 w-16 bg-accent-jade/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-accent-jade">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-ink-900 mb-3">上传成功</h3>
              <p className="text-ink-700/60">感谢你的贡献，管理员会尽快审核此条目，通过后就会纳入数据库</p>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="paper-card p-10">
              <div className="space-y-8">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-ink-800 mb-3">
                    文书标题 <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="input-field"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入文书标题"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="documentNumber" className="block text-sm font-medium text-ink-800 mb-3">
                    文书编号 <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    className="input-field"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="请输入文书编号"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-ink-800 mb-3">
                    所属年代 <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="period"
                    className="input-field"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="请输入所属年代"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-ink-800 mb-3">
                    文书释文 <span className="text-accent-gold">*</span>
                  </label>
                  <div className="bg-white border border-paper-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-bronze/20 focus-within:border-accent-bronze/40 transition-all duration-200">
                    <ReactQuill
                      id="content"
                      value={content}
                      onChange={(value) => setContent(value)}
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
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="请输入文献注释（可选）"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="pageNumber" className="block text-sm font-medium text-ink-800 mb-3">
                    所在页码 <span className="text-accent-gold">*</span>
                  </label>
                  <input
                    type="text"
                    id="pageNumber"
                    className="input-field"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    placeholder="请输入所在页码"
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? '上传中...' : '提交上传'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {showFeedbackForm && (
          <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-paper-lg">
              <h3 className="text-xl font-serif font-semibold text-ink-900 mb-2">反馈错误</h3>
              <p className="text-ink-700/60 text-sm mb-6">
                文献: <span className="font-serif text-ink-800">{currentDocumentTitle}</span>
              </p>
              
              {feedbackSuccess ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 bg-accent-jade/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-7 w-7 text-accent-jade">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-serif font-semibold text-ink-900 mb-2">反馈成功</h4>
                  <p className="text-ink-700/60 text-sm">感谢你的反馈，管理员会尽快处理</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <div className="mb-6">
                    <label htmlFor="feedbackContent" className="block text-sm font-medium text-ink-800 mb-3">
                      错误描述
                    </label>
                    <textarea
                      id="feedbackContent"
                      className="input-field min-h-[8rem]"
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="请详细描述你发现的错误"
                      required
                    ></textarea>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="flex-1 btn-secondary"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                      disabled={submittingFeedback}
                    >
                      {submittingFeedback ? '提交中...' : '提交反馈'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <footer className="mt-24 pt-10 border-t border-paper-200 text-center">
          <p className="text-ink-700/40 text-sm">
            敦煌吐鲁番文献检索与上传系统 © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  )
}
