const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

// Create dist directory if it doesn't exist
async function init() {
    try {
        await fs.mkdir('dist', { recursive: true });
        await fs.mkdir('src/content', { recursive: true });
        await fs.mkdir('src/templates', { recursive: true });
        await fs.mkdir('src/static', { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
    }
}

// Convert markdown to HTML and apply template
async function buildPage(templateContent, markdownContent) {
    const htmlContent = marked.parse(markdownContent);
    return templateContent.replace('{{content}}', htmlContent);
}

// Main build process
async function build() {
    await init();
    
    // Copy static assets
    await fs.cp('src/static', 'dist', { recursive: true });
    
    // Build pages
    const template = await fs.readFile('src/templates/main.html', 'utf-8');
    const files = await fs.readdir('src/content');
    
    for (const file of files) {
        if (file.endsWith('.md')) {
            const content = await fs.readFile(`src/content/${file}`, 'utf-8');
            const html = await buildPage(template, content);
            const outputFile = file.replace('.md', '.html');
            await fs.writeFile(`dist/${outputFile}`, html);
        }
    }
}

build().catch(console.error); 