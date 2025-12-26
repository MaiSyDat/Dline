/**
 * Setup Database Indexes
 * 
 * Chạy script này để tạo indexes cho database
 * Usage: npx tsx scripts/setup-indexes.ts
 */

import { createIndexes, checkIndexes } from '../lib/db-indexes';

async function main() {
  try {
    console.log('🔍 Checking existing indexes...');
    const existing = await checkIndexes();
    console.log('Existing indexes:', JSON.stringify(existing, null, 2));
    
    console.log('\n📊 Creating indexes...');
    await createIndexes();
    
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

