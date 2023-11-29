import * as vscode from 'vscode';
import { Links } from '../utilities/Constants';

export class WebsiteView {

    public static showMessage(): void {
        setTimeout(() => {
            vscode.window.showInformationMessage("Checkout Spydra's production grade fully managed blockchain platform and no-code features for Hyperledger Fabric.",
            "Try Spydra Platform", "Contact Spydra").then(selection => {
                if(selection === 'Contact Spydra') {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(Links.contactUs));
                } else if(selection === 'Try Spydra Platform') {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(Links.spydra));
                }
            });
          }, 30000);
    }
/*
    public static async showWebPage(): Promise<void> {
        const content: string = await WebsiteView.getWebviewContent();
        if(content !== ''){
        // Create and show panel
            const panel = vscode.window.createWebviewPanel(
                'spydra',
                'Spydra | Low Code Asset Tokenization Platform',
                vscode.ViewColumn.One,
                {enableScripts: true}
            );

            // And set its HTML content
            panel.webview.html = content;
        }
    }

    private static async getWebviewContent(): Promise<string> {
        let content: string = '';

        await axios.get(Links.spydra)
        .then(function (response: any) {
            content = response.data;
        });

        return content;
      }*/
}