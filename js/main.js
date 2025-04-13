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
        targetElement.innerHTML = marked.parse(markdown);

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