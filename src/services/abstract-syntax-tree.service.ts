import { relative } from 'path';
import { FunctionDeclaration, MethodDeclaration, Node, Project, SourceFile, SyntaxKind, VariableDeclaration } from 'ts-morph';
import { SearchableEntities } from '../types/searchable-entities.type.js';
import { FileGroup } from '../types/file-group.interface.js';
import { DeadEntity } from '../types/dead-entity.interface.js';

export class AbstractSyntaxTreeService {

    public parseFilesIntoProject(filePaths: string[]): Project {
        const project = new Project({
            useInMemoryFileSystem: false,
            skipAddingFilesFromTsConfig: true,
            compilerOptions: {
                allowJs: true,
                checkJs: false,
            },
        });
        for (const path of filePaths) {
            project.addSourceFileAtPathIfExists(path);
        }

        return project
    }

    public findDeadEntities(project: Project, entitiesToSearchFor: SearchableEntities[]): FileGroup<DeadEntity[]> {    
        const deadEntityFileGroup: FileGroup<DeadEntity[]> = {};
        for (const sourceFile of project.getSourceFiles()) {
            const relativePath = relative(process.cwd(), sourceFile.getFilePath());

            if (entitiesToSearchFor.includes(SearchableEntities.VARIABLES)) {
                this.findDeadEntitiesOfKind(
                    sourceFile,
                    SyntaxKind.VariableDeclaration,
                    SearchableEntities.VARIABLES,
                    (node) => (node as VariableDeclaration).getName(),
                    deadEntityFileGroup,
                    relativePath
                );
            }

            if (entitiesToSearchFor.includes(SearchableEntities.FUNCTIONS)) {
                this.findDeadEntitiesOfKind(
                    sourceFile,
                    SyntaxKind.FunctionDeclaration,
                    SearchableEntities.FUNCTIONS,
                    (node) => (node as FunctionDeclaration).getName() || 'UNNAMED FUNCTION',
                    deadEntityFileGroup,
                    relativePath
                );
            }

            if (entitiesToSearchFor.includes(SearchableEntities.METHODS)) {
                this.findDeadEntitiesOfKind(
                    sourceFile,
                    SyntaxKind.MethodDeclaration,
                    SearchableEntities.METHODS,
                    (node) => (node as MethodDeclaration).getName(),
                    deadEntityFileGroup,
                    relativePath
                );
            }

            if (entitiesToSearchFor.includes(SearchableEntities.CONSTRUCTOR_PARAMS)) {
                this.findDeadConstructorParams(sourceFile, deadEntityFileGroup, relativePath)
            }

            if (entitiesToSearchFor.includes(SearchableEntities.IMPORTS)) {
                this.findDeadImports(sourceFile, deadEntityFileGroup, relativePath);
            }
        }
        return deadEntityFileGroup;
    }

    private findDeadEntitiesOfKind(
        sourceFile: any,
        kind: SyntaxKind,
        entityType: SearchableEntities,
        getName: (node: Node) => string | undefined,
        fileGroup: FileGroup<DeadEntity[]>,
        relativePath: string
    ) {
        const nodes = sourceFile.getDescendantsOfKind(kind);
        for (const node of nodes) {
            const name = getName(node) ?? 'UNKNOWN';
            const symbol = node.getSymbol();
            if (!symbol) continue;

            const references = node.findReferences();
            let referenceCount = 0;
            for (const ref of references) {
                for (const refNode of ref.getReferences()) {
                    if (refNode.isDefinition()) continue;
                    referenceCount++;
                }
            }

            if (referenceCount === 0) {
                if (!fileGroup[relativePath]) {
                    fileGroup[relativePath] = [];
                }
                const line = node.getStartLineNumber();
                const column = node.getStartLinePos();
                fileGroup[relativePath].push({
                    entity: entityType,
                    name,
                    line,
                    column,
                });
            }
        }
    }

    private findDeadConstructorParams(sourceFile: SourceFile, fileGroup: FileGroup<DeadEntity[]>, relativePath: string) {
        const constructors = sourceFile.getDescendantsOfKind(SyntaxKind.Constructor);
        for (const ctor of constructors) {
            const params = ctor.getParameters();
            for (const param of params) {
                const name = param.getName();
                const symbol = param.getSymbol();
                if (!symbol) continue;

                const references = param.findReferences();
                let referenceCount = 0;
                for (const ref of references) {
                    for (const refNode of ref.getReferences()) {
                        if (refNode.isDefinition()) continue;
                        referenceCount++;
                    }
                }

                if (referenceCount === 0) {
                    if (!fileGroup[relativePath]) {
                        fileGroup[relativePath] = [];
                    }
                    const line = param.getStartLineNumber();
                    const column = param.getStartLinePos();
                    fileGroup[relativePath].push({
                        entity: SearchableEntities.CONSTRUCTOR_PARAMS,
                        name,
                        line,
                        column,
                    });
                }
            }
        }
    }

    private findDeadImports(sourceFile: SourceFile, fileGroup: FileGroup<DeadEntity[]>, relativePath: string) {
        const imports = sourceFile.getImportDeclarations();
        for (const importDeclaration of imports) {

            // Default import: import foo from "module"
            const defaultImport = importDeclaration.getDefaultImport();
            if (defaultImport) {
                const name = defaultImport.getText();
                const references = defaultImport.findReferences();
                let referenceCount = 0;
                for (const ref of references) {
                    for (const refNode of ref.getReferences()) {
                        const refSourceFile = refNode.getSourceFile();
                        if (refSourceFile.getFilePath() !== sourceFile.getFilePath()) continue;
                        if (refNode.isDefinition()) continue;
                        referenceCount++;
                    }
                }

                if (referenceCount === 0) {
                    if (!fileGroup[relativePath]) {
                        fileGroup[relativePath] = [];
                    }
                    const line = defaultImport.getStartLineNumber();
                    const column = defaultImport.getStartLinePos();
                    fileGroup[relativePath].push({
                        entity: SearchableEntities.IMPORTS,
                        name,
                        line,
                        column,
                    });
                }
            }

            // Named imports: import { foo, bar } from "module"
            for (const named of importDeclaration.getNamedImports()) {
                if (named) {
                    const name = named.getName();
                    const node = named.getNameNode();
                    if (!Node.isIdentifier(node)) {
                        continue;
                    }
                    const references = node.findReferences();
                    let isUsed = false;
                    for (const ref of references) {
                        for (const refNode of ref.getReferences()) {
                            // Only count as a reference if outside the import declaration
                            const refSourceFile = refNode.getSourceFile();
                            if (refSourceFile.getFilePath() !== sourceFile.getFilePath()) continue;
                            const refPos = refNode.getNode().getStart();
                            const importStart = named.getStart();
                            const importEnd = named.getEnd();
                            // If the reference is outside the import declaration, mark as used
                            if (!(refSourceFile === sourceFile && refPos >= importStart && refPos <= importEnd)) {
                                isUsed = true;
                                break;
                            }
                        }
                        if (isUsed) break;
                    }
                    if (!isUsed) {
                        if (!fileGroup[relativePath]) {
                            fileGroup[relativePath] = [];
                        }
                        const line = named.getStartLineNumber();
                        const column = named.getStartLinePos();
                        fileGroup[relativePath].push({
                            entity: SearchableEntities.IMPORTS,
                            name,
                            line,
                            column,
                        });
                    }
                }
            }

            // Namespace import: import * as foo from "module"
            const namespaceImport = importDeclaration.getNamespaceImport();
            if (namespaceImport) {
                const name = namespaceImport.getText();
                    const references = namespaceImport.findReferences();

                    let referenceCount = 0;
                    for (const ref of references) {
                        for (const refNode of ref.getReferences()) {
                            if (refNode.isDefinition()) continue;
                            referenceCount++;
                        }
                    }

                    if (referenceCount === 0) {
                        if (!fileGroup[relativePath]) {
                            fileGroup[relativePath] = [];
                        }
                        const line = namespaceImport.getStartLineNumber();
                        const column = namespaceImport.getStartLinePos();
                        fileGroup[relativePath].push({
                            entity: SearchableEntities.IMPORTS,
                            name,
                            line,
                            column,
                        });
                    }
            }
        }
    }
}