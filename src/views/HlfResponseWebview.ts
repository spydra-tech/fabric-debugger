import * as vscode from 'vscode';

export class HlfResponseWebview {
    private _message: string;
    private _status: string;
    private _result: string;
    private _panel: vscode.WebviewPanel;
    private _headlineColor: string;
    private static _instance: HlfResponseWebview;

    public static instance(): HlfResponseWebview {
        if(!this._instance)
        {
            HlfResponseWebview._instance = new HlfResponseWebview();
        }
        try{
            const webViewview = this._instance._panel.webview;
        }
        catch(err){     //Webview is disposed. Create a new one.
            HlfResponseWebview._instance = new HlfResponseWebview();
        }
        return HlfResponseWebview._instance;
    }

    public constructor() {
        this._panel = vscode.window.createWebviewPanel(
            'fabricResponse',
            'Fabric Response',
            vscode.ViewColumn.Two,
            {enableFindWidget: true, enableScripts: true}
          );
    }

    public async render(message: string, duration: number) {
        this.interpretMessage(message);
        this._panel.webview.html = this.getWebviewContent(duration);
    }

    private interpretMessage(message: string): void {
        if(message.startsWith("Error:")){
            const statusIndex = message.indexOf("response:");
            const resultIndex = message.indexOf("message:");
            if(statusIndex !== -1){
                this._message = message.substring(0, statusIndex-1);
            } else {
                this._message = "";
            }
            if(statusIndex !== -1 && resultIndex !== -1){
                this._status = message.substring(statusIndex+9, resultIndex-1);
            } else {
                this._status = " status:500";
            }
            this._result = message.substring(resultIndex);
            this._headlineColor = "Tomato";
            if(message.indexOf("Usage:")>-1){
                this._result = this._result.substring(0, message.indexOf("Usage:")-1);
            }
            this._result = `<code>${this._result}</code>`;
        }
        else{
            this._message = "Chaincode invoke successful.";
            this._status = " status:200";
            this._headlineColor = "MediumSeaGreen";
            if(this.isJson(message)){
                const json = JSON.parse(message);
                this._result = `<pre><code>${JSON.stringify(json, null, 2)}</code></pre>`;
            }
            else{
                this._result = `<code>${message}</code>`;
            }
        }
    }

    private isJson(message: string): boolean{
        if (typeof message !== "string") {
            return false;
        }
        try {
            JSON.parse(message);
            return true;
        } catch (error) {
            return false;
        }
    }

    private getWebviewContent(duration: number): string {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Response</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
            </head>
            <body>
                <p>
                    <span style="color:${this._headlineColor};"><strong>${this._message}</strong></span><br>
                    <span><strong>Response:</strong>${this._status}</span><br>
                    <span><strong>Time:&nbsp;</strong>${duration} ms</span>
                </p>
                <span><strong>Result:</strong><br>${this._result}</span>

                <script>hljs.highlightAll();</script>
            </body>
            </html>`;
    }
}