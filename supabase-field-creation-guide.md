# Supabase 控制台添加新字段步骤指南

## 问题分析
您无法在 Supabase 控制台添加新字段可能是因为操作流程不熟悉。以下是详细的步骤指南，帮助您成功添加所需的字段。

## 详细步骤

### 1. 登录 Supabase 控制台
1. 打开浏览器，访问 [Supabase 官网](https://supabase.com/)
2. 点击右上角的 "Sign In" 登录您的账户
3. 选择您的项目（应该是包含 documents 表的项目）

### 2. 找到并打开 documents 表
1. 在左侧导航栏中点击 "Database" 选项
2. 在 "Tables" 列表中找到 "documents" 表
3. 点击 "documents" 表进入表结构编辑页面

### 3. 添加新字段
1. 在表结构页面，点击顶部的 "Edit table" 按钮
2. 滚动到底部，找到 "Add column" 部分
3. 按照以下信息添加三个新字段：

#### 字段 1：文书编号
- **Name**: `document_number`
- **Data type**: `Text`
- **Default value**: 留空
- **Nullable**: 可以勾选（允许为空）
- **Description**: 文书编号
- 点击 "Add column" 按钮

#### 字段 2：所属年代
- **Name**: `period`
- **Data type**: `Text`
- **Default value**: 留空
- **Nullable**: 可以勾选（允许为空）
- **Description**: 所属年代
- 点击 "Add column" 按钮

#### 字段 3：所在页码
- **Name**: `page_number`
- **Data type**: `Text`
- **Default value**: 留空
- **Nullable**: 可以勾选（允许为空）
- **Description**: 所在页码
- 点击 "Add column" 按钮

### 4. 保存修改
1. 所有字段添加完成后，点击页面顶部的 "Save changes" 按钮
2. 等待保存完成，系统会显示保存成功的提示

## 常见问题及解决方案

### 1. 无法找到 "Edit table" 按钮
- **解决方案**: 确保您登录了正确的项目，并且有足够的权限修改表结构

### 2. 保存失败
- **解决方案**: 检查网络连接，确保字段名称符合要求（只能使用小写字母、数字和下划线）

### 3. 字段添加后不显示
- **解决方案**: 尝试刷新页面，或退出并重新登录 Supabase 控制台

## 验证
添加完成后，您可以通过以下方式验证：
1. 在表结构页面查看新添加的字段是否显示
2. 尝试上传一份新的文献，检查是否能成功保存所有字段
3. 在搜索结果中查看是否能显示新字段的内容

如果仍然遇到问题，请提供具体的错误信息或截图，以便我进一步帮助您解决。