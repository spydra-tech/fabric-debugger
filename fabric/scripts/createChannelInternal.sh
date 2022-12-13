#!/bin/bash

if peer channel list | grep -q 'default'; then
    echo "Channel 'default' already exists. Skipping channel creation"
else
    echo "Creating 'default' channel"
    configtxgen -channelID default -outputCreateChannelTx /etc/hyperledger/fabric/local/default.tx -profile SampleSingleMSPChannel -configPath $FABRIC_CFG_PATH
    peer channel create -o orderer.debugger.com:5050 -c default -f /etc/hyperledger/fabric/local/default.tx
    peer channel join -b default.block
fi