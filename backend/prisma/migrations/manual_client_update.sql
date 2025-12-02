-- Migración manual para actualizar tabla clients
-- Renombrar columna name a company y agregar responsible

-- 1. Agregar nueva columna responsible
ALTER TABLE clients ADD COLUMN IF NOT EXISTS responsible VARCHAR(100);

-- 2. Copiar datos de name a company si company está vacío
UPDATE clients SET company = name WHERE company IS NULL OR company = '';

-- 3. Hacer company NOT NULL
ALTER TABLE clients ALTER COLUMN company SET NOT NULL;

-- 4. Eliminar constraint único antiguo
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_name_key;

-- 5. Agregar nuevo constraint único para company
ALTER TABLE clients ADD CONSTRAINT clients_user_id_company_key UNIQUE (user_id, company);

-- 6. Eliminar columna name (comentado por seguridad, descomentar cuando estés seguro)
-- ALTER TABLE clients DROP COLUMN IF EXISTS name;
