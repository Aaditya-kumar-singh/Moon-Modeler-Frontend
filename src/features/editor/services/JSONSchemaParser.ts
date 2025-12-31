import { MongoDataType } from '@/types/diagram';
import { ParsedMongoField, ParsedMongoSchema } from './MongoDocumentParser';

export class JSONSchemaParser {
    /**
     * Parse MongoDB createCollection command with JSON Schema validator
     */
    static parseCreateCollection(text: string): ParsedMongoSchema | null {
        // Match db.createCollection("collectionName", { ... })
        const createCollectionRegex = /db\.createCollection\s*\(\s*["'](\w+)["']\s*,\s*({[\s\S]*})\s*\)/;
        const match = text.match(createCollectionRegex);

        if (!match) return null;

        const collectionName = match[1];
        const optionsJson = match[2];

        try {
            // Convert JavaScript object notation to valid JSON
            const validJson = this.convertToValidJson(optionsJson);

            // Parse the options object
            const options = JSON.parse(validJson);

            // Check if it has a validator with $jsonSchema
            if (options.validator?.$jsonSchema) {
                const schema = options.validator.$jsonSchema;
                const fields = this.extractFieldsFromJsonSchema(schema);

                return {
                    name: collectionName,
                    fields,
                    source: 'schema'
                };
            }
        } catch (error) {
            // If JSON parsing fails, return null
            return null;
        }

        return null;
    }

    /**
     * Convert JavaScript object notation to valid JSON
     */
    private static convertToValidJson(jsObject: string): string {
        let json = jsObject;

        // Replace unquoted keys with quoted keys
        // Match word characters (and $ for $jsonSchema) followed by colon
        json = json.replace(/([{,]\s*)(\$?\w+)(\s*:)/g, '$1"$2"$3');

        // Replace single quotes with double quotes (but be careful with nested quotes)
        json = json.replace(/'/g, '"');

        // Remove trailing commas before closing braces/brackets
        json = json.replace(/,(\s*[}\]])/g, '$1');

        return json;
    }

    /**
     * Extract fields from JSON Schema definition
     */
    private static extractFieldsFromJsonSchema(schema: any): ParsedMongoField[] {
        const fields: ParsedMongoField[] = [];

        if (!schema.properties) return fields;

        const required = schema.required || [];

        for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
            const def = fieldDef as any;

            const bsonType = def.bsonType || 'string';
            const isArray = bsonType === 'array';
            const isNested = bsonType === 'object';

            const field: ParsedMongoField = {
                name: fieldName,
                type: this.mapBsonTypeToMongoType(bsonType),
                isArray,
                isNested,
                nullable: !required.includes(fieldName)
            };

            // Handle array items
            if (isArray && def.items) {
                const itemsBsonType = def.items.bsonType || 'string';
                // For arrays, we store the type as 'Array' and optionally could store item type
                field.type = 'Array';

                // If array items are objects, extract nested fields
                if (itemsBsonType === 'object' && def.items.properties) {
                    field.nestedFields = this.extractFieldsFromJsonSchema(def.items);
                }
            }

            // Handle nested objects
            if (isNested && def.properties) {
                field.nestedFields = this.extractFieldsFromJsonSchema(def);
            }

            fields.push(field);
        }

        return fields;
    }

    /**
     * Map BSON type from JSON Schema to MongoDataType
     */
    private static mapBsonTypeToMongoType(bsonType: string): MongoDataType {
        const typeMap: Record<string, MongoDataType> = {
            'objectId': 'ObjectId',
            'string': 'String',
            'int': 'Number',
            'long': 'Number',
            'double': 'Number',
            'decimal': 'Number',
            'bool': 'Boolean',
            'boolean': 'Boolean',
            'date': 'Date',
            'array': 'Array',
            'object': 'Object',
        };

        return typeMap[bsonType.toLowerCase()] || 'String';
    }
}
