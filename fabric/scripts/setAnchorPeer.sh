#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# import utils
. ../scripts/configUpdate.sh

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "$2"
  fi
}

# NOTE: this must be run in a CLI container since it requires jq and configtxlator 
createAnchorPeerUpdate() {    
  echo "Fetching channel config for channel $CHANNEL_NAME"
  fetchChannelConfig $ORG $CHANNEL_NAME ../local/${CORE_PEER_LOCALMSPID}config.json

  echo "Generating anchor peer update transaction for Org${ORG} on channel $CHANNEL_NAME"

  if [ $ORG -eq 1 ]; then
    HOST="peer0.org1.debugger.com"
    PORT=5051
  else
    errorln "Org${ORG} unknown"
  fi

  # Modify the configuration to append the anchor peer 
  jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' ../local/${CORE_PEER_LOCALMSPID}config.json > ../local/${CORE_PEER_LOCALMSPID}modified_config.json

  # Compute a config update, based on the differences between 
  # {orgmsp}config.json and {orgmsp}modified_config.json, write
  # it as a transaction to {orgmsp}anchors.tx
  createConfigUpdate ${CHANNEL_NAME} ../local/${CORE_PEER_LOCALMSPID}config.json ../local/${CORE_PEER_LOCALMSPID}modified_config.json ../local/${CORE_PEER_LOCALMSPID}anchors.tx
}

updateAnchorPeer() {
  peer channel update -o orderer.debugger.com:5050 -c $CHANNEL_NAME -f ../local/${CORE_PEER_LOCALMSPID}anchors.tx >&../local/log.txt
  res=$?
  cat ../local/log.txt
  verifyResult $res "Anchor peer update failed"
  echo "Anchor peer set for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME'"
}

ORG=$1
CHANNEL_NAME=$2
CORE_PEER_LOCALMSPID=Org$1MSP

createAnchorPeerUpdate 

updateAnchorPeer 
