'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, BookOpen } from 'lucide-react'
import * as OpenCC from 'opencc-js'

// 初始化简繁转换实例
const converterS2T = OpenCC.Converter({ from: 'cn', to: 'tw' })
const converterT2S = OpenCC.Converter({ from: 'tw', to: 'cn' })

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentResults, setDocumentResults] = useState<any[]>([])
  const [dictionaryResults, setDictionaryResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchType, setSearchType] = useState('global') // global, title, content, dictionary
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [currentImagePage, setCurrentImagePage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [showMoreDocuments, setShowMoreDocuments] = useState(false)
  const [showMoreDictionary, setShowMoreDictionary] = useState(false)
  const [resultsPerPage, setResultsPerPage] = useState(10)

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 当页码变化且弹窗打开时，更新图片 URL 并设置加载状态为 true
  useEffect(() => {
    if (showImageViewer) {
      const newImageUrl = `https://hpggnkatybvyqepogdcb.supabase.co/storage/v1/object/public/dictionary-pages/TuCi_${currentImagePage}.jpeg`
      setImageUrl(newImageUrl)
      setIsLoading(true)
    }
  }, [currentImagePage, showImageViewer])

  // 使用 useCallback 来 memoize 搜索函数
  const memoizedHandleSearch = useCallback(async (event?: React.MouseEvent | string) => {
    // 检查是否是鼠标事件
    if (event && typeof event === 'object' && 'preventDefault' in event) {
      event.preventDefault()
      // 从状态中获取搜索词
      const query = searchTerm
      console.log('开始搜索，搜索词:', query, '搜索类型:', searchType)
          
          // 检查 query 是否是字符串类型
          if (typeof query !== 'string' || !query.trim()) {
            console.log('搜索词为空或不是字符串，取消搜索')
            return
          }

          setLoading(true)
          setShowResults(true)
          setShowMoreDocuments(false)
          setShowMoreDictionary(false)
          console.log('设置加载状态为 true，显示结果为 true，重置显示更多状态')

          try {
            const apiUrl = `/api/search?q=${encodeURIComponent(query)}&page=1&type=${searchType}`
            console.log('发起 API 请求，URL:', apiUrl)
            const response = await fetch(apiUrl)
        console.log('API 响应状态:', response.status)
        
        const data = await response.json()
        console.log('API 响应数据:', data)

        if (data.error) {
          console.error('搜索失败:', data.error)
          setDocumentResults([])
          setDictionaryResults([])
          console.log('设置搜索结果为空数组')
        } else {
          console.log('搜索成功，文献结果数量:', data.documents?.length || 0)
          console.log('搜索成功，词典结果数量:', data.dictionary?.length || 0)
          setDocumentResults(data.documents || [])
          setDictionaryResults(data.dictionary || [])
        }
      } catch (error) {
        console.error('搜索失败:', error)
        setDocumentResults([])
        setDictionaryResults([])
        console.log('设置搜索结果为空数组')
      } finally {
        setLoading(false)
        console.log('设置加载状态为 false')
      }
    } else {
      // 处理字符串参数
      const query = typeof event === 'string' ? event : searchTerm
      console.log('开始搜索，搜索词:', query, '搜索类型:', searchType)
          
          // 检查 query 是否是字符串类型
          if (typeof query !== 'string' || !query.trim()) {
            console.log('搜索词为空或不是字符串，取消搜索')
            return
          }

          setLoading(true)
          setShowResults(true)
          setShowMoreDocuments(false)
          setShowMoreDictionary(false)
          console.log('设置加载状态为 true，显示结果为 true，重置显示更多状态')

          try {
            const apiUrl = `/api/search?q=${encodeURIComponent(query)}&page=1&type=${searchType}`
            console.log('发起 API 请求，URL:', apiUrl)
            const response = await fetch(apiUrl)
        console.log('API 响应状态:', response.status)
        
        const data = await response.json()
        console.log('API 响应数据:', data)

        if (data.error) {
          console.error('搜索失败:', data.error)
          setDocumentResults([])
          setDictionaryResults([])
          console.log('设置搜索结果为空数组')
        } else {
          console.log('搜索成功，文献结果数量:', data.documents?.length || 0)
          console.log('搜索成功，词典结果数量:', data.dictionary?.length || 0)
          setDocumentResults(data.documents || [])
          setDictionaryResults(data.dictionary || [])
        }
      } catch (error) {
        console.error('搜索失败:', error)
        setDocumentResults([])
        setDictionaryResults([])
        console.log('设置搜索结果为空数组')
      } finally {
        setLoading(false)
        console.log('设置加载状态为 false')
      }
    }
  }, [searchTerm, searchType, setLoading, setShowResults, setDocumentResults, setDictionaryResults])

  // 当防抖搜索词变化时触发搜索
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      memoizedHandleSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, memoizedHandleSearch])



  const [title, setTitle] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [period, setPeriod] = useState('')
  const [content, setContent] = useState('')
  const [comment, setComment] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [uploading, setUploading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      memoizedHandleSearch()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      alert('请勾选同意条款')
      return
    }

    if (!title || !documentNumber || !period || !content) {
      alert('请填写所有必填字段')
      return
    }

    setUploading(true)

    try {
      // 检查是否已存在相同的文献
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('document_number', documentNumber)
        .eq('title', title)

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
        alert('上传成功，等待审核')
        setTitle('')
        setDocumentNumber('')
        setPeriod('')
        setContent('')
        setComment('')
        setPageNumber('')
        setAgreedToTerms(false)
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  // 文献反馈状态管理
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  
  // 版权与免责声明模态框状态管理
  const [showCopyrightModal, setShowCopyrightModal] = useState(false)

  // 处理反馈提交
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoc || !feedbackText) {
      alert('请填写反馈内容')
      return
    }

    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          document_id: selectedDoc.id,
          document_title: selectedDoc.title,
          content: feedbackText,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('反馈提交失败:', error)
        alert('反馈提交失败，请重试')
      } else {
        alert('反馈提交成功，感谢您的贡献！')
        setSelectedDoc(null)
        setFeedbackText('')
        setShowFeedbackModal(false)
      }
    } catch (error) {
      console.error('反馈提交失败:', error)
      alert('反馈提交失败，请重试')
    }
  }

  // 高亮显示搜索关键词
  const highlightText = (text: string, keyword: string): React.ReactNode => {
    if (!keyword) return text

    try {
      // 将搜索词转换为简体和繁体
      const simpTerm = converterT2S(keyword)
      const tradTerm = converterS2T(keyword)
      
      // 构建包含简体和繁体的正则表达式
      const terms = [simpTerm, tradTerm].filter((term, index, self) => self.indexOf(term) === index) // 去重
      const regexPattern = `(${terms.join('|')})`
      const regex = new RegExp(regexPattern, 'gi')
      
      const parts = text.split(regex)

      return (
        <>
          {parts.map((part, index) =>
            regex.test(part) ? (
              <span key={index} className="bg-yellow-200/50 font-semibold">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </>
      )
    } catch (error) {
      console.error('高亮处理失败:', error)
      return text
    }
  }

  // 高亮显示HTML内容中的关键词
  const highlightHTML = (html: string, keyword: string): React.ReactNode => {
    if (!keyword) return <div dangerouslySetInnerHTML={{ __html: html }} />

    try {
      // 将搜索词转换为简体和繁体
      const simpTerm = converterT2S(keyword)
      const tradTerm = converterS2T(keyword)
      
      // 构建包含简体和繁体的正则表达式
      const terms = [simpTerm, tradTerm].filter((term, index, self) => self.indexOf(term) === index) // 去重
      const regexPattern = `(${terms.join('|')})`
      const regex = new RegExp(regexPattern, 'gi')
      
      const highlightedHTML = html.replace(regex, '<span class="bg-yellow-200/50 font-semibold">$1</span>')

      return <div dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
    } catch (error) {
      console.error('HTML高亮处理失败:', error)
      return <div dangerouslySetInnerHTML={{ __html: html }} />
    }
  }

  // 文献展开/收起状态管理
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({})

  // 切换文献展开/收起状态
  const toggleExpand = (docId: string) => {
    setExpandedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }))
  }

  return (
    <div className="min-h-screen bg-stone-50 text-ink-800 font-serif">
      {/* 毛玻璃导航栏 */}
      <nav className="backdrop-blur-md bg-white/70 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-end items-center">
          <a href="/admin" className="text-ink-700 hover:text-ink-900 font-medium">
            管理员入口
          </a>
        </div>
      </nav>

      {/* 搜索框 */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-900 to-amber-600 mb-8">
          吐鲁番出土文献检索系统
        </h1>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="请输入关键词，如：高昌、佛经、文书..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 pr-16 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-md"
            />
            <button
              onClick={memoizedHandleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-ink-800 text-white p-4 rounded-full hover:bg-ink-900 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              <Search size={20} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSearchType('global')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${searchType === 'global' ? 'bg-ink-800 text-white shadow-md' : 'bg-gray-100 text-ink-700 hover:bg-gray-200'}`}
            >
              全局搜索
            </button>
            <button
              onClick={() => setSearchType('title')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${searchType === 'title' ? 'bg-ink-800 text-white shadow-md' : 'bg-gray-100 text-ink-700 hover:bg-gray-200'}`}
            >
              题目搜索
            </button>
            <button
              onClick={() => setSearchType('content')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${searchType === 'content' ? 'bg-ink-800 text-white shadow-md' : 'bg-gray-100 text-ink-700 hover:bg-gray-200'}`}
            >
              内容搜索
            </button>
            <button
              onClick={() => setSearchType('dictionary')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${searchType === 'dictionary' ? 'bg-ink-800 text-white shadow-md' : 'bg-gray-100 text-ink-700 hover:bg-gray-200'}`}
            >
              词典搜索
            </button>
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      {showResults && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6 text-ink-800">搜索结果</h2>
          
          {loading ? (
            // 骨架屏加载效果
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : documentResults.length > 0 || dictionaryResults.length > 0 ? (
            <div className="space-y-6">
              {/* 词典结果 */}
              {dictionaryResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 text-ink-800">词典 ({dictionaryResults.length}条)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(showMoreDictionary ? dictionaryResults : dictionaryResults.slice(0, resultsPerPage)).map((dict) => (
                      <div key={dict.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <h4 className="text-lg font-bold text-ink-900 mb-2">
                          {highlightText(dict.word, searchTerm)}
                        </h4>
                        <p className="text-gray-600 line-clamp-2 mb-3 text-sm">
                          {highlightText(dict.definition, searchTerm)}
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setCurrentImagePage(dict.page || 1)
                              setShowImageViewer(true)
                            }}
                            className="w-10 h-10 bg-amber-700 hover:bg-amber-800 text-white rounded-md transition-all duration-300 text-sm flex items-center justify-center"
                          >
                            查看
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {dictionaryResults.length > resultsPerPage && !showMoreDictionary && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => setShowMoreDictionary(true)}
                        className="px-3 py-1.5 bg-ink-800 hover:bg-ink-900 text-white rounded-lg transition-all duration-300 text-sm"
                      >
                        查看更多
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 文献结果 */}
              {documentResults.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-ink-800">文献 ({documentResults.length}条)</h3>
                  <div className="space-y-4">
                    {(showMoreDocuments ? documentResults : documentResults.slice(0, resultsPerPage)).map((doc) => (
                      <div key={doc.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-bold text-ink-900">
                            {highlightText(doc.title, searchTerm)}
                          </h4>
                          <div className="flex space-x-2">
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                              {doc.period}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {doc.document_number}
                            </span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-gray-600">
                            {expandedDocs[doc.id] ? (
                              highlightHTML(doc.content, searchTerm)
                            ) : (
                              <div className="line-clamp-3">
                                {highlightHTML(doc.content, searchTerm)}
                              </div>
                            )}
                          </p>
                          <button
                            onClick={() => toggleExpand(doc.id)}
                            className="mt-2 text-amber-700 hover:text-amber-900 text-sm font-medium"
                          >
                            {expandedDocs[doc.id] ? '收起' : '展开'}
                          </button>
                        </div>
                        {doc.comment && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-ink-700 mb-1">文献注释:</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{highlightText(doc.comment, searchTerm)}</p>
                          </div>
                        )}
                        {doc.page_number && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-ink-700 mb-1">所在页码:</h5>
                            <p className="text-gray-600 text-sm">{doc.page_number}</p>
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedDoc(doc)
                              setShowFeedbackModal(true)
                            }}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-ink-800 rounded-lg transition-all duration-300"
                          >
                            发现错误
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {documentResults.length > resultsPerPage && !showMoreDocuments && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowMoreDocuments(true)}
                        className="px-4 py-2 bg-ink-800 hover:bg-ink-900 text-white rounded-lg transition-all duration-300"
                      >
                        查看更多
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // 空白状态
            <div className="text-center py-16">
              <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                抱歉，未能找到相关的文献或词条。
              </h3>
              <p className="text-gray-400">
                您可以尝试缩短关键词，或联系管理员上传该文献。
              </p>
            </div>
          )}
        </div>
      )}

      {/* 文献上传 */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-ink-800">上传文献</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                文献标题 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                文献编号 *
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                时代 *
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                所在页码
              </label>
              <input
                type="text"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 mb-1">
              释文 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-serif"
              style={{ textRendering: 'optimizeLegibility' }}
            />
            <p className="mt-2 text-xs text-gray-400">
              💡 提示：若部分敦煌/吐鲁番异体字显示为空白方块，这是由于您的设备字库不全。建议安装学术界通用的【花园明朝 (Hanazono Mincho)】或使用部件拼字法进行录入。
            </p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink-700 mb-1">
              文献注释
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-ink-700">
                  我承诺上传的内容仅供学术交流，不侵犯他人知识产权。
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={uploading || !agreedToTerms}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? '上传中...' : '提交'}
            </button>
          </div>
        </form>
      </div>

      {/* 反馈模态框 */}
      {showFeedbackModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-ink-800">
              发现错误 - {selectedDoc.title}
            </h3>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  反馈内容 *
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoc(null)
                    setFeedbackText('')
                    setShowFeedbackModal(false)
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-ink-800 rounded-lg transition-all duration-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-all duration-300"
                >
                  提交反馈
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="bg-stone-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-ink-700 mb-4">
            © 2026 吐鲁番出土文献检索系统. 致力于吐鲁番出土文献的学术交流与共享。
          </p>
          <button onClick={() => setShowCopyrightModal(true)} className="text-amber-700 hover:text-amber-900 font-medium">
            版权与免责声明
          </button>
        </div>
      </footer>



      {/* 版权与免责声明模态框 */}
      {showCopyrightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-ink-900">版权与免责声明</h3>
              <button
                onClick={() => setShowCopyrightModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-ink-700 mb-4 leading-relaxed">
                本站部分文献数据与释文由网络搜集或注册用户自发上传。本站仅提供信息存储空间服务，不对用户上传内容的版权归属及真实性作实质性审查。
              </p>
              <p className="text-ink-700 mb-4 leading-relaxed">
                若本站收录的文献、词条或图片侵犯了您的合法权益，请联系管理员（邮箱：183823519@qq.com）。我们将在核实后第一时间进行删除或断开链接处理，感谢您的理解与监督。
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowCopyrightModal(false)}
                className="px-4 py-2 bg-ink-800 text-white rounded-lg hover:bg-ink-900 transition-all duration-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片浏览器 */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-ink-900">原典浏览</h3>
                <button
                  onClick={() => setShowImageViewer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={() => setCurrentImagePage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-ink-800 text-white rounded-lg hover:bg-ink-900 transition-all duration-300 mr-4"
                >
                  前一页
                </button>
                <span className="text-ink-700 font-medium">第 {currentImagePage} 页</span>
                <button
                  onClick={() => setCurrentImagePage(prev => prev + 1)}
                  className="px-4 py-2 bg-ink-800 text-white rounded-lg hover:bg-ink-900 transition-all duration-300 ml-4"
                >
                  后一页
                </button>
              </div>
              <div className="relative min-h-[200px]">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={`词典第 ${currentImagePage} 页`}
                    className="w-full h-auto max-h-[70vh] object-contain"
                    onLoad={() => setIsLoading(false)}
                  />
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 text-stone-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mb-4"></div>
                    <p>加载中...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page