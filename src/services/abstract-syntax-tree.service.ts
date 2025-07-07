import {relative} from "path";
import { Project, SyntaxKind } from "ts-morph";

export class AbstractSyntaxTreeService {
    private readonly filePaths: string[];
    private readonly project: Project;

    constructor(filePaths: string[]) {
        this.filePaths = filePaths;
        const thing = 123;
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

    public fetchDeadVariables() {
        for (const sourceFile of this.project.getSourceFiles()) {
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
                    const relativePath = relative(process.cwd(), sourceFile.getFilePath());
                    const lineNumber = variable.getStartLineNumber()
                    console.log(`${relativePath}:${lineNumber}\n - ${name}`)
                }
            }
        }
    }
}