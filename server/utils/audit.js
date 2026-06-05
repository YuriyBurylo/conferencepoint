async function auditAdminAction(db, { adminUserId, action, targetUserId = null, details = {} }) {
    try {
        await db.query(
            `INSERT INTO admin_audit_log (admin_user_id, action, target_user_id, details)
             VALUES ($1, $2, $3, $4)`,
            [adminUserId, action, targetUserId, details]
        );
    } catch (error) {
        console.error('Admin audit log error:', error.message);
    }
}

module.exports = { auditAdminAction };
