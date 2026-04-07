import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import * as OpenCC from 'opencc-js'

// 初始化简繁转换实例
const converterS2T = OpenCC.Converter({ from: 'cn', to: 'tw' })
const converterT2S = OpenCC.Converter({ from: 'tw', to: 'cn' })

// 繁简转换函数
function convertToTraditional(text: string): string {
  try {
    return converterS2T(text)
  } catch (error) {
    console.error('简转繁失败:', error)
    return text
  }
}

// 繁转简函数
function convertToSimplified(text: string): string {
  try {
    return converterT2S(text)
  } catch (error) {
    console.error('繁转简失败:', error)
    return text
  }
}

// 生成包含简体和繁体的搜索条件
function generateSearchConditions(searchTerm: string, searchType: string): string {
  // 将搜索词转换为简体和繁体
  const simpTerm = convertToSimplified(searchTerm)
  const tradTerm = convertToTraditional(searchTerm)
  
  // 根据搜索类型生成不同的搜索条件
  switch (searchType) {
    case 'title':
      if (simpTerm === tradTerm) {
        return `title.ilike.%${simpTerm}%`
      }
      return `title.ilike.%${simpTerm}%,title.ilike.%${tradTerm}%`
    case 'content':
      if (simpTerm === tradTerm) {
        return `content.ilike.%${simpTerm}%`
      }
      return `content.ilike.%${simpTerm}%,content.ilike.%${tradTerm}%`
    default: // global
      if (simpTerm === tradTerm) {
        return `title.ilike.%${simpTerm}%,document_number.ilike.%${simpTerm}%,period.ilike.%${simpTerm}%,content.ilike.%${simpTerm}%,comment.ilike.%${simpTerm}%`
      }
      return `title.ilike.%${simpTerm}%,title.ilike.%${tradTerm}%,document_number.ilike.%${simpTerm}%,document_number.ilike.%${tradTerm}%,period.ilike.%${simpTerm}%,period.ilike.%${tradTerm}%,content.ilike.%${simpTerm}%,content.ilike.%${tradTerm}%,comment.ilike.%${simpTerm}%,comment.ilike.%${tradTerm}%`
  }
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
    const searchType = req.query.type as string || 'global'
    const page = parseInt(req.query.page as string || '1')
    const limit = 20
    const offset = (page - 1) * limit

    if (!searchTerm.trim()) {
      res.status(200).json({ documents: [], dictionary: [], total: 0 })
      return
    }

    const searchConditions = generateSearchConditions(searchTerm, searchType)
    
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

    let dictionaryResults: { id: string; word: string; page: number; definition: string }[] = []
    try {
      // 将搜索词转换为简体和繁体
      const simpTerm = convertToSimplified(searchTerm)
      const tradTerm = convertToTraditional(searchTerm)
      
      const dictSearchConditions = simpTerm === tradTerm 
        ? `word.ilike.%${simpTerm}%`
        : `word.ilike.%${simpTerm}%,word.ilike.%${tradTerm}%`
      
      const { data: dict, error: dictError } = await supabase
        .from('dictionary')
        .select('id, word, page')
        .or(dictSearchConditions)
        .range(0, 19)

      if (dictError) {
        console.error('搜索词典失败:', dictError)
        dictionaryResults = []
      } else {
        // 为每个词典条目添加 definition 字段，以便前端显示
        dictionaryResults = (dict || []).map(item => ({
          ...item,
          definition: `位于第 ${item.page} 页`
        }))
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