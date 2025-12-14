# 需求文档

## 介绍

该系统为 TIL (Today I Learned) 内容生成极简的静态网站。系统创建带分页的首页、使用 ULID 作为 URL 的独立页面，以及仅显示标题链接的归档页面。系统包含当源 TIL 仓库更新时的自动构建触发机制。

## 术语表

- **TIL系统**: 处理 TIL 内容的静态站点生成器
- **源仓库**: 包含 TIL markdown 文件的 GitHub 仓库 (https://github.com/zhaochunqi/til)
- **目标仓库**: 托管生成的静态页面的仓库 (til-pages)
- **ULID**: 用于 TIL 条目 URL 的通用唯一词典排序标识符
- **Notes目录**: 源仓库中包含 TIL 文件的 "notes" 文件夹
- **首页**: 显示最新 TIL 条目的主索引页面
- **独立页面**: 通过 ULID URL 访问的每个 TIL 条目的专用页面
- **归档页面**: 仅列出所有 TIL 条目标题和链接的页面
- **React组件**: 用于构建用户界面的 React 函数组件
- **react-markdown**: 用于将 markdown 内容渲染为 React 组件的库

## 需求

### 需求 1

**用户故事:** 作为访问者，我希望在首页浏览最新的 TIL 条目，以便快速查看最新的学习内容。

#### 验收标准

1. WHEN 访问者访问首页 THEN TIL系统 SHALL 显示最新的 10 个 TIL 条目
2. WHEN 首页显示条目 THEN TIL系统 SHALL 显示每个条目的完整内容而不截断
3. WHEN 条目超过 10 个 THEN TIL系统 SHALL 提供分页控件来在页面间导航
4. WHEN 使用分页 THEN TIL系统 SHALL 始终保持每页 10 个条目
5. WHEN 显示条目 THEN TIL系统 SHALL 按创建日期排序，最新的在前

### 需求 2

**用户故事:** 作为访问者，我希望通过直接 URL 访问单个 TIL 条目，以便分享和收藏特定的学习内容。

#### 验收标准

1. WHEN TIL 条目存在于 Notes目录 中 THEN TIL系统 SHALL 生成可通过 URL 模式 /[ULID] 访问的页面
2. WHEN 访问独立页面 THEN TIL系统 SHALL 显示完整的 TIL 内容而不截断
3. WHEN ULID 对应现有 TIL 条目 THEN TIL系统 SHALL 提供相应的内容页面
4. IF ULID 不对应任何 TIL 条目 THEN TIL系统 SHALL 返回 404 错误页面
5. WHEN 生成独立页面 THEN TIL系统 SHALL 从 Notes目录 中的文件名提取 ULID

### 需求 3

**用户故事:** 作为访问者，我希望以归档格式浏览所有 TIL 条目，以便快速浏览所有可用内容。

#### 验收标准

1. WHEN 访问者访问归档页面 THEN TIL系统 SHALL 将所有 TIL 条目显示为标题-链接对
2. WHEN 显示归档条目 THEN TIL系统 SHALL 仅显示每个条目的标题和可点击链接
3. WHEN 点击归档链接 THEN TIL系统 SHALL 导航到相应的独立页面
4. WHEN 归档页面加载 THEN TIL系统 SHALL 按时间顺序排序，最新的在前
5. WHEN 添加新 TIL 条目 THEN TIL系统 SHALL 自动将其包含在归档页面中

### 需求 4

**用户故事:** 作为内容维护者，我希望当 TIL 内容更新时静态站点自动重建，以便网站保持最新而无需手动干预。

#### 验收标准

1. WHEN 源仓库中的内容更新 THEN 源仓库 SHALL 触发目标仓库中的构建
2. WHEN 触发构建 THEN TIL系统 SHALL 从源仓库获取最新内容
3. WHEN 获取内容 THEN TIL系统 SHALL 使用更新的内容重新生成所有静态页面
4. WHEN 重新生成完成 THEN TIL系统 SHALL 自动部署更新的站点
5. IF 构建过程失败 THEN TIL系统 SHALL 维护之前的工作版本

### 需求 5

**用户故事:** 作为内容创建者，我希望系统从 notes 目录解析 TIL 文件，以便我的 markdown 内容正确转换为网页。

#### 验收标准

1. WHEN TIL 文件存在于 Notes目录 中 THEN TIL系统 SHALL 完全解析每个 markdown 文件
2. WHEN 解析 markdown 文件 THEN TIL系统 SHALL 将 markdown 语法转换为适当的 HTML 元素
3. WHEN 提取文件信息 THEN TIL系统 SHALL 使用文件名作为 ULID 标识符的来源
4. WHEN 处理文件元数据 THEN TIL系统 SHALL 提取创建日期以进行正确的时间排序
5. IF markdown 解析遇到错误 THEN TIL系统 SHALL 记录错误并跳过有问题的文件

### 需求 6

**用户故事:** 作为访问者，我希望网站具有清洁和极简的设计，以便专注于内容而不受干扰。

#### 验收标准

1. WHEN 任何页面加载 THEN TIL系统 SHALL 应用具有清洁排版的极简视觉设计
2. WHEN 显示内容 THEN TIL系统 SHALL 使用充足的空白和可读的字体大小
3. WHEN 存在导航元素 THEN TIL系统 SHALL 保持其简单和不突兀
4. WHEN 页面渲染 THEN TIL系统 SHALL 确保使用最少的 CSS 和 JavaScript 实现快速加载
5. WHEN 在不同设备上查看 THEN TIL系统 SHALL 在各种屏幕尺寸上保持可读性

### 需求 7

**用户故事:** 作为开发者，我希望使用 React 和 react-markdown 构建系统，以便简化 markdown 内容的渲染和组件开发。

#### 验收标准

1. WHEN 构建系统 THEN TIL系统 SHALL 使用 React 作为主要的 UI 框架
2. WHEN 渲染 markdown 内容 THEN TIL系统 SHALL 使用 react-markdown 库进行转换
3. WHEN 创建页面组件 THEN TIL系统 SHALL 使用 React 函数组件架构
4. WHEN 处理 markdown 语法 THEN react-markdown SHALL 支持标准 markdown 语法和扩展
5. WHEN 集成组件 THEN TIL系统 SHALL 确保 React组件 与 react-markdown 无缝协作