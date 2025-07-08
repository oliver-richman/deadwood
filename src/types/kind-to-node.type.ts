import { FunctionDeclaration, MethodDeclaration, SyntaxKind, VariableDeclaration } from 'ts-morph';

export type KindToNode = {
    [SyntaxKind.VariableDeclaration]: VariableDeclaration;
    [SyntaxKind.FunctionDeclaration]: FunctionDeclaration;
    [SyntaxKind.MethodDeclaration]: MethodDeclaration;
};