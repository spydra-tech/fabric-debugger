[![Maintained by Spydra.app](https://img.shields.io/badge/maintained%20by-spydra.app-blueviolet)](https://www.spydra.app/?utm_source=vs_marketplace&utm_medium=fabric_debugger_page)
[![Installs-count](https://vsmarketplacebadges.dev/installs-short/Spydra.hyperledger-fabric-debugger.png)](https://marketplace.visualstudio.com/items?itemName=Spydra.hyperledger-fabric-debugger)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/spydra-tech/fabric-debugger/badge)](https://api.securityscorecards.dev/projects/github.com/spydra-tech/fabric-debugger)

# Hyperledger Fabric Debugger for Visual Studio Code

[Hyperledger Fabric Debugger Plugin](https://marketplace.visualstudio.com/items?itemName=Spydra.hyperledger-fabric-debugger) by [Spydra](https://www.spydra.app/?utm_source=vs_marketplace&utm_medium=fabric_debugger_page) is an Open Source Extension for Visual Studio Code that makes it easy for developers to build and debug [Hyperledger Fabric](https://www.hyperledger.org/use/fabric) Chaincode right from within the IDE. Typically, developing Chaincode for Fabric requires developers to set up a Fabric environment, deploy the developed Chaincode to it and then debug it by printing log messages to the console. In addition, installing a new version of Chaincode in a Fabric network is not as simple as uploading the new code. Developers have to execute the chaincode lifecycle commands for every modification to upgrade the Chaincode. This makes it very difficult to develop code in an iterative manner.

By using the Hyperledger Fabric Debug Plugin, a developer does not need to set up a Hyperledger Fabric network to deploy and test Chaincode. The plugin will automatically set up a local Fabric v2.5 environment and manage the process of installing the Chaincode.

## Quick Start

1. Install the pre-requisites:
    - Docker engine version 20.10.14 or higher and Docker compose version 2.3.4 or higher
    - Visual Studio Code version 1.80.0 or higher
    - For debugging Chaincode written in Go, install the [Go for Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=golang.go) and perform the [Debug Go programs in VS Code](https://github.com/golang/vscode-go/wiki/debugging) setup steps.

2. Open the Chaincode project in VS Code. For e.g. open the [asset-transfer-ledger-queries](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-ledger-queries/chaincode-go) Go sample project.
If you are debugging node.js chaincode, run [npm install](https://docs.npmjs.com/cli/v6/commands/npm-install) first.

3. Create a launch configuration by creating a file .vscode/launch.json. In the file, add the below configuration.
    ```json
    {
        "configurations": [  
            {
                "name": "Debug Chaincode",
                "type": "hlf-go",
                "request": "launch",
                "isCaas": false
            }
        ]
    }
    ```
    *If you are trying to debug a Chaincode developed for the Fabric External Chaincode as a Service model, please set **isCaas: true**.

    The same configuration can also be added by clicking on the **Add Configuration** button and selecting *"Go: Debug Fabric Chaincode"* option.

    ![Launch Configuration](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/launch-add-config.png)

    If you are debugging node.js code instead (JavaScript/TypeScript), use type="hlf-node" if manually creating the .vscode/launch.json file or choose the option *"Node.js: Debug Fabric Chaincode"* if using the **Add Configuration** button.

4. Set Breakpoints in the code that you want to debug. For e.g. set breakpoint inside the [ReadAsset](https://github.com/hyperledger/fabric-samples/blob/main/asset-transfer-ledger-queries/chaincode-go/asset_transfer_ledger_chaincode.go#L159) method of the [asset-transfer-ledger-queries](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-ledger-queries/chaincode-go) sample.

5. Methods in Chaincode can be invoked directly from VS Code. Create a file with a .fabric extension anywhere in the project. For e.g. create file called test.fabric at the root of the project folder. Add the below json to the file.

    ```json
    [      
        { 
            "query": "ReadAsset",
            "args": ["asset1"]   
        },
        {
            "invoke": "CreateAsset",
            "args": ["asset1","blue","71","Tom","220"]
        }
    ]
    ```
    You can query or invoke any Chaincode method by specifying the method name and the corresponding parameters as a JSON array. Try adding any of the Invoke and Query samples mentioned at the top of the [asset_transfer_ledger_chaincode.go](https://github.com/hyperledger/fabric-samples/blob/main/asset-transfer-ledger-queries/chaincode-go/asset_transfer_ledger_chaincode.go) file. You can add multiple methods in the same file or even create multiple .fabric files as needed.

6. Press F5 to start debugging or select the Run and Debug button from the [Run view](https://code.visualstudio.com/docs/editor/debugging#_run-view).

7. Go to the .fabric file that was created earlier and click on the "**Send Request**" link showing up above each of the Chaincode method. For e.g. clicking on the link above the ReadAsset method will hit the breakpoint set earlier in step 4.

    ![Send Request](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/send-request.png)

## Features
### Debugging
Debugging chaincodes written in Go and Node.js (Javascript/TypeScript is supported). A custom launch configuration .vscode/launch.json file is needed with the following values:

- **name** (mandatory): Provide a name of your choice for user configuration.
- **type** (mandatory): Use "hlf-go" for Go Chaincode and "hlf-node" for Node.js Chaincode.
- **request** (mandtory): Use value as "launch".
- **isCaas** (optional): true if the Chaincode is developed using the [External Chaincode as a Service model](https://hyperledger-fabric.readthedocs.io/en/latest/cc_service.html), otherwise false. Default value is false. Please note that the chaincode should get the value of chaincode Id from the environment variable "CHAINCODE_ID" and the chaincode server address from the environment variable "CHAINCODE_SERVER_ADDRESS".
- **chaincodeName** (optional): The name of the chaincode to be used while installing and commiting it to the fabric channel. If this value is not provided, then the current root folder name of the chaincode will be used.

You can use the Add Configuration button on the launch.json page and choose either "Go: Debug Fabric Chaincode" or "Node.js: Debug Fabric Chaincode" options to add the required launch configuration.

Additional configuration options that are supported natively by the Go and Node.js language debuggers can also be added if needed.

For a list of additional options supported by Go Debugger, please refer to [Go launchjson-attributes](https://github.com/golang/vscode-go/wiki/debugging#launchjson-attributes).

For a list of additional options supported by Node.js Debugger, please refer to [Node.js launchjson-attributes](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_launch-configuration-attributes).

Start debugging as you would normally do by pressing F5 or select the Run and Debug button from the [Run view](https://code.visualstudio.com/docs/editor/debugging#_run-view). Typical debug functionalities provided by the Go and Node.js debugger for VS Code like setting a breakpoint, stepping in/stepping over, viewing variables, stack trace etc. are all supported.

![Debug Window](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/debug-window.png)

### Manage Local Fabric Network
The Hyperledger Fabric Debugger automatically creates a local Fabric v2.5 network with a single organization, one orderer, one peer with CouchDB and one ca node. The network is created in Docker as containers. When you exit VS Code, the nodes that belong to this network are automatically stopped, but the containers are not removed. Due to this, any Ledger data is persisted across VS Code or even Docker/machine restarts.

The extension provides various ways to manage the local Fabric network. For e.g if you want to remove the Docker containers or simply reset the network to remove any Ledger data. Navigate to the Hyperledger Debugger Explorer by clicking the logo on the left pane. The following actions can be performed on the local network.

- Remove Network: Removes the local Fabric network containers. Any ledger data that is stored during debugging/testing is also removed. This is helpful if you want to start with a fresh network. The next time, Debugging (F5) is started, a new network will automatically be deployed.
- Stop Network: Manually stop the Docker containers. On exit of VS Code, containers will be automatically stopped anyway.
- Start Network: Start the Docker containers if they are in a stopped state.
- Restart Network: Stop and start the Docker containers. This might be useful if you see any errors during debugging related to stopped/failed containers.

![Manage Fabric Network](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/manage-network.png)

### Manage Wallet Identities
By default, the extension, creates two users - one user 'Org1Admin' with an Admin NodeOU role and one user 'User1' with a Client NodeOU role for testing. Navigate to the Hyperledger Debugger Explorer to create additional identities that can be used for testing.

![Manage Identities](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/manage-wallets.png)

For creating additional identities, click the + icon against the organization that you want the identity to be created for and provide a username. These identities can subsequently be used while submitting transactions.

For remove an identity, click the X icon against the corresponding identity.

### Submit Transactions to Chaincode
Once the breakpoints are set up and the Debugger is launched, in order for the code to execute and hit the breakpoint, the corresponding Chaincode method has to be invoked with the right arguments. This is similar to debugging an API wherein a request to the API has to be made. The Hyperledger Fabric extension supports invoking Chaincode methods directly from VS Code.

Create a .fabric file anywhere in the project. The .fabric file is a JSON file in which you can add the details of one or more Chaincode methods that you want to invoke as well as arguments to be supplied and identity to be used. You can define multiple requests in one file as well as you can create multiple files as needed. e.g
```json
    [      
        { 
            "query": "ReadAsset",
            "identity": "user1",
            "args": ["asset1"]   
        },
        {
            "query": "CreateAsset",
            "args": ["asset1","blue","71","Tom","220"]
        }
    ]
```

The various keys supported for each request object are:
- query/invoke (mandatory): The first key specifies whether the request is a query or invoking a transaction in Fabric. The value is the method name in the Chaincode. The key (query/invoke) is **not** case sensitive, but the value (method name) **is** case sensitive.
- identity (optional): This key can be used to specify an identity that was created earlier in the Wallet to by used while submitting the request. If this field is omitted, the default value of 'Org1Admin' is used.
- args: The array of arguments to be submitted to the Chaincode method. Fabric expects all arguments to be a string. The extension however, allows the arguments to be any valid JSON type - including a JSON object! All the below formats are valid arguments.
1. Arguments as a string array
    ```json
    ["asset1","blue","5","tom","35"]
    ```
2. Arguments as an array of primitive types
    ```json
    ["asset1","blue",5,"tom",35]
    ```
3.  Argument with rich CouchDB query with quotes escaped. This is typically how you would send an argument containing a JSON object to Fabric
    ```json
    ["{\"selector\":{\"owner\":\"tom\"}}"]
    ```
4.  The same rich CouchDB query as above, submitted as a JSON object for better readability. The extension will convert it to a JSON string as needed before submitting to Fabric 
    ```json
    [
        {
            "selector":{
                "owner":"tom"
            }
        }
    ]
    ```
Click on "Send Request" link that appears at the top of each of the method. The response will be displayed in a separate window that appears.

### Stream Chaincode events
Hyperledger Fabric Chaincode can raise chaincode level [events](https://ibm.github.io/hlf-internals/shim-architecture/interaction-flow/chaincode-events/) during execution. The debugger automatically captures these events and displays them in the output console. To view the chaincode events:
1. Go to View->Output and ensure that "Hlf Debugger" is selected in the dropdown in the output panel.
2. Invoke any chaincode transaction. The events emitted by the chaincode should show up in the output console. For e.g. the below event will be logged in the output console when debugging the [asset-transfer-events](https://github.com/hyperledger/fabric-samples/blob/main/asset-transfer-events/README.md) sample and submitting a "CreateAsset" transaction.

![Event listeners](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/event-listeners.png)

### Connect to CouchDB
The Hyperledger Fabric local network which is deployed by the debugger uses CouchDB as the state database. You can connect to CouchDB to view the documents that are stored by the chaincode. To connect to CouchDB:
1. Navigate to the Hyperledger Debugger Explorer by clicking the logo on the left pane.
2. In the Networks at the top, expand Local Fabric Network->Organizations->Org1->peer.
3. Hover over "peer0.org1.debugger.com" and click the database symbol.
![Connect to CouchDB](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/connect-couchdb.png)
4. A message will be displayed showing the credentials that can be used to connect. Note this down and then click OK.
5. Enter the credentials in the browser window that opens.

### Connect to the Network from your own Application
The Hyperledger Fabric debugger provides an easy way to submit "query" or "invoke" transactions to the locally deployed network as mentioned above. This enables you to easily test and debug the chaincode that you are creating. You can also use this local network from any application that you are developing using the Fabric SDK.

This is particularly useful when you want to debug the chaincode as well as a client application which will be connecting to the chaincode - for e.g. a web application connecting to the Blockchain layer and submitting transactions to chaincode. In this example, you can run and debug the web application in one Visual Studio Code window and run the Chaincode in another VS Code window and perform end to end debugging. In order to connect to the network from your own application, do the following.

Some of the settings that are required to connect to the local network are:
* Channel Name: default
* Chaincode Name: Look up the chaincode name by navigating to the Fabric Debugger logo on the left, in the "Networks" section at the top, look for the chaincode name under the peer name.

![Lookup Peer name](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/peer-name.png)

* MSP ID: Org1MSP

#### Using the Fabric Gateway Client API
The Fabric Gateway API is the newer SDK for Fabric versions 2.4 and 2.5 and is now the recommended way to develop Fabric applications. In order to connect to the chaincode running the Fabric debugger from this SDK, the chaincode has to be developed and run using the Chaincode as a Service model.
1. Run the Chaincode in debug mode as documented in the [Quickstart](#quick-start) above with the option isCaas set to true. For e.g. run the [asset-transfer-basic/chaincode-external](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-basic/chaincode-external) sample.
2. Open the application that you want to connect to the chaincode in a different Visual Studio code window. For e.g. open the application [asset-transfer-basic/application-gateway-typescript](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-basic/application-gateway-typescript) from Fabric samples.
3. The Fabric Gateway Client API requires additional configuration settings in order to connect. For e.g. for the above application, use the below settings to make changes in the src/app.ts file:
    * Path to crypto materials: On Windows machine - %USERPROFILE%\.vscode\extensions\spydra.hyperledger-fabric-debugger-{version}\fabric\local\organizations\peerOrganizations\org1.debugger.com. On Linux and Mac, it will be - ~/.vscode/extensions/spydra.hyperledger-fabric-debugger-{version}/fabric/local/organizations/peerOrganizations/org1.debugger.com.
    * User key directory: users/Org1Admin/msp/keystore
    * User certificate path: users/Org1Admin/msp/signcerts/cert.pem
    * Gateway Peer endpoint: localhost:5051
    * Since the Fabric debugger network does not use TLS, Peer TLS certificate path and Peer SSL Hostname override are not required.
    * In addition, ensure that you create the GRPC connection without TLS. In node.js, something like the below will work:
    ```javascript
    const disableTlsCredentials = grpc.credentials.createInsecure();
    const client = new grpc.Client(peerEndpoint, disableTlsCredentials);
    ```

#### Using the older Fabric Network SDK
The Fabric Network SDK (which is not deprecated) can be used to connect to legacy as well as Chaincode as a Service mode chaincode running in the Fabric debugger. Follow the below steps in order to connect to the network from your own application.

1. Run the Chaincode in debug mode as documented in the [Quickstart](#quick-start) above. For e.g. run the [asset-transfer-basic/chaincode-javascript](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-basic/chaincode-javascript) sample.
2. Open the application that you want to connect to the chaincode in a different Visual Studio code window. For e.g. open the application [asset-transfer-basic/application-javascript](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-basic/application-javascript) from Fabric samples.
3. The Fabric Network SDK requires additional configuration settings in order to connect.
    * CCP path: A common connection profile is a file that describes the Fabric network. This file can be found on Windows machine at - %USERPROFILE%\.vscode\extensions\spydra.hyperledger-fabric-debugger-{version}\fabric\sampleconfig\ccp\org1.json. On Linux and Mac, it will be at - ~/.vscode/extensions/spydra.hyperledger-fabric-debugger-{version}/fabric/sampleconfig/ccp/org1.json.
    * While connecting to the gateway, set discovery enabled = false and asLocalhost - true. For e.g
    ```javascript
    await gateway.connect(ccp, {
				wallet,
				identity,
				discovery: { enabled: false, asLocalhost: true }
			});
    ```
4. In order to connect to the Cetificate Authority (CA), use the below information:
    * Endpoint: http://localhost:5054
    * CA Name: ca-org1
    * Admin username:admin, Admin password: adminpw
    * Since the endpoint is http, TLS certificate is not needed while connecting. For Node.js, code similar to the below will work.
    ```javascript
    const caClient = new FabricCAServices('http://localhost:5054', {  verify: false }, "ca-org1");
    ```

## Frequently Asked Questions
#### 1. Debugging fails for Go Chaincode with the following error "Failed to launch: could not launch process: not an executable file " or with the error "Build Error: go build -o /.vscode/__debug_bin -gcflags all=-N -l . no Go files in /.vscode (exit status 1)"

For the Go Debugger to work properly, you need to select the file which contains the *main()* function first and then start debugging. Alternatively, in the *.vscode/launch.json* file, add an additional field called "program" that points to the file that contains the main() function in the Chaincode. For e.g.
```json
{
    "configurations": [  
        {
            "name": "Debug Chaincode",
            "type": "hlf-go",
            "request": "launch",
            "program": "assetTransfer.go"
        }
    ]
}
```

#### 2. I've installed the extension, but when I debug a Go Chaincode, I get the error "Error starting chaincode: 'CORE_CHAINCODE_ID_NAME' must be set"

This typically happens when the launch.json file is not created with the right debug settings. The launch.json file specifies that the Hyperledger Fabric debugger extension has to be used instead of the regular Go Debugger. Create the launch settings file as mentioned [here](#quick-start).

#### 3. I've installed the extension, but when I debug a Node.js Chaincode, nothing happens. The debugger starts and stops immediately
This typically happens when the launch.json file is not created with the right debug settings. The launch.json file specifies that the Hyperledger Fabric debugger extension has to be used instead of the regular Node.js Debugger. Create the launch settings file as mentioned [here](#quick-start).

#### 4. I've installed the extension and started the local fabric network also. When I submit a transaction in the .fabric file, I get an error "Start the Network or Start Debugging(F5) before submitting a transaction to Fabric"

Even though the local fabric network is started, in order for you to submit a transaction defined in the .fabric file, the Chaincode has to be started in Debug mode. Press F5 or select the Run and Debug button from the [Run view](https://code.visualstudio.com/docs/editor/debugging#_run-view) to start debugging.

#### 5. When I start debugging the Chaincode, I get the error "error starting chaincode: ccid must be specified"

This usually means that the Chaincode that you are trying to debug is developed using the Fabric [External Chaincode as a Service](https://hyperledger-fabric.readthedocs.io/en/latest/cc_service.html) model. Stop debugging, set the property "isCaas":true in the .vscode/launch.json file and start debugging again.

#### 6. When I start debugging the Chaincode, I get a message "You don't have an extension for debugging 'JSON with Comments'"

This typically means that the launch.json file is not created. Create the launch settings file as mentioned [here](#quick-start), select the code file that contains the entry point for the Chaincode and start debugging again.

#### 6. When I start debugging the Chaincode, the network doesn't start and I get a lot of errors in the output console

If the network is not continuously starting, try resetting the network by going to the Hyperledger Fabric Debugger logo on the left, "Networks" section on the top, hover over "Local Fabric Network" and click the first icon for "Remove Network". Try debugging again which will create a fresh network from scratch.

![Remove Network](https://github.com/spydra-tech/fabric-debugger/raw/main/media/docs/remove-network.png)

