'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentResults, setDocumentResults] = useState<any[]>([])
  const [dictionaryResults, setDictionaryResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  // 上传表单状态
  const [title, setTitle] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [period, setPeriod] = useState('')
  const [content, setContent] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // 搜索功能
  async function handleSearch() {
    if (!searchTerm.trim()) return

    setLoading(true)
    setShowResults(true)

    // 搜索文献（只搜索已通过审核的）
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'approved')
      .ilike('title', `%${searchTerm}%`)
      .or(`ilike(document_number, %${searchTerm}%),ilike(period, %${searchTerm}%),ilike(content, %${searchTerm}%),ilike(page_number, %${searchTerm}%)`)

    if (docsError) {
      console.error('搜索文献失败:', docsError)
      setDocumentResults([])
    } else {
      setDocumentResults(docs)
    }

    // 搜索词典
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

  // 处理回车搜索
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 上传文献
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    
    // 验证所有字段都已填写
    if (!title.trim() || !documentNumber.trim() || !period.trim() || !content.trim() || !pageNumber.trim()) {
      alert('请填写完整的文献信息')
      return
    }

    setUploading(true)

    // 检查是否存在重复的文书标题或编号
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

    // 插入新文献
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        document_number: documentNumber,
        period,
        content,
        page_number: pageNumber,
        status: 'pending' // 自动设置为待审核状态
      })
      .select()
      .single()

    if (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } else {
      setUploadSuccess(true)
      // 清空表单
      setTitle('')
      setDocumentNumber('')
      setPeriod('')
      setContent('')
      setPageNumber('')
      // 3秒后重置成功状态
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    }

    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* 右上角审核按钮 */}
        <div className="flex justify-end mb-12">
          <a
            href="/admin"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            审核
          </a>
        </div>
        
        {/* 首页搜索框 */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
            敦煌吐鲁番出土文献检索系统
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            汇聚敦煌吐鲁番历史文献，为研究人员和爱好者提供便捷的文献访问方式
          </p>
          
          {/* 现代风格搜索框 */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索文献..."
                className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 搜索结果 */}
        {showResults && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">搜索结果</h2>
            
            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-500">搜索中...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* 文献结果 */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">文献结果</h3>
                  {documentResults.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                      <p className="text-gray-500">未找到相关文献</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {documentResults.map((doc) => (
                        <div key={doc.id} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>文书编号: {doc.document_number}</p>
                            <p>所属年代: {doc.period}</p>
                            <p className="mt-2">{doc.content.substring(0, 150)}...</p>
                            <p>所在页码: {doc.page_number}</p>
                          </div>
                          <p className="mt-3 text-xs text-gray-400">
                            创建时间: {new Date(doc.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 词典结果 */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">词典结果</h3>
                  {dictionaryResults.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                      <p className="text-gray-500">未找到相关词典条目</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dictionaryResults.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">{item.word}</h4>
                          <p className="mt-2 text-sm text-gray-600">{item.definition}</p>
                          <p className="mt-3 text-xs text-gray-400">
                            创建时间: {new Date(item.created_at).toLocaleString()}
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

        {/* 文献上传 */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">文献上传</h2>
          
          {uploadSuccess ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">上传成功</h3>
              <p className="text-gray-500">感谢你的贡献，管理员会尽快审核此条目，通过后就会纳入数据库</p>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="bg-white p-8 rounded-xl shadow-md">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    文书标题
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入文书标题"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    文书编号
                  </label>
                  <input
                    type="text"
                    id="documentNumber"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="请输入文书编号"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                    所属年代
                  </label>
                  <input
                    type="text"
                    id="period"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="请输入所属年代"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    文书释文
                  </label>
                  <textarea
                    id="content"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="请输入文书释文"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="pageNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    所在页码
                  </label>
                  <input
                    type="text"
                    id="pageNumber"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    placeholder="请输入所在页码"
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors font-medium"
                    disabled={uploading}
                  >
                    {uploading ? '上传中...' : '提交上传'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* 页脚 */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <p>敦煌吐鲁番文献检索与上传系统 © {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  )
}