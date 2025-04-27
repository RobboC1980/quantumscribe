import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { supabase } from '../utils/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to initialize the database schema if needed
export async function initDatabase() {
  try {
    // Check if the users table exists by querying it
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error && error.code === '42P01') { // Table doesn't exist error code
      console.log('Setting up database schema...');
      
      // If table doesn't exist, run the migration SQL
      const migrationPath = join(__dirname, '../../migration.sql');
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Connect using the native pg client
        const { SUPABASE_DB_URL } = process.env;
        if (!SUPABASE_DB_URL) {
          throw new Error('SUPABASE_DB_URL environment variable is required');
        }
        
        const client = new pg.Client(SUPABASE_DB_URL);
        await client.connect();
        
        // Execute the SQL directly
        await client.query(migrationSQL);
        await client.end();
        
        console.log('Database schema created successfully');
      } else {
        console.error('Migration file not found');
      }
    } else {
      console.log('Database schema already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 