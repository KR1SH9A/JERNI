const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bigrgujvawjuifioxmhf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ3JndWp2YXdqdWlmaW94bWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE3MzUyNSwiZXhwIjoyMTAzNzQ5NTI1fQ.UojWRu0k1rHvo-iXQyrWIGeC9iGzpW04Styv1oRUyfg');
async function run() {
  const { data, error } = await supabase.from('journeys').select('id, title, curator_id').limit(1);
  console.log('journeys:', data, error);
}
run();
