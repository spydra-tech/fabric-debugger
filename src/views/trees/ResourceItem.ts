import * as vscode from 'vscode';
import { Commands } from '../../utilities/Commands';
import { Links } from '../../utilities/Constants';
import { HlfTreeItem } from './HlfTreeItem';

export class ResourceItem extends HlfTreeItem {
    constructor(
        readonly message: string,
        readonly description: string,
        readonly icon: string | vscode.ThemeIcon,
        readonly link: Links
    ) {
        super(message, vscode.TreeItemCollapsibleState.None);
    }

    getTreeItem() {
        const item = new vscode.TreeItem(this.message, vscode.TreeItemCollapsibleState.None);
        item.tooltip = this.message;
        item.description = this.description;
        item.resourceUri = vscode.Uri.parse(this.link);
        item.iconPath = this.icon;
        item.command = {
            command: "hlf.link.open",
            title: '',
            arguments: [item.resourceUri],
        };

        return item;
    }

    contextValue = 'resource';
}