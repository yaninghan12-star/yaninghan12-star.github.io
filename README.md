# 课题组网站

用 [Hugo](https://gohugo.io) 生成的中英双语静态网站，托管在 GitHub Pages。
**内容和页面是分开的**：日常维护只需要改 `data/` 和 `content/` 里的文字文件，不用碰页面代码。
改完提交后，GitHub 会自动重新构建网站，大约 1–2 分钟后上线。

```
data/
  site.yaml           课题组名称、简介、邮箱、首页显示哪些模块
  research.yaml       研究方向
  members.yaml        成员（PI、在读、毕业）
  publications.yaml   论文
  join.yaml           招生 / 招聘
content/news/         新闻，每条一个 Markdown 文件（中英文各一份）
static/images/people/ 成员照片
i18n/zh.yaml, en.yaml 按钮、标题等界面文字
layouts/              页面模板（改设计或加新模块时才需要动）
static/css, static/js 样式和交互脚本
```

---

## 一、第一次部署（只做一次）

1. 在 GitHub 新建仓库（建议建在课题组的 Organization 下，方便交接），设为 **Public**。
2. 把本项目所有文件上传到仓库根目录。**注意要包含隐藏的 `.github` 文件夹**，推荐用下面任一方式：
   - [GitHub Desktop](https://desktop.github.com)：克隆空仓库 → 把文件复制进去 → Commit → Push；
   - 命令行：
     ```bash
     cd lab-site
     git init -b main
     git add .
     git commit -m "Initial site"
     git remote add origin https://github.com/<账号或组织>/<仓库名>.git
     git push -u origin main
     ```
3. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
4. 打开仓库的 **Actions** 标签页，等 “Deploy site” 变成绿色对勾，网址会显示在里面。
   - 仓库名为 `<账号>.github.io` → 网址 `https://<账号>.github.io/`
   - 其他仓库名 → 网址 `https://<账号>.github.io/<仓库名>/`

---

## 二、日常维护（在 GitHub 网页上就能完成）

打开要改的文件 → 右上角铅笔图标 ✏️ 编辑 → 改完点 **Commit changes**。上线前可以在 Actions 页看构建进度。

### 新成员加入
在 `data/members.yaml` 的 `members:` 下面加一段（**缩进用空格，和上下对齐**）：
```yaml
  - name: { zh: 张三, en: San Zhang }
    group: students
    role: { zh: 博士生 · 2026 级, en: PhD student · 2026 }
    focus: { zh: 转录组时间动态, en: Temporal transcriptomics }
    photo: zhangsan.jpg
```
照片上传到 `static/images/people/`（在该文件夹页面点 **Add file → Upload files**），文件名和 `photo` 一致。建议正方形、宽 400px 左右、小于 300KB。没有照片就写 `photo: ""`。

### 成员毕业
把他的 `group: students` 改成 `group: alumni`，`focus` 可以改成去向，例如 `{ zh: 现就职于 XX, en: Now at XX }`。

### 新增论文
在 `data/publications.yaml` 的 `items:` 下加一段，年份会自动分组排序：
```yaml
  - year: 2027
    title: "论文标题"
    authors: "**Zhang S**#, **Li M**#, Wang X, **PI Name***"
    journal: "Nature Methods"
    doi: "10.1038/xxxx"
    tags: [method, sc]
```
- `**名字**` 加粗表示本组成员；名字后的 `*` 表示通讯作者，`#` 表示共同一作。
- `tags` 用文件顶部 `tags:` 里定义的 id；需要新的筛选类别，就在 `tags:` 里加一行。
- 可选字段：`pdf:`（把 PDF 放到 `static/papers/` 后填 `papers/xxx.pdf`）、`code:`（代码仓库链接）。
- 带 `sample: true` 的是示例论文，替换成真实论文后删掉。

### 发布新闻
在 `content/news/` 下新建两个文件（**Add file → Create new file**），文件名相同，后缀分别是 `.zh.md` 和 `.en.md`：

`content/news/2027-01-award.zh.md`
```markdown
---
title: "张三获得 XX 奖"
date: 2027-01-15
---
这里是正文（可选）。支持 Markdown，可以插图片和链接。
```
- 只写标题不写正文：首页只显示标题。写了正文：标题可以点击进入详情页。
- 首页显示最近 5 条，超过 5 条会出现“全部动态”链接。
- 只写中文版也可以，英文页面就不显示这条。

### 修改简介、研究方向、招生信息
分别改 `data/site.yaml`、`data/research.yaml`、`data/join.yaml`，格式照着已有内容写即可。
所有 `[示例]`、`[方括号]` 都是占位内容。全部替换完后，把 `site.yaml` 里的 `placeholder_notice` 改成 `false`。

### 调整首页模块顺序、隐藏模块
改 `data/site.yaml` 里的 `sections:` 列表，顺序即显示顺序，删掉一项即隐藏。导航栏会跟着变。

---

## 三、写 YAML 的注意事项

构建失败（Actions 里出现红叉）时，九成是 YAML 格式问题：
- 缩进只能用**空格**，不能用 Tab；同一层级要对齐。
- 内容里有 `: # * [ ] { }` 等符号，或以这些符号开头时，用英文双引号包起来：`title: "Cell: a study"`。
- 中英文都写用 `{ zh: 中文, en: English }`；只写一个字符串则两种语言都显示它。

出错了点开 Actions 里失败的那次运行，日志会写明是哪个文件第几行。网站在修好之前会继续显示上一个正常版本，不会挂掉。

---

## 四、新增模块（需要一点 HTML 基础）

以“仪器平台”为例：

1. 新建数据文件 `data/facilities.yaml`：
   ```yaml
   - name: { zh: 10x Chromium 单细胞平台, en: 10x Chromium }
     desc: { zh: 用于单细胞文库构建, en: Single-cell library preparation }
   ```
2. 新建模板 `layouts/_partials/sections/facilities.html`，可以复制 `research.html` 改：
   ```html
   {{- $lang := site.Language.Lang -}}
   <section id="facilities">
     <div class="wrap">
       <div class="sec-head"><h2>{{ i18n "facilities" }}</h2></div>
       {{- range hugo.Data.facilities }}
         <h3>{{ partial "tr.html" (dict "v" .name "lang" $lang) }}</h3>
         <p>{{ partial "tr.html" (dict "v" .desc "lang" $lang) }}</p>
       {{- end }}
     </div>
   </section>
   ```
3. 在 `i18n/zh.yaml` 加 `facilities: 仪器平台`，`i18n/en.yaml` 加 `facilities: Facilities`（导航栏和标题用）。
4. 在 `data/site.yaml` 的 `sections:` 里加上 `- facilities`。

`section` 的 `id` 要和 `sections:` 里的名字一致，导航栏链接才能跳转到位。
样式统一写在 `static/css/main.css`，颜色请用文件顶部定义的变量（如 `var(--accent)`），这样深色模式也能正常显示。

---

## 五、本地预览（可选）

改动较大（比如新增模块）时，建议先在自己电脑上预览：

1. 安装 Hugo extended 版：macOS `brew install hugo`；Windows `winget install Hugo.Hugo.Extended`；也可以用 `pip install hugo`。
2. 在项目目录运行 `hugo server`，浏览器打开 http://localhost:1313 ，改文件后页面会自动刷新。

本项目使用 Hugo 0.166.0 测试通过（版本号写在 `.github/workflows/deploy.yml` 里）。

---

## 其他

- **国内访问字体**：`hugo.toml` 里 `googleFonts = false` 可关闭 Google Fonts，改用系统字体。
- **自定义域名**：Settings → Pages → Custom domain 填写域名，并按提示在域名服务商处添加 DNS 记录。
- **多人维护**：建议在 Settings → Branches 给 `main` 开启 “Require a pull request before merging”，学生提交修改，管理员审核后合并上线。
