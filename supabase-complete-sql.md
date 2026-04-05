# 完整的 Supabase 表结构调整 SQL 命令

## 问题分析
您指出在之前的 SQL 命令中遗漏了 `updated_at` 字段，以下是包含 `updated_at` 字段的完整 SQL 命令：

## 完整的 SQL 命令

1. 登录 Supabase 控制台
2. 点击左侧导航栏中的 "SQL Editor"
3. 输入以下 SQL 命令：

```sql
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

-- 复制旧表数据到新表
INSERT INTO documents_new (id, title, document_number, period, content, page_number, status, created_at, updated_at)
SELECT 
  id, 
  title, 
  document_number, 
  period, 
  content, 
  page_number, 
  status, 
  created_at, 
  COALESCE(updated_at, created_at) AS updated_at 
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
```

4. 点击 "Run" 按钮执行命令

## 说明

1. **字段顺序**：新表的字段顺序为：
   - id
   - title
   - document_number
   - period
   - content
   - page_number
   - status
   - created_at
   - updated_at

2. **updated_at 字段**：
   - 添加了 `updated_at` 字段，默认值为当前时间
   - 复制数据时使用 `COALESCE(updated_at, created_at)` 确保即使旧表没有 `updated_at` 字段也能正常复制
   - 添加了触发器，当记录更新时自动更新 `updated_at` 字段

3. **数据迁移**：
   - 所有现有数据都会被保留
   - 新字段会自动填充默认值

## 验证方法

执行完成后，您可以：
1. 在 "Database" > "Tables" > "documents" 中查看表结构，确认字段顺序和 `updated_at` 字段
2. 尝试上传一份新的文献，检查所有字段是否能成功保存
3. 尝试修改一份现有文献，检查 `updated_at` 字段是否自动更新

这样，您的表结构就会更加完整和有序，同时也包含了 `updated_at` 字段用于跟踪记录的最后更新时间。