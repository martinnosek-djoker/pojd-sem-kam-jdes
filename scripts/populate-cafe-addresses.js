const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateCafeAddresses() {
  try {
    // Fetch all cafes
    const { data: cafes, error } = await supabase
      .from('cafes')
      .select('id, name, location, addresses');

    if (error) {
      console.error('❌ Error fetching cafes:', error);
      return;
    }

    console.log(`Found ${cafes.length} cafes`);

    let updated = 0;
    let skipped = 0;

    for (const cafe of cafes) {
      // Skip if addresses already exist
      if (cafe.addresses && Object.keys(cafe.addresses).length > 0) {
        console.log(`⏭️  Skipping ${cafe.name} - already has addresses`);
        skipped++;
        continue;
      }

      // Parse location string into array
      const locations = cafe.location.split(',').map(l => l.trim()).filter(l => l);

      // Create addresses object
      // Since we don't have exact addresses, we use cafe name + location for Google Maps search
      const addresses = {};
      locations.forEach(loc => {
        addresses[loc] = `${cafe.name}, ${loc}, Praha`;
      });

      // Update cafe
      const { error: updateError } = await supabase
        .from('cafes')
        .update({ addresses })
        .eq('id', cafe.id);

      if (updateError) {
        console.error(`❌ Error updating ${cafe.name}:`, updateError);
      } else {
        console.log(`✅ Updated ${cafe.name} with ${locations.length} address(es)`);
        updated++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${cafes.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

populateCafeAddresses();
