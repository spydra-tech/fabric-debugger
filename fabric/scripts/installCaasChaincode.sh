#!/bin/bash

if peer lifecycle chaincode querycommitted -C default | grep -q "Name: $1,"; then
    echo "Chaincode '$1' already commited to channel. Skipping chaincode installation on peer"
else
    echo "Installing chaincode '$1' on peer nodes"
    peer lifecycle chaincode install "../local/caas/$1.tar.gz"
fi