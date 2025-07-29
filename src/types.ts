export interface EditorConfig {
  contentDir: string;
  editorPath?: string;
  allowedExtensions?: string[];
  framework?: 'next' | 'sveltekit' | 'astro';
}

export interface EditorData {
  time: number;
  blocks: EditorBlock[];
  version: string;
}

export interface EditorBlock {
  id: string;
  type: string;
  data: any;
}

export interface MarkdownFile {
  slug: string;
  content: string;
  frontmatter?: Record<string, any>;
  editorData?: EditorData;
}

export interface SaveRequest {
  slug: string;
  content: EditorData;
  contentDir: string;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
} 