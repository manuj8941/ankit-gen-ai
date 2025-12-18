const initSqlJs = require( 'sql.js' );
const fs = require( 'fs' );
const path = require( 'path' );

const DB_PATH = path.join( __dirname, 'docs.db' );

let db = null;

/**
 * Initialize the database connection
 */
async function initDatabase ()
{
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if ( fs.existsSync( DB_PATH ) )
    {
        const buffer = fs.readFileSync( DB_PATH );
        db = new SQL.Database( buffer );
        console.log( 'Database loaded from file' );
    } else
    {
        db = new SQL.Database();
        console.log( 'New database created' );
    }

    return db;
}

/**
 * Save database to file
 */
function saveDatabase ()
{
    if ( !db )
    {
        throw new Error( 'Database not initialized' );
    }
    const data = db.export();
    const buffer = Buffer.from( data );
    fs.writeFileSync( DB_PATH, buffer );
}

/**
 * Get database instance
 */
function getDatabase ()
{
    if ( !db )
    {
        throw new Error( 'Database not initialized. Call initDatabase() first' );
    }
    return db;
}

/**
 * Close database connection
 */
function closeDatabase ()
{
    if ( db )
    {
        saveDatabase();
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    saveDatabase,
    getDatabase,
    closeDatabase
};
