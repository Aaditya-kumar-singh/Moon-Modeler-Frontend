import { describe, it, expect } from 'vitest';
import { generateMySQL, generateMongoose } from './codeGenerator';
// Mocking types loosely to avoid complex imports in test if paths break, but checking alias first.
// If aliases work in vitest.config, this should work.
import { DiagramNode, DiagramEdge } from '@/types/diagram';

describe('Code Generator', () => {
    describe('MySQL Generator', () => {
        it('should generate a simple CREATE TABLE statement', () => {
            const nodes: DiagramNode[] = [
                {
                    id: '1',
                    type: 'mysqlTable',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'users',
                        fields: [
                            { id: 'f1', name: 'id', type: 'INT', isPrimaryKey: true, isNullable: false },
                            { id: 'f2', name: 'email', type: 'VARCHAR', isNullable: false, isUnique: true }
                        ]
                    }
                }
            ];
            const edges: DiagramEdge[] = [];

            const sql = generateMySQL(nodes, edges);
            expect(sql).toContain('CREATE TABLE IF NOT EXISTS `users`');
            expect(sql).toContain('`id` INT NOT NULL AUTO_INCREMENT');
            expect(sql).toContain('`email` VARCHAR(255) NOT NULL');
            expect(sql).toContain('PRIMARY KEY (`id`)');
        });

        it('should generate FOREIGN KEY logic from relationships', () => {
            const nodes: DiagramNode[] = [
                {
                    id: '1',
                    type: 'mysqlTable',
                    position: { x: 0, y: 0 },
                    data: { label: 'users', fields: [{ id: 'f1', name: 'id', type: 'INT', isPrimaryKey: true }] }
                },
                {
                    id: '2',
                    type: 'mysqlTable',
                    position: { x: 0, y: 0 },
                    data: { label: 'posts', fields: [{ id: 'f2', name: 'id', type: 'INT', isPrimaryKey: true }, { id: 'f3', name: 'user_id', type: 'INT' }] }
                }
            ];
            const edges: DiagramEdge[] = [
                {
                    id: 'e1',
                    source: '2', // Post
                    target: '1', // User
                    type: 'fieldMapping',
                    data: {
                        fieldMappings: [{ sourceField: 'user_id', targetField: 'id', relationshipType: '1:N' }],
                        relationshipType: 'one-to-many',
                        showFields: true,
                        showCardinality: true
                    }
                }
            ];
            // In our logic: Source (Post) references Target (User)
            const sql = generateMySQL(nodes, edges);
            expect(sql).toContain('ALTER TABLE `posts`');
            expect(sql).toContain('ADD CONSTRAINT `fk_posts_user_id`');
            expect(sql).toContain('FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)');
        });
    });

    describe('Mongoose Generator', () => {
        it('should generate a Mongoose Schema', () => {
            const nodes: DiagramNode[] = [
                {
                    id: '1',
                    type: 'mongoCollection',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'users',
                        fields: [
                            { id: 'f1', name: '_id', type: 'ObjectId', isPrimaryKey: true },
                            { id: 'f2', name: 'username', type: 'String', isNullable: false }
                        ]
                    }
                }
            ];

            const code = generateMongoose(nodes);
            expect(code).toContain('const UserSchema = new Schema({');
            expect(code).not.toContain('_id: {'); // Should skip _id definition block
            expect(code).toContain('username: {');
            expect(code).toContain('type: String,');
            expect(code).toContain('required: true,');
            expect(code).toContain("mongoose.model('User', UserSchema)");
        });
    });
});
