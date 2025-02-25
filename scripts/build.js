const fs = require('fs-extra');
const { marked } = require('marked');
const path = require('path');
const matter = require('gray-matter');

// Template processing function
function processTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '');
}

async function build() {
    // Clear public directory
    await fs.emptyDir('./public');
    
    // Copy static assets
    await fs.copy('./src/styles', './public/styles');
    await fs.copy('./src/scripts', './public/scripts');
    
    // Copy index.html directly
    await fs.copy('./src/index.html', './public/index.html');
    
    // Read base template for other pages
    const baseTemplate = await fs.readFile('./src/templates/base.html', 'utf-8');
    
    // Process blog posts
    const blogFiles = await fs.readdir('./src/content/blog');
    const blogPosts = [];
    
    for (const file of blogFiles) {
        if (!file.endsWith('.md')) continue;
        
        const content = await fs.readFile(`./src/content/blog/${file}`, 'utf-8');
        const { data, content: markdownContent } = matter(content);
        const html = marked(markdownContent);
        
        // Save individual blog post
        const postSlug = file.replace('.md', '');
        const postHtml = processTemplate(baseTemplate, {
            title: data.title,
            content: html
        });
        
        await fs.ensureDir('./public/blog');
        await fs.writeFile(`./public/blog/${postSlug}.html`, postHtml);
        
        blogPosts.push({ ...data, slug: postSlug });
    }
    
    // Create blog index
    const blogIndex = `
        <h1>Blog Posts</h1>
        ${blogPosts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(post => `
                <article>
                    <h2><a href="/blog/${post.slug}.html">${post.title}</a></h2>
                    <time>${new Date(post.date).toLocaleDateString()}</time>
                    <p>${post.description || ''}</p>
                </article>
            `).join('')}
    `;
    
    await fs.writeFile(
        './public/blog/index.html',
        processTemplate(baseTemplate, { title: 'Blog', content: blogIndex })
    );
    
    // Process pages
    const pageFiles = await fs.readdir('./src/content/pages');
    
    for (const file of pageFiles) {
        if (!file.endsWith('.md')) continue;
        
        const content = await fs.readFile(`./src/content/pages/${file}`, 'utf-8');
        const { data, content: markdownContent } = matter(content);
        const html = marked(markdownContent);
        
        const pageSlug = file.replace('.md', '');
        const pageHtml = processTemplate(baseTemplate, {
            title: data.title,
            content: html
        });
        
        await fs.writeFile(`./public/${pageSlug}.html`, pageHtml);
    }
}

build().catch(console.error); 