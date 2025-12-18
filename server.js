const express = require( 'express' );
const session = require( 'express-session' );
const path = require( 'path' );
const { initDatabase, closeDatabase } = require( './db/database' );

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set( 'view engine', 'ejs' );
app.set( 'views', path.join( __dirname, 'views' ) );

// Middleware
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );

// Session middleware for admin authentication
app.use( session( {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
} ) );

// Logging middleware
app.use( ( req, res, next ) =>
{
    console.log( `${ new Date().toISOString() } - ${ req.method } ${ req.url }` );
    next();
} );

// Routes (will be added in later steps)
app.get( '/', ( req, res ) =>
{
    res.redirect( '/docs/home' );
} );

// Content routes - single generic route handler
app.use( '/docs', require( './routes/content' ) );

// Admin routes
app.use( '/admin', require( './routes/admin' ) );

// 404 handler
app.use( ( req, res ) =>
{
    res.status( 404 ).render( 'error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        error: { status: 404 }
    } );
} );

// Error handler
app.use( ( err, req, res, next ) =>
{
    console.error( 'Error:', err );
    res.status( err.status || 500 ).render( 'error', {
        title: 'Error',
        message: err.message || 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err : { status: err.status }
    } );
} );

// Initialize database and start server
async function startServer ()
{
    try
    {
        console.log( 'Initializing database...' );
        await initDatabase();
        console.log( 'Database initialized successfully' );

        app.listen( PORT, () =>
        {
            console.log( `Server running on http://localhost:${ PORT }` );
            console.log( `Environment: ${ process.env.NODE_ENV || 'development' }` );
        } );
    } catch ( error )
    {
        console.error( 'Failed to start server:', error );
        process.exit( 1 );
    }
}

// Graceful shutdown
process.on( 'SIGINT', () =>
{
    console.log( '\nShutting down gracefully...' );
    closeDatabase();
    process.exit( 0 );
} );

process.on( 'SIGTERM', () =>
{
    console.log( '\nShutting down gracefully...' );
    closeDatabase();
    process.exit( 0 );
} );

startServer();
