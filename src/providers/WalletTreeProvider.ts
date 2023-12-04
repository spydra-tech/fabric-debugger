import * as vscode from 'vscode';
import { NetworkItem } from '../views/trees/NetworkItem';
import { OrganizationItem } from '../views/trees/OrganizationItem';
import { WalletItem } from '../views/trees/WalletItem';
import { HlfTreeItem } from '../views/trees/HlfTreeItem';
import { HlfProvider } from './HlfProvider';
import { WalletIdentityProvider } from './WalletIdentityProvider';
import { Settings } from '../utilities/Constants';

export class WalletTreeProvider implements vscode.TreeDataProvider<HlfTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<HlfTreeItem | undefined | void> = new vscode.EventEmitter<HlfTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<HlfTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: HlfTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: HlfTreeItem): Promise<HlfTreeItem[]> {
        const tree: Array<HlfTreeItem> = [];
        if(HlfProvider.islocalNetworkStarted){
            if (element) {
                if (element instanceof NetworkItem) {
                    tree.push(new OrganizationItem(Settings.singleOrgSettings.name, vscode.TreeItemCollapsibleState.Expanded));
                }
                if (element instanceof OrganizationItem) {
                    const wallets = await WalletIdentityProvider.getwallets();
    
                    wallets.forEach(user => {
                        if(user.toLowerCase() === Settings.singleOrgSettings.adminUser.toLowerCase()){
                            //Do not allow the default org admin user to be removed.
                            //For this, set the context to some value other than 'wallet'
                            tree.push(new WalletItem(user, vscode.TreeItemCollapsibleState.None, user));
                        }
                        else{
                            tree.push(new WalletItem(user, vscode.TreeItemCollapsibleState.None));
                        }
                    });
                }
            }
            else{
                tree.push(new NetworkItem("Local Fabric Network", vscode.TreeItemCollapsibleState.Expanded));
            }
        }

        return Promise.resolve(tree);
    }
}