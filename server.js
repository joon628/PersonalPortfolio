const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'portfolio.db');

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Session configuration
app.use(session({
    secret: 'portfolio-admin-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables if they don't exist
function initializeDatabase() {
    const createTables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS portfolio_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_name TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_by TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    createTables.forEach(sql => {
        db.run(sql, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    });

    // Create default admin user if none exists
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (!err && row.count === 0) {
            const defaultPassword = 'P@rtf0lioQFDVTR!';
            bcrypt.hash(defaultPassword, 10, (err, hash) => {
                if (!err) {
                    db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                           ['admin', hash], (err) => {
                        if (!err) {
                            console.log('Default admin user created with password:', defaultPassword);
                        }
                    });
                }
            });
        }
    });
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Routes

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password_hash, (err, match) => {
            if (err) {
                return res.status(500).json({ error: 'Authentication error' });
            }
            
            if (match) {
                req.session.userId = user.id;
                req.session.username = user.username;
                res.json({ message: 'Login successful', username: user.username });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Change password endpoint
app.post('/api/auth/change-password', requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Get current user
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        bcrypt.compare(currentPassword, user.password_hash, (err, match) => {
            if (err) {
                return res.status(500).json({ error: 'Authentication error' });
            }
            
            if (!match) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            // Hash new password
            bcrypt.hash(newPassword, 10, (err, newHash) => {
                if (err) {
                    return res.status(500).json({ error: 'Password hashing error' });
                }
                
                // Update password in database
                db.run("UPDATE users SET password_hash = ? WHERE id = ?", 
                       [newHash, userId], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).json({ error: 'Failed to update password' });
                    }
                    
                    console.log(`Password updated for user: ${user.username}`);
                    res.json({ message: 'Password updated successfully' });
                });
            });
        });
    });
});

// Get all portfolio data
app.get('/api/portfolio', requireAuth, (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    db.all("SELECT section_name, data FROM portfolio_data ORDER BY section_name", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const portfolioData = {};
        rows.forEach(row => {
            try {
                portfolioData[row.section_name] = JSON.parse(row.data);
            } catch (e) {
                console.error(`Error parsing data for section ${row.section_name}:`, e);
                portfolioData[row.section_name] = [];
            }
        });

        res.json(portfolioData);
    });
});

// Get portfolio data for public view (no auth required)
app.get('/api/portfolio/public', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    db.all("SELECT section_name, data FROM portfolio_data ORDER BY section_name", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const portfolioData = {};
        rows.forEach(row => {
            try {
                portfolioData[row.section_name] = JSON.parse(row.data);
            } catch (e) {
                console.error(`Error parsing data for section ${row.section_name}:`, e);
                portfolioData[row.section_name] = [];
            }
        });

        res.json(portfolioData);
    });
});

// Update portfolio data
app.post('/api/portfolio', requireAuth, (req, res) => {
    const portfolioData = req.body;
    const username = req.session.username;

    if (!portfolioData || typeof portfolioData !== 'object') {
        return res.status(400).json({ error: 'Invalid portfolio data' });
    }

    // Start transaction
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        let hasError = false;
        const promises = [];

        Object.keys(portfolioData).forEach(sectionName => {
            const promise = new Promise((resolve, reject) => {
                const data = JSON.stringify(portfolioData[sectionName]);
                
                db.run(`INSERT OR REPLACE INTO portfolio_data 
                       (section_name, data, updated_at, updated_by) 
                       VALUES (?, ?, CURRENT_TIMESTAMP, ?)`,
                       [sectionName, data, username], (err) => {
                    if (err) {
                        console.error(`Error updating section ${sectionName}:`, err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            promises.push(promise);
        });

        Promise.all(promises)
            .then(() => {
                db.run("COMMIT", (err) => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        res.status(500).json({ error: 'Failed to save data' });
                    } else {
                        res.json({ message: 'Portfolio data saved successfully' });
                    }
                });
            })
            .catch((err) => {
                db.run("ROLLBACK");
                console.error('Error in transaction:', err);
                res.status(500).json({ error: 'Failed to save data' });
            });
    });
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve main site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

module.exports = app;