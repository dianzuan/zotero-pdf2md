/** Result of a single PDF-to-Markdown conversion */
export interface ConversionResult {
  markdown: string;
  pageCount?: number;
}

/** Configuration that backends may need */
export interface BackendConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  [key: string]: unknown;
}

/** Common interface for all OCR/VLM backends */
export interface IOcrBackend {
  /** Unique identifier, e.g. "glm-ocr", "mistral-ocr" */
  readonly name: string;
  /** Human-readable label for UI display */
  readonly label: string;

  /** Convert a PDF file to Markdown */
  convert(pdfPath: string, config: BackendConfig): Promise<ConversionResult>;
}

/** Singleton registry that holds all available backends */
export class BackendRegistry {
  private backends = new Map<string, IOcrBackend>();

  register(backend: IOcrBackend): void {
    this.backends.set(backend.name, backend);
  }

  get(name: string): IOcrBackend | undefined {
    return this.backends.get(name);
  }

  list(): string[] {
    return [...this.backends.keys()];
  }

  has(name: string): boolean {
    return this.backends.has(name);
  }
}
