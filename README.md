# PageTree

PageTree turns a `content/` folder into a navigable website.

It currently works as a client-side GitHub Pages runtime and is intended to grow into a small file-based site toolkit: the same content tree should later support both browser rendering and static HTML output with Deno.

## Why PageTree?

GitHub Pages can host static files, but it does not understand how those files should form a website. PageTree adds that missing structure: it reads a content directory, derives routes and labels from file names, builds navigation automatically and renders the selected content.

```text
GitHub Pages hosts files.
PageTree turns those files into a site structure.
```

## Current Status

Implemented:

- client-side runtime rendering,
- dynamic navigation generation,
- GitHub Pages auto-detection,
- GitHub Contents API integration,
- local directory-listing mode,
- hash-based routing,
- direct HTML loading,
- JSON rendering with external templates,
- Markdown parsing through `parseMD` for the current text-based Markdown example,
- CDN imports for `parseMD` and `vanillaTemplates`.

Planned:

- first-class `.md` support instead of the current `.txt` Markdown example,
- Kirby-inspired listed/unlisted/draft behavior,
- cleaner metadata handling from frontmatter,
- modularization of `app.js`,
- Deno-based static output into `dist/`,
- GitHub Actions deployment for static builds,
- optional parser and renderer adapters.

## Core Concepts

### Content Tree

The `content/` folder is the source of truth.

```text
content/
  01_home.html
  02_about.md
  imprint.md
  _drafts/
```

PageTree derives the site structure from that folder: pages, routes, navigation labels, metadata and template-backed data views.

### Naming Rules

The planned naming model is inspired by file-based CMSs such as Kirby.

```text
content/01_home.md      → listed page, appears in navigation as Home
content/02_projects.md  → listed page, appears in navigation as Projects
content/imprint.md      → unlisted page, routable but not in navigation
content/_drafts/page.md → draft, ignored by runtime and static builds
```

Number prefixes control navigation order. They are not shown in menu labels or public routes.

### Link Modes

PageTree needs different link styles for different output modes.

```text
Browser runtime: #home
Static build:    /home/
File/debug mode: content/01_home.md
```

Runtime mode keeps `content/` as an internal data source and uses hash routes. Static mode should generate real files and therefore real links. File mode is useful for debugging, but not ideal for public navigation because it exposes implementation details such as `content/`, prefixes and file extensions.

## Modes

### Browser Runtime Mode

Current.

In runtime mode, PageTree lists content files in the browser, builds a hash-based navigation and loads the selected file into `<main>` without a full page reload.

On standard GitHub Pages project URLs, PageTree can infer the GitHub user and repository:

```text
https://tehes.github.io/PageTree/
```

Derived config:

```text
user: Tehes
repo: PageTree
```

On custom domains or CNAME setups, the repository cannot always be inferred from the URL and should be configured explicitly:

```javascript
const config = {
    user: "Tehes",
    repo: "PageTree",
    directory: "content"
};
```

When not hosted on GitHub Pages, PageTree currently tries to read the content directory through a directory listing.

### Deno Static Build Mode

Planned.

Deno can read the local `content/` folder directly during a build:

```text
Deno.readDir("content")
```

That means static builds will not need the GitHub API, `.htaccess`, directory listing or browser-side file discovery.

Planned output:

```text
dist/
  index.html
  home/
    index.html
  about/
    index.html
```

A GitHub Actions workflow should later be able to run the Deno build and deploy `dist/` to GitHub Pages automatically.

### Optional Deno Deploy Target

Possible later.

Deno Deploy could become an additional target for static hosting or server-side rendering. It is not the core deployment model.

## Content Files

### HTML

Current.

HTML files are inserted directly into `<main>`.

```text
content/01_home.html
```

### Markdown

Partly current, partly planned.

The current prototype parses the existing text-based Markdown example with `parseMD`. First-class `.md` routing is planned next.

```md
---
title: About
date: 2024-08-24
author: Tino
---

# About

This is a Markdown page.
```

`parseMD` returns metadata from frontmatter and rendered HTML from the Markdown body. The HTML is inserted into `<main>`; the metadata can later drive document titles, route metadata, templates and static output.

### JSON

Current.

JSON is treated as a data source for templates, not as a normal page body format.

```text
content/04_products.json
templates/products.html
```

When the JSON file is loaded, PageTree fetches the matching template and renders it with `vanillaTemplates`.

Example data:

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

Matching template:

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

## Parser and Renderer Adapters

PageTree defaults to two small companion projects:

- [`parseMD`](https://github.com/Tehes/parseMD): A lightweight Markdown and frontmatter parser for browser and CDN usage.
- [`vanillaTemplates`](https://github.com/Tehes/vanillaTemplates): A lightweight HTML-based template engine for rendering JSON data with valid HTML syntax.

Planned adapter support should allow users to replace those defaults, for example with `gray-matter`, `marked`, `markdown-it` or custom parser/renderer functions.

## Configuration

Current configuration lives in `app.js`:

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

Options:

- **`startingPageName`**: The default route to load when no hash is present.
- **`standardFileType`**: The default file type used when no `data-file-type` is set on a navigation link.
- **`directory`**: The content directory to read.
- **`user`**: GitHub username, auto-detected on standard GitHub Pages URLs.
- **`repo`**: GitHub repository name, auto-detected from the URL path on standard GitHub Pages URLs.
- **`isGitHubPages`**: Detects whether the app is currently running on GitHub Pages.

## How It Works Today

The current browser runtime:

1. reads the configured content directory,
2. gets file names from the GitHub API or a directory listing,
3. strips numeric prefixes from labels,
4. builds hash navigation,
5. resolves the active hash route,
6. fetches the matching content file,
7. renders HTML, Markdown-like text or JSON content into `<main>`.

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

3. **Run locally**:

   Serve the project with any local static server.

4. **Deploy on GitHub Pages**:

   Push the project to GitHub and enable GitHub Pages in the repository settings. PageTree will detect standard GitHub Pages URLs automatically and use the GitHub API to list content files.

## Possible Standalone Menu Builder

Possible later.

The menu builder could become its own browser-first module once the API is stable. It would focus only on this chain:

```text
GitHub repository content folder
→ file list
→ parsed page entries
→ rendered <nav>
```

The Deno static builder could reuse its pure parsing functions, but not its browser-specific GitHub API and DOM code.

## Roadmap

### Runtime Cleanup

- Rename `.txt` Markdown examples to `.md`.
- Add first-class `.md` routing.
- Use frontmatter metadata for `document.title` and route metadata.
- Split `app.js` into smaller modules.

### Content Model

- Add Kirby-inspired listed/unlisted behavior.
- Ignore `_drafts/`.
- Treat JSON primarily as template data.

### Static Build

- Add Deno-based static build output to `dist/`.
- Generate real page links in static mode.
- Add GitHub Actions deployment for static builds.

### Extensibility

- Add parser and renderer adapters.
- Keep `parseMD` and `vanillaTemplates` as defaults.
- Allow alternatives such as `gray-matter`, `marked` and `markdown-it`.
- Consider extracting the menu builder into a standalone module once the API is stable.
- Document Deno Deploy as an optional future target, not the core deployment path.
