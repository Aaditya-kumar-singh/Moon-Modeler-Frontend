import { MongoDataType } from '@/types/diagram';
import { ParsedMongoField, ParsedMongoSchema } from './MongoDocumentParser';

export class MongooseSchemaParser {
    /**
     * Parse Mongoose schema definition
     */
    static parseSchema(text: string): ParsedMongoSchema | null {
        try {
            // Try to extract collection name from new Schema() or model() calls
            const schemaNameMatch = text.match(/(?:new\s+Schema|mongoose\.model)\s*\(\s*['"](\w+)['"]/);
            const collectionName = schemaNameMatch ? schemaNameMatch[1] : 'collection';

            // Extract field definitions
            const fields = this.extractFieldsFromMongooseSchema(text);

            if (fields.length === 0) {
                return null;
            }

            return {
                name: collectionName,
                fields,
                source: 'schema'
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Extract fields from Mongoose schema text
     */
    private static extractFieldsFromMongooseSchema(text: string): ParsedMongoField[] {
        const fields: ParsedMongoField[] = [];

        // Match field definitions: fieldName: { ... }
        // This regex captures field name and its definition object
        const fieldRegex = /(\w+)\s*:\s*\{([^}]+)\}/g;
        let match;

        while ((match = fieldRegex.exec(text)) !== null) {
            const fieldName = match[1];
            const fieldDef = match[2];

            // Skip if this looks like a nested schema or methods
            if (fieldName === 'type' || fieldName === 'default' || fieldName === 'required') {
                continue;
            }

            const field = this.parseFieldDefinition(fieldName, fieldDef);
            if (field) {
                fields.push(field);
            }
        }

        // Also match simple field definitions: fieldName: Type
        const simpleFieldRegex = /(\w+)\s*:\s*(String|Number|Date|Boolean|ObjectId|Array|Buffer)/g;

        while ((match = simpleFieldRegex.exec(text)) !== null) {
            const fieldName = match[1];
            const fieldType = match[2];

            // Check if we already parsed this field
            if (fields.some(f => f.name === fieldName)) {
                continue;
            }

            fields.push({
                name: fieldName,
                type: this.mapMongooseTypeToMongoType(fieldType),
                isArray: fieldType === 'Array',
                isNested: false,
                nullable: true // Default to nullable for simple definitions
            });
        }

        return fields;
    }

    /**
     * Parse individual field definition
     */
    private static parseFieldDefinition(fieldName: string, fieldDef: string): ParsedMongoField | null {
        // Extract type
        const typeMatch = fieldDef.match(/type\s*:\s*(\w+)/);
        if (!typeMatch) {
            return null;
        }

        const mongooseType = typeMatch[1];
        const type = this.mapMongooseTypeToMongoType(mongooseType);

        // Check if required
        const requiredMatch = fieldDef.match(/required\s*:\s*(true|false)/);
        const isRequired = requiredMatch ? requiredMatch[1] === 'true' : false;

        // Check if it's an array
        const isArray = /\[\s*\{/.test(fieldDef) || mongooseType === 'Array';

        return {
            name: fieldName,
            type,
            isArray,
            isNested: false,
            nullable: !isRequired
        };
    }

    /**
     * Map Mongoose type to MongoDataType
     */
    private static mapMongooseTypeToMongoType(mongooseType: string): MongoDataType {
        const typeMap: Record<string, MongoDataType> = {
            'String': 'String',
            'Number': 'Number',
            'Date': 'Date',
            'Boolean': 'Boolean',
            'ObjectId': 'ObjectId',
            'Array': 'Array',
            'Buffer': 'String',
            'Mixed': 'Object',
            'Map': 'Object'
        };

        return typeMap[mongooseType] || 'String';
    }

    /**
     * Enhanced parser that handles more complex schema definitions
     */
    static parseFullSchema(text: string): ParsedMongoSchema | null {
        // Try to wrap incomplete schema into a valid structure for parsing
        let schemaText = text.trim();

        // If it's just field definitions without wrapping, add structure
        if (!schemaText.includes('new Schema') && !schemaText.includes('{')) {
            schemaText = `{ ${schemaText} }`;
        }

        // If it doesn't have outer braces, add them
        if (!schemaText.startsWith('{')) {
            schemaText = `{ ${schemaText} }`;
        }

        return this.parseSchema(schemaText);
    }
}
