# PageTree

## Overview

This is a **Single-Page Application (SPA)** designed to dynamically build a navigation menu based on the content of a specified directory. The app fetches files from either a local directory or a GitHub repository, processes them, and renders them in the browser. It also features a caching mechanism that can be toggled, but it is currently disabled during testing for better control over live changes.

## Features

- **Dynamic Menu Generation**: Automatically generates a navigation menu based on files in a specified directory.
- **GitHub Integration**: Supports fetching files directly from a GitHub repository using the GitHub API when hosted on GitHub Pages.
- **Loadable HTML Templates**: HTML templates are fetched dynamically from the `/templates` directory based on the JSON data being rendered.
- **Markdown Parsing**: Supports the display of Markdown content by converting it into HTML using the `parseMd` function.
- **Frontmatter Extraction**: Extracts and processes YAML Frontmatter for Markdown files.
- **Responsive Updates**: Automatically updates the page content when navigation links are clicked.

## How It Works

PageTree operates in two main modes:
1. **Local Filesystem Mode**: Fetches file listings directly from a local directory when running locally or on a non-GitHub server.
2. **GitHub Pages Mode**: When hosted on GitHub Pages, the app uses the GitHub API to fetch files from a specific GitHub repository and directory.

### Template Loading

Instead of hard-coding HTML templates inside the main HTML file, templates are now stored in a separate `/templates` directory. When JSON data is loaded, the corresponding template is fetched and injected into the `<template>` tag dynamically.

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/PageTree.git
   cd PageTree
   ```

2. **Directory Structure**:
   Ensure that the `content/` and `templates/` directories are filled with the necessary files. File names in the `content/` directory can be prefixed with numbers to define their order in the menu, but these prefixes will not appear in the menu links.

3. **Run Locally**:
   You can run the app locally by opening the `index.html` file in your browser or serving it with a simple HTTP server:
   ```bash
   npx serve
   ```

4. **Deploy on GitHub Pages**:
   - To host the app on GitHub Pages, push the project to a GitHub repository and enable GitHub Pages in the repository settings.
   - The app will automatically detect if it is running on GitHub Pages and will fetch files using the GitHub API.

## Configuration

The configuration is stored in the `config` object within `app.js`. You can modify it to fit your needs:

```javascript
const config = {
    startingPageName: "home",             // The default page to load
    standardFileType: "html",             // Default file type if not specified
    directory: "content",                 // Directory containing content
    user: window.location.hostname.split(".")[0],  // GitHub username (autodetected)
    repo: window.location.pathname.split("/")[1],  // GitHub repository name (autodetected)
    isGitHubPages: window.location.hostname.endsWith("github.io")  // Detect GitHub Pages environment
};
```

### Customization

- **Changing the Content Directory**: You can modify the `directory` in the config object to point to a different directory for fetching content.
- **Markdown Parsing**: If you're using Markdown files, ensure that `parseMd` is correctly imported and used to process the content.
- **Adding File Types**: The app currently supports Markdown, plain text, and JSON files. You can easily extend it to support more file types by modifying the `router()` function.

## Usage Example

Once the app is up and running, it will dynamically generate the navigation menu based on the contents of the `content/` directory. Clicking on a link in the menu will load the corresponding file's content into the page without a full page reload.

### Adding Templates for JSON Files

The app also supports rendering templates for JSON data. Templates are defined within the HTML using the `<template>` tag, and the `renderTemplate` function dynamically fills them based on the structure of your JSON file.

```json
{
  "name": {
    "first": "Max",
    "last": "Mustermann"
  },
  "age": "44",
  "friends": [
    {
      "name": "Nils",
      "age": 20
    },
    {
      "name": "Teddy",
      "age": 10
    },
    {
      "name": "Nelson",
      "age": 40
    }
  ],
  "hobbies": [
    "singing",
    "dancing",
    "reading",
    "cycling"
  ],
  "profilePic": "https://www.fillmurray.com/300/300",
  "facebook": "https://de.wikipedia.org/wiki/Bill_Murray"
}
```

### Corresponding HTML Template

The following HTML template will render the JSON data:

```html
<template id="persons">
  <p>Name: <var>name.first</var> <var>name.last</var></p>
  <p>Age: <var>age</var></p>
  <p>Friends:
    <var data-loop="friends">
      <var>name</var> (<var>age</var>),
    </var>
  </p>
  <p>Hobbies:
    <ol>
      <var data-loop="hobbies">
        <li><var></var></li>
      </var>
    </ol>
  </p>
  <img src="" data-attr="src:profilePic" alt="Profile Picture">
  <a href="" data-attr="href:facebook">Wiki: <var>name.first</var> <var>name.last</var></a>
</template>
```

### Usage

When the app loads a JSON file (like `persons.json`), it automatically applies the corresponding template and renders the content into the web page. This system is flexible and works with different types of JSON data.

For example, with the `persons.json` structure mentioned above, the app will fetch the JSON file, load the appropriate template (`#persons`), and dynamically inject the data into the template tags using the `renderTemplate` function.

This allows for flexible content generation without needing to write raw HTML for each data entry, making it easy to manage and display various types of content.
```
