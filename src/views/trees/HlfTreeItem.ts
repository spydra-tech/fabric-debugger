import * as vscode from 'vscode';

export abstract class HlfTreeItem extends vscode.TreeItem {
    contextValue = 'hlf-tree-item';
}