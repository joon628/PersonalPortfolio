const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'portfolio.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to SQLite database');
});

db.all("SELECT section_name, LENGTH(data) as data_length FROM portfolio_data ORDER BY section_name", (err, rows) => {
    if (err) {
        console.error('Error querying database:', err.message);
    } else {
        console.log('\n📊 Database Contents:');
        console.log('='.repeat(40));
        rows.forEach(row => {
            console.log(`${row.section_name.padEnd(15)} | ${row.data_length.toString().padStart(6)} chars`);
        });
        console.log('='.repeat(40));
        
        // Get sample experience data to verify structure
        db.get("SELECT data FROM portfolio_data WHERE section_name = 'experience'", (err, row) => {
            if (!err && row) {
                const experience = JSON.parse(row.data);
                console.log(`\n✅ Sample: Experience section has ${experience.length} entries`);
                console.log(`   First entry: ${experience[0]?.company} - ${experience[0]?.title}`);
            }
            
            // Get sample projects data
            db.get("SELECT data FROM portfolio_data WHERE section_name = 'projects'", (err, row) => {
                if (!err && row) {
                    const projects = JSON.parse(row.data);
                    console.log(`✅ Sample: Projects section has ${projects.length} entries`);
                    console.log(`   First entry: ${projects[0]?.name}`);
                }
                
                db.close();
            });
        });
    }
});