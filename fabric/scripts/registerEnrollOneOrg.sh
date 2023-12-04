#!/bin/sh

cd /etc/hyperledger/fabric/local
if [ -f "organizations/peerOrganizations/org1.debugger.com/peers/peer0.org1.debugger.com/tls/server.crt" ];
then
    echo "Certificates already enrolled. Skipping certificate creation"
else
    echo "Enrolling certificates for Org1"
    . ../scripts/registerEnroll.sh

    createOrg1 &> /dev/null 
fi