// Portfolio Data Loader - Loads content from SQLite API and updates the DOM

// Helper function to format text with line breaks
function formatDescription(text) {
    if (!text) return '';
    // Escape HTML entities and convert line breaks to <br>
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>');
}

// Load portfolio data from API
async function loadPortfolioData() {
    try {
        return await portfolioAPI.getPublicPortfolioData();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

// Update About section
function updateAboutSection(data) {
    if (!data.about) return;
    
    // Update name in header - preserve the structure
    const headerNamePrimary = document.querySelector('header .name-primary');
    const headerNameSecondary = document.querySelector('header .name-secondary');
    if (headerNamePrimary && data.about.name) {
        // Split name if it contains parentheses for nickname
        const nameMatch = data.about.name.match(/^([^(]+)\s*\(([^)]+)\)\s*(.*)$/);
        if (nameMatch) {
            headerNamePrimary.textContent = (nameMatch[1] + ' ' + (nameMatch[3] || '')).trim();
            headerNameSecondary.textContent = nameMatch[2];
        } else {
            headerNamePrimary.textContent = data.about.name;
        }
    }
    
    // Update intro animation text
    const joonKangText = document.querySelector('.text-item:last-child');
    if (joonKangText && data.about.name) {
        joonKangText.textContent = data.about.name;
    }
    
    // Update about section content
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const titleEl = aboutSection.querySelector('h1');
        if (titleEl && data.about.title) {
            titleEl.textContent = data.about.title;
        }
        
        const descEl = aboutSection.querySelector('p');
        if (descEl && data.about.description) {
            descEl.innerHTML = formatDescription(data.about.description);
        }
        
        // Update keywords/tags
        const keywordsContainer = aboutSection.querySelector('.keywords');
        if (keywordsContainer && data.about.keywords && data.about.keywords.length > 0) {
            keywordsContainer.innerHTML = data.about.keywords
                .map(keyword => `<span class="keyword">${keyword}</span>`)
                .join('');
        }
    }
}

// Update Experience section
function updateExperienceSection(data) {
    if (!data.experience || data.experience.length === 0) return;
    
    const timeline = document.querySelector('#experience .timeline');
    if (!timeline) return;
    
    // Clear existing entries
    timeline.innerHTML = '';
    
    // Add new entries
    data.experience.forEach((exp, index) => {
        const entry = document.createElement('div');
        entry.className = 'entry';
        if (index >= 3) {
            entry.style.display = 'none';
            entry.style.opacity = '0';
        }
        
        entry.innerHTML = `
            <div class="company">${exp.company || ''}</div>
            <div class="details">
                <time>${exp.startDate || ''} – ${exp.endDate || 'Present'}</time>
                <div class="role">${exp.title || ''}</div>
                <p class="desc">${formatDescription(exp.description)}</p>
            </div>
        `;
        
        timeline.appendChild(entry);
    });
    
    // Add expand trigger if more than 3 entries
    if (data.experience.length > 3) {
        const trigger = document.createElement('div');
        trigger.className = 'expand-trigger';
        trigger.textContent = 'Show More';
        trigger.setAttribute('aria-expanded', 'false');
        trigger.onclick = showFull;
        timeline.appendChild(trigger);
    }
}

// Update Research section
function updateResearchSection(data) {
    if (!data.research || data.research.length === 0) return;
    
    const researchGrid = document.querySelector('#research .research-grid');
    if (!researchGrid) return;
    
    researchGrid.innerHTML = data.research
        .map(item => `
            <div class="research-card">
                <div class="research-header">
                    <h3 class="research-title">${item.area || ''}</h3>
                    <div class="research-date">${item.period || ''}</div>
                </div>
                <div class="research-institution">${item.institution || ''}</div>
                <div class="research-description">
                    ${formatDescription(item.description)}
                </div>
            </div>
        `)
        .join('');
}

// Update Skills section
function updateSkillsSection(data) {
    if (!data.skills || data.skills.length === 0) return;

    const sectionContent = document.querySelector('#skills .section-content');
    if (!sectionContent) return;

    // Split skills into two columns
    const leftColumnSkills = data.skills.slice(0, Math.ceil(data.skills.length / 2));
    const rightColumnSkills = data.skills.slice(Math.ceil(data.skills.length / 2));

    const renderSkillCategories = (skills) => skills
        .map(category => `
            <div class="skill-category">
                <h3>${category.category || ''}</h3>
                <div class="skill-tags">
                    ${category.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `)
        .join('');

    sectionContent.innerHTML = `
        <div class="left-column">
            ${renderSkillCategories(leftColumnSkills)}
        </div>
        <div class="right-column">
            ${renderSkillCategories(rightColumnSkills)}
        </div>
    `;
}

// Update Certifications section
function updateCertificationsSection(data) {
    if (!data.certifications || data.certifications.length === 0) return;

    const certGrid = document.querySelector('#certifications .certifications-grid');
    if (!certGrid) return;

    certGrid.innerHTML = data.certifications
        .map(cert => `
            <div class="cert-card">
                <div class="cert-icon">${cert.icon || '📜'}</div>
                <div class="cert-title">${cert.name || ''}</div>
                <div class="cert-issuer">${cert.issuer || ''}</div>
                <div class="cert-year">${cert.date || ''}</div>
                ${cert.credentialId ? `<div class="credential-id">ID: ${cert.credentialId}</div>` : ''}
            </div>
        `)
        .join('');
}

// Update Projects section
function updateProjectsSection(data) {
    if (!data.projects || data.projects.length === 0) return;
    
    const projectsGrid = document.querySelector('#projects .projects-grid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = data.projects
        .map(project => `
            <div class="project-card">
                <div class="project-header">
                    <h3 class="project-title">${project.name || ''}</h3>
                    <div class="project-date">${project.date || ''}</div>
                </div>
                <div class="project-description">
                    ${formatDescription(project.description)}
                </div>
                ${project.link ? `
                <div class="project-links">
                    <a href="${project.link}" target="_blank" class="project-link">${project.linkText || 'GitHub Repository'}</a>
                </div>` : ''}
                ${project.technologies && project.technologies.length > 0 ? `
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>` : ''}
            </div>
        `)
        .join('');
}

// Update Education section
function updateEducationSection(data) {
    if (!data.education || data.education.length === 0) return;

    const eduGrid = document.querySelector('#education .education-grid');
    if (!eduGrid) return;

    eduGrid.innerHTML = data.education
        .map(edu => `
            <div class="education-card">
                <div class="university-name">${edu.institution || ''}</div>
                <div class="degree-program">${edu.degree || ''}</div>
                <div class="degree-years">${edu.startDate || ''}–${edu.endDate || ''}</div>
                ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
                ${edu.honors ? `<div class="honors">${edu.honors}</div>` : ''}
            </div>
        `)
        .join('');
}

// Update Publications section
function updatePublicationsSection(data) {
    if (!data.publications || data.publications.length === 0) return;

    const pubGrid = document.querySelector('#publications .publications-grid');
    if (!pubGrid) return;

    pubGrid.innerHTML = data.publications
        .map(pub => `
            <div class="publication-card academic">
                <div class="publication-year">${pub.year || ''}</div>
                <div class="publication-title">${pub.title || ''}</div>
                <div class="publication-authors">${pub.authors || ''}</div>
                <div class="publication-venue">${pub.venue || ''}</div>
                ${pub.link ? `<button class="publication-btn" onclick="window.open('${pub.link}', '_blank')">View Publication</button>` : ''}
            </div>
        `)
        .join('');
}

// Update Patents section
function updatePatentsSection(data) {
    if (!data.patents || data.patents.length === 0) return;

    const patentGrid = document.querySelector('#patents .patents-grid');
    if (!patentGrid) return;

    patentGrid.innerHTML = data.patents
        .map(patent => `
            <div class="patent-card">
                <div class="patent-title">${patent.title || ''}</div>
                <div class="patent-number">${patent.number || ''}</div>
                <div class="patent-date">${patent.date || ''}</div>
                ${patent.link ? `<a href="${patent.link}" target="_blank" class="patent-link">View Patent</a>` : ''}
            </div>
        `)
        .join('');
}

// Update Honors section
function updateHonorsSection(data) {
    if (!data.honors || data.honors.length === 0) return;

    const honorsGrid = document.querySelector('#honors .honors-grid');
    if (!honorsGrid) return;

    honorsGrid.innerHTML = data.honors
        .map(honor => `
            <div class="honor-card">
                <div class="honor-icon">${honor.icon || '🏆'}</div>
                <div class="honor-title">${honor.title || ''}</div>
                <div class="honor-desc">${formatDescription(honor.description || '')}</div>
                <div class="honor-year">${honor.date || ''}</div>
            </div>
        `)
        .join('');
}

// Update Service section
function updateServiceSection(data) {
    if (!data.service || data.service.length === 0) return;
    
    const serviceGrid = document.querySelector('#service .service-grid');
    if (!serviceGrid) return;
    
    serviceGrid.innerHTML = data.service
        .map(service => `
            <div class="service-card">
                <div class="service-header">
                    <h3 class="service-title">${service.organization || ''}</h3>
                    <div class="service-years">${service.period || ''}</div>
                </div>
                <div class="service-role">${service.role || ''}</div>
                <div class="service-description">
                    ${formatDescription(service.description)}
                </div>
            </div>
        `)
        .join('');
}

// Update Affiliations section
function updateAffiliationsSection(data) {
    if (!data.affiliations || data.affiliations.length === 0) return;

    const affGrid = document.querySelector('#affiliations .affiliations-grid');
    if (!affGrid) return;

    affGrid.innerHTML = data.affiliations
        .map(aff => `
            <div class="affiliation-card">
                <h3 class="affiliation-title">${aff.role || ''}</h3>
                <div class="affiliation-org">${aff.name || ''}</div>
                <div class="affiliation-year">${aff.period || ''}</div>
                ${aff.description ? `<div class="affiliation-description">${formatDescription(aff.description)}</div>` : ''}
            </div>
        `)
        .join('');
}

// Update Languages section
function updateLanguagesSection(data) {
    if (!data.languages || data.languages.length === 0) return;

    const langGrid = document.querySelector('#languages .languages-grid');
    if (!langGrid) return;

    langGrid.innerHTML = data.languages
        .map(lang => {
            let proficiencyClass = 'proficiency-intermediate';
            if (lang.proficiency && lang.proficiency.toLowerCase().includes('native')) {
                proficiencyClass = 'proficiency-native';
            } else if (lang.proficiency && lang.proficiency.toLowerCase().includes('fluent')) {
                proficiencyClass = 'proficiency-fluent';
            }

            return `
                <div class="language-card">
                    <div class="language-name">${lang.name || ''}</div>
                    <div class="language-level">${lang.proficiency || ''}</div>
                    <div class="language-proficiency">
                        <div class="proficiency-bar ${proficiencyClass}"></div>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Update Contact section
function updateContactSection(data) {
    if (!data.contact) return;
    
    const contactInfo = document.querySelector('#contact .contact-info');
    if (!contactInfo) return;
    
    const contactItems = [];
    
    if (data.contact.email) {
        contactItems.push(`
            <div class="contact-item">
                <span class="icon">📧</span>
                <a href="mailto:${data.contact.email}">${data.contact.email}</a>
            </div>
        `);
    }
    
    if (data.contact.phone) {
        contactItems.push(`
            <div class="contact-item">
                <span class="icon">📱</span>
                <a href="tel:${data.contact.phone}">${data.contact.phone}</a>
            </div>
        `);
    }
    
    if (data.contact.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <span class="icon">💼</span>
                <a href="${data.contact.linkedin}" target="_blank">LinkedIn</a>
            </div>
        `);
    }
    
    if (data.contact.github) {
        contactItems.push(`
            <div class="contact-item">
                <span class="icon">🐙</span>
                <a href="${data.contact.github}" target="_blank">GitHub</a>
            </div>
        `);
    }
    
    if (data.contact.location) {
        contactItems.push(`
            <div class="contact-item">
                <span class="icon">📍</span>
                <span>${data.contact.location}</span>
            </div>
        `);
    }
    
    contactInfo.innerHTML = contactItems.join('');
}

// Initialize data loading
async function initializeDataLoader() {
    const data = await loadPortfolioData();
    if (!data) {
        console.log('No API data available, using default HTML content');
        return;
    }
    
    // Update all sections with saved data
    updateAboutSection(data);
    updateExperienceSection(data);
    updateResearchSection(data);
    updateSkillsSection(data);
    updateCertificationsSection(data);
    updateProjectsSection(data);
    updateEducationSection(data);
    updatePublicationsSection(data);
    updatePatentsSection(data);
    updateHonorsSection(data);
    updateServiceSection(data);
    updateAffiliationsSection(data);
    updateLanguagesSection(data);
    updateContactSection(data);
}

// Load data when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDataLoader);
} else {
    // DOM is already loaded
    initializeDataLoader();
}