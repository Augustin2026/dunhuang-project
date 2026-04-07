-- 创建访问量统计表
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);
