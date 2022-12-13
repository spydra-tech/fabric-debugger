import { LogType } from "./Constants";
import { Logger } from "./Logger";
import { ShellCommand } from "./ShellCommand";

export class Prerequisites {
    public static async checkDocker(): Promise<boolean>{
        try{
            //Check by running docker info which will return a version if docker is installed and running.
            const result = await ShellCommand.runexec("docker", ["info"]);
            if(result.toLowerCase().indexOf("version:") > -1){
                return true;
            }
            else{
                return false; 
            }
        }   
        catch(error){
            Logger.instance().log(LogType.error, error.stdout);
            return false;
        }
    }

    public static async checkDockerCompose(): Promise<boolean>{
        //Simply checking if docker-compose is installed
        const result = await ShellCommand.runexec("docker-compose", ["-v"]);
        if(result.toLowerCase().indexOf("version ") > -1){
            return true;
        }
        else{
            return false;
        }
    }
}