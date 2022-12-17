export enum DebuggerType {
    hlfGo = "hlf-go",
    hlfNode = "hlf-node"
};

export enum ChaincodeLang {
    hlfGo = "go",
    hlfNode = "node"
};

export enum LogType {
  info = "Info",
  warning = "Warning",
  error = "Error"
};

export class Settings {
  private static _defaultChaincodeId: string = "asset";
  static readonly debugEnv = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "CORE_CHAINCODE_ID_NAME" : "asset:v1", "CORE_CHAINCODE_LOGLEVEL" : "debug", "CORE_PEER_TLS_ENABLED" : "false"
  };

  static readonly debugCaasEnv = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "CHAINCODE_ID" : "asset:v1", "CHAINCODE_SERVER_ADDRESS" : "localhost:5999"
  };

  //Currently peer address is hardcoded to the below and will always be launched here.
  static readonly peerAddress: string = "localhost:5052";

  static defaultChaincodePackageId: string = "asset:v1";
  static readonly defaultChaincodeVersion: string = "v1";
  static dockerDir: string = "";
  static isCaas: boolean = false;

  static set defaultChaincodeId(chaincodeName: string){
    Settings._defaultChaincodeId = chaincodeName;
  }

  static get defaultChaincodeId(){
    if(Settings.isCaas){
      return `${Settings._defaultChaincodeId}-caas`;
    }
    else{
      return Settings._defaultChaincodeId;
    }
  }
}

export class DockerComposeFiles {
  static readonly localCa: string = "compose-local-ca.yaml";
  static readonly localNetwork: string = "compose-local.yaml";
}