import * as vscode from 'vscode';
import { ShellCommand } from '../utilities/ShellCommand';
import { LogType, DockerComposeFiles, Settings } from '../utilities/Constants';
import { Logger } from '../utilities/Logger';
import { setTimeout } from "timers/promises";
import { Prerequisites } from '../utilities/Prerequisites';
import { TelemetryLogger } from '../utilities/TelemetryLogger';
import * as fs from 'fs';
import * as path from 'path';
import {  Contract, ContractEvent, DefaultCheckpointers, Gateway, GatewayOptions, Wallets } from 'fabric-network';

export class HlfProvider {
    public static islocalNetworkStarted: boolean = false;
    private static contracts: Map<string, Contract> = new Map();
    private static listener = async (event: ContractEvent) => {
        const transaction = event.getTransactionEvent();
        Logger.instance().log(LogType.info, `Chaincode Event: Name: ${event.eventName}, Block No: ${transaction.getBlockEvent().blockNumber}, Transaction Id: ${transaction.transactionId}, Payload: ${event.payload.toString()}`);
    };

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

            var startTime = process.hrtime();
            const telemetryLogger = TelemetryLogger.instance();
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Starting local Fabric network",
                cancellable: true
                }, async (progress) => {
                    //Create the network by invoking Docker compose
                    //It is Ok to invoke Docker compose on a running network also
                    //Create the CA node first
                    await ShellCommand.runDockerCompose(DockerComposeFiles.localCa, ["up", "--detach"]);
                    progress.report({ increment: 10 });

                    //Wait for some time for the CA node to be fully functional
                    await setTimeout(1000);

                    //Create the required certificates
                    await ShellCommand.execDockerComposeSh(DockerComposeFiles.localCa, Settings.singleOrgSettings.caDomain, "/etc/hyperledger/fabric/scripts/registerEnrollOneOrg.sh");
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

                    if(Settings.isCaas){
                        //Install chaincode on peers
                        await this.installCaasChaincode();
                    }
                    else{
                        Settings.defaultChaincodePackageId = `${Settings.defaultChaincodeId}:${Settings.defaultChaincodeVersion}`;
                    }

                    //Approve and Commit chaincode on the channel
                    let chaincodeArgs: string[] = [Settings.defaultChaincodeId, Settings.defaultChaincodeVersion, Settings.defaultChaincodePackageId];
                    await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/deployChaincodeInternal.sh", chaincodeArgs);
                    progress.report({ increment: 100});

                    HlfProvider.islocalNetworkStarted = true;
                    vscode.commands.executeCommand('hlf.identity.refresh');
                    vscode.commands.executeCommand('hlf.localnetwork.refresh');
                    logger.showMessage(LogType.info, "Local Fabric Network started");
                });
                const elapsedTime = telemetryLogger.parseHrtimeToMs(process.hrtime(startTime));
                telemetryLogger.sendTelemetryEvent('CreateNetwork', null, {'createNetworkDuration': elapsedTime});
            return true;
        }
        catch(error){
            Logger.instance().showMessageOnly(LogType.error, `Failed to start local Fabric Network. ${error}`);
            return false;
        }
    }

    public static setChaincodeName(name: string){
        if(name){
            Settings.defaultChaincodeId = name.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
        } else if(vscode.workspace.name) {
            //Chaincode name is the current workspace name. Replace all non-alphanumeric characters with "-".
            Settings.defaultChaincodeId = vscode.workspace.name.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
            if(Settings.isCaas){
                Settings.defaultChaincodeId = `${Settings.defaultChaincodeId}-caas`;
            }
        }
        Settings.debugEnv.CORE_CHAINCODE_ID_NAME = `${Settings.defaultChaincodeId}:${Settings.defaultChaincodeVersion}`;
    }

    public static async stopNetwork(): Promise<void>{
        //Stop existing debug session
        vscode.debug.stopDebugging(vscode.debug.activeDebugSession);

        var startTime = process.hrtime();
        const telemetryLogger = TelemetryLogger.instance();
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
                vscode.commands.executeCommand('hlf.identity.refresh');
                vscode.commands.executeCommand('hlf.localnetwork.refresh');
                Logger.instance().showMessage(LogType.info, "Local Fabric Network stopped");
            }
        );
        const elapsedTime = telemetryLogger.parseHrtimeToMs(process.hrtime(startTime));
        telemetryLogger.sendTelemetryEvent('StopNetwork', null, {'stopNetworkDuration': elapsedTime});
    }

    public static async restartNetwork(): Promise<void>{
        await this.stopNetwork();
        await this.createNetwork();

    }

    public static async removeNetwork(): Promise<void>{
        //Stop existing debug session
        vscode.debug.stopDebugging(vscode.debug.activeDebugSession);

        var startTime = process.hrtime();
        const telemetryLogger = TelemetryLogger.instance();
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
                vscode.commands.executeCommand('hlf.identity.refresh');
                vscode.commands.executeCommand('hlf.localnetwork.refresh');
                Logger.instance().showMessage(LogType.info, "Local Fabric Network removed");
            }
        );
        const elapsedTime = telemetryLogger.parseHrtimeToMs(process.hrtime(startTime));
        telemetryLogger.sendTelemetryEvent('RemoveNetwork', null, {'removeNetworkDuration': elapsedTime});
    }

    public static async installCaasChaincode(): Promise<void>{
        let chaincodeArgs: string[] = [Settings.defaultChaincodeId];
        //Package the chaincode first
        Settings.defaultChaincodePackageId = (await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/packageCaasChaincode.sh", chaincodeArgs)).replace("\n", "");
        Settings.debugCaasEnv.CHAINCODE_ID = Settings.defaultChaincodePackageId;
        //Install the chaincode on the peers
        await ShellCommand.execDockerComposeBash(DockerComposeFiles.localNetwork, "debug-cli", "/etc/hyperledger/fabric/scripts/installCaasChaincode.sh", chaincodeArgs);
    }

    public static async shouldRestart(debugConfiguration: vscode.DebugConfiguration): Promise<boolean> {
		let shouldRestart: boolean = false;

        //If external chaincode setting has changed, we should restart
		if(Settings.isCaas !== debugConfiguration.isCaas){
			shouldRestart = true;
		}

        //if chaincode name has changed, we should restart
        if(debugConfiguration.chaincodeName && Settings.defaultChaincodeId !== debugConfiguration.chaincodeName){
			shouldRestart = true;
		}


        //Check if all the docker containers are running. If not, we should try to restart
		const result = await ShellCommand.runDockerCompose(DockerComposeFiles.localNetwork, ["ls", "--filter", `name=${Settings.singleOrgProj}`], false);
        if(result.toLowerCase().indexOf("running(5)") === -1){
            shouldRestart = true;
        }
        
        return shouldRestart;
	}

    public static async startChaincodeListener(): Promise<void>{
        const logger: Logger = Logger.instance();
        try{
            let contract: Contract;
            if(!HlfProvider.contracts.has(Settings.defaultChaincodeId)){
                //Create wallet from the admin user's certificate and key
                const mspPath = path.join(Settings.dockerDir, '..', '..', 'local', 'organizations', 'peerOrganizations',
                Settings.singleOrgSettings.domain, 'users', Settings.singleOrgSettings.adminUser, 'msp');
                const certPath = path.join(mspPath, 'signcerts', 'cert.pem');
                const keyPath = path.join(mspPath, 'keystore');
                let privatekey = '';
                const files = fs.readdirSync(keyPath);
                files.forEach(function (file) {
                    privatekey = fs.readFileSync(path.join(keyPath, file), 'utf8');
                });

                const certificate = fs.readFileSync(certPath, 'utf8');
                if(!certificate || !privatekey){
                    logger.log(LogType.warning, "Certificate or private key not found for admin user. Skipping Event listener setup. Events won't be streamed to the output.");
                    return;
                } 
                
                const x509Identity = {
                    credentials: {
                        certificate: certificate,
                        privateKey: privatekey,
                    },
                    mspId: Settings.singleOrgSettings.msp,
                    type: 'X.509',
                };
                const wallet = await Wallets.newInMemoryWallet();
                await wallet.put(Settings.singleOrgSettings.adminUser, x509Identity);

                const ccpPath = path.join(Settings.dockerDir, '..', '..', 'sampleconfig', 'ccp', Settings.singleOrgSettings.ccpFileName);
                const fileExists = fs.existsSync(ccpPath);
                if (!fileExists) {
                    logger.log(LogType.warning, "CCP profile not found. Skipping Event listener setup. Events won't be streamed to the output.");
                    return;
                }
                const contents = fs.readFileSync(ccpPath, 'utf8');
                const ccp = JSON.parse(contents);
                
                const gateway = new Gateway();
                await gateway.connect(ccp, {
                    wallet,
                    identity: Settings.singleOrgSettings.adminUser,
                    discovery: { enabled: false, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
                });
                const network = await gateway.getNetwork(Settings.defaultChannel);
                contract = network.getContract(Settings.defaultChaincodeId);
                HlfProvider.contracts.set(Settings.defaultChaincodeId, contract);
            } else {
                contract = HlfProvider.contracts.get(Settings.defaultChaincodeId);
            }
        
            //Cleanup any existing listener
            contract.removeContractListener(HlfProvider.listener);
            //Add a new event listener
            const checkpointer = await DefaultCheckpointers.file(path.join(Settings.dockerDir, '..', '..', 'local', 'checkpointer'));
			await contract.addContractListener(HlfProvider.listener, {checkpointer: checkpointer});

        } catch(error){
            logger.log(LogType.warning, `Skipping Event listener setup. Events won't be streamed to the output. ${error}`);
        }
    }

    public static async openCouchDb(): Promise<void>{
        vscode.window.showInformationMessage("Credentials for login to CouchDB.\nUsername: admin\nPassword: adminpw",
        {modal: true, detail:`Navigate to the database 'default_${Settings.defaultChaincodeId}' to view the documents.`})
        .then(() => {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(Settings.singleOrgSettings.couchDbUrl));
        });
    }
}