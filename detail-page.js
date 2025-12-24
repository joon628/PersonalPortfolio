// Detail Page Loader
// Loads detailed content for experiences, research, publications, and projects

// Parse URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        type: params.get('type'),     // experience, research, publication, project
        slug: params.get('slug')       // unique slug identifier
    };
}

// Convert Strapi content to HTML
function renderRichText(content) {
    if (!content) return '';

    // Check if content is Blocks format (array)
    if (Array.isArray(content)) {
        return window.renderBlocks(content);
    }

    // If it's a string, parse it as markdown using marked.js
    if (typeof content === 'string') {
        // Use marked.js to parse markdown to HTML
        if (typeof marked !== 'undefined') {
            return marked.parse(content);
        }
        // Fallback if marked.js not loaded
        return `<p>${content}</p>`;
    }

    return '';
}

// Fetch content by type and slug
async function fetchDetailContent(type, slug) {
    const endpointMap = {
        'experience': 'experiences',
        'research': 'researches',
        'publication': 'publications',
        'project': 'projects'
    };

    const endpoint = endpointMap[type];
    if (!endpoint) {
        throw new Error('Invalid content type');
    }

    try {
        const url = `http://localhost:1337/api/${endpoint}?filters[slug][$eq]=${slug}&populate=*`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.data || result.data.length === 0) {
            throw new Error('Content not found');
        }

        return result.data[0];
    } catch (error) {
        console.error('Error fetching detail content:', error);
        throw error;
    }
}

// Render experience detail
function renderExperienceDetail(data) {
    document.getElementById('page-title').textContent = `${data.title} — Portfolio`;
    document.getElementById('detail-title').textContent = data.title;

    // Meta information
    const metaHtml = `
        <div class="detail-meta-item">
            <strong>${data.company || ''}</strong>
        </div>
        ${data.startDate ? `
        <div class="detail-meta-item">
            📅 ${data.startDate}${data.endDate ? ' – ' + data.endDate : ' – Present'}
        </div>
        ` : ''}
        ${data.location ? `
        <div class="detail-meta-item">
            📍 ${data.location}
        </div>
        ` : ''}
    `;
    document.getElementById('detail-meta').innerHTML = metaHtml;

    // Content
    const contentHtml = data.detailedContent ? renderRichText(data.detailedContent) : renderRichText(data.description);
    document.getElementById('detail-content').innerHTML = contentHtml;

    // Links (if any)
    document.getElementById('detail-links').innerHTML = '';
}

// Render research detail
function renderResearchDetail(data) {
    document.getElementById('page-title').textContent = `${data.area} — Portfolio`;
    document.getElementById('detail-title').textContent = data.area;

    // Meta information
    const metaHtml = `
        ${data.institution ? `
        <div class="detail-meta-item">
            <strong>${data.institution}</strong>
        </div>
        ` : ''}
        ${data.period ? `
        <div class="detail-meta-item">
            📅 ${data.period}
        </div>
        ` : ''}
    `;
    document.getElementById('detail-meta').innerHTML = metaHtml;

    // Content
    const contentHtml = data.detailedContent ? renderRichText(data.detailedContent) : renderRichText(data.description);
    document.getElementById('detail-content').innerHTML = contentHtml;

    // Links
    document.getElementById('detail-links').innerHTML = '';
}

// Render publication detail
function renderPublicationDetail(data) {
    document.getElementById('page-title').textContent = `${data.title} — Portfolio`;
    document.getElementById('detail-title').textContent = data.title;

    // Meta information
    const metaHtml = `
        ${data.authors ? `
        <div class="detail-meta-item">
            👥 ${data.authors}
        </div>
        ` : ''}
        ${data.venue ? `
        <div class="detail-meta-item">
            📍 ${data.venue}
        </div>
        ` : ''}
        ${data.year ? `
        <div class="detail-meta-item">
            📅 ${data.year}
        </div>
        ` : ''}
    `;
    document.getElementById('detail-meta').innerHTML = metaHtml;

    // Content
    let contentHtml = '';
    if (data.abstract) {
        contentHtml += '<h2>Abstract</h2>' + renderRichText(data.abstract);
    }
    if (data.detailedContent) {
        contentHtml += renderRichText(data.detailedContent);
    } else if (data.content) {
        contentHtml += renderRichText(data.content);
    }
    document.getElementById('detail-content').innerHTML = contentHtml;

    // Links
    let linksHtml = '';
    if (data.link) {
        linksHtml += `<a href="${data.link}" target="_blank" class="detail-link-btn">📄 View Publication</a>`;
    }
    if (data.pdfUrl) {
        linksHtml += `<a href="${data.pdfUrl}" target="_blank" class="detail-link-btn">📥 Download PDF</a>`;
    }
    if (data.githubUrl) {
        linksHtml += `<a href="${data.githubUrl}" target="_blank" class="detail-link-btn secondary">💻 GitHub Repository</a>`;
    }
    if (data.doi) {
        linksHtml += `<a href="https://doi.org/${data.doi}" target="_blank" class="detail-link-btn secondary">🔗 DOI</a>`;
    }
    document.getElementById('detail-links').innerHTML = linksHtml;
}

// Render project detail
function renderProjectDetail(data) {
    document.getElementById('page-title').textContent = `${data.name} — Portfolio`;
    document.getElementById('detail-title').textContent = data.name;

    // Meta information
    const metaHtml = `
        ${data.date ? `
        <div class="detail-meta-item">
            📅 ${data.date}
        </div>
        ` : ''}
        ${data.technologies && data.technologies.length > 0 ? `
        <div class="detail-meta-item">
            🛠️ ${data.technologies.join(', ')}
        </div>
        ` : ''}
    `;
    document.getElementById('detail-meta').innerHTML = metaHtml;

    // Content
    const contentHtml = data.detailedContent ? renderRichText(data.detailedContent) : renderRichText(data.description);
    document.getElementById('detail-content').innerHTML = contentHtml;

    // Links
    let linksHtml = '';
    if (data.link) {
        linksHtml += `<a href="${data.link}" target="_blank" class="detail-link-btn">${data.linkText || '🔗 View Project'}</a>`;
    }
    document.getElementById('detail-links').innerHTML = linksHtml;
}

// Main initialization
async function initDetailPage() {
    const { type, slug } = getUrlParams();

    if (!type || !slug) {
        showError();
        return;
    }

    try {
        const data = await fetchDetailContent(type, slug);

        // Check if detailed content exists
        if (!data.detailedContent && !data.content) {
            showError();
            return;
        }

        // Render based on type
        switch(type) {
            case 'experience':
                renderExperienceDetail(data);
                break;
            case 'research':
                renderResearchDetail(data);
                break;
            case 'publication':
                renderPublicationDetail(data);
                break;
            case 'project':
                renderProjectDetail(data);
                break;
            default:
                showError();
                return;
        }

        // Show content, hide loading
        document.getElementById('detail-loading').style.display = 'none';
        document.getElementById('detail-article').style.display = 'block';

    } catch (error) {
        console.error('Error loading detail page:', error);
        showError();
    }
}

// Show error message
function showError() {
    document.getElementById('detail-loading').style.display = 'none';
    document.getElementById('detail-error').style.display = 'block';
}

// Load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailPage);
} else {
    initDetailPage();
}
