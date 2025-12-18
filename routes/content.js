const express = require( 'express' );
const router = express.Router();
const { marked } = require( 'marked' );
const {
    getPageBySlug,
    getRootPages,
    getChildren,
    getAncestors,
    getRootPage
} = require( '../models/pages' );

// Configure marked for better markdown rendering
marked.setOptions( {
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
} );

/**
 * Single generic route handler for all content pages
 * This is the ONLY content route - handles unlimited hierarchy
 */
router.get( '/:slug', async ( req, res, next ) =>
{
    try
    {
        const { slug } = req.params;

        // Fetch the page
        const page = getPageBySlug( slug );

        // 404 if page not found
        if ( !page )
        {
            return res.status( 404 ).render( 'error', {
                title: 'Page Not Found',
                message: `The page "${ slug }" does not exist.`,
                error: { status: 404 }
            } );
        }

        // Convert markdown to HTML
        const htmlContent = page.content ? marked.parse( page.content ) : '';

        // Gather all navigation data
        const rootPages = getRootPages(); // Top navigation
        const ancestors = getAncestors( page.id ); // Breadcrumbs
        const children = getChildren( page.id ); // Sidebar items

        // Get the root page for this page (for sidebar context)
        const rootPage = page.parent_id ? getRootPage( page.id ) : page;

        // Get all siblings and children under the root (for full sidebar tree)
        const sidebarTree = rootPage ? getChildren( rootPage.id ) : [];

        // Build complete sidebar recursively
        function buildSidebarTree ( parentId )
        {
            const items = getChildren( parentId );
            return items.map( item => ( {
                ...item,
                children: buildSidebarTree( item.id )
            } ) );
        }

        const fullSidebar = rootPage ? buildSidebarTree( rootPage.id ) : [];

        // Prepare data for the template
        const templateData = {
            page: {
                ...page,
                content: htmlContent // Replace markdown with HTML
            },
            rootPages,
            ancestors,
            children,
            rootPage,
            fullSidebar,
            currentSlug: slug
        };

        // Render the appropriate layout based on page.layout_type
        res.render( `layouts/${ page.layout_type }`, templateData );

    } catch ( error )
    {
        next( error );
    }
} );

module.exports = router;
