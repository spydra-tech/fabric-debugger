import * as vscode from 'vscode';
import { Links, Settings } from '../utilities/Constants';
import { TelemetryLogger } from '../utilities/TelemetryLogger';

export class WebsiteView {

    public static showMessage(): void {
        if(Settings.spdrLinkMessageShown === 0){
            setTimeout(() => {
                vscode.window.showInformationMessage("Limited time offer!! Get $400 worth of credits FREE. Checkout Spydra's fully managed platform and no-code features for Hyperledger Fabric.",
                "Try Spydra Platform", "Contact Spydra").then(selection => {
                    if(selection === 'Contact Spydra') {
                        vscode.env.openExternal(vscode.Uri.parse(Links.contactUs));
                        TelemetryLogger.instance().sendTelemetryEvent('OpenExternalLink', {'link': Links.contactUs, linkTitle: "Contact Spydra Popup"});
                    } else if(selection === 'Try Spydra Platform') {
                        vscode.env.openExternal(vscode.Uri.parse(Links.spydra));
                        TelemetryLogger.instance().sendTelemetryEvent('OpenExternalLink', {'link': Links.spydra, linkTitle: "Try Spydra Platform"});
                    }
                });
            }, 30000);
            Settings.spdrLinkMessageShown = 1;
        }
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