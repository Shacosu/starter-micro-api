import sqlite3 from 'sqlite3'

const dbConnection = async () => {
    try {
        const db = new sqlite3.Database('./announcements.db', sqlite3.OPEN_READWRITE);
        db.run('CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY, title TEXT, courseName TEXT, description TEXT, date TEXT)')
        // db.run(`INSERT INTO announcements (id, title, courseName, description, date) VALUES (?, ?, ?, ?, ?)`, [1, 'test', 'test', 'test', 'test'])
        return db;
    } catch (error) {
        console.log(error)
    }
}

export default dbConnection;