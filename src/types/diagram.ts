import { Node, Edge } from 'reactflow';

export type MySQLDataType =
    | 'INT' | 'BIGINT' | 'TINYINT' | 'DECIMAL' | 'FLOAT' | 'DOUBLE'
    | 'VARCHAR' | 'CHAR' | 'TEXT' | 'LONGTEXT' | 'ENUM'
    | 'DATE' | 'DATETIME' | 'TIMESTAMP' | 'BOOLEAN' | 'JSON' | 'BLOB';
// ...
export interface DiagramContent {
    nodes: Node<TableNodeData>[]; // ReactFlow Nodes
    edges: Edge<EnhancedEdgeData>[]; // ReactFlow Edges with EnhancedEdgeData
    metadata: DiagramMetadata;
}

export type DiagramNode = Node<TableNodeData>;
export type DiagramEdge = Edge<EnhancedEdgeData>;

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
    columns?: Field[]; // Alias for MySQL compatibility
    color?: string; // Custom header color
}

export type Theme = 'ocean' | 'sunset' | 'dark' | 'forest' | 'default';
export type EdgeStyle = 'bezier' | 'straight' | 'step';

export interface DiagramMetadata {
    version: number;
    dbType: 'MYSQL' | 'MONGODB';
    createdAt: string;
    updatedAt: string;
    theme?: Theme;
    edgeStyle?: EdgeStyle;
}

// Field-Level Relationship Types
export interface FieldMapping {
    sourceField: string;
    targetField: string;
    relationshipType: '1:1' | '1:N' | 'N:M';
    description?: string;

    // Visual styling per mapping
    style?: {
        stroke?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
        animated?: boolean;
    };
}

export interface Constraints {
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface EnhancedEdgeData {
    // Field-level mappings
    fieldMappings: FieldMapping[];

    // Overall relationship metadata
    relationshipName?: string;
    relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';

    // Label positioning
    labelPosition?: { x: number; y: number };

    // Constraints
    constraints?: Constraints;

    // Visual settings
    showFields: boolean;      // Show field mappings on diagram
    showCardinality: boolean; // Show relationship cardinality

    // Styling
    style?: {
        stroke?: string;
        strokeWidth?: number;
        animated?: boolean;
    };
}


