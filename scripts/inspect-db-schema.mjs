import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kkqrumygyxuefrwbpyiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXJ1bXlneXh1ZWZyd2JweWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5MjQsImV4cCI6MjA3ODA5MjkyNH0.FpbEeNkp_LqQSJlymXzFBSfWFzVvkLiRlbOVz-70gW8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
  const tables = ['restaurants', 'cafes', 'bakeries'];

  for (const table of tables) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Table: ${table}`);
    console.log('='.repeat(80));

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      console.log('\nSample record:');
      console.log(JSON.stringify(data[0], null, 2));

      console.log('\nField names:');
      console.log(Object.keys(data[0]).join(', '));
    }
  }
}

inspectSchema().catch(console.error);
