"use strict";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const email = 'demo@lifetrack.app';
const password = 'demo123456';
async function main() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
        },
    });
    const data = await res.json();
    const existing = data.users?.find((u) => u.email === email);
    if (existing) {
        console.log('Demo user already exists');
        process.exit(0);
    }
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            user_metadata: { name: 'Demo User' },
            email_confirm: true,
        }),
    });
    const result = await createRes.json();
    if (result.error) {
        console.error('Failed:', result.error.message);
        process.exit(1);
    }
    console.log(`Created demo user: ${result.email}`);
}
main().catch(console.error);
//# sourceMappingURL=seed.js.map