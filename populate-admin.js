// Script to populate admin system with existing website content

const existingData = {
    about: {
        name: 'Junseok (Joon) Kang',
        title: 'Software Engineer • Data Scientist • Full‑Stack Developer',
        description: 'I am studying Computational Science and Engineering at Harvard University for a Masters Degree, driven by the potential of software to make a real-world difference. I am passionate about hands-on projects and collaborative learning, and I have gained extensive experience in software engineering through internships at companies such as Microsoft, Amazon and Symbotic. I have worked on various projects in the field of data analytics and have expertise in programming languages such as Python, C, Java, C#, and SQL, as well as cloud computing and databases.',
        keywords: ['Machine Learning', 'Data Analytics', 'Cloud Computing', 'Software Engineering', 'Python', 'Java', 'Computer Vision']
    },
    experience: [
        {
            title: 'KATUSA Sergeant, Office of Staff Judge Advocate',
            company: 'US Army',
            startDate: 'Sep 2024',
            endDate: 'Mar 2026',
            location: '',
            description: 'Served as a KATUSA Soldier in the 8th Army, 2nd Infantry Division in the Office of Staff Judge Advocate. Translated cases and in court proceedings.',
            highlights: []
        },
        {
            title: 'Software Engineering Intern',
            company: 'Symbotic',
            startDate: 'May 2024',
            endDate: 'Sep 2024',
            location: '',
            description: 'Worked on the TeleOperations team, adding new and improving features to the existing, deprecated system using Python, PyQt and Internal Engines. Researched potential implementations for better debugging options with BehaviorTrees in core application software of the robotics using C++.',
            highlights: []
        },
        {
            title: 'Co-founder & Project Manager',
            company: 'ii:eum education',
            startDate: 'Feb 2022',
            endDate: 'Sep 2023',
            location: '',
            description: 'Co-founded a non-profit organization in the field of English Education in Korea, providing platforms to connect underprivileged children to international school students. Leading a team of software engineers as head software developer and project manager, using Jira as a planning tool for developing the website. Developed a website with functionalities such as stream-sharing and personal notebooks, as well as scheduling methods using Python Django, SQL and HTML/CSS.',
            highlights: []
        },
        {
            title: 'Software Engineer & Project Manager',
            company: 'Amazon Robotics',
            startDate: 'Sep 2022',
            endDate: 'May 2023',
            location: '',
            description: 'Working as a Project Manager and Software Engineer on the SCOPE team of Amazon Robotics at Olin College of Engineering. Developed networking solutions and software systems for robotic automation.',
            highlights: []
        },
        {
            title: 'Software Engineering Intern',
            company: 'Microsoft',
            startDate: 'May 2022',
            endDate: 'Sep 2022',
            location: '',
            description: 'Worked on a system to parse and convert existing data files to human readable analytic reports on the performance analytic data from 4G/5G performance metrics using Python, Jenkins and Kusto. Developed methods to verify the integrity of data provided by internal infrastructure using Python. Created a report-generating tool that outputs interactive html files that contain formatted and presentable data analytic information using the plotly library.',
            highlights: []
        },
        {
            title: 'Software Engineering Intern',
            company: 'Motivo Engineering',
            startDate: 'Dec 2021',
            endDate: 'Jan 2022',
            location: '',
            description: 'Replaced the core API that drives the company\'s timekeeping tool using REST, XML and SOAP Connections and integrated new functions that improves the efficiency of viewing statistics of user data.',
            highlights: []
        },
        {
            title: 'Software Engineering Intern',
            company: 'Verve Motion',
            startDate: 'Sep 2021',
            endDate: 'Dec 2021',
            location: '',
            description: 'Created data analytic page linked with Google Firestore in the internal website with various functions such as automatic pdf generation and email sending using JS, JQuery and HTML. Developed a data transferring tool to compress and upload non-duplicate and time sensitive data to google cloud storage from the company\'s local gateways using Python. Developed data analytic tools including data extracting modules from excel files and data integration with firebase, as well as multiple data visualization tools with sqlite and Python.',
            highlights: []
        },
        {
            title: 'Automation Engineering Intern',
            company: 'SummerBio',
            startDate: 'Jun 2022',
            endDate: 'Sep 2021',
            location: '',
            description: 'Developed software modules in automated throughput for Covid-19 PCR testing using C/WPF. Developed Image Processing Modules for decapper error detection and barcode reading with .NET/C and Winforms, Python and CUDA cores.',
            highlights: []
        },
        {
            title: 'Software Design Teaching Assistant',
            company: 'Olin College',
            startDate: 'Jan 2021',
            endDate: 'Jun 2021',
            location: '',
            description: 'Teaching assistant at Olin College of Engineering in Software Design (ENGR2510). Taught students basics of coding and logic, code management, version control and other basics of becoming a developer using Python as the main language.',
            highlights: []
        },
        {
            title: 'Full Stack Developer',
            company: 'Purgo Biologics',
            startDate: 'Mar 2020',
            endDate: 'Dec 2020',
            location: '',
            description: 'Created and deployed web application with full security measures based on Python flask, HTML, CSS, JS and ubuntu server management to assist salespeople with their current sales revenue compared to prior month and provided data on possible focus in certain customers for future reference. Provided categorization to company\'s customers in terms of potential sales quantity and level of potential purchase rates based on their data using machine learning and data analysis techniques in Python. Produced web application based on Python flask and ubuntu server management on subject of product subsidiary stock management and data visualization for product shipping and manufacturing.',
            highlights: []
        }
    ],
    research: [
        {
            area: 'Data Analytic Researcher',
            period: 'Sep 2022 – Current',
            institution: 'Olin College of Engineering • Prof. Paul Ruvolo',
            description: 'Constructed a system that allows data evaluation and integrity testing for geospatial location plots and cloud anchors for navigation applications for the blind with professor Paul Ruvolo and the OCCAM Lab at Olin College of Engineering.'
        },
        {
            area: 'Data Management Researcher',
            period: 'Jan 2021 – Jun 2021',
            institution: 'Olin College of Engineering • Prof. Scott Hersey',
            description: 'Created and managed database to contain SWIM Flight Data for tracking and managing anomalies and patterns. Developed internal software to automatically collect, parse, and filter data from source and stream data points into the server for integration. Performed data analysis research on FAA flight data and pollutant levels near Boston Logan International Airport.'
        },
        {
            area: 'Cryptocurrency Data Researcher',
            period: 'Jun 2020 – Nov 2020',
            institution: 'Olin College of Engineering • Prof. Stephanos Matsumoto',
            description: 'Worked full time as a researcher on the topic of gas consumption and its efficiency in ethereum cryptocurrency. Used multiple data analysis techniques with Python and R to uncover interesting user traits when dealing with faulty transactions, as well as general trends of usage in relation to input of users.'
        },
        {
            area: 'ML and Image Processing Researcher',
            period: 'Jun 2018 – Jul 2018',
            institution: 'Dongguk University • Prof. Donghwan Kim',
            description: 'Research and development on image processing and machine learning on 3D particles using MATLAB and fourier transformations. Studied methods of error detection in hue and color saturation using computer vision using OpenCV. Published a research article on AMS based on a prototype created in a private company that detects particles and their defects.'
        }
    ],
    skills: [
        {
            category: 'Programming Languages',
            skills: ['Python', 'Java', 'C', 'C++', 'JavaScript', 'HTML', 'CSS', 'SQL', 'MATLAB', 'Golang', 'OCaml', 'PHP', 'LaTeX']
        },
        {
            category: 'Frameworks & Libraries',
            skills: ['ReactJS', 'Flask', 'Django', 'PyQt', 'WPF', '.NET', 'WinForms', 'jQuery', 'OpenCV', 'Plotly']
        },
        {
            category: 'Technologies & Tools',
            skills: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Jenkins', 'Jira', 'Git', 'Ubuntu', 'CUDA', 'Kusto', 'Firebase', 'SQLite']
        },
        {
            category: 'Specializations',
            skills: ['Machine Learning', 'Data Mining', 'Computer Vision', 'Image Processing', 'Data Analytics', 'REST APIs', 'SOAP', 'XML', 'TCP/IP', 'VPN']
        }
    ],
    certifications: [
        {
            name: 'MTA 98-381 Python Programming',
            issuer: 'Microsoft',
            date: '2021',
            credentialId: ''
        },
        {
            name: 'Certified Lifeguard',
            issuer: 'YMCA',
            date: '2019',
            credentialId: ''
        },
        {
            name: 'Bilingual Diploma',
            issuer: 'International Baccalaureate',
            date: '2019',
            credentialId: ''
        },
        {
            name: 'Oracle Certified Professional Java SE 6',
            issuer: 'Oracle',
            date: '2017',
            credentialId: ''
        }
    ],
    projects: [
        {
            name: 'FAA Flight Data Management System',
            date: 'Jan 2021 – Jun 2021',
            description: 'Comprehensive flight data analysis and pollutant tracking system with automated ETL pipelines. Built scalable data infrastructure processing 2GB+ daily flight logs with real-time analytics capabilities.',
            technologies: ['Python', 'AWS Aurora', 'MySQL', 'ETL'],
            link: 'https://github.com/joon628/FAADataSort',
            linkText: 'GitHub Repository'
        },
        {
            name: 'Monte Carlo Tree Search Research',
            date: 'Nov 2020 – Dec 2020',
            description: 'Advanced game AI research implementing Monte Carlo Tree Search algorithms for strategic gameplay. Presented comprehensive analysis of UCT policy optimization and rollout strategies.',
            technologies: ['Python', 'Game AI', 'MCTS', 'Research'],
            link: 'https://drive.google.com/drive/folders/1qq217b-Lk9HlNgN5cdYeKdXrNqj-ARSc',
            linkText: 'View Research'
        },
        {
            name: 'Spotify Song Data Analysis',
            date: 'Nov 2020 – Dec 2020',
            description: 'Machine learning analysis of 33K+ tracks using Spotify\'s audio features. Built predictive models for song popularity with interactive Shiny dashboard for A&R team insights.',
            technologies: ['R', 'Spotify API', 'Machine Learning', 'Shiny'],
            link: 'https://github.com/joon628/DataScience_Spotify_Analysis',
            linkText: 'GitHub Repository'
        },
        {
            name: 'Fall Detection Algorithm',
            date: 'Dec 2020',
            description: 'Real-time fall detection system using accelerometer data and FFT analysis. Achieved 95% sensitivity with 1% false-positive rate, deployed on ESP32 microcontroller.',
            technologies: ['Python', 'ESP32', 'Signal Processing', 'IoT'],
            link: 'https://github.com/joon628/Quantitative_Fall_Detection_Analysis',
            linkText: 'GitHub Repository'
        },
        {
            name: 'Passive Solar House Analysis',
            date: 'Oct 2020',
            description: 'MATLAB-based thermal modeling system for optimizing house insulation efficiency. Implemented finite-difference heat transfer models with hourly temperature analysis.',
            technologies: ['MATLAB', 'Thermal Modeling', 'Energy Analysis'],
            link: 'https://github.com/joon628/QEA_Bridge_of_Doom',
            linkText: 'GitHub Repository'
        },
        {
            name: 'Robot Path Planning with LIDAR',
            date: 'May 2020',
            description: 'Autonomous navigation system using RANSAC and linear regression for obstacle detection. Optimized path planning algorithms achieving sub-50ms response times.',
            technologies: ['Python', 'LIDAR', 'Robotics', 'Computer Vision'],
            link: 'https://github.com/joon628/Quantitative_Engineering_Analysis_Robot_Simulation',
            linkText: 'GitHub Repository'
        }
    ],
    education: [
        {
            degree: 'M.S. Computational Science & Engineering',
            institution: 'Harvard University',
            startDate: '2023',
            endDate: '2024',
            gpa: '',
            honors: ''
        },
        {
            degree: 'B.S. Engineering in Computers, Concentration in Entrepreneurship',
            institution: 'Franklin W. Olin College of Engineering',
            startDate: '2019',
            endDate: '2023',
            gpa: '',
            honors: ''
        }
    ],
    publications: [
        {
            title: 'Solving Double Execution of Java\'s paint() Method by Counting Down to the Heat Death of the Universe',
            authors: 'Braden Oh, Vedaant Kuchhal, Junseok Kang et al.',
            venue: 'SIGBOVIK',
            year: '2022',
            link: ''
        },
        {
            title: 'Study on the Resolution of Digital Image Using Computational and Mathematical Analysis',
            authors: 'Kang, Junseok and Richard Kyung',
            venue: 'American Mathematical Society',
            year: '2018',
            link: ''
        }
    ],
    patents: [
        {
            title: 'Product Inventory Management System and Means to Manage Stock by Using the System',
            number: 'KR 10‑2016‑0117022',
            status: 'Granted',
            date: 'March 2016'
        }
    ],
    honors: [
        {
            title: 'Commandant\'s List',
            issuer: 'Eighth Army Wightman NCO Academy',
            date: '2024',
            description: 'Top 10 percent of class at the Eighth Army Wightman NCO Academy'
        },
        {
            title: 'Olin College Tuition Scholarship',
            issuer: 'Olin College',
            date: '2019',
            description: 'Full tuition scholarship valued at $110,000'
        },
        {
            title: 'VEX Robotics Excellence Award & Tournament Champion',
            issuer: 'VEX Robotics',
            date: '2018',
            description: 'VEX Robotics National Championship'
        },
        {
            title: 'Korea CORE/Seoul Metropolitan Council Award',
            issuer: 'Korea CORE',
            date: '2017',
            description: 'Recognition for translating text on independence martyrs in Korea to raise awareness'
        }
    ],
    service: [
        {
            role: 'President',
            organization: 'PowerChords A Capella',
            period: '2019 – Current',
            description: 'Led and served the only A Capella group in Olin College of Engineering. Performed multiple shows on and off campus. Participated in ICCAs as a team.'
        },
        {
            role: 'Lead Programmer',
            organization: 'VEX Robotics Team 6724B',
            period: '2018 – 2019',
            description: 'Led and programmed robot for team 6724B, based in Seoul, Korea. Ranked 1st Nationwide twice, with numerous awards in regionals and nationals.'
        },
        {
            role: 'Cooking Volunteer, Co-Chef',
            organization: 'Nanu Lee Orphanage',
            period: '2015 – 2019',
            description: 'Cooked and distributed food for 4 different orphanages every month, each with about 100-200 kids.'
        },
        {
            role: 'Translator',
            organization: 'Korea CORE Volunteer Team',
            period: '2016 – 2017',
            description: 'Translated for a book about Korea\'s unknown national heroes who participated in resistance from Japan in the 1930-40s.'
        }
    ],
    affiliations: [
        {
            name: 'United Nations',
            role: 'Translator',
            period: '2019'
        }
    ],
    languages: [
        {
            name: 'Korean',
            proficiency: 'Native'
        },
        {
            name: 'English',
            proficiency: 'Native'
        },
        {
            name: 'Japanese',
            proficiency: 'Conversational'
        }
    ],
    contact: {
        email: 'jkang@g.harvard.edu',
        phone: '781-975-9059',
        linkedin: '',
        github: '',
        location: ''
    }
};

// Function to populate localStorage with existing data
function populateAdminData() {
    const STORAGE_KEY = 'portfolioData';
    // Clear any existing data to ensure fresh start
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    console.log('Admin system populated with existing website content!');
    alert('✅ Admin system has been populated with existing website content!\n\nYou can now access the admin panel and edit all sections.');
}

// Function to refresh data structure (can be called manually)
function refreshAdminData() {
    const STORAGE_KEY = 'portfolioData';
    const currentData = localStorage.getItem(STORAGE_KEY);
    
    if (currentData) {
        const parsed = JSON.parse(currentData);
        // Check if research data has the new fields
        if (parsed.research && parsed.research.length > 0 && !parsed.research[0].hasOwnProperty('period')) {
            console.log('Updating data structure...');
            populateAdminData();
            return true;
        }
        // Check if projects have linkText field
        if (parsed.projects && parsed.projects.length > 0 && !parsed.projects[0].hasOwnProperty('linkText')) {
            console.log('Updating data structure...');
            populateAdminData();
            return true;
        }
    }
    return false;
}

// Check if we need to populate or refresh data
const STORAGE_KEY = 'portfolioData';
const currentData = localStorage.getItem(STORAGE_KEY);

if (!currentData) {
    // No data exists, populate with fresh data
    populateAdminData();
} else {
    // Data exists, check if it needs updating
    if (!refreshAdminData()) {
        console.log('Data structure is up to date');
    }
}

// Make refreshAdminData available globally for manual refresh
window.refreshAdminData = refreshAdminData;