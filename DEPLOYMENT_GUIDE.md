# 网站部署指南

## 步骤 1：初始化 Git 仓库

1. **打开终端**：在项目根目录 `d:\新建文件夹\dunhuang-project` 中打开终端

2. **初始化 Git 仓库**：
   ```bash
   git init
   ```

3. **创建 .gitignore 文件**：
   ```bash
   echo "# dependencies\nnode_modules\n.pnp\n.pnp.js\n\n# testing\ncoverage\n\n# production\nbuild\n\n# misc\n.DS_Store\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n\n# editor directories and files\n.idea\n.vscode\n*.swp\n*.swo\n*~
" > .gitignore
   ```

4. **添加文件到暂存区**：
   ```bash
   git add .
   ```

5. **提交初始 commit**：
   ```bash
   git commit -m "Initial commit"
   ```

## 步骤 2：创建 GitHub 仓库

1. **登录 GitHub**：打开 [GitHub](https://github.com/) 并登录您的账户

2. **创建新仓库**：
   - 点击右上角的 "+" 按钮，选择 "New repository"
   - 填写仓库名称（例如：dunhuang-project）
   - 选择 "Public" 或 "Private"
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

3. **复制仓库 URL**：在新创建的仓库页面，复制 HTTPS 或 SSH URL

## 步骤 3：将代码推送到 GitHub

1. **添加远程仓库**：
   ```bash
   git remote add origin <your-github-repo-url>
   ```
   例如：
   ```bash
   git remote add origin https://github.com/your-username/dunhuang-project.git
   ```

2. **推送到 GitHub**：
   ```bash
   git push -u origin master
   ```
   如果遇到分支名称问题，可能需要使用：
   ```bash
   git push -u origin main
   ```

## 步骤 4：部署到 Vercel

1. **登录 Vercel**：打开 [Vercel](https://vercel.com/) 并使用 GitHub 账号登录

2. **导入项目**：
   - 点击 "New Project"
   - 在 "Import Git Repository" 部分，找到您的 dunhuang-project 仓库
   - 点击 "Import"

3. **配置项目**：
   - 项目名称：保持默认或修改为您喜欢的名称
   - Framework Preset：选择 "Next.js"
   - Root Directory：保持为空（默认）
   - Build Command：保持默认（`next build`）
   - Output Directory：保持默认（`.next`）
   - Environment Variables：点击 "Add" 按钮添加以下环境变量：
     - `NEXT_PUBLIC_SUPABASE_URL`：您的 Supabase 项目 URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`：您的 Supabase 匿名密钥

4. **部署项目**：
   - 点击 "Deploy"
   - 等待部署完成
   - 部署成功后，您会看到一个 URL，例如：`https://dunhuang-project.vercel.app`

## 步骤 5：验证部署

1. **访问部署的网站**：在浏览器中打开 Vercel 提供的 URL

2. **测试功能**：
   - 测试搜索功能
   - 测试上传功能
   - 测试审核功能（使用管理员密码 `admin123`）

3. **检查环境变量**：确保 Supabase 连接正常

## 常见问题及解决方案

### 1. Git 推送失败
- **解决方案**：检查 GitHub 仓库 URL 是否正确，确保您有推送权限

### 2. Vercel 部署失败
- **解决方案**：检查环境变量是否正确设置，确保 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已正确配置

### 3. 网站无法连接到 Supabase
- **解决方案**：检查环境变量是否与 Supabase 控制台中的值匹配，确保 Supabase 项目的 RLS 策略已正确配置

### 4. 上传功能无法正常工作
- **解决方案**：检查 Supabase 表结构是否已正确创建，确保所有必要的字段都存在

## 后续维护

- **代码更新**：每次修改代码后，使用 `git add .`、`git commit -m "Your commit message"` 和 `git push` 推送到 GitHub，Vercel 会自动重新部署

- **环境变量管理**：如果需要修改环境变量，在 Vercel 项目设置中更新

- **域名配置**：如果您有自定义域名，可以在 Vercel 项目设置中添加

恭喜！您的网站现在已经成功部署到线上，可以通过 Vercel 提供的 URL 访问。