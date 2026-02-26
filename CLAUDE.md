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

## 编码规则

- OCR 后端实现 `IOcrBackend` 接口，通过 `BackendRegistry` 注册
- 偏好设置前缀: `extensions.zotero.pdf2md.*`
- 用户可见错误用 `ztoolkit.ProgressWindow` 通知
- 调试日志用 `Zotero.log()`
