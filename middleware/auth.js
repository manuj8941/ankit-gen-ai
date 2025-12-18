// Admin authentication middleware with encrypted password comparison
const crypto = require( 'crypto' );
const util = require( 'util' );

// Promisify scrypt for async/await usage
const scrypt = util.promisify( crypto.scrypt );

// Password configuration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SALT = process.env.PASSWORD_SALT || 'default-salt-change-in-production';

// Cache the hashed password on startup for performance
let cachedHashedPassword = null;

async function hashPassword ( password )
{
    const derivedKey = await scrypt( password, SALT, 64 );
    return derivedKey.toString( 'hex' );
}

// Initialize cached hash
( async () =>
{
    cachedHashedPassword = await hashPassword( ADMIN_PASSWORD );
} )();

function requireAuth ( req, res, next )
{
    // Check if authenticated
    if ( req.session && req.session.isAuthenticated )
    {
        return next();
    }

    // If trying to access login or authenticate routes, allow
    if ( req.path === '/login' || req.path === '/authenticate' )
    {
        return next();
    }

    // Otherwise redirect to login
    res.redirect( '/admin/login' );
}

async function authenticate ( req, res )
{
    const { password } = req.body;

    try
    {
        // Hash the input password
        const inputHash = await hashPassword( password );

        // Constant-time comparison to prevent timing attacks
        const isValid = crypto.timingSafeEqual(
            Buffer.from( inputHash, 'hex' ),
            Buffer.from( cachedHashedPassword, 'hex' )
        );

        if ( isValid )
        {
            req.session.isAuthenticated = true;
            res.redirect( '/admin/tree' );
        } else
        {
            res.redirect( '/admin/login?error=1' );
        }
    } catch ( error )
    {
        console.error( 'Authentication error:', error );
        res.redirect( '/admin/login?error=1' );
    }
}

function logout ( req, res )
{
    req.session.destroy();
    res.redirect( '/admin/login' );
}

module.exports = {
    requireAuth,
    authenticate,
    logout
};
