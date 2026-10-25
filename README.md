# Writers Outline

## Overview

A GUI tool for writers to interact with a JSON outline file. Browse chapters, filter lines by tag, annotate lines with typed notes, and drag-and-drop to reorder — all changes auto-save back to the source file.

## Setup

```
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Adding your outline file

Place your `.json` file in the `data/` directory. The app will auto-detect it on startup.

- If there is only one file in `data/`, it loads automatically.
- If there are multiple files, a file picker card is shown on load, and a file switcher appears in the sidebar.

## JSON format

Your outline file must follow this schema:

```json
{
  "chapters": [
    {
      "chapter_number": 1,
      "lines": [
        {
          "line_number": "1.010",
          "text": "Eli leaves the stage",
          "tags": ["eli", "venue"],
          "notes": [
            { "type": "new", "text": "Some note text" }
          ]
        }
      ]
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `chapter_number` | number | Chapter identifier, shown in sidebar nav |
| `line_number` | string | Unique ID for the line (e.g. `"1.010"`) |
| `text` | string | The outline beat / line content |
| `tags` | string[] | Arbitrary tags for filtering |
| `notes` | Note[] | Annotations attached to the line |

## Features

- **Chapter navigation** — jump to any chapter from the sidebar, or view all at once
- **Tag filtering** — click tags in the sidebar to filter lines across all visible chapters; multiple tags are ANDed
- **Inline editing** — click any line text to edit it in place (Cmd+Enter to save, Esc to cancel)
- **Tags** — add and remove tags per line; hover a line to reveal the `+ tag` button
- **Notes** — attach typed annotations to any line; hover to reveal `+ note`
- **Drag-and-drop reordering** — drag lines within a chapter (disabled when tag filter is active)
- **Auto-save** — all mutations are debounced and written back to the JSON file after 1.5 seconds

## Note types

| Type | Purpose |
|---|---|
| `new` | New content to write |
| `todo` | Action item |
| `question` | Open question |
| `research` | Research needed |
| `revision` | Needs rewriting |
| `continuity` | Continuity flag |
| `cut` | Consider cutting |

## Data persistence

Changes are saved automatically to the source `.json` file in `data/` after a short delay (1.5 seconds). The sidebar shows "Saving…" while a save is in flight and "Saved" once complete. There is no undo — the JSON file is the source of truth.
