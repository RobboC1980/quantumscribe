import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const prisma = new PrismaClient();

// Function to initialize the database schema if needed
export async function initDatabase() {
  try {
    // Try to query the User table to see if it exists
    await prisma.user.findFirst();
    console.log('Database schema already exists');
  } catch (error) {
    console.log('Setting up database schema...');
    try {
      // If table doesn't exist, run the migration SQL
      const migrationPath = join(__dirname, '../../migration.sql');
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Connect using the native pg client instead of Prisma
        const { SUPABASE_DB_URL } = process.env;
        const client = new pg.Client(SUPABASE_DB_URL);
        await client.connect();
        
        // Execute the SQL directly
        await client.query(migrationSQL);
        await client.end();
        
        console.log('Database schema created successfully');
      } else {
        console.error('Migration file not found');
      }
    } catch (migrationError) {
      console.error('Failed to run migration:', migrationError);
    }
  }
} 