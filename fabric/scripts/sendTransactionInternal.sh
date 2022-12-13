#!/bin/bash

if !([ -z "$5" ])
then
    export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/local/organizations/peerOrganizations/org1.debugger.com/users/$5/msp
fi
peer chaincode $1 -n $2 -C default -o orderer.debugger.com:5050 -c "{\"function\":\"$3\",\"Args\":[$4]}"