// Admin Panel JavaScript

// Configuration - Using API instead of localStorage
const ADMIN_USERNAME = 'admin'; // Default username

// State Management
let portfolioData = {
    about: {
        name: 'Junseok (Joon) Kang',
        title: 'Software Engineer | ML Engineer | Cloud Architect',
        description: '',
        keywords: []
    },
    experience: [],
    research: [],
    skills: [],
    certifications: [],
    projects: [],
    education: [],
    publications: [],
    patents: [],
    honors: [],
    service: [],
    affiliations: [],
    languages: [],
    contact: {
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        location: ''
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    setupEventListeners();
});

// Authentication
async function checkAuthentication() {
    try {
        const status = await portfolioAPI.checkAuthStatus();
        if (status.authenticated) {
            await loadData();
            showDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    renderCurrentSection();
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout').addEventListener('click', handleLogout);
    
    // Change password button
    document.getElementById('changePassword').addEventListener('click', showPasswordModal);
    
    // Save all button
    document.getElementById('saveAll').addEventListener('click', saveAllChanges);
    
    // Refresh data button
    document.getElementById('refreshData').addEventListener('click', handleRefreshData);
    
    // Password modal handlers
    document.getElementById('passwordModalClose').addEventListener('click', hidePasswordModal);
    document.getElementById('cancelPasswordChange').addEventListener('click', hidePasswordModal);
    document.getElementById('passwordChangeForm').addEventListener('submit', handlePasswordChange);
    document.getElementById('newPassword').addEventListener('input', updatePasswordStrength);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
    
    // Close modal when clicking outside
    document.getElementById('passwordModal').addEventListener('click', (e) => {
        if (e.target.id === 'passwordModal') {
            hidePasswordModal();
        }
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // About section inputs
    document.getElementById('aboutName').addEventListener('input', updateAbout);
    document.getElementById('aboutTitle').addEventListener('input', updateAbout);
    document.getElementById('aboutDescription').addEventListener('input', updateAbout);
    document.getElementById('aboutKeywords').addEventListener('input', updateAbout);
    
    // Contact section inputs
    document.getElementById('contactEmail').addEventListener('input', updateContact);
    document.getElementById('contactPhone').addEventListener('input', updateContact);
    document.getElementById('contactLinkedIn').addEventListener('input', updateContact);
    document.getElementById('contactGitHub').addEventListener('input', updateContact);
    document.getElementById('contactLocation').addEventListener('input', updateContact);
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        await portfolioAPI.login(username, password);
        await loadData();
        showDashboard();
        showToast('Login successful!');
    } catch (error) {
        const errorMsg = document.getElementById('loginError');
        errorMsg.textContent = error.message || 'Invalid credentials';
        errorMsg.classList.add('show');
        setTimeout(() => errorMsg.classList.remove('show'), 3000);
    }
}

// Logout Handler
async function handleLogout() {
    try {
        await portfolioAPI.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    showLogin();
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = '';
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.editor-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = e.target.getAttribute('href').substring(1);
    document.getElementById(targetSection + '-editor').classList.remove('hidden');
    
    // Render section content
    renderSection(targetSection);
}

// Data Management
async function loadData() {
    try {
        portfolioData = await portfolioAPI.getPortfolioData();
        loadAboutData();
        loadContactData();
    } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Failed to load data: ' + error.message, true);
    }
}

async function saveAllChanges() {
    try {
        await portfolioAPI.savePortfolioData(portfolioData);
        showToast('All changes saved successfully!');
    } catch (error) {
        console.error('Failed to save data:', error);
        showToast('Failed to save data: ' + error.message, true);
    }
}

// Refresh data handler
async function handleRefreshData() {
    if (confirm('This will reload your data from the database. Any unsaved changes will be lost. Continue?')) {
        try {
            await loadData();
            renderCurrentSection();
            showToast('Data refreshed successfully!');
        } catch (error) {
            console.error('Failed to refresh data:', error);
            showToast('Failed to refresh data: ' + error.message, true);
        }
    }
}

// About Section
function loadAboutData() {
    document.getElementById('aboutName').value = portfolioData.about.name || '';
    document.getElementById('aboutTitle').value = portfolioData.about.title || '';
    document.getElementById('aboutDescription').value = portfolioData.about.description || '';
    document.getElementById('aboutKeywords').value = portfolioData.about.keywords.join(', ');
}

function updateAbout() {
    portfolioData.about = {
        name: document.getElementById('aboutName').value,
        title: document.getElementById('aboutTitle').value,
        description: document.getElementById('aboutDescription').value,
        keywords: document.getElementById('aboutKeywords').value.split(',').map(k => k.trim()).filter(k => k)
    };
}

// Contact Section
function loadContactData() {
    document.getElementById('contactEmail').value = portfolioData.contact.email || '';
    document.getElementById('contactPhone').value = portfolioData.contact.phone || '';
    document.getElementById('contactLinkedIn').value = portfolioData.contact.linkedin || '';
    document.getElementById('contactGitHub').value = portfolioData.contact.github || '';
    document.getElementById('contactLocation').value = portfolioData.contact.location || '';
}

function updateContact() {
    portfolioData.contact = {
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        linkedin: document.getElementById('contactLinkedIn').value,
        github: document.getElementById('contactGitHub').value,
        location: document.getElementById('contactLocation').value
    };
}

// Section Rendering
function renderCurrentSection() {
    const activeNav = document.querySelector('.nav-link.active');
    if (activeNav) {
        const section = activeNav.getAttribute('href').substring(1);
        renderSection(section);
    }
}

function renderSection(section) {
    switch(section) {
        case 'experience':
            renderExperience();
            break;
        case 'research':
            renderResearch();
            break;
        case 'skills':
            renderSkills();
            break;
        case 'certifications':
            renderCertifications();
            break;
        case 'projects':
            renderProjects();
            break;
        case 'education':
            renderEducation();
            break;
        case 'publications':
            renderPublications();
            break;
        case 'patents':
            renderPatents();
            break;
        case 'honors':
            renderHonors();
            break;
        case 'service':
            renderService();
            break;
        case 'affiliations':
            renderAffiliations();
            break;
        case 'languages':
            renderLanguages();
            break;
    }
}

// Experience Section
function renderExperience() {
    const container = document.getElementById('experienceList');
    container.innerHTML = '';
    
    portfolioData.experience.forEach((exp, index) => {
        container.appendChild(createExperienceCard(exp, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.experience.splice(oldIndex, 1)[0];
                    portfolioData.experience.splice(newIndex, 0, item);
                    renderExperience();
                }
            }
        });
    }
}

function createExperienceCard(exp, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${exp.title || 'New Experience'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editExperience(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteExperience(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Company:</strong> ${exp.company || ''}</p>
        <p><strong>Period:</strong> ${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
        <p><strong>Location:</strong> ${exp.location || ''}</p>
        <p><strong>Description:</strong> ${exp.description || ''}</p>
    `;
    return card;
}

window.addExperience = function() {
    const newExp = {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        highlights: []
    };
    portfolioData.experience.push(newExp);
    renderExperience();
    editExperience(portfolioData.experience.length - 1);
};

window.editExperience = function(index) {
    const exp = portfolioData.experience[index];
    const card = document.querySelectorAll('#experienceList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" value="${exp.title || ''}" 
                   onchange="updateExperience(${index}, 'title', this.value)">
        </div>
        <div class="form-group">
            <label>Company</label>
            <input type="text" class="form-control" value="${exp.company || ''}" 
                   onchange="updateExperience(${index}, 'company', this.value)">
        </div>
        <div class="date-range">
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="form-control" value="${exp.startDate || ''}" 
                       placeholder="e.g., Jan 2020"
                       onchange="updateExperience(${index}, 'startDate', this.value)">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="form-control" value="${exp.endDate || ''}" 
                       placeholder="Present"
                       onchange="updateExperience(${index}, 'endDate', this.value)">
            </div>
        </div>
        <div class="form-group">
            <label>Location</label>
            <input type="text" class="form-control" value="${exp.location || ''}" 
                   onchange="updateExperience(${index}, 'location', this.value)">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" rows="4" 
                      onchange="updateExperience(${index}, 'description', this.value)">${exp.description || ''}</textarea>
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderExperience()">Done</button>
        </div>
    `;
};

window.updateExperience = function(index, field, value) {
    portfolioData.experience[index][field] = value;
};

window.deleteExperience = function(index) {
    if (confirm('Are you sure you want to delete this experience?')) {
        portfolioData.experience.splice(index, 1);
        renderExperience();
        showToast('Experience deleted');
    }
};

// Research Section
function renderResearch() {
    const container = document.getElementById('researchList');
    container.innerHTML = '';
    
    portfolioData.research.forEach((item, index) => {
        container.appendChild(createResearchCard(item, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.research.splice(oldIndex, 1)[0];
                    portfolioData.research.splice(newIndex, 0, item);
                    renderResearch();
                }
            }
        });
    }
}

function createResearchCard(item, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${item.area || 'New Research Area'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editResearch(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteResearch(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Period:</strong> ${item.period || ''}</p>
        <p><strong>Institution:</strong> ${item.institution || ''}</p>
        <p>${item.description || ''}</p>
    `;
    return card;
}

window.addResearch = function() {
    const newItem = {
        area: '',
        period: '',
        institution: '',
        description: ''
    };
    portfolioData.research.push(newItem);
    renderResearch();
    editResearch(portfolioData.research.length - 1);
};

window.editResearch = function(index) {
    const item = portfolioData.research[index];
    const card = document.querySelectorAll('#researchList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Research Area</label>
            <input type="text" class="form-control" value="${item.area || ''}" 
                   onchange="updateResearch(${index}, 'area', this.value)">
        </div>
        <div class="form-group">
            <label>Period</label>
            <input type="text" class="form-control" value="${item.period || ''}" 
                   placeholder="e.g., Sep 2022 – Current"
                   onchange="updateResearch(${index}, 'period', this.value)">
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="form-control" value="${item.institution || ''}" 
                   placeholder="e.g., Olin College • Prof. Name"
                   onchange="updateResearch(${index}, 'institution', this.value)">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" rows="3" 
                      onchange="updateResearch(${index}, 'description', this.value)">${item.description || ''}</textarea>
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderResearch()">Done</button>
        </div>
    `;
};

window.updateResearch = function(index, field, value) {
    portfolioData.research[index][field] = value;
};

window.deleteResearch = function(index) {
    if (confirm('Are you sure you want to delete this research area?')) {
        portfolioData.research.splice(index, 1);
        renderResearch();
        showToast('Research area deleted');
    }
};

// Skills Section
function renderSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = '';
    
    portfolioData.skills.forEach((category, index) => {
        container.appendChild(createSkillCategoryCard(category, index));
    });
}

function createSkillCategoryCard(category, index) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-header">
            <h3>${category.category || 'New Category'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editSkillCategory(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteSkillCategory(${index})">Delete</button>
            </div>
        </div>
        <div class="skill-pills">
            ${category.skills.map((skill, skillIndex) => `
                <span class="skill-pill">
                    ${skill}
                    <button onclick="removeSkill(${index}, ${skillIndex})">×</button>
                </span>
            `).join('')}
        </div>
        <div class="add-item-input" style="margin-top: 1rem;">
            <input type="text" placeholder="Add skill..." onkeypress="if(event.key==='Enter'){addSkill(${index}, this.value); this.value='';}">
            <button class="btn btn-small btn-primary" onclick="addSkill(${index}, this.previousElementSibling.value); this.previousElementSibling.value='';">Add</button>
        </div>
    `;
    return card;
}

window.addSkillCategory = function() {
    const newCategory = {
        category: '',
        skills: []
    };
    portfolioData.skills.push(newCategory);
    renderSkills();
    editSkillCategory(portfolioData.skills.length - 1);
};

window.editSkillCategory = function(index) {
    const category = portfolioData.skills[index];
    const card = document.querySelectorAll('#skillsList .item-card')[index];
    
    const categoryInput = card.querySelector('h3');
    categoryInput.innerHTML = `<input type="text" class="form-control" value="${category.category}" 
                                     onchange="updateSkillCategory(${index}, this.value)" 
                                     onblur="renderSkills()">`;
    categoryInput.querySelector('input').focus();
};

window.updateSkillCategory = function(index, value) {
    portfolioData.skills[index].category = value;
};

window.addSkill = function(categoryIndex, skill) {
    if (skill.trim()) {
        portfolioData.skills[categoryIndex].skills.push(skill.trim());
        renderSkills();
    }
};

window.removeSkill = function(categoryIndex, skillIndex) {
    portfolioData.skills[categoryIndex].skills.splice(skillIndex, 1);
    renderSkills();
};

window.deleteSkillCategory = function(index) {
    if (confirm('Are you sure you want to delete this skill category?')) {
        portfolioData.skills.splice(index, 1);
        renderSkills();
        showToast('Skill category deleted');
    }
};

// Certifications Section
function renderCertifications() {
    const container = document.getElementById('certificationsList');
    container.innerHTML = '';
    
    portfolioData.certifications.forEach((cert, index) => {
        container.appendChild(createCertificationCard(cert, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.certifications.splice(oldIndex, 1)[0];
                    portfolioData.certifications.splice(newIndex, 0, item);
                    renderCertifications();
                }
            }
        });
    }
}

function createCertificationCard(cert, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${cert.name || 'New Certification'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editCertification(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteCertification(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Issuer:</strong> ${cert.issuer || ''}</p>
        <p><strong>Date:</strong> ${cert.date || ''}</p>
        ${cert.credentialId ? `<p><strong>Credential ID:</strong> ${cert.credentialId}</p>` : ''}
    `;
    return card;
}

window.addCertification = function() {
    const newCert = {
        name: '',
        issuer: '',
        date: '',
        credentialId: ''
    };
    portfolioData.certifications.push(newCert);
    renderCertifications();
    editCertification(portfolioData.certifications.length - 1);
};

window.editCertification = function(index) {
    const cert = portfolioData.certifications[index];
    const card = document.querySelectorAll('#certificationsList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Certification Name</label>
            <input type="text" class="form-control" value="${cert.name || ''}" 
                   onchange="updateCertification(${index}, 'name', this.value)">
        </div>
        <div class="form-group">
            <label>Issuer</label>
            <input type="text" class="form-control" value="${cert.issuer || ''}" 
                   onchange="updateCertification(${index}, 'issuer', this.value)">
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="text" class="form-control" value="${cert.date || ''}" 
                   placeholder="e.g., March 2023"
                   onchange="updateCertification(${index}, 'date', this.value)">
        </div>
        <div class="form-group">
            <label>Credential ID (optional)</label>
            <input type="text" class="form-control" value="${cert.credentialId || ''}" 
                   onchange="updateCertification(${index}, 'credentialId', this.value)">
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderCertifications()">Done</button>
        </div>
    `;
};

window.updateCertification = function(index, field, value) {
    portfolioData.certifications[index][field] = value;
};

window.deleteCertification = function(index) {
    if (confirm('Are you sure you want to delete this certification?')) {
        portfolioData.certifications.splice(index, 1);
        renderCertifications();
        showToast('Certification deleted');
    }
};

// Projects Section
function renderProjects() {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';
    
    portfolioData.projects.forEach((project, index) => {
        container.appendChild(createProjectCard(project, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.projects.splice(oldIndex, 1)[0];
                    portfolioData.projects.splice(newIndex, 0, item);
                    renderProjects();
                }
            }
        });
    }
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${project.name || 'New Project'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editProject(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteProject(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Date:</strong> ${project.date || ''}</p>
        <p>${project.description || ''}</p>
        <p><strong>Technologies:</strong> ${project.technologies ? project.technologies.join(', ') : ''}</p>
        ${project.link ? `<p><strong>Link:</strong> <a href="${project.link}" target="_blank">${project.linkText || 'GitHub Repository'}</a></p>` : ''}
    `;
    return card;
}

window.addProject = function() {
    const newProject = {
        name: '',
        date: '',
        description: '',
        technologies: [],
        link: '',
        linkText: 'GitHub Repository'
    };
    portfolioData.projects.push(newProject);
    renderProjects();
    editProject(portfolioData.projects.length - 1);
};

window.editProject = function(index) {
    const project = portfolioData.projects[index];
    const card = document.querySelectorAll('#projectsList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Project Name</label>
            <input type="text" class="form-control" value="${project.name || ''}" 
                   onchange="updateProject(${index}, 'name', this.value)">
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="text" class="form-control" value="${project.date || ''}" 
                   placeholder="e.g., Nov 2020 – Dec 2020"
                   onchange="updateProject(${index}, 'date', this.value)">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" rows="3" 
                      onchange="updateProject(${index}, 'description', this.value)">${project.description || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Technologies (comma-separated)</label>
            <input type="text" class="form-control" value="${project.technologies ? project.technologies.join(', ') : ''}" 
                   onchange="updateProject(${index}, 'technologies', this.value.split(',').map(t => t.trim()).filter(t => t))">
        </div>
        <div class="form-group">
            <label>Project Link (optional)</label>
            <input type="url" class="form-control" value="${project.link || ''}" 
                   onchange="updateProject(${index}, 'link', this.value)">
        </div>
        <div class="form-group">
            <label>Link Button Text</label>
            <input type="text" class="form-control" value="${project.linkText || 'GitHub Repository'}" 
                   placeholder="e.g., View Demo, GitHub Repository, Live Site"
                   onchange="updateProject(${index}, 'linkText', this.value)">
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderProjects()">Done</button>
        </div>
    `;
};

window.updateProject = function(index, field, value) {
    portfolioData.projects[index][field] = value;
};

window.deleteProject = function(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        portfolioData.projects.splice(index, 1);
        renderProjects();
        showToast('Project deleted');
    }
};

// Education Section
function renderEducation() {
    const container = document.getElementById('educationList');
    container.innerHTML = '';
    
    portfolioData.education.forEach((edu, index) => {
        container.appendChild(createEducationCard(edu, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.education.splice(oldIndex, 1)[0];
                    portfolioData.education.splice(newIndex, 0, item);
                    renderEducation();
                }
            }
        });
    }
}

function createEducationCard(edu, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${edu.degree || 'New Education'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editEducation(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteEducation(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Institution:</strong> ${edu.institution || ''}</p>
        <p><strong>Period:</strong> ${edu.startDate || ''} - ${edu.endDate || ''}</p>
        ${edu.gpa ? `<p><strong>GPA:</strong> ${edu.gpa}</p>` : ''}
        ${edu.honors ? `<p><strong>Honors:</strong> ${edu.honors}</p>` : ''}
    `;
    return card;
}

window.addEducation = function() {
    const newEdu = {
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        gpa: '',
        honors: ''
    };
    portfolioData.education.push(newEdu);
    renderEducation();
    editEducation(portfolioData.education.length - 1);
};

window.editEducation = function(index) {
    const edu = portfolioData.education[index];
    const card = document.querySelectorAll('#educationList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="form-control" value="${edu.degree || ''}" 
                   onchange="updateEducation(${index}, 'degree', this.value)">
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="form-control" value="${edu.institution || ''}" 
                   onchange="updateEducation(${index}, 'institution', this.value)">
        </div>
        <div class="date-range">
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="form-control" value="${edu.startDate || ''}" 
                       placeholder="e.g., Sep 2018"
                       onchange="updateEducation(${index}, 'startDate', this.value)">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="form-control" value="${edu.endDate || ''}" 
                       placeholder="e.g., May 2022"
                       onchange="updateEducation(${index}, 'endDate', this.value)">
            </div>
        </div>
        <div class="form-group">
            <label>GPA (optional)</label>
            <input type="text" class="form-control" value="${edu.gpa || ''}" 
                   onchange="updateEducation(${index}, 'gpa', this.value)">
        </div>
        <div class="form-group">
            <label>Honors (optional)</label>
            <input type="text" class="form-control" value="${edu.honors || ''}" 
                   onchange="updateEducation(${index}, 'honors', this.value)">
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderEducation()">Done</button>
        </div>
    `;
};

window.updateEducation = function(index, field, value) {
    portfolioData.education[index][field] = value;
};

window.deleteEducation = function(index) {
    if (confirm('Are you sure you want to delete this education?')) {
        portfolioData.education.splice(index, 1);
        renderEducation();
        showToast('Education deleted');
    }
};

// Publications Section
function renderPublications() {
    const container = document.getElementById('publicationsList');
    container.innerHTML = '';
    
    portfolioData.publications.forEach((pub, index) => {
        container.appendChild(createPublicationCard(pub, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.publications.splice(oldIndex, 1)[0];
                    portfolioData.publications.splice(newIndex, 0, item);
                    renderPublications();
                }
            }
        });
    }
}

function createPublicationCard(pub, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${pub.title || 'New Publication'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editPublication(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deletePublication(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Authors:</strong> ${pub.authors || ''}</p>
        <p><strong>Venue:</strong> ${pub.venue || ''}</p>
        <p><strong>Year:</strong> ${pub.year || ''}</p>
        ${pub.link ? `<p><strong>Link:</strong> <a href="${pub.link}" target="_blank">${pub.link}</a></p>` : ''}
    `;
    return card;
}

window.addPublication = function() {
    const newPub = {
        title: '',
        authors: '',
        venue: '',
        year: '',
        link: ''
    };
    portfolioData.publications.push(newPub);
    renderPublications();
    editPublication(portfolioData.publications.length - 1);
};

window.editPublication = function(index) {
    const pub = portfolioData.publications[index];
    const card = document.querySelectorAll('#publicationsList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" value="${pub.title || ''}" 
                   onchange="updatePublication(${index}, 'title', this.value)">
        </div>
        <div class="form-group">
            <label>Authors</label>
            <input type="text" class="form-control" value="${pub.authors || ''}" 
                   onchange="updatePublication(${index}, 'authors', this.value)">
        </div>
        <div class="form-group">
            <label>Venue/Journal</label>
            <input type="text" class="form-control" value="${pub.venue || ''}" 
                   onchange="updatePublication(${index}, 'venue', this.value)">
        </div>
        <div class="form-group">
            <label>Year</label>
            <input type="number" class="form-control" value="${pub.year || ''}" 
                   onchange="updatePublication(${index}, 'year', this.value)">
        </div>
        <div class="form-group">
            <label>Link (optional)</label>
            <input type="url" class="form-control" value="${pub.link || ''}" 
                   onchange="updatePublication(${index}, 'link', this.value)">
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderPublications()">Done</button>
        </div>
    `;
};

window.updatePublication = function(index, field, value) {
    portfolioData.publications[index][field] = value;
};

window.deletePublication = function(index) {
    if (confirm('Are you sure you want to delete this publication?')) {
        portfolioData.publications.splice(index, 1);
        renderPublications();
        showToast('Publication deleted');
    }
};

// Patents Section
function renderPatents() {
    const container = document.getElementById('patentsList');
    container.innerHTML = '';
    
    portfolioData.patents.forEach((patent, index) => {
        container.appendChild(createPatentCard(patent, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.patents.splice(oldIndex, 1)[0];
                    portfolioData.patents.splice(newIndex, 0, item);
                    renderPatents();
                }
            }
        });
    }
}

function createPatentCard(patent, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${patent.title || 'New Patent'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editPatent(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deletePatent(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Patent Number:</strong> ${patent.number || ''}</p>
        <p><strong>Status:</strong> ${patent.status || ''}</p>
        <p><strong>Date:</strong> ${patent.date || ''}</p>
    `;
    return card;
}

window.addPatent = function() {
    const newPatent = {
        title: '',
        number: '',
        status: '',
        date: ''
    };
    portfolioData.patents.push(newPatent);
    renderPatents();
    editPatent(portfolioData.patents.length - 1);
};

window.editPatent = function(index) {
    const patent = portfolioData.patents[index];
    const card = document.querySelectorAll('#patentsList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" value="${patent.title || ''}" 
                   onchange="updatePatent(${index}, 'title', this.value)">
        </div>
        <div class="form-group">
            <label>Patent Number</label>
            <input type="text" class="form-control" value="${patent.number || ''}" 
                   onchange="updatePatent(${index}, 'number', this.value)">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select class="form-control" onchange="updatePatent(${index}, 'status', this.value)">
                <option value="">Select Status</option>
                <option value="Pending" ${patent.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Granted" ${patent.status === 'Granted' ? 'selected' : ''}>Granted</option>
                <option value="Published" ${patent.status === 'Published' ? 'selected' : ''}>Published</option>
            </select>
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="text" class="form-control" value="${patent.date || ''}" 
                   placeholder="e.g., January 2023"
                   onchange="updatePatent(${index}, 'date', this.value)">
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderPatents()">Done</button>
        </div>
    `;
};

window.updatePatent = function(index, field, value) {
    portfolioData.patents[index][field] = value;
};

window.deletePatent = function(index) {
    if (confirm('Are you sure you want to delete this patent?')) {
        portfolioData.patents.splice(index, 1);
        renderPatents();
        showToast('Patent deleted');
    }
};

// Honors Section
function renderHonors() {
    const container = document.getElementById('honorsList');
    container.innerHTML = '';
    
    portfolioData.honors.forEach((honor, index) => {
        container.appendChild(createHonorCard(honor, index));
    });
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex) {
                    const item = portfolioData.honors.splice(oldIndex, 1)[0];
                    portfolioData.honors.splice(newIndex, 0, item);
                    renderHonors();
                }
            }
        });
    }
}

function createHonorCard(honor, index) {
    const card = document.createElement('div');
    card.className = 'item-card sortable-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="item-header">
            <h3>${honor.title || 'New Honor'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editHonor(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteHonor(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Issuer:</strong> ${honor.issuer || ''}</p>
        <p><strong>Date:</strong> ${honor.date || ''}</p>
        ${honor.description ? `<p>${honor.description}</p>` : ''}
    `;
    return card;
}

window.addHonor = function() {
    const newHonor = {
        title: '',
        issuer: '',
        date: '',
        description: ''
    };
    portfolioData.honors.push(newHonor);
    renderHonors();
    editHonor(portfolioData.honors.length - 1);
};

window.editHonor = function(index) {
    const honor = portfolioData.honors[index];
    const card = document.querySelectorAll('#honorsList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Honor/Award Title</label>
            <input type="text" class="form-control" value="${honor.title || ''}" 
                   onchange="updateHonor(${index}, 'title', this.value)">
        </div>
        <div class="form-group">
            <label>Issuer</label>
            <input type="text" class="form-control" value="${honor.issuer || ''}" 
                   onchange="updateHonor(${index}, 'issuer', this.value)">
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="text" class="form-control" value="${honor.date || ''}" 
                   placeholder="e.g., May 2023"
                   onchange="updateHonor(${index}, 'date', this.value)">
        </div>
        <div class="form-group">
            <label>Description (optional)</label>
            <textarea class="form-control" rows="2" 
                      onchange="updateHonor(${index}, 'description', this.value)">${honor.description || ''}</textarea>
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderHonors()">Done</button>
        </div>
    `;
};

window.updateHonor = function(index, field, value) {
    portfolioData.honors[index][field] = value;
};

window.deleteHonor = function(index) {
    if (confirm('Are you sure you want to delete this honor?')) {
        portfolioData.honors.splice(index, 1);
        renderHonors();
        showToast('Honor deleted');
    }
};

// Service Section
function renderService() {
    const container = document.getElementById('serviceList');
    container.innerHTML = '';
    
    portfolioData.service.forEach((service, index) => {
        container.appendChild(createServiceCard(service, index));
    });
}

function createServiceCard(service, index) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-header">
            <h3>${service.role || 'New Service'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editService(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteService(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Organization:</strong> ${service.organization || ''}</p>
        <p><strong>Period:</strong> ${service.period || ''}</p>
        ${service.description ? `<p>${service.description}</p>` : ''}
    `;
    return card;
}

window.addService = function() {
    const newService = {
        role: '',
        organization: '',
        period: '',
        description: ''
    };
    portfolioData.service.push(newService);
    renderService();
    editService(portfolioData.service.length - 1);
};

window.editService = function(index) {
    const service = portfolioData.service[index];
    const card = document.querySelectorAll('#serviceList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Role</label>
            <input type="text" class="form-control" value="${service.role || ''}" 
                   onchange="updateService(${index}, 'role', this.value)">
        </div>
        <div class="form-group">
            <label>Organization</label>
            <input type="text" class="form-control" value="${service.organization || ''}" 
                   onchange="updateService(${index}, 'organization', this.value)">
        </div>
        <div class="form-group">
            <label>Period</label>
            <input type="text" class="form-control" value="${service.period || ''}" 
                   placeholder="e.g., 2022 - Present"
                   onchange="updateService(${index}, 'period', this.value)">
        </div>
        <div class="form-group">
            <label>Description (optional)</label>
            <textarea class="form-control" rows="2" 
                      onchange="updateService(${index}, 'description', this.value)">${service.description || ''}</textarea>
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderService()">Done</button>
        </div>
    `;
};

window.updateService = function(index, field, value) {
    portfolioData.service[index][field] = value;
};

window.deleteService = function(index) {
    if (confirm('Are you sure you want to delete this service?')) {
        portfolioData.service.splice(index, 1);
        renderService();
        showToast('Service deleted');
    }
};

// Affiliations Section
function renderAffiliations() {
    const container = document.getElementById('affiliationsList');
    container.innerHTML = '';
    
    portfolioData.affiliations.forEach((affiliation, index) => {
        container.appendChild(createAffiliationCard(affiliation, index));
    });
}

function createAffiliationCard(affiliation, index) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-header">
            <h3>${affiliation.name || 'New Affiliation'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editAffiliation(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteAffiliation(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Role:</strong> ${affiliation.role || ''}</p>
        ${affiliation.period ? `<p><strong>Period:</strong> ${affiliation.period}</p>` : ''}
    `;
    return card;
}

window.addAffiliation = function() {
    const newAffiliation = {
        name: '',
        role: '',
        period: ''
    };
    portfolioData.affiliations.push(newAffiliation);
    renderAffiliations();
    editAffiliation(portfolioData.affiliations.length - 1);
};

window.editAffiliation = function(index) {
    const affiliation = portfolioData.affiliations[index];
    const card = document.querySelectorAll('#affiliationsList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Organization Name</label>
            <input type="text" class="form-control" value="${affiliation.name || ''}" 
                   onchange="updateAffiliation(${index}, 'name', this.value)">
        </div>
        <div class="form-group">
            <label>Role/Membership Type</label>
            <input type="text" class="form-control" value="${affiliation.role || ''}" 
                   onchange="updateAffiliation(${index}, 'role', this.value)">
        </div>
        <div class="form-group">
            <label>Period (optional)</label>
            <input type="text" class="form-control" value="${affiliation.period || ''}" 
                   placeholder="e.g., 2020 - Present"
                   onchange="updateAffiliation(${index}, 'period', this.value)">
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderAffiliations()">Done</button>
        </div>
    `;
};

window.updateAffiliation = function(index, field, value) {
    portfolioData.affiliations[index][field] = value;
};

window.deleteAffiliation = function(index) {
    if (confirm('Are you sure you want to delete this affiliation?')) {
        portfolioData.affiliations.splice(index, 1);
        renderAffiliations();
        showToast('Affiliation deleted');
    }
};

// Languages Section
function renderLanguages() {
    const container = document.getElementById('languagesList');
    container.innerHTML = '';
    
    portfolioData.languages.forEach((language, index) => {
        container.appendChild(createLanguageCard(language, index));
    });
}

function createLanguageCard(language, index) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-header">
            <h3>${language.name || 'New Language'}</h3>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editLanguage(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteLanguage(${index})">Delete</button>
            </div>
        </div>
        <p><strong>Proficiency:</strong> ${language.proficiency || ''}</p>
    `;
    return card;
}

window.addLanguage = function() {
    const newLanguage = {
        name: '',
        proficiency: ''
    };
    portfolioData.languages.push(newLanguage);
    renderLanguages();
    editLanguage(portfolioData.languages.length - 1);
};

window.editLanguage = function(index) {
    const language = portfolioData.languages[index];
    const card = document.querySelectorAll('#languagesList .item-card')[index];
    
    card.innerHTML = `
        <div class="form-group">
            <label>Language</label>
            <input type="text" class="form-control" value="${language.name || ''}" 
                   onchange="updateLanguage(${index}, 'name', this.value)">
        </div>
        <div class="form-group">
            <label>Proficiency</label>
            <select class="form-control" onchange="updateLanguage(${index}, 'proficiency', this.value)">
                <option value="">Select Proficiency</option>
                <option value="Native" ${language.proficiency === 'Native' ? 'selected' : ''}>Native</option>
                <option value="Fluent" ${language.proficiency === 'Fluent' ? 'selected' : ''}>Fluent</option>
                <option value="Professional" ${language.proficiency === 'Professional' ? 'selected' : ''}>Professional</option>
                <option value="Conversational" ${language.proficiency === 'Conversational' ? 'selected' : ''}>Conversational</option>
                <option value="Basic" ${language.proficiency === 'Basic' ? 'selected' : ''}>Basic</option>
            </select>
        </div>
        <div class="item-actions">
            <button class="btn btn-small btn-success" onclick="renderLanguages()">Done</button>
        </div>
    `;
};

window.updateLanguage = function(index, field, value) {
    portfolioData.languages[index][field] = value;
};

window.deleteLanguage = function(index) {
    if (confirm('Are you sure you want to delete this language?')) {
        portfolioData.languages.splice(index, 1);
        renderLanguages();
        showToast('Language deleted');
    }
};

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show' + (isError ? ' error' : '');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy to clipboard', true);
        });
    } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast('Copied to clipboard!');
            } else {
                showToast('Failed to copy to clipboard', true);
            }
        } catch (err) {
            showToast('Failed to copy to clipboard', true);
        }
        
        document.body.removeChild(textArea);
    }
}

// Password Change Functions
function showPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('currentPassword').focus();
    clearPasswordForm();
}

function hidePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    clearPasswordForm();
}

function clearPasswordForm() {
    document.getElementById('passwordChangeForm').reset();
    document.getElementById('passwordError').textContent = '';
    resetPasswordStrength();
}

function updatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        resetPasswordStrength();
        return;
    }
    
    const strength = calculatePasswordStrength(password);
    
    // Remove all strength classes
    strengthBar.className = 'strength-bar';
    strengthText.className = 'strength-text';
    
    // Add appropriate strength class
    strengthBar.classList.add(strength.class);
    strengthText.classList.add(strength.class);
    strengthText.textContent = strength.text;
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('at least 8 characters');
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('special characters');
    
    // Determine strength level
    if (score < 2) {
        return { class: 'weak', text: 'Weak - Add ' + feedback.slice(0, 2).join(' and ') };
    } else if (score < 3) {
        return { class: 'fair', text: 'Fair - Add ' + feedback.slice(0, 1).join('') };
    } else if (score < 4) {
        return { class: 'good', text: 'Good password' };
    } else {
        return { class: 'strong', text: 'Strong password' };
    }
}

function resetPasswordStrength() {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    strengthBar.className = 'strength-bar';
    strengthText.className = 'strength-text';
    strengthText.textContent = 'Enter a password';
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    
    if (confirmPassword && newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return false;
    } else {
        errorDiv.textContent = '';
        return true;
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    
    // Validate form
    if (!currentPassword || !newPassword || !confirmPassword) {
        errorDiv.textContent = 'All fields are required';
        return;
    }
    
    if (newPassword.length < 8) {
        errorDiv.textContent = 'New password must be at least 8 characters long';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return;
    }
    
    if (newPassword === currentPassword) {
        errorDiv.textContent = 'New password must be different from current password';
        return;
    }
    
    try {
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            hidePasswordModal();
            showToast('Password updated successfully!', false);
        } else {
            errorDiv.textContent = data.error || 'Failed to update password';
        }
    } catch (error) {
        console.error('Password change error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
    }
}