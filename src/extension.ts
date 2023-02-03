// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode
import * as vscode from 'vscode';
import { HlfCodeLensProvider } from './providers/HlfCodeLensProvider';
import { HlfProvider } from './providers/HlfProvider';
import { HlfRequestCommandProvider } from './providers/HlfRequestCommandProvider';
import { HlfDebugConfigProvider } from './providers/HlfDebugConfigProvider';
import { NetworkTreeProvider } from './providers/NetworkTreeProvider';
import { WalletTreeProvider } from './providers/WalletTreeProvider';
import { Settings } from './utilities/Constants';
import { Logger } from './utilities/Logger';
import { WalletIdentityProvider } from './providers/WalletIdentityProvider';
import { WalletItem } from './views/trees/WalletItem';
import { TelemetryLogger } from './utilities/TelemetryLogger';


// This method is called when the extension is activated
// The extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	var startTime = process.hrtime();
	const logger: Logger = Logger.instance();
	const telemetryLogger = TelemetryLogger.instance();

	Settings.dockerDir = context.asAbsolutePath(`fabric/docker/${Settings.singleOrgProj}`);
	HlfProvider.setChaincodeName();

	//Register the Debug configuration providers for Golang and Node
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('hlf-go', new HlfDebugConfigProvider()));
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('hlf-node', new HlfDebugConfigProvider()));

	//Register network related providers
	const networkTreeProvider: NetworkTreeProvider = new NetworkTreeProvider();
	context.subscriptions.push(vscode.commands.registerCommand('localnetwork.start', () => HlfProvider.createNetwork()));
	context.subscriptions.push(vscode.commands.registerCommand('localnetwork.stop', () => HlfProvider.stopNetwork()));
	context.subscriptions.push(vscode.commands.registerCommand('localnetwork.restart', () => HlfProvider.restartNetwork()));
	context.subscriptions.push(vscode.commands.registerCommand('localnetwork.remove', () => HlfProvider.removeNetwork()));
	context.subscriptions.push(vscode.commands.registerCommand('localnetwork.refresh', () => networkTreeProvider.refresh()));
	context.subscriptions.push(vscode.window.registerTreeDataProvider('hlfNetworks', networkTreeProvider));

	//Register the .fabric language related providers
	const fabricDocumentSelector = [
        { language: 'jsonc', scheme: '*', pattern: "**/*.fabric" }
    ];
	context.subscriptions.push(vscode.languages.registerCodeLensProvider(fabricDocumentSelector, new HlfCodeLensProvider()));
	context.subscriptions.push(vscode.commands.registerCommand('fabric.request', ((range: vscode.Range) => new HlfRequestCommandProvider().exec(range))));

	//Register wallet related providers
	const walletTreeProvider: WalletTreeProvider = new WalletTreeProvider();
	const walletIdentityProvider: WalletIdentityProvider = new WalletIdentityProvider();
	context.subscriptions.push(vscode.commands.registerCommand('identity.create', () => walletIdentityProvider.createIdentity()));
	context.subscriptions.push(vscode.commands.registerCommand('identity.remove', (element: WalletItem) => walletIdentityProvider.removeIdentity(element)));
	context.subscriptions.push(vscode.commands.registerCommand('identity.refresh', () => walletTreeProvider.refresh()));
	context.subscriptions.push(vscode.window.registerTreeDataProvider('hlfWallets', walletTreeProvider));

	const elapsedTime = telemetryLogger.parseHrtimeToMs(process.hrtime(startTime));
	telemetryLogger.sendTelemetryEvent('Activate', null, {'activationDuration': elapsedTime});
}

// This method is called when the extension is deactivated
export async function deactivate() {
	await TelemetryLogger.instance().sendTelemetryEvent('DeActivate');
	TelemetryLogger.instance().dispose();
	await HlfProvider.stopNetwork();
}
