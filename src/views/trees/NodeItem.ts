import { ThemeIcon } from 'vscode';
import { HlfTreeItem } from './HlfTreeItem';

export class NodeItem extends HlfTreeItem {
    iconPath = new ThemeIcon("file-directory");
    contextValue = 'node';
}