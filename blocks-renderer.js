// Vanilla JavaScript renderer for Strapi v5 Blocks format
// Based on @strapi/blocks-react-renderer but for vanilla JS

function renderBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';

    return blocks.map(block => renderBlock(block)).join('');
}

function renderBlock(block) {
    if (!block || !block.type) return '';

    switch (block.type) {
        case 'paragraph':
            return `<p>${renderChildren(block.children)}</p>`;

        case 'heading':
            const level = block.level || 1;
            return `<h${level}>${renderChildren(block.children)}</h${level}>`;

        case 'list':
            const listTag = block.format === 'ordered' ? 'ol' : 'ul';
            return `<${listTag}>${renderChildren(block.children)}</${listTag}>`;

        case 'list-item':
            return `<li>${renderChildren(block.children)}</li>`;

        case 'quote':
            return `<blockquote>${renderChildren(block.children)}</blockquote>`;

        case 'code':
            const language = block.language || '';
            return `<pre><code class="language-${language}">${escapeHtml(block.children[0]?.text || '')}</code></pre>`;

        case 'image':
            const alt = block.image?.alternativeText || '';
            const src = block.image?.url || '';
            return `<img src="${src}" alt="${escapeHtml(alt)}" />`;

        case 'link':
            const url = block.url || '#';
            return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${renderChildren(block.children)}</a>`;

        default:
            return renderChildren(block.children || []);
    }
}

function renderChildren(children) {
    if (!children || !Array.isArray(children)) return '';

    return children.map(child => {
        if (child.type === 'text') {
            return renderText(child);
        }
        return renderBlock(child);
    }).join('');
}

function renderText(node) {
    let text = escapeHtml(node.text || '');

    // Apply text modifiers
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code) text = `<code>${text}</code>`;

    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for use in other scripts
window.renderBlocks = renderBlocks;
