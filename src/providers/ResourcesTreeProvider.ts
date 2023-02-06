import path = require('path');
import * as vscode from 'vscode';
import { Links } from '../utilities/Constants';
import { HlfTreeItem } from '../views/trees/HlfTreeItem';
import { ResourceItem } from '../views/trees/ResourceItem';

export class ResourcesTreeProvider implements vscode.TreeDataProvider<HlfTreeItem> {

    getTreeItem(element: ResourceItem): vscode.TreeItem {
        return element.getTreeItem();
    }

    async getChildren(element?: HlfTreeItem): Promise<HlfTreeItem[]> {
        const tree: Array<HlfTreeItem> = [];
        if (!element) {
            tree.push(new ResourceItem("Documentation", "Extension Documentation", new vscode.ThemeIcon("book"), Links.documentation));
            tree.push(new ResourceItem("Contribute", "Contribute to this Extension", new vscode.ThemeIcon("git-pull-request"), Links.contribute));
            tree.push(new ResourceItem("Report an Issue", "Report issues or make feature requests", new vscode.ThemeIcon("bug"), Links.reportIssue));
            tree.push(new ResourceItem("Review", "Share your love for this extension", new vscode.ThemeIcon("comment-discussion"), Links.review));
            tree.push(new ResourceItem("Contact Spydra", "Learn more about how our services can support your business", path.join(__filename, '..', '..', '..',  'media', 'spydra-blue.png'), Links.contactUs));
        }

        return Promise.resolve(tree);
    }
}