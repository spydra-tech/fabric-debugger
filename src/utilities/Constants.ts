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
  static readonly singleOrgProj: string = "fabric-singleorg";
  static readonly defaultChannel: string = "default";

  static singleOrgSettings = {
    caDomain: "ca.org1.debugger.com",
    domain: "org1.debugger.com",
    adminUser: "Org1Admin",
    name: "Org1",
    msp: "Org1MSP",
    ccpFileName: "org1.json",
    peerDomain: "peer0.org1.debugger.com",
    ordererDomain: "orderer.debugger.com",
    couchDbUrl: "http://localhost:5984/_utils"
  };

  static set defaultChaincodeId(chaincodeName: string){
    Settings._defaultChaincodeId = chaincodeName;
  }

  static get defaultChaincodeId(){
      return Settings._defaultChaincodeId;
  }

  static spdrLinkMessageShown: number = 0;
}

export enum DockerComposeFiles {
  localCa = "compose-local-ca.yaml",
  localNetwork = "compose-local.yaml"
}

export enum Links {
  documentation = 'https://github.com/spydra-tech/fabric-debugger/blob/main/README.md',
  contribute = 'https://github.com/spydra-tech/fabric-debugger',
  reportIssue = 'https://github.com/spydra-tech/fabric-debugger/issues',
  contactUs = 'https://www.spydra.app/schedule-a-demo?utm_source=vs_marketplace&utm_medium=fabric_debugger_plugin',
  review = 'https://marketplace.visualstudio.com/items?itemName=Spydra.hyperledger-fabric-debugger&ssr=false#review-details',
  spydra = 'https://www.spydra.app?utm_source=vs_marketplace&utm_medium=fabric_debugger_plugin',
  getStarted = 'https://console.spydra.app/?utm_source=vs_marketplace&utm_medium=fabric_debugger_plugin'
}