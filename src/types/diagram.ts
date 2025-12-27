export type MySQLDataType =
    | 'INT' | 'BIGINT' | 'TINYINT' | 'DECIMAL' | 'FLOAT' | 'DOUBLE'
    | 'VARCHAR' | 'CHAR' | 'TEXT' | 'LONGTEXT' | 'ENUM'
    | 'DATE' | 'DATETIME' | 'TIMESTAMP' | 'BOOLEAN' | 'JSON' | 'BLOB';

export type MongoDataType =
    | 'ObjectId' | 'String' | 'Number' | 'Boolean' | 'Date'
    | 'Array' | 'Object' | 'Decimal128' | 'Map' | 'Buffer' | 'UUID';

export type DataType = MySQLDataType | MongoDataType;

export interface Field {
    id: string;
    name: string;
    type: DataType;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    isNullable?: boolean;
    isUnique?: boolean;
    defaultValue?: string;
}

export interface TableNodeData {
    label: string; // Table/Collection Name
    fields: Field[];
}

export interface DiagramMetadata {
    version: number;
    dbType: 'MYSQL' | 'MONGODB';
    createdAt: string;
    updatedAt: string;
}

export interface DiagramContent {
    nodes: any[]; // ReactFlow Nodes
    edges: any[]; // ReactFlow Edges
    metadata: DiagramMetadata;
}
