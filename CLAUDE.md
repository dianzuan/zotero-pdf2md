# zotero-pdf2md

Zotero 7 插件：PDF 论文 → 高质量 Markdown 转换 + PDF 标注映射。

## 技术栈

- 基于 `windingwind/zotero-plugin-template`（TypeScript + esbuild）
- Zotero 7 Bootstrap 插件（免重启加载/卸载）
- `zotero-plugin-toolkit` 用于 UI 交互

## 开发工作流

**TDD 小步迭代，每步都验证：**
1. 写测试 → 2. 写实现 → 3. 跑测试 → 4. review → 5. commit

每个 commit 应该是一个可验证的小功能点。不做大包大揽。

## 开发命令

```bash
npm install       # 安装依赖
npm run build     # 构建 .xpi 插件文件
npm run start     # 开发模式（热重载 + 自动启动 Zotero）
npm run lint      # ESLint 检查
npm test          # 运行测试
```

## 核心设计决策

- **存储方案**: MD 存为 Zotero 附件（`Zotero.Attachments.importFromFile()`），不转 HTML 笔记。保持 PDF→MD 定位
- **图片处理**: GLM-OCR 开启 `return_crop_images: true`，下载图片转 base64 嵌入 MD（自包含，不怕 URL 过期）
- **Better Notes**: 可选增强，非依赖。检测到 BN 时可用 `Zotero.BetterNotes.api.import.fromMD()` 额外创建可编辑笔记
- **只处理文献条目**: 跳过独立 PDF 附件和笔记，只处理有 parentItem 的 PDF（生成的 MD 需要挂在文献条目下）

## 编码规则

- OCR 后端实现 `IOcrBackend` 接口（`name` + `label` + `convert()`），通过 `BackendRegistry` 注册
- 偏好设置前缀: `extensions.zotero.pdf2md.*`
- 用户可见错误用 `ztoolkit.ProgressWindow` 通知
- 调试日志用 `Zotero.log()`

## 当前进度

- Step 1~5: 已完成（空壳插件、菜单、PDF路径、后端接口、GLM-OCR）
- Step 5 待补充: 图片 base64 嵌入
- Step 6: 下一步 — MD 存为 Zotero 附件
