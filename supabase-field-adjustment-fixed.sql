-- 创建新表，按照所需顺序定义字段，包含 updated_at 字段
CREATE TABLE documents_new (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  document_number TEXT,
  period TEXT,
  content TEXT NOT NULL,
  page_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 复制旧表数据到新表（只选择旧表中存在的字段）
INSERT INTO documents_new (id, title, document_number, period, content, page_number, status, created_at)
SELECT 
  id, 
  title, 
  document_number, 
  period, 
  content, 
  page_number, 
  status, 
  created_at
FROM documents;

-- 删除旧表
DROP TABLE documents;

-- 重命名新表为旧表名
ALTER TABLE documents_new RENAME TO documents;

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();