# PageTree

PageTree turns a content folder into a navigable website.

It currently runs as a client-side GitHub Pages app and is designed to grow into a small file-based site toolkit: the same content tree should be usable for browser rendering and, later, for static HTML output with Deno.

## Core Idea

GitHub Pages can host files. PageTree adds the missing structure around them:

```text
content/
  01_home.html
  02_about.md
  imprint.md
  _drafts/
```

From that folder, PageTree can build:

- navigation links
- clean route names
- rendered page content
- metadata from Markdown frontmatter
- data-driven views from JSON files and templates

The content folder becomes the source of truth for the site.

## Current Status

PageTree is currently a browser-based runtime prototype. It dynamically reads a configured content directory, builds a navigation menu and renders the selected content into the page without a full reload.

The planned next step is a Deno-based static build mode that reads the same content folder and writes real HTML pages into a `dist/` directory.

## Related Projects

PageTree uses two small companion projects:

- [`parseMD`](https://github.com/Tehes/parseMD): A lightweight Markdown and frontmatter parser for browser and CDN usage.
- [`vanillaTemplates`](https://github.com/Tehes/vanillaTemplates): A lightweight HTML-based template engine for rendering JSON data with valid HTML syntax.

## Features

- **Dynamic Menu Generation**: Automatically generates a navigation menu based on files in a specified content directory.
- **GitHub Pages Integration**: Uses the GitHub API to fetch repository content when hosted on GitHub Pages.
- **Local Directory Mode**: Can read a directory listing when served from a local or non-GitHub server that exposes indexes.
- **Markdown Parsing**: Converts Markdown content into HTML using `parseMD`.
- **Frontmatter Extraction**: Reads simple frontmatter from Markdown files for metadata such as title, date and author.
- **Raw HTML Content**: Loads HTML files directly into the page body.
- **JSON Templates**: Loads JSON data and renders it with external HTML templates using `vanillaTemplates`.
- **Hash-Based Runtime Routing**: Uses clean hash routes such as `#home` while keeping content files in the `content/` directory.

## Modes

### Browser Runtime Mode

This is the current mode.

```text
content/01_home.html
→ menu item: Home
→ route: #home
→ loaded into <main>
```

When hosted on GitHub Pages, PageTree detects the repository from the current URL and uses the GitHub Contents API to list files in the configured content directory.

### Planned Deno Static Build Mode

The planned static mode should use the same content structure, but build real HTML files ahead of time:

```text
content/01_home.md
→ dist/home/index.html
```

In this mode, the navigation can use real links instead of hash routes:

```html
<a href="/home/">Home</a>
```

## How It Works

PageTree operates in two current runtime environments:

1. **Local Directory Mode**: Fetches file listings from a local directory when running locally or on a non-GitHub server that exposes directory indexes.
2. **GitHub Pages Mode**: Uses the GitHub Contents API to fetch files from a specific GitHub repository and directory.

The app then:

1. reads the available files,
2. strips numeric prefixes from menu labels,
3. builds navigation links,
4. resolves the active hash route,
5. fetches the matching content file,
6. renders HTML, Markdown or JSON content into `<main>`.

## Installation and Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Tehes/PageTree.git
   cd PageTree
   ```

2. **Create your content structure**:

   ```text
   content/
     01_home.html
     02_about.md
     04_products.json
   templates/
     products.html
   ```

   File names in the `content/` directory can be prefixed with numbers to define their order in the menu. These prefixes are not shown in the rendered navigation.

3. **Run locally**:

   Use a local static server. For example:

   ```bash
   npx serve
   ```

4. **Deploy on GitHub Pages**:

   Push the project to GitHub and enable GitHub Pages in the repository settings. PageTree will detect GitHub Pages automatically and use the GitHub API to list the content files.

## Configuration

The configuration is stored in the `config` object within `app.js`:

```javascript
const config = {
    startingPageName: "home",
    standardFileType: "html",
    directory: "content",
    user: globalThis.location.hostname.split(".")[0],
    repo: globalThis.location.pathname.split("/")[1],
    isGitHubPages: globalThis.location.hostname.endsWith("github.io")
};
```

### Options

- **`startingPageName`**: The default route to load when no hash is present.
- **`standardFileType`**: The default file type used when no `data-file-type` is set on a navigation link.
- **`directory`**: The content directory to read.
- **`user`**: GitHub username, auto-detected on GitHub Pages.
- **`repo`**: GitHub repository name, auto-detected from the URL path.
- **`isGitHubPages`**: Detects whether the app is currently running on GitHub Pages.

## Content Files

### HTML

HTML files are inserted directly into `<main>`:

```text
content/01_home.html
```

### Markdown

Markdown files are parsed with `parseMD`. The rendered HTML is inserted into `<main>`, while frontmatter can be used as metadata.

```md
---
title: About
date: 2024-08-24
author: Tino
---

# About

This is a Markdown page.
```

### JSON

JSON files are rendered with an external template from the `templates/` directory.

For example:

```text
content/04_products.json
templates/products.html
```

When the JSON file is loaded, PageTree fetches the matching template and renders it with `vanillaTemplates`.

## JSON Template Example

```json
{
  "products": [
    {
      "Name": "Cheese",
      "Price": 2.5,
      "Location": "Refrigerated foods"
    },
    {
      "Name": "Chocolate",
      "Price": 1.5,
      "Location": "the Snack isle"
    }
  ]
}
```

A matching template could look like this:

```html
<ul>
  <var data-loop="products">
    <li>
      <strong><var>Name</var></strong>
      <span><var>Price</var></span>
      <small><var>Location</var></small>
    </li>
  </var>
</ul>
```

## Roadmap

- Rename `.txt` Markdown examples to `.md`.
- Split `app.js` into smaller modules.
- Add Kirby-inspired listed/unlisted behavior:
  - numbered files appear in navigation,
  - unnumbered files are routable but not listed,
  - `_drafts/` is ignored.
- Add cleaner metadata handling from frontmatter.
- Add Deno-based static build output to `dist/`.
- Add GitHub Actions deployment for the static build mode.
- Consider extracting the menu builder into a standalone module once the API is stable.
