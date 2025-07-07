import {relative} from "path";
import { Project, SyntaxKind } from "ts-morph";
import { DeadVariable } from "../types/dead-variable.interface.js";
import { FileGroup } from "../types/file-group.interface.js";

export class AbstractSyntaxTreeService {
    private readonly filePaths: string[];
    private readonly project: Project;

    constructor(filePaths: string[]) {
        this.filePaths = filePaths;
        this.project = new Project({
            useInMemoryFileSystem: false,
            skipAddingFilesFromTsConfig: true,
            compilerOptions: {
                allowJs: true,
                checkJs: false,
            },
        })
    }

    public parseFiles(): void {
        for (const path of this.filePaths) {
            this.project.addSourceFileAtPath(path);
        }
    }

    public fetchDeadVariables(): FileGroup<DeadVariable[]> {
        const fileGroup: FileGroup<DeadVariable[]> = {}
        for (const sourceFile of this.project.getSourceFiles()) {
            const relativePath = relative(process.cwd(), sourceFile.getFilePath());
            const variables = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
            for (const variable of variables) {
                const name = variable.getName();
                const symbol = variable.getSymbol();

                if (!symbol) continue;

                const references = variable.findReferences()
                let referenceCount = 0;
                for (const ref of references) {
                    for (const refNode of ref.getReferences()) {
                        if (refNode.isDefinition()) continue;
                        referenceCount++
                    }
                }

                if (referenceCount === 0) {
                    if (!fileGroup[relativePath]) {
                        fileGroup[relativePath] = []
                    }
                    const line = variable.getStartLineNumber()
                    const column = variable.getStartLinePos();
                    fileGroup[relativePath].push({
                        name,
                        line,
                        column,
                    })
                }
            }
        }

        return fileGroup
    }
}