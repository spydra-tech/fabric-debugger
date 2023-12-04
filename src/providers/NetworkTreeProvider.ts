import * as vscode from 'vscode';
import { HlfTreeItem } from '../views/trees/HlfTreeItem';
import { NetworkItem } from '../views/trees/NetworkItem';
import { OrganizationItem } from '../views/trees/OrganizationItem';
import { HlfProvider } from './HlfProvider';
import { Settings } from '../utilities/Constants';
import { OrganizationRoot } from '../views/trees/OrganizationRoot';
import { CaItem } from '../views/trees/CaItem';
import { OrdererItem } from '../views/trees/OrdererItem';
import { PeerItem } from '../views/trees/PeerItem';
import { NodeItem } from '../views/trees/NodeItem';

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
                tree.push(new OrganizationRoot("Organizations", vscode.TreeItemCollapsibleState.Expanded));
            } else if (element instanceof OrganizationRoot) {
                tree.push(new OrganizationItem(Settings.singleOrgSettings.name, vscode.TreeItemCollapsibleState.Expanded));
            } else if (element instanceof OrganizationItem) {
                tree.push(new NodeItem("ca", vscode.TreeItemCollapsibleState.Expanded));
                tree.push(new NodeItem("orderer", vscode.TreeItemCollapsibleState.Expanded));
                tree.push(new NodeItem("peer", vscode.TreeItemCollapsibleState.Expanded));
            } else if (element instanceof NodeItem && element.label === "ca") {
                tree.push(new CaItem(Settings.singleOrgSettings.caDomain, vscode.TreeItemCollapsibleState.None));
            } else if (element instanceof NodeItem && element.label === "orderer") {
                tree.push(new OrdererItem(Settings.singleOrgSettings.ordererDomain, vscode.TreeItemCollapsibleState.None));
            } else if (element instanceof NodeItem && element.label === "peer") {
                tree.push(new PeerItem(Settings.singleOrgSettings.peerDomain, vscode.TreeItemCollapsibleState.Expanded));
            } else if (element instanceof PeerItem) {
                tree.push(new vscode.TreeItem(Settings.defaultChaincodeId, vscode.TreeItemCollapsibleState.None));
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