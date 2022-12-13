#!/bin/bash

if peer lifecycle chaincode querycommitted -C default | grep -q "Name: $1,"; then
    echo "Chaincode '$1' already commited to channel. Skipping chaincode deployment"
else
    echo "Deploying chaincode '$1' to channel 'default'"
    peer lifecycle chaincode approveformyorg -o orderer.debugger.com:5050 --channelID default --name $1 --version $2 --sequence 1 --signature-policy "OR ('Org1MSP.member')" --package-id $1:$2
    peer lifecycle chaincode checkcommitreadiness -o orderer.debugger.com:5050 --channelID default --name $1 --version $2 --sequence 1 --signature-policy "OR ('Org1MSP.member')"
    peer lifecycle chaincode commit -o orderer.debugger.com:5050 --channelID default --name $1 --version $2 --sequence 1 --signature-policy "OR ('Org1MSP.member')"
fi