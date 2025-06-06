// js/main.js
// Shared utility functions for the website

/**
 * Formats a Date object into "11th April 2025" style.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    // Basic check for valid Date object
    if (!(date instanceof Date) || isNaN(date)) {
        console.warn("formatDate received an invalid date:", date);
        // Provide a fallback to today's date
        date = new Date();
    }

    const day = date.getDate();
    let suffix = 'th';
    // Correct logic for suffixes (handles 11, 12, 13 correctly)
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    else if (day % 10 === 2 && day !== 12) suffix = 'nd';
    else if (day % 10 === 3 && day !== 13) suffix = 'rd';

    // Ensure month name is retrieved correctly
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();

    return `${day}${suffix} ${month} ${year}`;
}


/**
 * Fetches a Markdown file and renders it into a target HTML element using marked.js.
 * Handles basic loading and error states. Includes optional KaTeX and Prism rendering.
 * @param {string} file - The path to the Markdown file.
 * @param {string} targetElementId - The ID of the HTML element to render into.
 * @param {boolean} [renderMath=false] - Optionally trigger KaTeX rendering after loading.
 * @param {boolean} [highlightCode=false] - Optionally trigger Prism highlighting after loading.
 */
async function loadMarkdownContent(file, targetElementId, renderMath = false, highlightCode = false) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        console.error(`Target element with ID "${targetElementId}" not found.`);
        return; // Stop execution if target element doesn't exist
    }

    targetElement.innerHTML = '<p>Loading...</p>'; // Provide loading feedback

    try {
        // Check if marked library is loaded and ready
        if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
            throw new Error('Markdown rendering library (marked.js) is not loaded or not ready.');
        }

        const response = await fetch(file);
        if (!response.ok) {
            // Improve error message with status and file path
            throw new Error(`HTTP error! Status: ${response.status} while fetching ${file}`);
        }
        const markdown = await response.text();

        // Render markdown content
        targetElement.innerHTML = marked.parse(markdown, { mangle: false, headerIds: false });

        // --- Optional Post-Processing ---

        // Render Math (KaTeX) if requested and available
        if (renderMath) {
            // Check if KaTeX auto-render function is available
            if (typeof renderMathInElement === 'function') {
                try {
                    renderMathInElement(targetElement, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false }
                        ],
                        throwOnError: false // Don't stop rendering if one equation fails
                    });
                } catch (mathError) {
                    console.error("KaTeX rendering failed:", mathError);
                    // Optionally display a user-friendly message in the UI
                }
            } else {
                console.warn('KaTeX (renderMathInElement) function not found, cannot render math.');
            }
        }

        // Highlight Code (Prism) if requested and available
        if (highlightCode) {
            // Check if Prism core and autoloader/highlighting function is available
            if (typeof Prism !== 'undefined' && typeof Prism.highlightAllUnder === 'function') {
                try {
                    Prism.highlightAllUnder(targetElement);
                } catch (codeError) {
                    console.error("Prism highlighting failed:", codeError);
                    // Optionally display a user-friendly message
                }
            } else {
                console.warn('Prism (highlightAllUnder function) not found, cannot highlight code.');
            }
        }

    } catch (error) {
        console.error(`Error loading or processing markdown file ${file}:`, error);
        // Display a more informative error message in the target element
        targetElement.innerHTML = `<p style="color: red;">Error loading content from ${file}: ${error.message}. Please check the file path and network connection.</p>`;
    }
}

/**
 * Parses frontmatter from a markdown string.
 * @param {string} markdownText - The raw markdown text.
 * @returns {object} An object with 'metadata' (parsed frontmatter) and 'content' (markdown after frontmatter).
 */
function parseFrontmatter(markdownText) {
    const frontmatterRegex = /^---\s*[\r\n]([\s\S]*?)[\r\n]---\s*[\r\n]([\s\S]*)$/;
    const match = markdownText.match(frontmatterRegex);

    if (!match) {
        return { metadata: {}, content: markdownText };
    }

    const frontmatterBlock = match[1];
    const content = match[2] || ''; // Ensure content is a string even if empty
    const metadata = {};

    frontmatterBlock.split(/[\r\n]+/).forEach(line => {
        const parts = line.match(/^([^:]+):\s*(.*)$/);
        if (parts) {
            const key = parts[1].trim();
            let value = parts[2].trim();

            // Attempt to parse simple arrays (e.g., tags: [tag1, "tag two"])
            if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    // A more robust YAML parser would be better for complex cases,
                    // but this handles simple arrays of strings.
                    value = JSON.parse(value.replace(/'/g, '"')); // Replace single with double quotes for JSON compatibility
                } catch (e) {
                    console.warn(`Could not parse array for key "${key}": ${value}. Keeping as string. Error: ${e.message}`);
                    // Keep as string if parsing fails
                }
            } else if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1); // Remove surrounding quotes
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.substring(1, value.length - 1); // Remove surrounding quotes
            }
            // Basic type conversion for numbers and booleans, if not quoted
            else if (!isNaN(value) && value.trim() !== '') {
                 // Check if it's not just a string of digits that should remain a string (e.g. version numbers)
                 // This simple check might convert things like "2024-03-15" into numbers if not quoted.
                 // For robust typing, explicit quoting in YAML or a proper YAML parser is better.
                 // For now, we'll assume if it's a pure number, convert it.
                 if (String(Number(value)) === value) {
                    value = Number(value);
                 }
            } else if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            }
            metadata[key] = value;
        }
    });

    // Provide default author if not specified
    if (!metadata.author) {
        metadata.author = "Srinivas Raghav V C";
    }

    return { metadata, content };
}

/**
 * Fetches and parses frontmatter for a list of post files.
 * @param {string[]} postFilesArray - An array of paths to markdown post files.
 * @returns {Promise<object[]>} A promise that resolves to an array of metadata objects.
 */
async function fetchAllPostMetadata(postFilesArray) {
    const allMetadata = [];

    for (const filePath of postFilesArray) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                console.warn(`Could not fetch ${filePath}. Status: ${response.status}`);
                // Optionally, add a placeholder or skip this post
                allMetadata.push({
                    title: `Error loading: ${filePath.split('/').pop()}`,
                    slug: filePath.split('/').pop().replace('.md', ''),
                    date: 'N/A',
                    summary: `Failed to load content for this post.`,
                    error: true
                });
                continue;
            }
            const markdownText = await response.text();
            const { metadata, content } = parseFrontmatter(markdownText); // Use the new parseFrontmatter

            // Add filename or slug to metadata if not already present, for linking
            if (!metadata.slug) {
                metadata.slug = filePath.split('/').pop().replace('.md', '');
            }
            // Include the raw content length or a flag if content is empty, for diagnostics
            metadata.contentLength = content.length;
            metadata.filePath = filePath; // Keep track of original file path

            allMetadata.push(metadata);
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
            // Optionally, add a placeholder for posts that failed to process
            allMetadata.push({
                title: `Error processing: ${filePath.split('/').pop()}`,
                slug: filePath.split('/').pop().replace('.md', ''),
                date: 'N/A',
                summary: `Failed to parse metadata for this post.`,
                error: true,
                errorMessage: error.message
            });
        }
    }
    return allMetadata;
}

/**
 * Displays blog posts on the blog page.
 * @param {object[]} postsMetadataArray - Array of post metadata objects.
 * @param {string} containerId - ID of the HTML element to display posts in.
 */
function displayBlogPosts(postsMetadataArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Blog posts container with ID "${containerId}" not found.`);
        return;
    }

    container.innerHTML = ''; // Clear loading message or previous content

    if (!postsMetadataArray || postsMetadataArray.length === 0) {
        container.innerHTML = '<p>No posts available at the moment. Check back soon!</p>';
        return;
    }

    // Optional: Sort posts by date if not already sorted (most recent first)
    postsMetadataArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    postsMetadataArray.forEach(post => {
        if (post.error) { // Skip posts that had loading/parsing errors
            const errorPostElement = document.createElement('div');
            errorPostElement.className = 'blog-post-item blog-post-error';
            errorPostElement.innerHTML = `
                <h3>Error loading post: ${post.title || 'Unknown Title'}</h3>
                <p>${post.summary || 'Could not load details for this post.'}</p>
            `;
            container.appendChild(errorPostElement);
            return; // Skip to the next post
        }

        const postElement = document.createElement('div');
        postElement.className = 'blog-post-item'; // Add a class for styling list items

        let imageHtml = '';
        if (post.image) {
            imageHtml = `<img src="${post.image}" alt="${post.title}" class="blog-post-image">`;
        }

        // Use formatDate if available and date is valid
        let formattedDate = post.date;
        if (typeof formatDate === 'function' && post.date && !isNaN(new Date(post.date))) {
            formattedDate = formatDate(new Date(post.date));
        }


        postElement.innerHTML = `
            ${imageHtml}
            <h3 class="blog-post-title"><a href="post.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a></h3>
            <p class="blog-post-meta">By ${post.author || 'Srinivas Raghav V C'} on ${formattedDate}</p>
            <p class="blog-post-summary">${post.summary || 'No summary available.'}</p>
            <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="read-more-link">Read more &rarr;</a>
        `;
        container.appendChild(postElement);
    });
}

/**
 * Initializes the blog page by fetching metadata and displaying posts.
 */
async function initBlogPage() {
    // For now, hardcode the list of known blog post files.
    // In a real setup, this could come from a manifest.json or server-side listing.
    const blogPostFiles = [
        'posts/essay_on_life.md',
        'posts/poem.md'
        // Add other post file paths here as they get frontmatter
    ];

    const postsContainerId = 'blog-posts-container';
    const container = document.getElementById(postsContainerId);
    if (!container) { // Only run if the container exists (i.e., we are on blog.html)
        return;
    }

    container.innerHTML = '<p>Loading posts, please wait...</p>'; // Initial loading message

    try {
        const postsMetadata = await fetchAllPostMetadata(blogPostFiles);
        displayBlogPosts(postsMetadata, postsContainerId);
    } catch (error) {
        console.error("Error initializing blog page:", error);
        if(container) container.innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
    }
}

/**
 * Loads and displays a single blog post based on slug from URL.
 */
async function loadBlogPost() {
    const contentElement = document.getElementById('content'); // Main content area for markdown
    const titleDisplayElement = document.getElementById('post-title-display'); // For H2 display
    const dateDisplayElement = document.getElementById('post-date-display'); // For date display
    const pageTitleElement = document.querySelector('title'); // HTML <title> tag

    if (!contentElement || !titleDisplayElement || !dateDisplayElement || !pageTitleElement) {
        console.error('Required elements for displaying the post are not found on the page.');
        if(contentElement) contentElement.innerHTML = '<p>Error: Post display elements missing. Cannot load post.</p>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        pageTitleElement.textContent = 'Error - Post Not Specified';
        titleDisplayElement.textContent = 'Post Not Found';
        dateDisplayElement.textContent = '';
        contentElement.innerHTML = '<p>Error: No post slug provided in the URL. Please select a post from the blog listing.</p>';
        return;
    }

    // Convention: slug is the filename without .md, directly in posts/ directory.
    const mdFilePath = `posts/${slug}.md`;

    try {
        const response = await fetch(mdFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} while fetching ${mdFilePath}`);
        }
        const markdownText = await response.text();
        const { metadata, content } = parseFrontmatter(markdownText); // Assuming parseFrontmatter is defined

        // Populate HTML elements with metadata
        pageTitleElement.textContent = `${metadata.title || 'Blog Post'} - Srinivas Raghav V C`;
        titleDisplayElement.textContent = metadata.title || 'Untitled Post';

        if (metadata.date) {
            // Use formatDate if available and the date is valid
            dateDisplayElement.textContent = (typeof formatDate === 'function' && !isNaN(new Date(metadata.date)))
                ? formatDate(new Date(metadata.date))
                : metadata.date;
        } else {
            dateDisplayElement.textContent = 'Date not available';
        }

        // Render Markdown content
        if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
            contentElement.innerHTML = marked.parse(content, { mangle: false, headerIds: false });
        } else {
            throw new Error('Markdown parser (marked.js) is not available.');
        }

        // Optional: Render Math (KaTeX) if available and needed
        if (typeof renderMathInElement === 'function') {
            try {
                renderMathInElement(contentElement, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false }
                    ],
                    throwOnError: false
                });
            } catch (mathError) {
                console.error("KaTeX rendering failed for post content:", mathError);
            }
        }

        // Optional: Highlight Code (Prism) if available and needed
        if (typeof Prism !== 'undefined' && typeof Prism.highlightAllUnder === 'function') {
            try {
                Prism.highlightAllUnder(contentElement); // Target only the post content area
            } catch (codeError) {
                console.error("Prism highlighting failed for post content:", codeError);
            }
        }

    } catch (error) {
        console.error(`Error loading post "${slug}":`, error);
        pageTitleElement.textContent = 'Error Loading Post - Srinivas Raghav V C';
        titleDisplayElement.textContent = 'Error Loading Post';
        dateDisplayElement.textContent = '';
        contentElement.innerHTML = `<p>Sorry, there was an error loading the post titled "${slug}". Please check the console for details or try returning to the blog. Error: ${error.message}</p>`;
    }
}

/**
 * Initializes the single post page by calling loadBlogPost.
 */
function initPostPage() {
    // This function is called if the specific elements for a post page are present.
    loadBlogPost();
}

/**
 * Fetches gallery data from a JSON file.
 * @param {string} jsonPath - Path to the gallery JSON data file.
 * @returns {Promise<object[]>} A promise that resolves to an array of image objects.
 */
async function fetchGalleryData(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} while fetching ${jsonPath}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching gallery data:", error);
        return []; // Return empty array on error
    }
}

/**
 * Displays gallery images on the page.
 * @param {object[]} imagesArray - Array of image objects from gallery_data.json.
 * @param {string} containerId - ID of the HTML element to display images in.
 */
function displayGalleryImages(imagesArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Gallery container with ID "${containerId}" not found.`);
        return;
    }

    container.innerHTML = ''; // Clear loading message or previous content

    if (!imagesArray || imagesArray.length === 0) {
        container.innerHTML = '<p>No images available in the gallery at the moment.</p>';
        return;
    }

    imagesArray.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        // Add data attributes for lightbox if implementing later
        // galleryItem.setAttribute('data-image-path', image.path);
        // galleryItem.setAttribute('data-caption', image.caption);


        const imgElement = document.createElement('img');
        imgElement.src = image.path;
        imgElement.alt = image.caption || 'Gallery image';
        // imgElement.loading = 'lazy'; // Add lazy loading

        const captionElement = document.createElement('figcaption');
        captionElement.className = 'gallery-caption';
        captionElement.textContent = image.caption;

        const dateElement = document.createElement('p');
        dateElement.className = 'gallery-image-date';
        dateElement.textContent = image.date ? formatDate(new Date(image.date)) : '';


        galleryItem.appendChild(imgElement);
        galleryItem.appendChild(captionElement);
        galleryItem.appendChild(dateElement);
        container.appendChild(galleryItem);
    });
}

/**
 * Initializes the gallery page.
 */
async function initGalleryPage() {
    const galleryContainerId = 'gallery-container';
    const container = document.getElementById(galleryContainerId);
    if (!container) { // Only run if the gallery container exists
        return;
    }

    container.innerHTML = '<p>Loading images, please wait...</p>';

    const galleryDataPath = 'content/gallery_data.json';
    try {
        const imagesData = await fetchGalleryData(galleryDataPath);
        displayGalleryImages(imagesData, galleryContainerId);
    } catch (error) {
        console.error("Error initializing gallery page:", error);
        if(container) container.innerHTML = '<p>Error loading images. Please try again later.</p>';
    }
}


/**
 * Sets up the dark mode toggle functionality.
 * Checks localStorage for saved theme, applies it, and adds event listener to the toggle button.
 */
function setupDarkModeToggle() {
    const toggleButton = document.getElementById('darkModeToggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme or system preference
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
    } else if (currentTheme === 'light') {
        body.classList.remove('dark-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
        // Optional: Do not save system preference to localStorage immediately, let user toggle first
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            // Optional: Update button text/icon here if desired
            // e.g., toggleButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });
    } else {
        console.warn('Dark mode toggle button with id "darkModeToggle" not found.');
    }
}

// General initialization that should run on all pages
document.addEventListener('DOMContentLoaded', () => {
    // Setup dark mode toggle as soon as the DOM is ready
    if (typeof setupDarkModeToggle === 'function') {
        setupDarkModeToggle();
    }

    // Example: Update date on pages that have a 'current-date' element
    // This part can be made more robust or page-specific if needed
    const dateElement = document.getElementById('current-date');
    if (dateElement && typeof formatDate === 'function') {
        dateElement.textContent = formatDate(new Date());
    }

    // Initialize blog page if on blog.html (check for specific container)
    if (document.getElementById('blog-posts-container')) {
        if (typeof initBlogPage === 'function') {
            initBlogPage();
        } else {
            console.error('initBlogPage function not found for blog page.');
            const postsContainer = document.getElementById('blog-posts-container');
            if(postsContainer) postsContainer.innerHTML = '<p>Error: Blog listing script not found.</p>';
        }
    }

    // Initialize single post page if on post.html (check for specific elements)
    // The check for elements is now implicitly done by initPostPage calling loadBlogPost,
    // which itself checks for elements. We just need to ensure initPostPage is called.
    // A more robust check could be `if (window.location.pathname.endsWith('post.html'))`
    // or by checking for the presence of a unique ID only on post.html.
    // For now, checking for 'post-title-display' is a good proxy.
    if (document.getElementById('post-title-display')) { // Indicates it's a single post page
         if (typeof initPostPage === 'function') {
            initPostPage();
        } else {
            console.error('initPostPage function not found for post page.');
            const contentArea = document.getElementById('content');
            if(contentArea) contentArea.innerHTML = '<p>Error: Post loading script not found.</p>';
        }
    }

    // Initialize gallery page if on gallery.html
    if (document.getElementById('gallery-container')) {
        if (typeof initGalleryPage === 'function') {
            initGalleryPage();
        } else {
            console.error('initGalleryPage function not found for gallery page.');
            const galleryContainer = document.getElementById('gallery-container');
            if(galleryContainer) galleryContainer.innerHTML = '<p>Error: Gallery loading script not found.</p>';
        }
    }

    // Other global initializations can go here

    // --- Temporary Testing for Frontmatter Parsing ---
    console.log("--- Testing Frontmatter Parsing ---");

    // Test case 1: parseFrontmatter
    const testMarkdownWithFrontmatter = `---
title: "Test Title"
date: "2024-01-01"
slug: "test-slug"
tags: ["test", "example"]
customField: true
---
This is the actual content.
`;
    const parsedResult = parseFrontmatter(testMarkdownWithFrontmatter);
    console.log("Parsed Frontmatter Result:", parsedResult);
    if (parsedResult.metadata.title === "Test Title" && parsedResult.metadata.tags && parsedResult.metadata.tags.length === 2 && parsedResult.content.includes("actual content")) {
        console.log("parseFrontmatter basic test: PASSED");
    } else {
        console.error("parseFrontmatter basic test: FAILED", parsedResult);
    }

    const testMarkdownWithoutFrontmatter = "Just some content without frontmatter.";
    const parsedResultNoFM = parseFrontmatter(testMarkdownWithoutFrontmatter);
    console.log("Parsed No-Frontmatter Result:", parsedResultNoFM);
    if (Object.keys(parsedResultNoFM.metadata).length === 1 && parsedResultNoFM.metadata.author === "Srinivas Raghav V C" && parsedResultNoFM.content === testMarkdownWithoutFrontmatter) {
        // Expecting only default author if no frontmatter
        console.log("parseFrontmatter no-frontmatter test: PASSED");
    } else {
        console.error("parseFrontmatter no-frontmatter test: FAILED", parsedResultNoFM);
    }

    // Test case 2: fetchAllPostMetadata
    const testPostFiles = ['posts/essay_on_life.md', 'posts/poem.md'];
    if (typeof fetchAllPostMetadata === 'function') {
        console.log("Testing fetchAllPostMetadata with:", testPostFiles);
        fetchAllPostMetadata(testPostFiles)
            .then(allMeta => {
                console.log("fetchAllPostMetadata Result:", allMeta);
                if (allMeta && allMeta.length === 2) {
                    const essayMeta = allMeta.find(m => m.slug === "essay-on-reflection-of-life");
                    const poemMeta = allMeta.find(m => m.slug === "poem-1-fighting-the-man-inside");
                    if (essayMeta && essayMeta.title === "An Essay on a Reflection of Life at This Point" && poemMeta && poemMeta.summary) {
                        console.log("fetchAllPostMetadata test: PASSED");
                    } else {
                        console.error("fetchAllPostMetadata test: FAILED - metadata content mismatch", allMeta);
                    }
                } else {
                    console.error("fetchAllPostMetadata test: FAILED - incorrect number of results", allMeta);
                }
            })
            .catch(err => {
                console.error("fetchAllPostMetadata test: FAILED - error during fetch", err);
            });
    } else {
        console.error("fetchAllPostMetadata function not defined.");
    }
    console.log("--- End of Testing ---");
});