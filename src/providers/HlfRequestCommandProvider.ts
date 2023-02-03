import * as vscode from 'vscode';
import { ShellCommand } from '../utilities/ShellCommand';
import { Settings, LogType, DockerComposeFiles } from '../utilities/Constants';
import { HlfResponseWebview } from '../views/HlfResponseWebview';
import { Logger } from '../utilities/Logger';
import * as JSON5 from 'json5';
import { WalletIdentityProvider } from './WalletIdentityProvider';
import { TelemetryLogger } from '../utilities/TelemetryLogger';

export class HlfRequestCommandProvider {
    private lineSplit: RegExp = /\r?\n/g;

    public async exec(range: vscode.Range) {
        const editor = vscode.window.activeTextEditor;
        const document = vscode.window.activeTextEditor?.document;
        if (!editor || !document) {
            return;
        }

        //Parse the input in the range as a valid Json
        const lines: string = document.getText(range);
        const requestJson =  JSON5.parse(lines);

        //Get the transaction type and method name. Assume that the transaction type is case-insensitive
        let transactionType: string = "query";
        let methodName: string = this.getValueWithoutCase(requestJson, "query");
        if(!methodName){
            transactionType = "invoke";
            methodName = this.getValueWithoutCase(requestJson, "invoke");
        }

        TelemetryLogger.instance().sendTelemetryEvent('RequestCommand', {transactionType: transactionType});
        //Get the identity to be used for the request
        const wallet = this.getValueWithoutCase(requestJson, "identity");

        //Fabric expects all arguments to be strings even when the argument type declared in a method is not a string.
        //Since we are allowing users to declare the arguments as a Json array, we will accept any valid JSON array
        //including any valid native type (number, boolean) or any JSON object as elements in the array.
        //Convert all elements as strings before sending the transaction to Fabric
        let payloadArgs: string[] = [];
        for(const arg in requestJson.args){
            if(typeof requestJson.args[arg] === 'object'){
                payloadArgs.push(`'\"${JSON.stringify(requestJson.args[arg]).split('"').join('\\"')}\"'`);
            }
            else{
                payloadArgs.push(`'\"${requestJson.args[arg].toString().split('"').join('\\"')}\"'`);
            }
        }
        const payloadLines = `${[payloadArgs.join(',')]}`;

        //Send the transaction to Fabric
        const chaincodeArgs: string[] = [transactionType, Settings.defaultChaincodeId, methodName, payloadLines];
        if(wallet){
            if((await WalletIdentityProvider.getwallets()).findIndex(element => {
                return element.toLowerCase() === wallet.toLowerCase();
              }) === -1){
                Logger.instance().showMessage(LogType.error, `The user '${wallet}' does not exist. Create the user in the wallet first before submitting a request`);
                return;
              }
              
            chaincodeArgs.push(wallet);
        }

        var startTime = process.hrtime();
        let result: string = await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/sendTransactionInternal.sh", chaincodeArgs);
        const elapsedTime = TelemetryLogger.instance().parseHrtimeToMs(process.hrtime(startTime));

        if(result.indexOf("error building chaincode: error building image: failed to get chaincode package for external build:") > -1
        || result.indexOf("connect: connection refused") > -1){
            Logger.instance().showMessage(LogType.error, "Start Debugging(F5) before submitting a transaction to Fabric");
            result = "Error: cannot debug Chaincode. response: status:500 message: \"Start Debugging(F5) before submitting a transaction to Fabric\"";
        }
        if(result.indexOf("service \"debug-cli\" is not running container") > -1){
            Logger.instance().showMessage(LogType.error, "Start the Network or Start Debugging(F5) before submitting a transaction to Fabric");
            result = "Error: cannot connect to local Fabric environment. response: status:500 message: \"Start the Network or Start Debugging(F5) before submitting a transaction to Fabric\"";
        }
        else if(result.startsWith("Error: chaincode argument error: invalid character")){
            Logger.instance().showMessage(LogType.error, "Syntax error in query/invoke request");
        }

        //Render the result
        const responseWebView: HlfResponseWebview = HlfResponseWebview.instance();
        responseWebView.render(result, elapsedTime);
    }

    private getValueWithoutCase(requestJson: any, transactionType: string): string {
        return requestJson[Object.keys(requestJson).find(key => key.toLowerCase() === transactionType)];
    }
}