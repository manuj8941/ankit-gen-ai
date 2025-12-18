// Tree interaction handlers

let draggedNode = null;

// Toggle node expand/collapse
function toggleNode ( button )
{
    const node = button.closest( '.tree-node' );
    node.classList.toggle( 'expanded' );
}

// Expand all nodes
function expandAll ()
{
    document.querySelectorAll( '.tree-node' ).forEach( node =>
    {
        node.classList.add( 'expanded' );
    } );
}

// Collapse all nodes
function collapseAll ()
{
    document.querySelectorAll( '.tree-node' ).forEach( node =>
    {
        node.classList.remove( 'expanded' );
    } );
}

// Add root page
function addRootPage ()
{
    window.location.href = '/admin/edit/new?parent=null';
}

// Add child page
function addChild ( parentId )
{
    window.location.href = `/admin/edit/new?parent=${ parentId }`;
}

// Delete page
function deletePage ( id, title )
{
    const recursive = confirm(
        `Delete "${ title }"?\n\n` +
        `Choose OK to delete this page and move children up one level.\n` +
        `Choose Cancel to abort.`
    );

    if ( recursive === false ) return;

    const deleteChildren = confirm(
        `Also delete all child pages recursively?\n\n` +
        `OK = Delete everything under "${ title }"\n` +
        `Cancel = Keep children (move them up)`
    );

    const url = `/admin/api/pages/${ id }?recursive=${ deleteChildren }`;

    fetch( url, { method: 'DELETE' } )
        .then( res => res.json() )
        .then( data =>
        {
            if ( data.success )
            {
                location.reload();
            } else
            {
                alert( 'Error: ' + data.error );
            }
        } )
        .catch( err =>
        {
            alert( 'Error deleting page: ' + err.message );
        } );
}

// Drag and drop functionality
document.addEventListener( 'DOMContentLoaded', () =>
{
    const nodes = document.querySelectorAll( '.tree-node' );

    // Attach click handlers for add child buttons
    document.querySelectorAll( '.btn-add-child' ).forEach( btn =>
    {
        btn.addEventListener( 'click', () =>
        {
            const parentId = btn.dataset.pageId;
            addChild( parentId );
        } );
    } );

    // Attach click handlers for delete buttons
    document.querySelectorAll( '.btn-delete-page' ).forEach( btn =>
    {
        btn.addEventListener( 'click', () =>
        {
            const id = btn.dataset.pageId;
            const title = btn.dataset.pageTitle;
            deletePage( id, title );
        } );
    } );

    nodes.forEach( node =>
    {
        // Drag start
        node.addEventListener( 'dragstart', ( e ) =>
        {
            draggedNode = node;
            node.classList.add( 'dragging' );
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData( 'text/html', node.innerHTML );
        } );

        // Drag end
        node.addEventListener( 'dragend', ( e ) =>
        {
            node.classList.remove( 'dragging' );
            document.querySelectorAll( '.drag-over' ).forEach( n =>
            {
                n.classList.remove( 'drag-over' );
            } );
        } );

        // Drag over
        node.addEventListener( 'dragover', ( e ) =>
        {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if ( node !== draggedNode )
            {
                node.classList.add( 'drag-over' );
            }
        } );

        // Drag leave
        node.addEventListener( 'dragleave', ( e ) =>
        {
            node.classList.remove( 'drag-over' );
        } );

        // Drop
        node.addEventListener( 'drop', ( e ) =>
        {
            e.preventDefault();
            e.stopPropagation();

            node.classList.remove( 'drag-over' );

            if ( node === draggedNode ) return;

            const draggedId = parseInt( draggedNode.dataset.id );
            const targetId = parseInt( node.dataset.id );

            // Confirm move
            const draggedTitle = draggedNode.querySelector( '.tree-node-title strong' ).textContent;
            const targetTitle = node.querySelector( '.tree-node-title strong' ).textContent;

            const confirmed = confirm(
                `Move "${ draggedTitle }" to be a child of "${ targetTitle }"?`
            );

            if ( !confirmed ) return;

            // Make API call to move page
            fetch( `/admin/api/pages/${ draggedId }/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { newParentId: targetId } )
            } )
                .then( res => res.json() )
                .then( data =>
                {
                    if ( data.success )
                    {
                        location.reload();
                    } else
                    {
                        alert( 'Error: ' + data.error );
                    }
                } )
                .catch( err =>
                {
                    alert( 'Error moving page: ' + err.message );
                } );
        } );
    } );
} );
