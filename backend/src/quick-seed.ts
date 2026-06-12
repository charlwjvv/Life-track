import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.SUPABASE_URL || 'https://upgcveutdbjceihotbbl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZ2N2ZXV0ZGJqY2VpaG90YmJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMTI0OSwiZXhwIjoyMDk0NzA3MjQ5fQ.byURY56IScmuyyblXWTHIpHt4hTkOKcb0qAWBXSiiMk';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: { transport: WebSocket as any },
});

async function main() {
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  const demo = existing?.users?.find(u => u.email === 'demo@lifetrack.app');
  
  if (demo) {
    console.log('Demo user already exists:', demo.id);
    return;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'demo@lifetrack.app',
    password: 'demo123456',
    email_confirm: true,
    user_metadata: { name: 'Demo User' },
  });

  if (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
  console.log('Created demo user:', data.user?.email, data.user?.id);
}

main().catch(console.error);
