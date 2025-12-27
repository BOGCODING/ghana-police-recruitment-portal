-- 019_create_role_permissions_table.sql
CREATE TABLE IF NOT EXISTS role_permissions (
    "roleId" UUID REFERENCES roles(id) ON DELETE CASCADE,
    "permissionId" UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY ("roleId", "permissionId")
);
