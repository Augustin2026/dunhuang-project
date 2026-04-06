import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { id, title, document_number, period, content, page_number, comment, status } = req.body

    if (!id) {
      res.status(400).json({ error: 'Missing document id' })
      return
    }

    const { error, data } = await supabase
      .from('documents')
      .update({
        title,
        document_number,
        period,
        content,
        page_number,
        comment,
        status
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('更新文献失败:', error)
      res.status(500).json({ error: '更新文献失败' })
    } else {
      res.status(200).json({ success: true, data })
    }
  } catch (error) {
    console.error('更新文献过程中发生错误:', error)
    res.status(500).json({ error: '更新文献失败' })
  }
}