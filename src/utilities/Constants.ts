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

  static readonly debugEnv = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "CORE_CHAINCODE_ID_NAME" : "asset:v1", "CORE_CHAINCODE_LOGLEVEL" : "debug", "CORE_PEER_TLS_ENABLED" : "false"
  };

  //Currently peer address is hardcoded to the below and will always be launched here.
  static readonly peerAddress: string = "localhost:5052";

  static defaultChaincodeId: string = "asset";
  static readonly defaultChaincodeVersion: string = "v1";
  static dockerDir: string = "";
}

export class DockerComposeFiles {
  static readonly localCa: string = "compose-local-ca.yaml";
  static readonly localNetwork: string = "compose-local.yaml";
}