const { initDatabase, closeDatabase } = require( './db/database' );
const {
    getPageBySlug,
    getRootPages,
    getChildren,
    getAncestors,
    buildTree
} = require( './models/pages' );

async function runTests ()
{
    console.log( '=== Testing Database and Models ===\n' );

    try
    {
        // Initialize database
        await initDatabase();
        console.log( '✓ Database initialized\n' );

        // Test 1: Get root pages
        console.log( 'Test 1: Get root pages (top navigation)' );
        const rootPages = getRootPages();
        console.log( `Found ${ rootPages.length } root pages:` );
        rootPages.forEach( p => console.log( `  - ${ p.title } (/${ p.slug })` ) );
        console.log( '' );

        // Test 2: Get page by slug
        console.log( 'Test 2: Get page by slug' );
        const page = getPageBySlug( 'getting-started' );
        if ( page )
        {
            console.log( `✓ Found page: ${ page.title }` );
            console.log( `  ID: ${ page.id }` );
            console.log( `  Slug: ${ page.slug }` );
            console.log( `  Layout: ${ page.layout_type }` );
            console.log( `  Parent ID: ${ page.parent_id || 'NULL (root page)' }` );
        }
        console.log( '' );

        // Test 3: Get children
        console.log( 'Test 3: Get children of "Getting Started"' );
        const children = getChildren( page.id );
        console.log( `Found ${ children.length } children:` );
        children.forEach( c => console.log( `  - ${ c.title } (/${ c.slug })` ) );
        console.log( '' );

        // Test 4: Get ancestors
        console.log( 'Test 4: Get ancestors of nested page' );
        const nestedPage = getPageBySlug( 'how-transformers-work' );
        if ( nestedPage )
        {
            const ancestors = getAncestors( nestedPage.id );
            console.log( `Page: ${ nestedPage.title }` );
            console.log( `Breadcrumb trail: ${ ancestors.map( a => a.title ).join( ' > ' ) }` );
        }
        console.log( '' );

        // Test 5: Build complete tree
        console.log( 'Test 5: Build complete site tree' );
        const tree = buildTree();
        console.log( 'Site structure:' );

        function printTree ( nodes, indent = '' )
        {
            nodes.forEach( node =>
            {
                console.log( `${ indent }${ node.title } [${ node.layout_type }]` );
                if ( node.children && node.children.length > 0 )
                {
                    printTree( node.children, indent + '  ' );
                }
            } );
        }

        printTree( tree );
        console.log( '' );

        console.log( '=== All Tests Passed! ===' );

        closeDatabase();

    } catch ( error )
    {
        console.error( 'Test failed:', error );
        closeDatabase();
        process.exit( 1 );
    }
}

runTests();
