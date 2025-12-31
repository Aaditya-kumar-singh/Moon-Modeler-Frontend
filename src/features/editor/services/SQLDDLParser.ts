import { MySQLDataType, Field } from '@/types/diagram';

export interface ParsedSQLField {
    name: string;
    type: MySQLDataType;
    isPrimaryKey: boolean;
    isUnique: boolean;
    isNullable: boolean;
    defaultValue?: string;
    autoIncrement: boolean;
}

export interface ParsedForeignKey {
    constraintName: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface ParsedSQLTable {
    name: string;
    fields: ParsedSQLField[];
    foreignKeys: ParsedForeignKey[];
    source: 'ddl';
}

export class SQLDDLParser {
    /**
     * Parse SQL CREATE TABLE statements
     */
    static parse(sqlText: string): ParsedSQLTable[] {
        const tables: ParsedSQLTable[] = [];

        // Extract CREATE TABLE statements
        const createTableRegex = /CREATE\s+TABLE\s+`?(\w+)`?\s*\(([\s\S]*?)\);/gi;
        let match;

        while ((match = createTableRegex.exec(sqlText)) !== null) {
            const tableName = match[1];
            const tableBody = match[2];

            const table: ParsedSQLTable = {
                name: tableName,
                fields: this.parseFields(tableBody),
                foreignKeys: this.parseForeignKeys(tableName, tableBody),
                source: 'ddl'
            };

            tables.push(table);
        }

        return tables;
    }

    /**
     * Parse field definitions from table body
     */
    private static parseFields(tableBody: string): ParsedSQLField[] {
        const fields: ParsedSQLField[] = [];
        const lines = tableBody.split(',').map(l => l.trim());

        for (const line of lines) {
            // Skip constraint definitions
            if (line.toUpperCase().startsWith('PRIMARY KEY') ||
                line.toUpperCase().startsWith('FOREIGN KEY') ||
                line.toUpperCase().startsWith('UNIQUE') ||
                line.toUpperCase().startsWith('CONSTRAINT') ||
                line.toUpperCase().startsWith('INDEX') ||
                line.toUpperCase().startsWith('KEY')) {
                continue;
            }

            const field = this.parseFieldDefinition(line);
            if (field) {
                fields.push(field);
            }
        }

        return fields;
    }

    /**
     * Parse single field definition
     */
    private static parseFieldDefinition(line: string): ParsedSQLField | null {
        // Match: `field_name` TYPE [constraints]
        const fieldRegex = /`?(\w+)`?\s+(\w+)(\([^)]+\))?(.*)$/i;
        const match = line.match(fieldRegex);

        if (!match) return null;

        const fieldName = match[1];
        const fieldType = match[2].toUpperCase();
        const restOfLine = match[4] || '';

        // Map SQL types to our MySQLDataType
        const type = this.mapSQLType(fieldType);

        // Parse constraints
        const isPrimaryKey = /PRIMARY\s+KEY/i.test(restOfLine);
        const isUnique = /UNIQUE/i.test(restOfLine);
        const isNullable = !/NOT\s+NULL/i.test(restOfLine);
        const autoIncrement = /AUTO_INCREMENT/i.test(restOfLine);

        // Parse default value
        const defaultMatch = restOfLine.match(/DEFAULT\s+(.+?)(\s|$)/i);
        const defaultValue = defaultMatch ? defaultMatch[1].replace(/['"]/g, '') : undefined;

        return {
            name: fieldName,
            type,
            isPrimaryKey,
            isUnique,
            isNullable,
            defaultValue,
            autoIncrement
        };
    }

    /**
     * Parse FOREIGN KEY constraints
     */
    private static parseForeignKeys(tableName: string, tableBody: string): ParsedForeignKey[] {
        const foreignKeys: ParsedForeignKey[] = [];

        // Match: FOREIGN KEY (`col`) REFERENCES `table`(`col`) [ON DELETE ...] [ON UPDATE ...]
        const fkRegex = /FOREIGN\s+KEY\s+\(`?(\w+)`?\)\s+REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)(.*?)(?:,|$)/gi;
        let match;

        while ((match = fkRegex.exec(tableBody)) !== null) {
            const sourceColumn = match[1];
            const targetTable = match[2];
            const targetColumn = match[3];
            const constraints = match[4] || '';

            // Parse ON DELETE
            const onDeleteMatch = constraints.match(/ON\s+DELETE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION)/i);
            const onDelete = onDeleteMatch ? onDeleteMatch[1].replace(/\s+/g, ' ').toUpperCase() as any : undefined;

            // Parse ON UPDATE
            const onUpdateMatch = constraints.match(/ON\s+UPDATE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION)/i);
            const onUpdate = onUpdateMatch ? onUpdateMatch[1].replace(/\s+/g, ' ').toUpperCase() as any : undefined;

            foreignKeys.push({
                constraintName: `fk_${tableName}_${sourceColumn}`,
                sourceColumn,
                targetTable,
                targetColumn,
                onDelete,
                onUpdate
            });
        }

        // Also check for CONSTRAINT syntax
        const constraintRegex = /CONSTRAINT\s+`?(\w+)`?\s+FOREIGN\s+KEY\s+\(`?(\w+)`?\)\s+REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)(.*?)(?:,|$)/gi;

        while ((match = constraintRegex.exec(tableBody)) !== null) {
            const constraintName = match[1];
            const sourceColumn = match[2];
            const targetTable = match[3];
            const targetColumn = match[4];
            const constraints = match[5] || '';

            const onDeleteMatch = constraints.match(/ON\s+DELETE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION)/i);
            const onDelete = onDeleteMatch ? onDeleteMatch[1].replace(/\s+/g, ' ').toUpperCase() as any : undefined;

            const onUpdateMatch = constraints.match(/ON\s+UPDATE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION)/i);
            const onUpdate = onUpdateMatch ? onUpdateMatch[1].replace(/\s+/g, ' ').toUpperCase() as any : undefined;

            foreignKeys.push({
                constraintName,
                sourceColumn,
                targetTable,
                targetColumn,
                onDelete,
                onUpdate
            });
        }

        return foreignKeys;
    }

    /**
     * Map SQL type to MySQLDataType
     */
    private static mapSQLType(sqlType: string): MySQLDataType {
        const typeUpper = sqlType.toUpperCase();

        // Integer types
        if (typeUpper.includes('INT')) {
            if (typeUpper.includes('TINY')) return 'TINYINT';
            if (typeUpper.includes('BIG')) return 'BIGINT';
            return 'INT';
        }

        // Decimal types
        if (typeUpper.includes('DECIMAL') || typeUpper.includes('NUMERIC')) return 'DECIMAL';
        if (typeUpper.includes('FLOAT')) return 'FLOAT';
        if (typeUpper.includes('DOUBLE')) return 'DOUBLE';

        // String types
        if (typeUpper.includes('VARCHAR')) return 'VARCHAR';
        if (typeUpper.includes('CHAR')) return 'CHAR';
        if (typeUpper.includes('TEXT')) {
            if (typeUpper.includes('LONG')) return 'LONGTEXT';
            return 'TEXT';
        }
        if (typeUpper.includes('ENUM')) return 'ENUM';

        // Date/Time types
        if (typeUpper.includes('DATETIME')) return 'DATETIME';
        if (typeUpper.includes('TIMESTAMP')) return 'TIMESTAMP';
        if (typeUpper.includes('DATE')) return 'DATE';

        // Boolean
        if (typeUpper.includes('BOOL')) return 'BOOLEAN';

        // JSON
        if (typeUpper.includes('JSON')) return 'JSON';

        // BLOB
        if (typeUpper.includes('BLOB')) return 'BLOB';

        // Default to VARCHAR
        return 'VARCHAR';
    }

    /**
     * Convert parsed fields to diagram Field type
     */
    static toDiagramFields(parsedFields: ParsedSQLField[]): Field[] {
        return parsedFields.map((field, index) => ({
            id: `field_${index}_${field.name}`,
            name: field.name,
            type: field.type,
            isPrimaryKey: field.isPrimaryKey,
            isForeignKey: false, // Will be set when processing foreign keys
            isNullable: field.isNullable,
            isUnique: field.isUnique || field.isPrimaryKey,
            defaultValue: field.defaultValue
        }));
    }
}
