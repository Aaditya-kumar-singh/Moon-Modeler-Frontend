import { DiagramNode, DiagramEdge } from '@/types/diagram';

export const generateMySQL = (nodes: DiagramNode[], edges: DiagramEdge[]): string => {
    let sql = '';

    // 1. Tables
    nodes.forEach(node => {
        if (node.type !== 'mysqlTable' && node.type !== 'table') return;

        const tableName = node.data.label;
        const columns = node.data.columns || node.data.fields || [];

        sql += `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;

        const pkColumns: string[] = [];

        columns.forEach((col: any, index: number) => {
            let line = `  \`${col.name}\` ${col.type.toUpperCase()}`;

            if (col.type.toUpperCase() === 'VARCHAR') line += '(255)';
            if (!col.isNullable) line += ' NOT NULL';
            if (col.isPrimaryKey) {
                line += ' AUTO_INCREMENT';
                pkColumns.push(col.name);
            }

            if (index < columns.length - 1 || pkColumns.length > 0) line += ',';
            sql += line + '\n';
        });

        if (pkColumns.length > 0) {
            sql += `  PRIMARY KEY (\`${pkColumns.join('`, `')}\`)\n`;
        }

        sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;
    });

    // 2. Relationships (Alter Table to add FKs)
    edges.forEach(edge => {
        // Find source and target nodes/columns
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode || (sourceNode.type !== 'mysqlTable' && sourceNode.type !== 'table')) return;

        // In our model, Source -> Target usually means Source has FK to Target (e.g. User -> Post (no), Post -> User (yes))
        // Wait, normally the arrow points TO the dependency.
        // Post(authorId) -> User(id).
        // Let's assume field mappings define this.

        if (edge.data?.fieldMappings) {
            edge.data.fieldMappings.forEach((mapping: any) => {
                // mapping.sourceField (in sourceNode) references mapping.targetField (in targetNode)
                sql += `ALTER TABLE \`${sourceNode.data.label}\`\n`;
                sql += `  ADD CONSTRAINT \`fk_${sourceNode.data.label}_${mapping.sourceField}\`\n`;
                sql += `  FOREIGN KEY (\`${mapping.sourceField}\`) REFERENCES \`${targetNode.data.label}\` (\`${mapping.targetField}\`)\n`;
                sql += `  ON DELETE ${edge.data?.constraints?.onDelete || 'NO ACTION'}\n`;
                sql += `  ON UPDATE ${edge.data?.constraints?.onUpdate || 'NO ACTION'};\n\n`;
            });
        }
    });

    return sql;
};

export const generateMongoose = (nodes: DiagramNode[]): string => {
    let code = "const mongoose = require('mongoose');\nconst { Schema } = mongoose;\n\n";

    nodes.forEach(node => {
        if (node.type !== 'mongoCollection') return;

        const modelName = node.data.label; // Collection name usually plural
        // Convert to singular PascalCase for Model name? e.g. 'users' -> 'User'
        const singularName = modelName.charAt(0).toUpperCase() + modelName.slice(1, -1);

        code += `const ${singularName}Schema = new Schema({\n`;

        const fields = node.data.fields || [];
        fields.forEach((field: any) => {
            if (field.name === '_id') return; // Mongoose adds this automatically

            let type = field.type;
            if (type === 'ObjectId') type = 'Schema.Types.ObjectId';

            // Simple check
            if (['String', 'Number', 'Date', 'Boolean'].includes(type)) {
                // native types
            }

            code += `  ${field.name}: {\n`;
            code += `    type: ${type},\n`;
            if (!field.isNullable) code += `    required: true,\n`;
            code += `  },\n`;
        });

        code += `}, { timestamps: true });\n\n`;
        code += `module.exports = mongoose.model('${singularName}', ${singularName}Schema);\n\n`;
    });

    return code;
};
