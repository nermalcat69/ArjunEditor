# arjun-editor

A localhost only markdown editor for Next.js, SvelteKit, and Astro apps.

Specifically for people who don't want to use a CMS just for editing.

## Setup

```bash
pnpm add -D arjun-editor
```

Add to `package.json`:
```json
{
  "scripts": {
    "edit:start": "arjun-editor"
  }
}
```

## Usage

Start the editor:
```bash
pnpm run edit:start
# or
pnpm start  
# or
arjun-editor
```

**That's it!** Visit your website - you'll see a floating edit widget on every page.

## Commands

```bash
arjun-editor              # Auto-detect content directory
arjun-editor ./docs       # Use specific directory  
arjun-editor -p 4000      # Use specific port
arjun-editor ./blog -p 8080   # Directory + port
```

## Alternative Setup Options

**One-line setup:**
```ts
import { setup } from 'arjun-editor';
setup('./content');
```

**Auto-setup:**
```ts
import 'arjun-editor/auto';
```

**Manual framework integration:**
```ts
// Next.js
import { createEditorMiddleware } from 'arjun-editor/nextjs';

// SvelteKit  
import { createEditorHandle } from 'arjun-editor/sveltekit';

// Astro
import { markdownEditor } from 'arjun-editor/astro';
```

ps: i made this for personal usage only because not everybody likes stuff like this :c