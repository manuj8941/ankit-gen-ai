const { initDatabase, saveDatabase, getDatabase, closeDatabase } = require( '../db/database' );

const SCHEMA = `
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id INTEGER NULL REFERENCES pages(id),
  layout_type TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
`;

const SEED_DATA = [
    // Top-level pages (parent_id = NULL)
    {
        title: 'Home',
        slug: 'home',
        parent_id: null,
        layout_type: 'landing',
        content: '# Welcome to Gen AI Learning\n\nExplore comprehensive documentation on Generative AI concepts, tutorials, and best practices.',
        order_index: 0,
        status: 'published'
    },
    {
        title: 'Getting Started',
        slug: 'getting-started',
        parent_id: null,
        layout_type: 'doc',
        content: '# Getting Started\n\nBegin your journey into Generative AI with these foundational concepts.',
        order_index: 1,
        status: 'published'
    },
    {
        title: 'Tutorials',
        slug: 'tutorials',
        parent_id: null,
        layout_type: 'doc',
        content: '# Tutorials\n\nStep-by-step guides to build your first AI applications.',
        order_index: 2,
        status: 'published'
    },

    // Child pages under "Getting Started" (parent_id = 2)
    {
        title: 'Introduction to LLMs',
        slug: 'intro-to-llms',
        parent_id: 2,
        layout_type: 'doc',
        content: '# Introduction to Large Language Models\n\nLearn the fundamentals of LLMs and how they work.',
        order_index: 0,
        status: 'published'
    },
    {
        title: 'Prompt Engineering Basics',
        slug: 'prompt-engineering-basics',
        parent_id: 2,
        layout_type: 'doc',
        content: '# Prompt Engineering Basics\n\nMaster the art of crafting effective prompts.',
        order_index: 1,
        status: 'published'
    },

    // Nested child under "Introduction to LLMs" (parent_id = 4)
    {
        title: 'How Transformers Work',
        slug: 'how-transformers-work',
        parent_id: 4,
        layout_type: 'doc',
        content: '# How Transformers Work\n\nDive deep into the transformer architecture.',
        order_index: 0,
        status: 'published'
    },

    // Child pages under "Tutorials" (parent_id = 3)
    {
        title: 'Build a Chatbot',
        slug: 'build-a-chatbot',
        parent_id: 3,
        layout_type: 'tutorial',
        content: '# Build a Chatbot\n\nCreate your first AI-powered chatbot in 30 minutes.',
        order_index: 0,
        status: 'published'
    },
    {
        title: 'RAG System Tutorial',
        slug: 'rag-system-tutorial',
        parent_id: 3,
        layout_type: 'tutorial',
        content: '# RAG System Tutorial\n\nBuild a Retrieval-Augmented Generation system.',
        order_index: 1,
        status: 'published'
    }
];

async function initializeDatabase ()
{
    try
    {
        console.log( 'Initializing database...' );

        await initDatabase();
        const db = getDatabase();

        // Create schema
        console.log( 'Creating schema...' );
        db.run( SCHEMA );

        // Check if data already exists
        const result = db.exec( 'SELECT COUNT(*) as count FROM pages' );
        const count = result[ 0 ]?.values[ 0 ]?.[ 0 ] || 0;

        if ( count === 0 )
        {
            console.log( 'Inserting seed data...' );

            // Insert seed data
            const stmt = db.prepare( `
        INSERT INTO pages (title, slug, parent_id, layout_type, content, order_index, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            for ( const page of SEED_DATA )
            {
                stmt.run( [
                    page.title,
                    page.slug,
                    page.parent_id,
                    page.layout_type,
                    page.content,
                    page.order_index,
                    page.status
                ] );
            }

            stmt.free();
            console.log( `Inserted ${ SEED_DATA.length } pages` );
        } else
        {
            console.log( `Database already contains ${ count } pages. Skipping seed data.` );
        }

        // Save database to file
        saveDatabase();
        console.log( 'Database saved successfully!' );

        // Display structure
        console.log( '\nDatabase structure:' );
        const pages = db.exec( 'SELECT id, title, slug, parent_id, layout_type FROM pages ORDER BY order_index' );
        if ( pages[ 0 ] )
        {
            console.table( pages[ 0 ].values.map( row => ( {
                id: row[ 0 ],
                title: row[ 1 ],
                slug: row[ 2 ],
                parent_id: row[ 3 ] || 'NULL',
                layout: row[ 4 ]
            } ) ) );
        }

        closeDatabase();
        console.log( '\nDatabase initialization complete!' );

    } catch ( error )
    {
        console.error( 'Database initialization failed:', error );
        process.exit( 1 );
    }
}

// Run if called directly
if ( require.main === module )
{
    initializeDatabase();
}

module.exports = { initializeDatabase };
