import { OutputChannel, window } from 'vscode';
import * as constants from './Constants';
import { TelemetryLogger } from './TelemetryLogger';

export class Logger {
    private readonly _outputChannel: OutputChannel;

    private static _instance: Logger = new Logger();

    public static instance(): Logger {
        return Logger._instance;
    }

    private constructor() {
        this._outputChannel = window.createOutputChannel('Hlf Debugger');
        this._outputChannel.show();
    }

    //Log message to output window
    public log(type: constants.LogType, message: string){
        this._outputChannel.appendLine(`[${(new Date().toLocaleTimeString())} - ${type}] ${message}`);
    }

    //Show popup message and log the error
    public showMessage(type: constants.LogType, message: string){
        this.log(type, message);
        this.showMessageOnly(type, message);
    }

    //Show popup message only
    public showMessageOnly(type: constants.LogType, message: string){
        switch(type){
			case constants.LogType.error: {
				window.showErrorMessage(message);
                TelemetryLogger.instance().sendTelemetryEvent('Error', {message: message});
				break;
			}
			case constants.LogType.warning: {
				window.showWarningMessage(message);
				break;
			}
            default: {
                window.showInformationMessage(message);
				break;
            }
		}
    }
}