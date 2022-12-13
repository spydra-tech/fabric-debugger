#!/bin/sh

cd /etc/hyperledger/fabric/local

export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org1.debugger.com/

{
fabric-ca-client register --caname ca-org1 --id.name $1 --id.secret rAnd0mPwd --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/org1/ca-cert.pem"
  { set +x; } 2>/dev/null

fabric-ca-client enroll -u https://$1:rAnd0mPwd@localhost:5054 --caname ca-org1 -M "${PWD}/organizations/peerOrganizations/org1.debugger.com/users/$1/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/org1/ca-cert.pem"
  { set +x; } 2>/dev/null

cp "${PWD}/organizations/peerOrganizations/org1.debugger.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/org1.debugger.com/users/$1/msp/config.yaml"

} &> /dev/null

echo "Created and enrolled identity for user: $1"