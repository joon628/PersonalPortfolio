// Portfolio Data Loader - Loads content from SQLite API and updates the DOM

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
            descEl.textContent = data.about.description;
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
                <p class="desc">${exp.description || ''}</p>
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
                    ${item.description || ''}
                </div>
            </div>
        `)
        .join('');
}

// Update Skills section
function updateSkillsSection(data) {
    if (!data.skills || data.skills.length === 0) return;
    
    const skillsGrid = document.querySelector('#skills .skills-grid');
    if (!skillsGrid) return;
    
    skillsGrid.innerHTML = data.skills
        .map(category => `
            <div class="skill-category">
                <h3>${category.category || ''}</h3>
                <div class="skills-list">
                    ${category.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                </div>
            </div>
        `)
        .join('');
}

// Update Certifications section
function updateCertificationsSection(data) {
    if (!data.certifications || data.certifications.length === 0) return;
    
    const certGrid = document.querySelector('#certifications .cert-grid');
    if (!certGrid) return;
    
    certGrid.innerHTML = data.certifications
        .map(cert => `
            <div class="cert-item">
                <h3>${cert.name || ''}</h3>
                <div class="issuer">${cert.issuer || ''}</div>
                <div class="date">${cert.date || ''}</div>
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
                    ${project.description || ''}
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
    
    const eduList = document.querySelector('#education .education-list');
    if (!eduList) return;
    
    eduList.innerHTML = data.education
        .map(edu => `
            <div class="education-item">
                <h3>${edu.degree || ''}</h3>
                <div class="institution">${edu.institution || ''}</div>
                <div class="date">${edu.startDate || ''} - ${edu.endDate || ''}</div>
                ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
                ${edu.honors ? `<div class="honors">${edu.honors}</div>` : ''}
            </div>
        `)
        .join('');
}

// Update Publications section
function updatePublicationsSection(data) {
    if (!data.publications || data.publications.length === 0) return;
    
    const pubList = document.querySelector('#publications .publication-list');
    if (!pubList) return;
    
    pubList.innerHTML = data.publications
        .map(pub => `
            <div class="publication-item">
                <h3>${pub.title || ''}</h3>
                <div class="authors">${pub.authors || ''}</div>
                <div class="venue">${pub.venue || ''}</div>
                <div class="year">${pub.year || ''}</div>
                ${pub.link ? `<a href="${pub.link}" target="_blank" class="pub-link">View →</a>` : ''}
            </div>
        `)
        .join('');
}

// Update Patents section
function updatePatentsSection(data) {
    if (!data.patents || data.patents.length === 0) return;
    
    const patentList = document.querySelector('#patents .patent-list');
    if (!patentList) return;
    
    patentList.innerHTML = data.patents
        .map(patent => `
            <div class="patent-item">
                <h3>${patent.title || ''}</h3>
                <div class="patent-number">Patent #: ${patent.number || ''}</div>
                <div class="status">Status: ${patent.status || ''}</div>
                <div class="date">${patent.date || ''}</div>
            </div>
        `)
        .join('');
}

// Update Honors section
function updateHonorsSection(data) {
    if (!data.honors || data.honors.length === 0) return;
    
    const honorsList = document.querySelector('#honors .honors-list');
    if (!honorsList) return;
    
    honorsList.innerHTML = data.honors
        .map(honor => `
            <div class="honor-item">
                <h3>${honor.title || ''}</h3>
                <div class="issuer">${honor.issuer || ''}</div>
                <div class="date">${honor.date || ''}</div>
                ${honor.description ? `<p>${honor.description}</p>` : ''}
            </div>
        `)
        .join('');
}

// Update Service section
function updateServiceSection(data) {
    if (!data.service || data.service.length === 0) return;
    
    const serviceList = document.querySelector('#service .service-list');
    if (!serviceList) return;
    
    serviceList.innerHTML = data.service
        .map(service => `
            <div class="service-item">
                <h3>${service.role || ''}</h3>
                <div class="organization">${service.organization || ''}</div>
                <div class="period">${service.period || ''}</div>
                ${service.description ? `<p>${service.description}</p>` : ''}
            </div>
        `)
        .join('');
}

// Update Affiliations section
function updateAffiliationsSection(data) {
    if (!data.affiliations || data.affiliations.length === 0) return;
    
    const affList = document.querySelector('#affiliations .affiliations-list');
    if (!affList) return;
    
    affList.innerHTML = data.affiliations
        .map(aff => `
            <div class="affiliation-item">
                <h3>${aff.name || ''}</h3>
                <div class="role">${aff.role || ''}</div>
                ${aff.period ? `<div class="period">${aff.period}</div>` : ''}
            </div>
        `)
        .join('');
}

// Update Languages section
function updateLanguagesSection(data) {
    if (!data.languages || data.languages.length === 0) return;
    
    const langList = document.querySelector('#languages .languages-list');
    if (!langList) return;
    
    langList.innerHTML = data.languages
        .map(lang => `
            <div class="language-item">
                <span class="language">${lang.name || ''}</span>
                <span class="proficiency">${lang.proficiency || ''}</span>
            </div>
        `)
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