-- Setup initial user roles and permissions

-- Insert default roles
INSERT INTO user_roles (role_name) VALUES
    ('admin'),
    ('manager'),
    ('user')
ON CONFLICT (role_name) DO NOTHING;

-- Create admin user if not exists
INSERT INTO users (
    username,
    email,
    password_hash,
    active
) VALUES (
    'admin',
    'admin@gearhubone.com',
    '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFO/4t/E3Ds.v.2', -- Default password: admin123 (change in production)
    true
)
ON CONFLICT (username) DO NOTHING;

-- Get the admin user_id
DO $$
DECLARE
    v_user_id INTEGER;
    v_admin_role_id INTEGER;
BEGIN
    SELECT user_id INTO v_user_id FROM users WHERE username = 'admin';
    SELECT role_id INTO v_admin_role_id FROM user_roles WHERE role_name = 'admin';
    
    -- Assign admin role to admin user
    INSERT INTO user_permissions (user_id, role_id)
    VALUES (v_user_id, v_admin_role_id)
 