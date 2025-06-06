# Personal Website & Blog of Srinivas Raghav V C

This repository contains the source code for my personal website, blog, and image gallery. It's designed to be a simple, lightweight, and customizable static site.

## Features

*   **Responsive Design:** Adapts to various screen sizes for a good viewing experience on desktops, tablets, and mobile devices.
*   **Dark Mode:** Includes a user-toggleable dark mode for comfortable viewing in low-light environments. Theme preference is saved in localStorage.
*   **Dynamic Blog:** Blog posts are written in Markdown with YAML-like frontmatter and are dynamically loaded into the blog page.
*   **Image Gallery:** A dedicated gallery page displays images with captions and dates, sourced from a JSON data file.
*   **KaTeX Math Rendering:** Supports mathematical notation rendering using KaTeX.
*   **Markdown-Driven Content:** Most page content (like "About Me", intro blurbs, and blog posts) is written in Markdown and rendered dynamically.
*   **Asset Optimization:** Uses minified CSS and JavaScript files. Recommendations for image optimization are included.

## Project Structure

```
.
├── index.html            # Home page
├── about.html            # About Me page
├── blog.html             # Blog listing page
├── gallery.html          # Image gallery page
├── post.html             # Template for individual blog posts
├── life_in_weeks.html    # Specialized page
├── misc.html             # Miscellaneous links/resources list page
├── quotes_display.html   # Page to display quotes
├── resource.html         # Template for individual resource items
├── style.css             # Main stylesheet (source)
├── style.min.css         # Minified stylesheet (linked in HTML)
├── js/
│   ├── main.js           # Main JavaScript file (source)
│   └── main.min.js       # Minified JavaScript file (linked in HTML)
├── content/
│   ├── about-me.md       # Markdown for the About Me page
│   ├── home-intro.md     # Markdown for the home page introduction
│   ├── intro-blurb.md    # Markdown for the sidebar introduction
│   ├── gallery_data.json # JSON data for the image gallery
│   └── quotes.md         # Markdown file containing quotes
│   └── ...               # Other .md files for content
├── posts/
│   ├── your-post-slug.md # Example blog post in Markdown
│   ├── image.jpg         # Example image associated with a post or gallery
│   └── ...               # Other blog posts and images
└── README.md             # This file
```

## Adding Content

### Adding a New Blog Post

1.  **Create Markdown File:**
    *   Create a new `.md` file in the `posts/` directory (e.g., `posts/my-new-article.md`).
2.  **Add Frontmatter:**
    *   At the very beginning of your new Markdown file, add frontmatter enclosed in `---` delimiters. This metadata is crucial for how the post is displayed.
    *   **Structure:**
        ```yaml
        ---
        title: "Your Blog Post Title"
        date: "YYYY-MM-DD"  # e.g., "2024-03-15"
        author: "Your Name" # Optional, defaults to "Srinivas Raghav V C"
        slug: "your-unique-post-slug" # URL-friendly, e.g., "my-new-article"
        summary: "A brief summary of your post for the blog listing page."
        image: "posts/optional-path-to-featured-image.jpg" # Optional
        tags: ["tag1", "another tag", "example"] # Optional
        ---

        (Your Markdown blog content starts here...)
        ```
    *   **Important:**
        *   The `slug` must be unique for each post and should match the filename (without the `.md` extension) for the current setup to work correctly when navigating to the post.
        *   Ensure the `date` format is `YYYY-MM-DD`.
3.  **Update Blog Post List (Manual Step):**
    *   Open the `js/main.min.js` file (or `js/main.js` if you are developing and will re-minify).
    *   Locate the `initBlogPage` function.
    *   Inside this function, find the `blogPostFiles` array.
    *   Add the path to your new Markdown file to this array. For example:
        ```javascript
        // Inside initBlogPage function:
        const blogPostFiles = [
            'posts/essay_on_life.md',
            'posts/poem.md',
            'posts/your-new-article.md' // Add your new file here
        ];
        ```
    *   *Note: This manual step is a limitation of the current static site setup. A more advanced setup might use a build script or a server-side component to automatically discover posts.*

### Adding Images to the Gallery

1.  **Add Image File:**
    *   Place your new image file in a suitable directory. Currently, images from `posts/` are used, but you could create a dedicated `gallery_images/` folder. For consistency, let's assume you might place it in `posts/` or a subfolder like `posts/gallery_specific/`.
2.  **Update Gallery Data:**
    *   Open the `content/gallery_data.json` file.
    *   Add a new JSON object for your image to the existing array.
    *   **Structure for each image object:**
        ```json
        {
          "id": "uniqueImageID00X", // Make this unique
          "path": "posts/path/to/your/image.jpg", // Correct path to the image
          "caption": "A descriptive caption for the image.",
          "date": "YYYY-MM-DD", // Date image was taken or added
          "tags": ["new-image", "category", "example"]
        }
        ```
    *   Ensure the JSON syntax remains valid (e.g., commas between objects, no trailing comma after the last object in the array).

## Development & Customization

*   **Styling:** Main styles are defined in `style.css`. The site links to `style.min.css`, which is the minified version. Edit `style.css` for changes, then re-minify.
*   **JavaScript:** Core functionality is in `js/main.js`. The site links to `js/main.min.js`. Edit `js/main.js` for changes, then re-minify.
*   **Libraries Used:**
    *   [Marked.js](https://marked.js.org/): For converting Markdown to HTML.
    *   [KaTeX](https://katex.org/): For rendering mathematical formulas.
    *   [Prism.js](https://prismjs.com/): For syntax highlighting in code blocks (used on post pages).

## Asset Optimization

*   **CSS & JavaScript:** The linked `style.min.css` and `js/main.min.js` are basic minified versions of their source files.
*   **Images:** It is highly recommended to optimize all images (JPEGs, PNGs) before adding them to the site to improve loading speed. Tools like `jpegoptim`, `optipng`, `pngquant`, or online services like TinyPNG/TinyJPG can be used. Consider converting PNGs to JPEGs if transparency is not needed. Resize images to appropriate dimensions for their display context.

## License

Currently, no license is specified. Consider adding an MIT License if this project is to be shared or adapted by others. You can do this by adding a `LICENSE` file with the MIT License text.
