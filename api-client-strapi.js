// API Client for Strapi CMS
// Fetches portfolio data from Strapi REST API

class PortfolioAPI {
    constructor() {
        // Use relative URLs so requests go through nginx proxy
        // In production: nginx proxies /api -> http://portfolio-strapi:1337/api (internal)
        // In development: can use localhost:1337 directly or run through nginx
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isDev) {
            // Development: direct to Strapi
            this.strapiURL = 'http://localhost:1337';
            this.apiURL = `${this.strapiURL}/api`;
        } else {
            // Production: use relative URLs (proxied by nginx)
            this.strapiURL = '';
            this.apiURL = '/api';
        }

        console.log(`Portfolio API initialized: ${this.apiURL || 'relative URLs'}`);
    }

    // Parse date string to Date object for sorting
    // Handles formats like "Mar 2020", "Jun 2022 – Current", "2023", etc.
    parseDate(dateStr) {
        if (!dateStr) return new Date(0); // Return epoch for missing dates

        // Extract the first date from range (handles both en-dash – and hyphen -)
        // e.g., "Jun 2022 – Current" -> "Jun 2022" or "Jul 2025 - Current" -> "Jul 2025"
        const firstDate = dateStr.split(/[–-]/)[0].trim();

        // Try to parse as a year only (e.g., "2023")
        if (/^\d{4}$/.test(firstDate)) {
            return new Date(parseInt(firstDate), 0, 1);
        }

        // Try to parse "Mon YYYY" format (e.g., "Mar 2020")
        const parsed = Date.parse(firstDate);
        if (!isNaN(parsed)) {
            return new Date(parsed);
        }

        // Fallback to epoch
        return new Date(0);
    }

    // Fetch data from Strapi with client-side date sorting
    async fetchFromStrapi(endpoint, populate = false) {
        // Map endpoints to their date fields for sorting (newest first)
        const dateFields = {
            'experiences': 'startDate',
            'researches': 'period',
            'certifications': 'date',
            'projects': 'date',
            'publications': 'year',
            'patents': 'filingDate',
            'honors': 'date',
            'services': 'period',
            'affiliations': 'period',
        };

        const populateParam = populate ? 'populate=*' : '';
        const url = `${this.apiURL}/${endpoint}${populateParam ? '?' + populateParam : ''}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            // Client-side sorting by date field if applicable
            const dateField = dateFields[endpoint];
            if (dateField && result.data && Array.isArray(result.data)) {
                console.log(`Sorting ${endpoint} by ${dateField}, found ${result.data.length} items`);
                result.data.sort((a, b) => {
                    // Access date field directly from the item (Strapi v5 flattened structure)
                    const dateA = this.parseDate(a[dateField]);
                    const dateB = this.parseDate(b[dateField]);

                    // Debug log for experiences only
                    if (endpoint === 'experiences') {
                        console.log(`  ${a[dateField]} (${dateA.toISOString()}) vs ${b[dateField]} (${dateB.toISOString()}) = ${dateB - dateA}`);
                    }

                    return dateB - dateA; // Descending order (newest first)
                });
                console.log(`After sorting ${endpoint}:`, result.data.map(item => item[dateField]));
            }

            return result;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    }

    // Get public portfolio data (main method used by frontend)
    async getPublicPortfolioData() {
        try {
            // Fetch all data in parallel
            const [
                aboutRes,
                contactRes,
                experiencesRes,
                researchesRes,
                skillsRes,
                certificationsRes,
                projectsRes,
                educationsRes,
                publicationsRes,
                patentsRes,
                honorsRes,
                servicesRes,
                affiliationsRes,
                languagesRes
            ] = await Promise.all([
                this.fetchFromStrapi('about'),
                this.fetchFromStrapi('contact'),
                this.fetchFromStrapi('experiences', true),
                this.fetchFromStrapi('researches', true),
                this.fetchFromStrapi('skills', true),
                this.fetchFromStrapi('certifications', true),
                this.fetchFromStrapi('projects', true),
                this.fetchFromStrapi('educations', true),
                this.fetchFromStrapi('publications', true),
                this.fetchFromStrapi('patents', true),
                this.fetchFromStrapi('honors', true),
                this.fetchFromStrapi('services', true),
                this.fetchFromStrapi('affiliations', true),
                this.fetchFromStrapi('languages', true)
            ]);

            // Transform Strapi response format to match old API format
            // Single types: extract data object
            // Collection types: extract data array

            // Helper to extract attributes from Strapi response
            const extractData = (item) => {
                if (!item) return null;
                const { id, documentId, createdAt, updatedAt, publishedAt, ...attributes } = item;
                return attributes;
            };

            return {
                about: aboutRes?.data ? extractData(aboutRes.data) : {},
                contact: contactRes?.data ? extractData(contactRes.data) : {},
                experience: (experiencesRes?.data || []).map(extractData).filter(Boolean),
                research: (researchesRes?.data || []).map(extractData).filter(Boolean),
                skills: (skillsRes?.data || []).map(extractData).filter(Boolean),
                certifications: (certificationsRes?.data || []).map(extractData).filter(Boolean),
                projects: (projectsRes?.data || []).map(extractData).filter(Boolean),
                education: (educationsRes?.data || []).map(extractData).filter(Boolean),
                publications: (publicationsRes?.data || []).map(extractData).filter(Boolean),
                patents: (patentsRes?.data || []).map(extractData).filter(Boolean),
                honors: (honorsRes?.data || []).map(extractData).filter(Boolean),
                service: (servicesRes?.data || []).map(extractData).filter(Boolean),
                affiliations: (affiliationsRes?.data || []).map(extractData).filter(Boolean),
                languages: (languagesRes?.data || []).map(extractData).filter(Boolean),
            };
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            return null;
        }
    }

    // Compatibility method (same as old API)
    async getPortfolioData() {
        return await this.getPublicPortfolioData();
    }

    // Health check
    async ping() {
        try {
            const response = await fetch(`${this.strapiURL}/_health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Create global instance
const portfolioAPI = new PortfolioAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioAPI;
}

// Make available globally
window.portfolioAPI = portfolioAPI;
