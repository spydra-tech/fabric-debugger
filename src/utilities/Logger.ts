import { OutputChannel, window } from 'vscode';
import * as constants from './Constants';

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

    //Show popup message
    public showMessage(type: constants.LogType, message: string){
        this.log(type, message);
        this.showMessageOnly(type, message);
    }

    public showMessageOnly(type: constants.LogType, message: string){
        switch(type){
			case constants.LogType.error: {
				window.showErrorMessage(message);
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