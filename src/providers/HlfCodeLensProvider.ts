import * as vscode from 'vscode';
import { TelemetryLogger } from '../utilities/TelemetryLogger';

export class HlfCodeLensProvider implements vscode.CodeLensProvider {
    private lineSplit: RegExp = /\r?\n/g;

    //Get the code areas corresponding to the various request sections
    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        //var startTime = process.hrtime();
        //const telemetryLogger = TelemetryLogger.instance();

        const codeLenses: vscode.CodeLens[] = [];
        const lines: string[] = document.getText().split(this.lineSplit);

        let startline: number=0, startIndex=0, codeStartline: number=0, codeStartIndex: number=0;
        let lineIndex: number = 0;
        let lineMatches: number = 0; 
        let lastOpenBracketLine: number = 0, lastOpenBracketIndex: number = 0;
        let lastCloseBracketLine: number = 0, lastCloseBracketIndex: number = 0;
        for(let line of lines){
            const matchedIndex = line.search(/("invoke"|"query") *:/gi);

            if(matchedIndex === -1){
                if(line.lastIndexOf("{")>-1){
                    lastOpenBracketLine = lineIndex;
                    lastOpenBracketIndex = line.lastIndexOf("{");
                }
                if(line.lastIndexOf("}")>-1){
                    lastCloseBracketLine = lineIndex;
                    lastCloseBracketIndex = line.lastIndexOf("}");
                }
            }
            else{
                const preTransactionLine = line.substring(0, matchedIndex);
                if(preTransactionLine.lastIndexOf("{")>-1){
                    lastOpenBracketLine = lineIndex;
                    lastOpenBracketIndex = preTransactionLine.lastIndexOf("{");
                }
                if(preTransactionLine.lastIndexOf("}")>-1){
                    lastCloseBracketLine = lineIndex;
                    lastCloseBracketIndex = preTransactionLine.lastIndexOf("}");
                }
                if(lineMatches > 0){
                    const range = new vscode.Range(startline, startIndex, lineIndex-1, 0);
                    const codeRange = new vscode.Range(codeStartline, codeStartIndex, lastCloseBracketLine, lastCloseBracketIndex+1);
                    const cmd: vscode.Command = {
                        arguments: [codeRange],
                        title: 'Send Request',
                        command: 'fabric.request'
                    };
                    codeLenses.push(new vscode.CodeLens(range, cmd));
                }
                if(line.lastIndexOf("}")>-1){
                    lastCloseBracketLine = lineIndex;
                    lastCloseBracketIndex = line.lastIndexOf("}");
                }
                lineMatches++;
                startline=lineIndex;
                startIndex = matchedIndex;
                codeStartline = lastOpenBracketLine;
                codeStartIndex = lastOpenBracketIndex;
            }
            lineIndex++;
        }
        if(lineMatches>0){
            const range = new vscode.Range(startline, startIndex, lineIndex, 0);
            const codeRange = new vscode.Range(codeStartline, codeStartIndex, lastCloseBracketLine, lastCloseBracketIndex+1);
            const cmd: vscode.Command ={
                arguments: [codeRange],
                title: 'Send Request',
                command: 'fabric.request'
            };
            codeLenses.push(new vscode.CodeLens(range, cmd));
        }

        //const elapsedTime = telemetryLogger.parseHrtimeToMs(process.hrtime(startTime));
        //telemetryLogger.sendTelemetryEvent('CodeLens', null, {'codeLensDuration': elapsedTime});

        return codeLenses;
    }    
}