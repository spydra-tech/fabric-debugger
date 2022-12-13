import path = require('path');
import * as vscode from 'vscode';
import { HlfTreeItem } from './HlfTreeItem';

export class WalletItem extends HlfTreeItem {
    iconPath: {light: string, dark: string} = {
        light: path.join(__filename, '..', '..','..', '..', 'media', 'wallet-black.png'),
        dark: path.join(__filename, '..', '..','..', '..', 'media', 'wallet-white.png')
    };

    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, context: string = 'wallet') {
        super(label, collapsibleState);
        this.contextValue = context;
    }
}