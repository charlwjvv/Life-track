"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const db_1 = require("../db");
async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    try {
        const { data: { user }, error } = await db_1.supabase.auth.getUser(token);
        if (error || !user)
            return res.status(401).json({ error: 'Invalid token' });
        req.userId = user.id;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
//# sourceMappingURL=auth.js.map