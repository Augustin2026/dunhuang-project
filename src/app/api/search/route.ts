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
      .range(offset, offset + limit - 1)

    if (docsError) {
      console.error('搜索文献失败:', docsError)
      return NextResponse.json({ error: '搜索文献失败', details: docsError }, { status: 500 })
    }

    return NextResponse.json(
      {
        documents: docs || [],
        dictionary: [],
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
