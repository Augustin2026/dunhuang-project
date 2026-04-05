# Supabase 添加字段问题解决方案

## 问题分析
您在添加字段时遇到页面自动刷新的问题，这可能是由于网络连接、浏览器缓存或 Supabase 控制台的临时故障导致的。以下是几种解决方案：

## 解决方案

### 方案 1：基本故障排除
1. **清除浏览器缓存**：
   - 在 Chrome 中：按 Ctrl+Shift+Delete，选择 "缓存的图片和文件"，然后点击 "清除数据"
   - 在 Firefox 中：按 Ctrl+Shift+Delete，选择 "缓存"，然后点击 "清除"
   - 在 Safari 中：点击 "Safari" 菜单 > "偏好设置" > "高级" > 勾选 "在菜单栏中显示开发菜单" > 然后点击 "开发" > "清空缓存"

2. **使用隐身模式**：
   - 打开浏览器的隐身模式（Chrome: Ctrl+Shift+N, Firefox: Ctrl+Shift+P, Safari: Command+Shift+N）
   - 登录 Supabase 控制台，尝试添加字段

3. **更换浏览器**：
   - 尝试使用不同的浏览器（如 Chrome、Firefox、Edge 等）登录 Supabase 控制台

4. **检查网络连接**：
   - 确保您的网络连接稳定
   - 尝试使用有线连接或更换网络环境

### 方案 2：使用 SQL 命令添加字段
如果上述方法仍然无法解决问题，您可以使用 SQL 命令直接添加字段。

1. 登录 Supabase 控制台
2. 在左侧导航栏中点击 "SQL Editor"
3. 在 SQL 编辑器中输入以下命令：

```sql
-- 添加文书编号字段
ALTER TABLE documents ADD COLUMN document_number TEXT;

-- 添加所属年代字段
ALTER TABLE documents ADD COLUMN period TEXT;

-- 添加所在页码字段
ALTER TABLE documents ADD COLUMN page_number TEXT;
```

4. 点击 "Run" 按钮执行命令
5. 执行完成后，您可以在 "Database" > "Tables" > "documents" 中查看新添加的字段

### 方案 3：创建新表
如果上述方法都无法解决问题，您可以考虑创建一个新的表，包含所有需要的字段：

1. 在 SQL 编辑器中输入以下命令：

```sql
-- 创建新表
CREATE TABLE documents_new (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  document_number TEXT,
  period TEXT,
  content TEXT NOT NULL,
  page_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 复制旧表数据到新表（如果有数据）
INSERT INTO documents_new (title, content, status, created_at)
SELECT title, content, status, created_at FROM documents;

-- 删除旧表
DROP TABLE documents;

-- 重命名新表为旧表名
ALTER TABLE documents_new RENAME TO documents;
```

4. 点击 "Run" 按钮执行命令

## 验证方法
无论使用哪种方法，添加完成后，您可以通过以下方式验证：

1. 在 "Database" > "Tables" > "documents" 中查看表结构，确认新字段已添加
2. 尝试在网站上上传一份新的文献，检查是否能成功保存所有字段
3. 在搜索结果中查看是否能显示新字段的内容

## 注意事项
- 如果您的表中已有数据，使用 SQL 命令添加字段时不会影响现有数据
- 使用方案 3 时，请确保先备份您的数据，以防万一
- 如果问题仍然存在，建议联系 Supabase 官方支持

希望这些解决方案能帮助您解决问题！