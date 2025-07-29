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

**That's it!** 

- Visit `http://localhost:3456` to see all your posts
- Visit your website to see the floating edit widget on every page
- Click any post to edit it
- Navigate back to the list from the editor

## Commands

```bash
arjun-editor              # Auto-detect content directory
arjun-editor ./docs       # Use specific directory  
arjun-editor -p 4000      # Use specific port
arjun-editor ./blog -p 8080   # Directory + port
```

## License

MIT

ps: i made this for personal usage only because not everybody likes stuff like this :c