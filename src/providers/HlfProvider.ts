import * as vscode from 'vscode';
import { ShellCommand } from '../utilities/ShellCommand';
import { LogType, DockerComposeFiles, Settings } from '../utilities/Constants';
import { Logger } from '../utilities/Logger';
import { setTimeout } from "timers/promises";
import { Prerequisites } from '../utilities/Prerequisites';

export class HlfProvider {
    public static islocalNetworkStarted: boolean = false;

    public static async createNetwork(): Promise<boolean>{
        const logger: Logger = Logger.instance();

        try{
            if(!(await Prerequisites.checkDocker())){
                logger.showMessage(LogType.error, "Prerequisite- Docker is not installed or running. Please install and start Docker and try again");
                return false;
            }
            if(!(await Prerequisites.checkDockerCompose())){
                logger.showMessage(LogType.error, "Prerequisite- Docker-compose is not installed. Please install latest version of Docker-compose and try again");
                return false;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating local Fabric network",
                cancellable: true
                }, async (progress) => {
                    //Create the network by invoking Docker compose
                    //It is Ok to invoke Docker compose on a running network also
                    //Create the CA node first
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localCa, ["up", "--detach"]);
                    progress.report({ increment: 10 });

                    //Create the required certificates
                    await ShellCommand.execDockerComposeSh(DockerComposeFiles.localCa, "ca.org1.debugger.com", "/etc/hyperledger/fabric/scripts/registerEnrollOneOrg.sh");
                    progress.report({ increment: 20 });

                    //Create the rest of the nodes
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localNetwork, ["up", "--detach"]);
                    logger.log(LogType.info, "Created local Fabric network");
                    progress.report({ increment: 70, message: "Creating channel" });

                    //Wait for some time for the nodes to be fully functional
                    await setTimeout(1000);
                    //Create the default channel
                    await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/createChannelInternal.sh");
                    progress.report({ increment: 85, message: "Deploying chaincode" });

                    //Deploy chaincode on the channel
                    let chaincodeArgs: string[] = [Settings.defaultChaincodeId, Settings.defaultChaincodeVersion];
                    await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/deployChaincodeInternal.sh", chaincodeArgs);
                    progress.report({ increment: 100});

                    HlfProvider.islocalNetworkStarted = true;
                    vscode.commands.executeCommand('identity.refresh');
                    vscode.commands.executeCommand('localnetwork.refresh');
                    logger.showMessage(LogType.info, "Local Fabric Network started");
                });
            return true;
        }
        catch(error){
            Logger.instance().showMessageOnly(LogType.error, `Failed to start local Fabric Network. ${error}`);
            return false;
        }
    }

    public static setChaincodeName(){
        if(vscode.workspace.name){
            //Chaincode name is the current workspace name. Replace all non-alphanumeric characters with "-".
            Settings.defaultChaincodeId = vscode.workspace.name.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
            Settings.debugEnv.CORE_CHAINCODE_ID_NAME = `${Settings.defaultChaincodeId}:${Settings.defaultChaincodeVersion}`;
        }
    }

    public static async stopNetwork(): Promise<void>{
        //Stop existing debug session
        vscode.debug.stopDebugging(vscode.debug.activeDebugSession);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Stopping local Fabric network",
            cancellable: true
            }, async (progress) => {
                try{
                    progress.report({ increment: 20 });
                    //Stop the CA node
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localCa, ["stop"]);
                    progress.report({ increment: 40});
                    //Stop the rest of the nodes
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localNetwork, ["stop"]);
                    progress.report({ increment: 100});
                }
                catch (error){
                    if(error.indexOf('ENOENT')>-1){
                        Logger.instance().showMessage(LogType.error, `Prerequisite- Docker is not installed. Please install latest version of Docker and Docker-compose and try again`);
                    }
                    else{
                        Logger.instance().showMessageOnly(LogType.error, "Failed to stop local Fabric Network");
                    }
                }

                HlfProvider.islocalNetworkStarted = false;
                vscode.commands.executeCommand('identity.refresh');
                vscode.commands.executeCommand('localnetwork.refresh');
                Logger.instance().showMessage(LogType.info, "Local Fabric Network stopped");
            }
        );
    }

    public static async restartNetwork(): Promise<void>{
        await this.stopNetwork();
        await this.createNetwork();

    }

    public static async removeNetwork(): Promise<void>{
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Removing local Fabric network",
            cancellable: true
            }, async (progress) => {
                try{
                    //Cleanup the files related to the local network
                    await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/cleanupFiles.sh");
                    progress.report({ increment: 20 });
                    //Remove all the nodes except CA
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localNetwork, ["down", "-v"]);
                    progress.report({ increment: 80});
                    //Remove the CA node
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localCa, ["down", "-v"]);
                    progress.report({ increment: 100});
                }
                catch (error){
                    if(error.indexOf('ENOENT')>-1){
                        Logger.instance().showMessage(LogType.error, `Prerequisite- Docker is not installed. Please install latest version of Docker and Docker-compose and try again`);
                    }
                    else{
                        Logger.instance().showMessageOnly(LogType.error, "Failed to remove local Fabric Network");
                    }
                }

                HlfProvider.islocalNetworkStarted = false;
                vscode.commands.executeCommand('identity.refresh');
                vscode.commands.executeCommand('localnetwork.refresh');
                Logger.instance().showMessage(LogType.info, "Local Fabric Network removed");
            }
        );
    }
}