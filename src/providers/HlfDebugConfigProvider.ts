import path = require('path');
import * as vscode from 'vscode';
import {DebuggerType, ChaincodeLang, Settings, LogType} from '../utilities/Constants';
import { HlfProvider } from './HlfProvider';

export class HlfDebugConfigProvider implements vscode.DebugConfigurationProvider {

    public async resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, debugConfiguration: vscode.DebugConfiguration): Promise<vscode.DebugConfiguration> {
		
		if(!HlfProvider.islocalNetworkStarted || Settings.isCaas !== debugConfiguration.isCaas){
			//Launch Fabric network if its not up yet.
			Settings.isCaas = debugConfiguration.isCaas;
			HlfProvider.islocalNetworkStarted = await HlfProvider.createNetwork();
			//If we failed to start the network, then return undefined to cancel the debugging session
			if(!HlfProvider.islocalNetworkStarted){
				return undefined;
			}
		}

		if (!debugConfiguration.args) {
            debugConfiguration.args = [];
        }

		//Depending on the language used to develop the chaincode, choose the approriate debugger.
		switch(debugConfiguration.type){
			case DebuggerType.hlfGo: {
				debugConfiguration.type=ChaincodeLang.hlfGo;
				if (!debugConfiguration.program) {
					debugConfiguration.program = '${fileDirname}';
				}
				break;
			}
			case DebuggerType.hlfNode: {
				debugConfiguration.type=ChaincodeLang.hlfNode;
				if(process.platform === "win32"){
					debugConfiguration.program = path.join(folder.uri.fsPath, 'node_modules', 'fabric-shim', 'cli');
				}
				else{
					debugConfiguration.program = path.join(folder.uri.fsPath, 'node_modules', '.bin', 'fabric-chaincode-node');
				}

				if(debugConfiguration.isCaas){
					debugConfiguration.args.push('server');
				}
				else{
					debugConfiguration.args.push('start');
				}
				break;
			}
		}
		//Add other default values
		if (!debugConfiguration.request) {
            debugConfiguration.request = 'launch';
        }

        if (!debugConfiguration.mode) {
            debugConfiguration.mode = 'auto';
        }


		if(debugConfiguration.isCaas){
			//Add environment variables for Fabric CaaS model
			debugConfiguration.env = { ...debugConfiguration.env, ...Settings.debugCaasEnv };
		}
		else{
			//Add environment variables for Fabric 'dev' mode
			debugConfiguration.env = { ...debugConfiguration.env, ...Settings.debugEnv };
		}

		if(!debugConfiguration.isCaas){
			//Add peer address to the arguments
			debugConfiguration.args.push('--peer.address', Settings.peerAddress);
		}

		//Simply changing the Debugger type will result in an error as the debugger type has already been determined by this time
		//We need to cancel the existing debugging session and start a new one with the modified configuration.
		delete debugConfiguration.name;
		vscode.debug.startDebugging(folder, debugConfiguration);
		return undefined;
	}
}