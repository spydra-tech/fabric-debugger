import * as vscode from 'vscode';
import { ShellCommand } from '../utilities/ShellCommand';
import { Logger } from '../utilities/Logger';
import { LogType, DockerComposeFiles, Settings } from '../utilities/Constants';
import { WalletItem } from '../views/trees/WalletItem';
import { TelemetryLogger } from '../utilities/TelemetryLogger';

export class WalletIdentityProvider {
    public async createIdentity() {
        TelemetryLogger.instance().sendTelemetryEvent('CreateIdentity');
        const username = await vscode.window.showInputBox({ prompt: 'Provide a username for the identity', 
                                                        placeHolder: "Username" });
        if (username) {
            if(username.search(/^[a-zA-Z0-9_-]+$/g) === -1){
                Logger.instance().showMessage(LogType.error, `Enter alphanumeric, hyphen (-) and underscore (_) characters only in username`);
                return;
            }

            if((await WalletIdentityProvider.getwallets()).findIndex(element => {
                return element.toLowerCase() === username.toLowerCase();
              }) === -1){

                const identityArgs: string[] = [username];
                const result: string = await ShellCommand.execDockerComposeSh(DockerComposeFiles.localCa, "ca.org1.debugger.com", "/etc/hyperledger/fabric/scripts/registerEnrollIdentity.sh", identityArgs);

                if(result.search(/service .* is not running container .*/gi)>-1){
                    Logger.instance().showMessage(LogType.error, "Start the Network or Start Debugging(F5) before creating an identity");
                }
                else{
                    vscode.commands.executeCommand('identity.refresh');
                    Logger.instance().showMessageOnly(LogType.info, `Created and enrolled identity for user: ${username}`);
                }
            }
            else{
                Logger.instance().showMessage(LogType.error, `The user '${username}' already exists`);
            }
        }
    }

    public async removeIdentity(element?: WalletItem) {
        TelemetryLogger.instance().sendTelemetryEvent('RemoveIdentity');
        if(element && element.label){
            const username: string = element.label.toString();
            const identityArgs: string[] = [username];
            const result: string = await ShellCommand.execDockerComposeSh(DockerComposeFiles.localCa, "ca.org1.debugger.com", "/etc/hyperledger/fabric/scripts/removeIdentity.sh", identityArgs);

            if(result.search(/service .* is not running container .*/gi)>-1){
                Logger.instance().showMessage(LogType.error, "Start the Network or Start Debugging(F5) before modifying an identity");
            }
            else{
                vscode.commands.executeCommand('identity.refresh');
                Logger.instance().showMessageOnly(LogType.info, `Removed identity for user: ${username}`);
            }
        }
    }

    static async getwallets(): Promise<string[]>{
        try{
            const result: string = await ShellCommand.execDockerComposeSh(DockerComposeFiles.localCa, "ca.org1.debugger.com", "/etc/hyperledger/fabric/scripts/getWallets.sh", [], false);
            if(result){
                return result.split("\n").filter(user=> user && user!=="/" && user.indexOf("/")>-1).map(user=>user.replace("/", ""));
            }
            else{
                return [];
            }
        }
        catch(error){
            Logger.instance().showMessage(LogType.error, `Cannot retrieve wallets. ${error}`);
            return [];
        }
    }
}