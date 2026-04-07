import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // 获取今日访问量
      const today = new Date().toISOString().split('T')[0];
      const { data: todayVisit, error: todayError } = await supabase
        .from('visits')
        .select('count')
        .eq('date', today)
        .single();

      // 获取总访问量
      const { data: totalVisit, error: totalError } = await supabase
        .from('visits')
        .select('sum(count) as total')
        .single();

      if (todayError || totalError) {
        console.error('获取访问量失败:', todayError, totalError);
        res.status(200).json({ today: 0, total: 0 });
        return;
      }

      res.status(200).json({
        today: todayVisit?.count || 0,
        total: totalVisit?.total || 0
      });
    } catch (error) {
      console.error('获取访问量失败:', error);
      res.status(200).json({ today: 0, total: 0 });
    }
  } else if (req.method === 'POST') {
    try {
      // 增加今日访问量
      const today = new Date().toISOString().split('T')[0];
      
      // 先检查是否存在今日记录
      const { data: existingVisit, error: existingError } = await supabase
        .from('visits')
        .select('id, count')
        .eq('date', today)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('检查今日访问量失败:', existingError);
        res.status(500).json({ error: '检查今日访问量失败' });
        return;
      }

      if (existingVisit) {
        // 更新现有记录
        const { error: updateError } = await supabase
          .from('visits')
          .update({ count: existingVisit.count + 1 })
          .eq('id', existingVisit.id);

        if (updateError) {
          console.error('更新访问量失败:', updateError);
          res.status(500).json({ error: '更新访问量失败' });
          return;
        }
      } else {
        // 创建新记录
        const { error: insertError } = await supabase
          .from('visits')
          .insert({ date: today, count: 1 });

        if (insertError) {
          console.error('创建访问量记录失败:', insertError);
          res.status(500).json({ error: '创建访问量记录失败' });
          return;
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('增加访问量失败:', error);
      res.status(500).json({ error: '增加访问量失败' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
