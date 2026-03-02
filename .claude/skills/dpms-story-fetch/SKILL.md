---
name: dpms-story-fetch
description: 从 DPMS 需求管理系统获取需求内容、附件和图片并自动保存到本地
---

# dpms-story-fetch

从 DPMS 需求详情页抓取需求信息，包括内容、附件和图片。

## 输入

用户提供的 DPMS 需求 URL（如 `http://dpms.weoa.com/#/product/xxxx/story/detail/xxxx`）

## 执行流程

### 1. 访问页面
- `navigate` 到用户提供的 URL
- `await_element` 等待 `.el-tabs__content` 加载完成

### 2. 提取信息
读取并执行 `scripts/extract-story-info.js` 获取：Story ID、标题、发布计划、附件列表

读取并执行 `scripts/extract-content-images.js` 获取：需求内容(HTML)、图片列表

### 3. 保存文件
- 创建目录：`./story/{发布计划}/{需求ID}/{attachments,assets}`
- 清理发布计划名称中的非法字符，**只保留括号前的部分**（如 "RRS-FBD-26.02.2(2026-02-05)" → "RRS-FBD-26.02.2"）
- 使用 `scripts/download_files.py` 下载附件和图片
- 保存 `files_manifest.json`

### 4. 生成 Markdown
- 解析 HTML 内容，图片插入到原始位置
- 输出的需求内容，严格按照模版输出：`templates/requirement.md.template`
- 生成 `{需求名称}_origin.md`

## 输出目录

```
./story/{发布计划(只保留括号前)}/{需求ID}/
├── {需求名称}_origin.md
├── files_manifest.json
├── attachments/
└── assets/
```

## 脚本

| 脚本 | 说明 |
|------|------|
| `scripts/extract-story-info.js` | 提取基础信息 |
| `scripts/extract-content-images.js` | 提取内容和图片 |
| `scripts/download_files.py` | 下载文件 |

## 依赖

- Chrome 浏览器（superpowers-chrome 插件）
- Python 3.x