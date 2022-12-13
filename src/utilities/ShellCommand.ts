import * as ChildProcess from 'child_process';
import { Logger } from './Logger';
import * as constants from './Constants';
import path = require('path');

export class ShellCommand {

    private static pattern: string = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
	].join('|');

    private static isExecPermissionSet = false;

    public static async run(cmd: string, pwd: string, args: Array<string> | undefined, printLogs: boolean = true): Promise<string>{
        const logger: Logger = Logger.instance();
        const regEx = new RegExp(this.pattern, 'g');

        const options = {
            cwd: pwd,
            env: process.env
        };
        //Give execute permissions to the script folder.
        if(!this.isExecPermissionSet && process.platform !== "win32"){
            ChildProcess.execSync(`chmod u+x \`ls ${path.join(constants.Settings.dockerDir, '..', '..', 'scripts')}/*.sh\``);
            this.isExecPermissionSet = true;
        }

        //Submit the actual command.
        const childProcess: ChildProcess.ChildProcess = ChildProcess.spawn(cmd, args, options);
        
        let ouput: string="";
        childProcess.stdout.on("data", data => {
            let messages: Array<string> = data.toString().replace(regEx, "").split("\n");
            messages.forEach((message: string)=> {
                    if(message) {
                        if(printLogs){
                            logger.log(constants.LogType.info, message);
                        }
                        ouput = `${ouput}${message}\n`;
                    }
                }
            );
        });
        
        childProcess.stderr.on("data", data => {
            let messages: Array<string> = data.toString().replace(regEx, "").split("\n");
            messages.forEach((message: string)=> {
                    if(message) {
                        if(printLogs
                            && message.toLowerCase().indexOf("found orphan containers")===-1 /*suppress orphan container messages as we are using two docker-compose files*/
                            ){
                                logger.log(constants.LogType.info, message);
                        }
                        ouput = `${ouput}${message}\n`;
                    }
                }
            );
        });

        return new Promise<string>((resolve: any, reject: any) => {
            childProcess.on('error', (error: Error) => {
                logger.log(constants.LogType.error, error.message);
                ouput = `${ouput}${error.message}\n`;
                return reject(ouput);
            });
            childProcess.on('close', (code: number) => {
                if (code) {
                    //Check if the command exited because Docker was not running.
                    if(ouput.toLowerCase().indexOf("docker daemon is not running") > -1){
                        return reject(ouput);
                    }else{
                        return resolve(ouput);
                    }
                }
                else{
                    return resolve(ouput);
                }
            });
        });
    }

    public static async runexec(cmd: string, args: Array<string>): Promise<string>{

        cmd = `${cmd} ${args.join(" ")}`;
        return ChildProcess.execSync(cmd).toString();
    }

    public static async runDockerCompose(composeFileName: string, args: Array<string>, printLogs: boolean = true): Promise<string> {
        const cmd: string = "docker-compose";
        let dockerArgs: string[] = ["-p", "fabric-singleorg", "-f", composeFileName];

        return this.run(cmd, constants.Settings.dockerDir, [...dockerArgs, ...args], printLogs);
    }

    public static async execDockerComposeSh(composeFileName: string, container: string, cmd: string, args: string[] = [], printLogs: boolean = true): Promise<string> {
        let dockerArgs: string[] = ["exec", "-T", container, "sh", "-c", `${cmd} ${args.join(" ")}`];

        return this.runDockerCompose(composeFileName, dockerArgs, printLogs);
    }

    public static async execDockerComposeBash(composeFileName: string, container: string, cmd: string, args: string[] = [], printLogs: boolean = true): Promise<string> {
        let dockerArgs: string[] = ["exec", "-T", container, "/bin/bash", "-c", `${cmd} ${args.join(" ")}`];

        return this.runDockerCompose(composeFileName, dockerArgs, printLogs);
    }
}
