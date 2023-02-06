import { env, Uri } from "vscode";
import { TelemetryLogger } from "./TelemetryLogger";


export class Commands {

    public static async openLink(link: Uri){
        env.openExternal(link);

        TelemetryLogger.instance().sendTelemetryEvent('OpenExternalLink', {'link': link.toString()});
    }

}