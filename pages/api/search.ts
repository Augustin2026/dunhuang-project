import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

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

    const { data: docs, error: docsError, count: docsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .or(`title.ilike.%${searchTerm}%,document_number.ilike.%${searchTerm}%,period.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .range(offset, offset + limit - 1)

    if (docsError) {
      console.error('搜索文献失败:', docsError)
      res.status(500).json({ error: '搜索文献失败', details: docsError })
      return
    }

    let dictionaryResults = []
    try {
      const { data: dict, error: dictError } = await supabase
        .from('dictionary')
        .select('*')
        .or(`word.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%`)
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