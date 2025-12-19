import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { count: tc } = await supabase.from('trips').select('*', { count: 'exact', head: true });
    const { count: dc } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
    const { count: rc } = await supabase.from('routes').select('*', { count: 'exact', head: true });
    const { count: sc } = await supabase.from('settlements').select('*', { count: 'exact', head: true });
    console.log({ trips: tc, drivers: dc, routes: rc, settlements: sc });
}
check();
