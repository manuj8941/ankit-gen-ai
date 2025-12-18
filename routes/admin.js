const express = require( 'express' );
const router = express.Router();
const multer = require( 'multer' );
const path = require( 'path' );
const fs = require( 'fs' );
const { requireAuth, authenticate, logout } = require( '../middleware/auth' );
const {
    getAllPages,
    buildTree,
    getPageById,
    createPage,
    updatePage,
    deletePage,
    deletePageRecursive,
    movePage,
    reorderPages
} = require( '../models/pages' );

// Configure multer for image uploads
const storage = multer.diskStorage( {
    destination: ( req, file, cb ) =>
    {
        const uploadDir = path.join( __dirname, '../public/uploads' );
        if ( !fs.existsSync( uploadDir ) )
        {
            fs.mkdirSync( uploadDir, { recursive: true } );
        }
        cb( null, uploadDir );
    },
    filename: ( req, file, cb ) =>
    {
        const uniqueSuffix = Date.now() + '-' + Math.round( Math.random() * 1E9 );
        cb( null, uniqueSuffix + path.extname( file.originalname ) );
    }
} );

const upload = multer( {
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: ( req, file, cb ) =>
    {
        const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
        const extname = allowedTypes.test( path.extname( file.originalname ).toLowerCase() );
        const mimetype = allowedTypes.test( file.mimetype );

        if ( mimetype && extname )
        {
            return cb( null, true );
        } else
        {
            cb( new Error( 'Only image files are allowed!' ) );
        }
    }
} );

/**
 * Login page
 */
router.get( '/login', ( req, res ) =>
{
    res.render( 'admin/login', {
        error: req.query.error === '1'
    } );
} );

/**
 * Authenticate admin
 */
router.post( '/authenticate', authenticate );

/**
 * Logout
 */
router.get( '/logout', logout );

/**
 * Admin dashboard - redirect to tree view
 */
router.get( '/', requireAuth, ( req, res ) =>
{
    res.redirect( '/admin/tree' );
} );

/**
 * Content tree view - main admin interface
 */
router.get( '/tree', requireAuth, ( req, res ) =>
{
    try
    {
        const tree = buildTree();
        const allPages = getAllPages();

        res.render( 'admin/tree', {
            tree,
            allPages,
            title: 'Content Tree'
        } );
    } catch ( error )
    {
        console.error( 'Error loading tree:', error );
        res.status( 500 ).render( 'error', {
            title: 'Error',
            message: 'Failed to load content tree',
            error
        } );
    }
} );

/**
 * Page editor - new page
 */
router.get( '/edit/new', ( req, res ) =>
{
    try
    {
        const { parent } = req.query;
        const allPages = getAllPages();

        res.render( 'admin/edit', {
            page: null,
            isNew: true,
            parentId: parent === 'null' ? null : ( parent ? parseInt( parent ) : null ),
            allPages,
            title: 'New Page'
        } );
    } catch ( error )
    {
        console.error( 'Error loading editor:', error );
        res.status( 500 ).render( 'error', {
            title: 'Error',
            message: 'Failed to load editor',
            error
        } );
    }
} );

/**
 * Page editor - edit existing page
 */
router.get( '/edit/:id', ( req, res ) =>
{
    try
    {
        const { id } = req.params;
        const page = getPageById( parseInt( id ) );

        if ( !page )
        {
            return res.status( 404 ).render( 'error', {
                title: 'Page Not Found',
                message: 'The page you are trying to edit does not exist.',
                error: { status: 404 }
            } );
        }

        const allPages = getAllPages();

        res.render( 'admin/edit', {
            page,
            isNew: false,
            parentId: page.parent_id,
            allPages,
            title: `Edit: ${ page.title }`
        } );
    } catch ( error )
    {
        console.error( 'Error loading editor:', error );
        res.status( 500 ).render( 'error', {
            title: 'Error',
            message: 'Failed to load editor',
            error
        } );
    }
} );

/**
 * Save page (create or update)
 */
router.post( '/save', requireAuth, ( req, res ) =>
{
    try
    {
        const { id, title, slug, parent_id, layout_type, content, order_index, status } = req.body;

        if ( id && id !== 'new' )
        {
            // Update existing page
            updatePage( parseInt( id ), {
                title,
                slug,
                parent_id: parent_id ? parseInt( parent_id ) : null,
                layout_type,
                content,
                order_index: order_index ? parseInt( order_index ) : 0,
                status
            } );
        } else
        {
            // Create new page
            createPage( {
                title,
                slug,
                parent_id: parent_id ? parseInt( parent_id ) : null,
                layout_type,
                content,
                order_index: order_index ? parseInt( order_index ) : 0,
                status
            } );
        }

        res.redirect( '/admin/tree' );
    } catch ( error )
    {
        console.error( 'Error saving page:', error );
        res.status( 500 ).render( 'error', {
            title: 'Error',
            message: 'Failed to save page: ' + error.message,
            error
        } );
    }
} );

/**
 * API: Get tree as JSON
 */
router.get( '/api/tree', requireAuth, ( req, res ) =>
{
    try
    {
        const tree = buildTree();
        res.json( { success: true, tree } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

/**
 * API: Delete page
 */
router.delete( '/api/pages/:id', requireAuth, ( req, res ) =>
{
    try
    {
        const { id } = req.params;
        const { recursive } = req.query;

        if ( recursive === 'true' )
        {
            deletePageRecursive( parseInt( id ) );
        } else
        {
            deletePage( parseInt( id ) );
        }

        res.json( { success: true } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

/**
 * API: Move page to new parent
 */
router.post( '/api/pages/:id/move', requireAuth, ( req, res ) =>
{
    try
    {
        const { id } = req.params;
        const { newParentId } = req.body;

        const page = movePage(
            parseInt( id ),
            newParentId ? parseInt( newParentId ) : null
        );

        res.json( { success: true, page } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

/**
 * API: Reorder pages
 */
router.post( '/api/pages/reorder', requireAuth, ( req, res ) =>
{
    try
    {
        const { pageIds } = req.body;
        reorderPages( pageIds.map( id => parseInt( id ) ) );

        res.json( { success: true } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

/**
 * API: Upload image
 */
router.post( '/api/upload', requireAuth, upload.single( 'image' ), ( req, res ) =>
{
    try
    {
        if ( !req.file )
        {
            return res.status( 400 ).json( { success: false, error: 'No file uploaded' } );
        }

        const imageUrl = `/uploads/${ req.file.filename }`;
        res.json( {
            success: true,
            url: imageUrl,
            filename: req.file.filename
        } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

module.exports = router;
