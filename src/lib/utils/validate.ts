
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

const SQL_RESERVED_WORDS = new Set([
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'AND', 'OR', 'TABLE', 'DROP', 'CREATE', 'ALTER', 'INDEX', 'KEY'
]);

export const validateTableName = (name: string): ValidationResult => {
    if (!name) return { isValid: false, error: 'Table name is required' };
    if (name.length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 64) return { isValid: false, error: 'Name is too long' };
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        return { isValid: false, error: 'Name must start with a letter/underscore and contain only alphanumeric chars' };
    }
    if (SQL_RESERVED_WORDS.has(name.toUpperCase())) {
        return { isValid: false, error: 'Name is a reserved SQL keyword' };
    }
    return { isValid: true };
};

export const validateFieldName = (name: string): ValidationResult => {
    if (!name) return { isValid: false, error: 'Field name is required' };
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        return { isValid: false, error: 'Invalid field name format' };
    }
    // Reserved words check might be less strict for fields if quoted, but good practice to avoid
    if (SQL_RESERVED_WORDS.has(name.toUpperCase())) {
        return { isValid: false, error: 'Field name is a reserved keyword' };
    }
    return { isValid: true };
};
