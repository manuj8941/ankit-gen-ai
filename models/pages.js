const { getDatabase, saveDatabase } = require( '../db/database' );

/**
 * Convert SQL result to array of objects
 */
function resultToArray ( result )
{
    if ( !result || !result[ 0 ] ) return [];

    const columns = result[ 0 ].columns;
    const values = result[ 0 ].values;

    return values.map( row =>
    {
        const obj = {};
        columns.forEach( ( col, index ) =>
        {
            obj[ col ] = row[ index ];
        } );
        return obj;
    } );
}

/**
 * Get a single page by slug
 */
function getPageBySlug ( slug )
{
    const db = getDatabase();
    const result = db.exec(
        'SELECT * FROM pages WHERE slug = ? AND status = ?',
        [ slug, 'published' ]
    );

    const pages = resultToArray( result );
    return pages[ 0 ] || null;
}

/**
 * Get a single page by ID
 */
function getPageById ( id )
{
    const db = getDatabase();
    const result = db.exec( 'SELECT * FROM pages WHERE id = ?', [ id ] );

    const pages = resultToArray( result );
    return pages[ 0 ] || null;
}

/**
 * Get all root pages (top-level navigation)
 */
function getRootPages ()
{
    const db = getDatabase();
    const result = db.exec(
        'SELECT * FROM pages WHERE parent_id IS NULL AND status = ? ORDER BY order_index',
        [ 'published' ]
    );

    return resultToArray( result );
}

/**
 * Get direct children of a page
 */
function getChildren ( parentId )
{
    const db = getDatabase();
    const result = db.exec(
        'SELECT * FROM pages WHERE parent_id = ? AND status = ? ORDER BY order_index',
        [ parentId, 'published' ]
    );

    return resultToArray( result );
}

/**
 * Get all ancestors of a page (for breadcrumbs)
 * Returns array from root to current page's parent
 */
function getAncestors ( pageId )
{
    const db = getDatabase();
    const ancestors = [];
    let currentId = pageId;

    // Follow parent_id chain up to root
    while ( currentId )
    {
        const result = db.exec( 'SELECT * FROM pages WHERE id = ?', [ currentId ] );
        const pages = resultToArray( result );

        if ( pages.length === 0 ) break;

        const page = pages[ 0 ];
        if ( page.parent_id )
        {
            // Add parent to ancestors
            const parentResult = db.exec( 'SELECT * FROM pages WHERE id = ?', [ page.parent_id ] );
            const parents = resultToArray( parentResult );
            if ( parents.length > 0 )
            {
                ancestors.unshift( parents[ 0 ] );
            }
        }
        currentId = page.parent_id;
    }

    return ancestors;
}

/**
 * Build complete tree recursively from a root page
 */
function buildTree ( parentId = null )
{
    const db = getDatabase();

    const query = parentId === null
        ? 'SELECT * FROM pages WHERE parent_id IS NULL AND status = ? ORDER BY order_index'
        : 'SELECT * FROM pages WHERE parent_id = ? AND status = ? ORDER BY order_index';

    const params = parentId === null ? [ 'published' ] : [ parentId, 'published' ];
    const result = db.exec( query, params );
    const pages = resultToArray( result );

    // Recursively get children for each page
    return pages.map( page => ( {
        ...page,
        children: buildTree( page.id )
    } ) );
}

/**
 * Get the root page for a given page (traverse up to top-level)
 */
function getRootPage ( pageId )
{
    const db = getDatabase();
    let currentId = pageId;
    let rootPage = null;

    while ( currentId )
    {
        const result = db.exec( 'SELECT * FROM pages WHERE id = ?', [ currentId ] );
        const pages = resultToArray( result );

        if ( pages.length === 0 ) break;

        rootPage = pages[ 0 ];
        if ( !rootPage.parent_id )
        {
            return rootPage;
        }
        currentId = rootPage.parent_id;
    }

    return rootPage;
}

/**
 * Create a new page
 */
function createPage ( { title, slug, parent_id, layout_type, content, order_index, status } )
{
    const db = getDatabase();

    db.run(
        `INSERT INTO pages (title, slug, parent_id, layout_type, content, order_index, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ title, slug, parent_id || null, layout_type, content || '', order_index || 0, status || 'published' ]
    );

    saveDatabase();

    // Get the inserted page
    const result = db.exec( 'SELECT * FROM pages WHERE slug = ?', [ slug ] );
    const pages = resultToArray( result );
    return pages[ 0 ];
}

/**
 * Update an existing page
 */
function updatePage ( id, { title, slug, parent_id, layout_type, content, order_index, status } )
{
    const db = getDatabase();

    const updates = [];
    const values = [];

    if ( title !== undefined ) { updates.push( 'title = ?' ); values.push( title ); }
    if ( slug !== undefined ) { updates.push( 'slug = ?' ); values.push( slug ); }
    if ( parent_id !== undefined ) { updates.push( 'parent_id = ?' ); values.push( parent_id || null ); }
    if ( layout_type !== undefined ) { updates.push( 'layout_type = ?' ); values.push( layout_type ); }
    if ( content !== undefined ) { updates.push( 'content = ?' ); values.push( content ); }
    if ( order_index !== undefined ) { updates.push( 'order_index = ?' ); values.push( order_index ); }
    if ( status !== undefined ) { updates.push( 'status = ?' ); values.push( status ); }

    updates.push( 'updated_at = CURRENT_TIMESTAMP' );
    values.push( id );

    db.run(
        `UPDATE pages SET ${ updates.join( ', ' ) } WHERE id = ?`,
        values
    );

    saveDatabase();

    return getPageById( id );
}

/**
 * Delete a page and handle children
 * Strategy: move children to parent's parent (move up one level)
 */
function deletePage ( id )
{
    const db = getDatabase();

    const page = getPageById( id );
    if ( !page ) return false;

    // Move children up one level
    db.run(
        'UPDATE pages SET parent_id = ? WHERE parent_id = ?',
        [ page.parent_id || null, id ]
    );

    // Delete the page
    db.run( 'DELETE FROM pages WHERE id = ?', [ id ] );

    saveDatabase();
    return true;
}

/**
 * Delete a page and all its descendants recursively
 */
function deletePageRecursive ( id )
{
    const db = getDatabase();

    // Get all children
    const children = getChildren( id );

    // Recursively delete children first
    children.forEach( child =>
    {
        deletePageRecursive( child.id );
    } );

    // Delete the page itself
    db.run( 'DELETE FROM pages WHERE id = ?', [ id ] );

    saveDatabase();
    return true;
}

/**
 * Move a page to a new parent
 */
function movePage ( pageId, newParentId )
{
    const db = getDatabase();

    // Prevent moving a page to one of its descendants (would create a cycle)
    if ( newParentId )
    {
        let checkId = newParentId;
        while ( checkId )
        {
            if ( checkId === pageId )
            {
                throw new Error( 'Cannot move a page to one of its descendants' );
            }
            const parent = getPageById( checkId );
            checkId = parent?.parent_id;
        }
    }

    db.run(
        'UPDATE pages SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [ newParentId || null, pageId ]
    );

    saveDatabase();
    return getPageById( pageId );
}

/**
 * Reorder pages (update order_index)
 */
function reorderPages ( pageIds )
{
    const db = getDatabase();

    pageIds.forEach( ( id, index ) =>
    {
        db.run(
            'UPDATE pages SET order_index = ? WHERE id = ?',
            [ index, id ]
        );
    } );

    saveDatabase();
}

/**
 * Get all pages (for admin)
 */
function getAllPages ()
{
    const db = getDatabase();
    const result = db.exec( 'SELECT * FROM pages ORDER BY order_index' );
    return resultToArray( result );
}

/**
 * Search pages by title or content
 */
function searchPages ( query )
{
    const db = getDatabase();
    const result = db.exec(
        `SELECT * FROM pages 
     WHERE (title LIKE ? OR content LIKE ?) AND status = ?
     ORDER BY title`,
        [ `%${ query }%`, `%${ query }%`, 'published' ]
    );
    return resultToArray( result );
}

module.exports = {
    getPageBySlug,
    getPageById,
    getRootPages,
    getChildren,
    getAncestors,
    buildTree,
    getRootPage,
    createPage,
    updatePage,
    deletePage,
    deletePageRecursive,
    movePage,
    reorderPages,
    getAllPages,
    searchPages
};
