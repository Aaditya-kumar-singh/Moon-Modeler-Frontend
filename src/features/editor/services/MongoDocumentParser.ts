import { MongoDataType, Field } from '@/types/diagram';

export interface ParsedMongoField {
    name: string;
    type: MongoDataType;
    isArray: boolean;
    isNested: boolean;
    nestedFields?: ParsedMongoField[];
    nullable: boolean;
}

export interface ParsedMongoSchema {
    name: string;
    fields: ParsedMongoField[];
    source: 'document' | 'schema';
}

export class MongoDocumentParser {
    /**
     * Parse MongoDB document(s) from JSON string
     */
    static parse(jsonText: string): ParsedMongoSchema[] {
        try {
            // Clean up MongoDB-specific syntax
            const cleanedJson = this.cleanMongoSyntax(jsonText);

            // Try to parse as JSON
            const parsed = JSON.parse(cleanedJson);

            // Handle single document or array of documents
            const documents = Array.isArray(parsed) ? parsed : [parsed];

            // Extract schema from each document
            return documents.map((doc, index) => ({
                name: this.inferCollectionName(doc) || `collection_${index + 1}`,
                fields: this.extractFields(doc),
                source: 'document'
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to parse MongoDB document: ${errorMessage}`);
        }
    }

    /**
     * Clean MongoDB-specific syntax to make it valid JSON
     */
    private static cleanMongoSyntax(text: string): string {
        let cleaned = text;

        // Replace ObjectId("...") with "ObjectId:..."
        cleaned = cleaned.replace(/ObjectId\("([^"]+)"\)/g, '"ObjectId:$1"');

        // Replace ISODate("...") with "ISODate:..."
        cleaned = cleaned.replace(/ISODate\("([^"]+)"\)/g, '"ISODate:$1"');

        // Replace NumberInt(...) with number
        cleaned = cleaned.replace(/NumberInt\((\d+)\)/g, '$1');

        // Replace NumberLong(...) with number
        cleaned = cleaned.replace(/NumberLong\((\d+)\)/g, '$1');

        // Replace NumberDecimal("...") with number
        cleaned = cleaned.replace(/NumberDecimal\("([^"]+)"\)/g, '$1');

        // Remove trailing commas (common in MongoDB shell)
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

        return cleaned;
    }

    /**
     * Infer collection name from document
     */
    private static inferCollectionName(doc: any): string | null {
        // Check common patterns
        if (doc.collection) return doc.collection;
        if (doc.collectionName) return doc.collectionName;

        // Infer from ID pattern
        if (doc._id && typeof doc._id === 'string') {
            const match = doc._id.match(/^([a-z]+)_/i);
            if (match) return match[1] + 's'; // Pluralize
        }

        // Infer from fields (if has studentId, probably students collection)
        const idFields = Object.keys(doc).filter(k => k.endsWith('Id'));
        if (idFields.length > 0) {
            const entityType = idFields[0].replace(/Id$/, '');
            return entityType + 's'; // Pluralize
        }

        return null;
    }

    /**
     * Extract fields from document
     */
    private static extractFields(doc: any, parentPath: string = ''): ParsedMongoField[] {
        const fields: ParsedMongoField[] = [];

        for (const [key, value] of Object.entries(doc)) {
            const fieldPath = parentPath ? `${parentPath}.${key}` : key;

            // Infer type
            const fieldType = this.inferType(value);
            const isArray = Array.isArray(value);
            const isNested = typeof value === 'object' && value !== null && !isArray && !this.isMongoType(value);

            const field: ParsedMongoField = {
                name: key,
                type: fieldType,
                isArray,
                isNested,
                nullable: value === null,
            };

            // Handle nested objects
            if (isNested) {
                field.nestedFields = this.extractFields(value, fieldPath);
            }

            // Handle arrays of objects
            if (isArray && value.length > 0 && typeof value[0] === 'object') {
                field.nestedFields = this.extractFields(value[0], fieldPath);
            }

            fields.push(field);
        }

        return fields;
    }

    /**
     * Infer MongoDB type from value
     */
    private static inferType(value: any): MongoDataType {
        if (value === null || value === undefined) {
            return 'String'; // Default to String for null
        }

        // Check for MongoDB-specific string patterns
        if (typeof value === 'string') {
            if (value.startsWith('ObjectId:')) return 'ObjectId';
            if (value.startsWith('ISODate:')) return 'Date';
            return 'String';
        }

        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'Number' : 'Number';
        }

        if (typeof value === 'boolean') {
            return 'Boolean';
        }

        if (Array.isArray(value)) {
            return 'Array';
        }

        if (typeof value === 'object') {
            return 'Object';
        }

        return 'String';
    }

    /**
     * Check if value is a MongoDB-specific type
     */
    private static isMongoType(value: any): boolean {
        if (typeof value !== 'string') return false;
        return value.startsWith('ObjectId:') || value.startsWith('ISODate:');
    }

    /**
     * Flatten nested fields to top-level
     */
    static flattenFields(fields: ParsedMongoField[]): ParsedMongoField[] {
        const flattened: ParsedMongoField[] = [];

        for (const field of fields) {
            if (field.isNested && field.nestedFields) {
                // Flatten nested object
                for (const nestedField of field.nestedFields) {
                    flattened.push({
                        ...nestedField,
                        name: `${field.name}_${nestedField.name}`,
                        isNested: false
                    });
                }
            } else {
                flattened.push(field);
            }
        }

        return flattened;
    }

    /**
     * Convert parsed fields to diagram Field type
     */
    static toDiagramFields(parsedFields: ParsedMongoField[], flatten: boolean = false): Field[] {
        const fieldsToConvert = flatten ? this.flattenFields(parsedFields) : parsedFields;

        return fieldsToConvert.map((field, index) => ({
            id: `field_${index}_${field.name}`,
            name: field.name,
            type: field.isArray ? 'Array' : field.type,
            isPrimaryKey: field.name === '_id',
            isForeignKey: field.type === 'ObjectId' && field.name !== '_id',
            isNullable: field.nullable,
            isUnique: field.name === '_id',
        }));
    }
}
