#!/bin/sh

cd /etc/hyperledger/fabric/local

rm -rf "${PWD}/organizations/peerOrganizations/org1.debugger.com/users/$1"