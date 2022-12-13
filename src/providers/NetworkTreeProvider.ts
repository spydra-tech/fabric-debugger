import * as vscode from 'vscode';
import { HlfTreeItem } from '../views/trees/HlfTreeItem';
import { NetworkItem } from '../views/trees/NetworkItem';
import { OrganizationItem } from '../views/trees/OrganizationItem';
import { HlfProvider } from './HlfProvider';

export class NetworkTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<HlfTreeItem | undefined | void> = new vscode.EventEmitter<HlfTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<HlfTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        const tree: Array<vscode.TreeItem> = [];
        
        //Hardcode the Fabric organization structure for now. Need to make this dynamic when we enable support for multiple organizations
        if (element) {
            if (element instanceof NetworkItem) {
                tree.push(new OrganizationItem("Organizations", vscode.TreeItemCollapsibleState.Expanded));
            }
            if (element instanceof OrganizationItem) {
                tree.push(new vscode.TreeItem("Org1", vscode.TreeItemCollapsibleState.None));
            }
        }
        else{
            if(HlfProvider.islocalNetworkStarted){
                tree.push(new NetworkItem("Local Fabric Network", vscode.TreeItemCollapsibleState.Expanded));
            }
            else{
                tree.push(new NetworkItem("Local Fabric Network (Stopped)", vscode.TreeItemCollapsibleState.Collapsed));
            }
        }

        return tree;
    }
}