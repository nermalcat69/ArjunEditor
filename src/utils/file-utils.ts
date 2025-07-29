import * as fs from 'fs';
import * as path from 'path';
import { MarkdownFile, EditorData } from '../types';

const FRONTMATTER_DELIMITER = '---';

export function parseMarkdownFile(filePath: string): MarkdownFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.md');
  
  const { frontmatter, markdown } = parseFrontmatter(content);
  
  return {
    slug,
    content: markdown,
    frontmatter,
  };
}

export function writeMarkdownFile(filePath: string, data: MarkdownFile): void {
  let content = '';
  
  // Add frontmatter if it exists
  if (data.frontmatter && Object.keys(data.frontmatter).length > 0) {
    content += `${FRONTMATTER_DELIMITER}\n`;
    for (const [key, value] of Object.entries(data.frontmatter)) {
      content += `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}\n`;
    }
    content += `${FRONTMATTER_DELIMITER}\n\n`;
  }
  
  content += data.content;
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function findMarkdownFile(contentDir: string, slug: string): string | null {
  const possiblePaths = [
    path.join(contentDir, `${slug}.md`),
    path.join(contentDir, slug, 'index.md'),
    path.join(contentDir, `${slug}.mdx`),
    path.join(contentDir, slug, 'index.mdx'),
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

export function getAllMarkdownFiles(contentDir: string): string[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files: string[] = [];
  
  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(contentDir);
  return files;
}

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; markdown: string } {
  const lines = content.split('\n');
  
  if (lines[0] !== FRONTMATTER_DELIMITER) {
    return { frontmatter: {}, markdown: content };
  }
  
  const frontmatterEnd = lines.findIndex((line, index) => 
    index > 0 && line === FRONTMATTER_DELIMITER
  );
  
  if (frontmatterEnd === -1) {
    return { frontmatter: {}, markdown: content };
  }
  
  const frontmatterLines = lines.slice(1, frontmatterEnd);
  const markdownLines = lines.slice(frontmatterEnd + 1);
  
  const frontmatter: Record<string, any> = {};
  
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      
      // Try to parse as JSON, fallback to string
      try {
        frontmatter[key] = JSON.parse(value);
      } catch {
        frontmatter[key] = value;
      }
    }
  }
  
  return {
    frontmatter,
    markdown: markdownLines.join('\n').trim(),
  };
} 