import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// 繁简转换函数
function convertToTraditional(text: string): string {
  // 这里使用一个简单的繁简转换映射
  // 实际应用中可以使用更完整的转换库
  const simplifiedToTraditional: Record<string, string> = {
    '高': '高',
    '昌': '昌',
    '经': '經',
    '书': '書',
    '文': '文',
    '字': '字',
    '词': '詞',
    '条': '條',
    '件': '件',
    '搜': '搜',
    '索': '索',
    '结': '結',
    '果': '果',
    '显': '顯',
    '示': '示',
    '文': '文',
    '献': '獻',
    '注': '注',
    '释': '釋',
    '时': '時',
    '代': '代',
    '页': '頁',
    '码': '碼'
    // 可以添加更多的繁简转换映射
  }
  
  return text.split('').map(char => simplifiedToTraditional[char] || char).join('')
}

// 生成包含简体和繁体的搜索条件
function generateSearchConditions(searchTerm: string): string {
  const traditionalTerm = convertToTraditional(searchTerm)
  
  // 如果搜索词和转换后的繁体相同，只需要一个条件
  if (searchTerm === traditionalTerm) {
    return `title.ilike.%${searchTerm}%,document_number.ilike.%${searchTerm}%,period.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,comment.ilike.%${searchTerm}%`
  }
  
  // 否则，同时搜索简体和繁体
  return `title.ilike.%${searchTerm}%,title.ilike.%${traditionalTerm}%,document_number.ilike.%${searchTerm}%,document_number.ilike.%${traditionalTerm}%,period.ilike.%${searchTerm}%,period.ilike.%${traditionalTerm}%,content.ilike.%${searchTerm}%,content.ilike.%${traditionalTerm}%,comment.ilike.%${searchTerm}%,comment.ilike.%${traditionalTerm}%`
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not set')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const searchTerm = req.query.q as string || ''
    const page = parseInt(req.query.page as string || '1')
    const limit = 20
    const offset = (page - 1) * limit

    if (!searchTerm.trim()) {
      res.status(200).json({ documents: [], dictionary: [], total: 0 })
      return
    }

    const searchConditions = generateSearchConditions(searchTerm)
    
    const { data: docs, error: docsError, count: docsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .or(searchConditions)
      .range(offset, offset + limit - 1)

    if (docsError) {
      console.error('搜索文献失败:', docsError)
      res.status(500).json({ error: '搜索文献失败', details: docsError })
      return
    }

    let dictionaryResults = []
    try {
      const traditionalTerm = convertToTraditional(searchTerm)
      const dictSearchConditions = searchTerm === traditionalTerm 
        ? `word.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%`
        : `word.ilike.%${searchTerm}%,word.ilike.%${traditionalTerm}%,definition.ilike.%${searchTerm}%,definition.ilike.%${traditionalTerm}%`
      
      const { data: dict, error: dictError } = await supabase
        .from('dictionary')
        .select('*')
        .or(dictSearchConditions)
        .range(0, 19)

      if (dictError) {
        console.error('搜索词典失败:', dictError)
        dictionaryResults = []
      } else {
        dictionaryResults = dict || []
      }
    } catch (error) {
      console.error('搜索词典失败:', error)
      dictionaryResults = []
    }

    res.status(200).json({
      documents: docs || [],
      dictionary: dictionaryResults,
      total: docsCount || 0,
      page,
      limit
    })
  } catch (error) {
    console.error('请求处理失败:', error)
    res.status(500).json({ error: '请求处理失败' })
  }
}