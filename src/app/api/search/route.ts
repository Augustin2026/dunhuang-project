import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const searchTerm = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  if (!searchTerm.trim()) {
    return NextResponse.json({ documents: [], dictionary: [], total: 0 }, { status: 200 })
  }

  try {
    // 搜索文献
    const { data: docs, error: docsError, count: docsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .ilike('title', `%${searchTerm}%`)
      .or(`ilike(document_number, %${searchTerm}%),ilike(period, %${searchTerm}%),ilike(content, %${searchTerm}%),ilike(page_number, %${searchTerm}%),ilike(comment, %${searchTerm}%)`)
      .range(offset, offset + limit - 1)

    if (docsError) {
      console.error('搜索文献失败:', docsError)
      return NextResponse.json({ error: '搜索文献失败' }, { status: 500 })
    }

    // 搜索词典
    const { data: dict, error: dictError } = await supabase
      .from('dictionary')
      .select('*')
      .ilike('word', `%${searchTerm}%`)
      .or(`ilike(definition, %${searchTerm}%)`)
      .range(0, 19) // 词典也限制最多20条

    if (dictError) {
      console.error('搜索词典失败:', dictError)
      return NextResponse.json({ error: '搜索词典失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        documents: docs || [],
        dictionary: dict || [],
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
}
