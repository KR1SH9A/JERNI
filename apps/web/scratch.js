import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const [mineData, joinedData] = await Promise.all([
    supabaseAdmin
      .from('journeys')
      .select('*, task_definitions!task_definitions_journey_id_fkey(count)')
      .order('created_at', { ascending: false })
      .limit(1),

    supabaseAdmin
      .from('memberships')
      .select('joined_at, journeys(*, task_definitions!task_definitions_journey_id_fkey(count))')
      .order('joined_at', { ascending: false })
      .limit(1)
  ]);

  console.log('Mine Data Error:', JSON.stringify(mineData.error, null, 2));
  console.log('Mine Data:', mineData.data);

  console.log('Joined Data Error:', JSON.stringify(joinedData.error, null, 2));
  console.log('Joined Data:', joinedData.data);
}

run();
