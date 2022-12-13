#!/bin/sh

cd /etc/hyperledger/fabric/local
if [ -f "organizations/peerOrganizations/org1.debugger.com/peers/peer0.org1.debugger.com/tls/server.crt" ];
then
    echo "Certificates already enrolled. Skipping certificate creation"
else
    echo "Enrolling certificates for Org1"
    . ../scripts/registerEnroll.sh

    while :
        do
        if [ ! -f "/etc/hyperledger/fabric-ca-server/tls-cert.pem" ]; then
            sleep 1
        else
            break
        fi
        done

    createOrg1 &> /dev/null
fi