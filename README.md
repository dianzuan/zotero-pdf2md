# Zotero PDF to Markdown

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

A Zotero 7 plugin that converts PDF attachments to high-quality Markdown using OCR/VLM backends, with annotation mapping.

## Features

- **PDF to Markdown conversion** — Uses cloud APIs (GLM-OCR, Mistral OCR, Qwen-VL, Gemini Flash) or local tools (MinerU, Marker) for high-quality conversion, including formulas, tables, and multi-column layouts
- **Annotation mapping** — Maps PDF highlights and notes to corresponding positions in the converted Markdown via fuzzy text matching
- **Multiple backends** — Pluggable backend architecture supporting both cloud and local OCR/VLM services
- **Zotero integration** — Converted Markdown files are stored as Zotero child attachments

## Status

🚧 Work in progress — currently in early development.

## Development

```bash
# Install dependencies
npm install

# Build plugin (.xpi)
npm run build

# Start dev server with hot reload
npm start
```

## License

AGPL-3.0-or-later
