import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 直接在 API 路由中初始化 Supabase 客户端，避免依赖外部文件
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 检查环境变量是否设置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not set')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    console.log('API 收到搜索请求:', { searchTerm, page, limit, offset })

    if (!searchTerm.trim()) {
      console.log('搜索词为空，返回空结果')
      return NextResponse.json({ documents: [], dictionary: [], total: 0 }, { status: 200 })
    }

    // 搜索文献
    console.log('开始搜索文献...')
    try {
      const { data: docs, error: docsError, count: docsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .ilike('title', `%${searchTerm}%`)
        .range(offset, offset + limit - 1)

      if (docsError) {
        console.error('搜索文献失败:', docsError)
        return NextResponse.json({ error: '搜索文献失败', details: docsError }, { status: 500 })
      }

      console.log('文献搜索成功，找到', docsCount, '条结果')

      // 搜索词典
      console.log('开始搜索词典...')
      let dictionaryResults = []
      try {
        // 修复 or 条件的语法，使用正确的 Supabase 语法
        const { data: dict, error: dictError } = await supabase
          .from('dictionary')
          .select('*')
          .ilike('word', `%${searchTerm}%`)
          .or(`definition.ilike.%25${encodeURIComponent(searchTerm)}%25`)
          .range(0, 19) // 词典也限制最多20条

        if (dictError) {
          console.error('搜索词典失败:', dictError)
          // 只记录错误，不影响文献搜索结果
          dictionaryResults = []
        } else {
          dictionaryResults = dict || []
          console.log('词典搜索成功，找到', dictionaryResults.length, '条结果')
        }
      } catch (error) {
        console.error('搜索词典失败:', error)
        // 只记录错误，不影响文献搜索结果
        dictionaryResults = []
      }

      return NextResponse.json(
        {
          documents: docs || [],
          dictionary: dictionaryResults,
          total: docsCount || 0,
          page,
          limit
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('搜索失败:', error)
      return NextResponse.json({ error: '搜索失败' }, { status: 500 })
    }
  } catch (error) {
    console.error('请求处理失败:', error)
    return NextResponse.json({ error: '请求处理失败' }, { status: 500 })
  }
}
