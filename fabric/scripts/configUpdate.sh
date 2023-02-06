#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# fetchChannelConfig <org> <channel_id> <output_json>
# Writes the current channel config for a given channel to a JSON file
# NOTE: this must be run in a CLI container since it requires configtxlator
fetchChannelConfig() {
  ORG=$1
  CHANNEL=$2
  OUTPUT=$3

  echo "Fetching the most recent configuration block for the channel"
 
  peer channel fetch config ../local/config_block.pb -o orderer.debugger.com:5050 -c $CHANNEL

  echo "Decoding config block to JSON and isolating config to ${OUTPUT}"

  configtxlator proto_decode --input ../local/config_block.pb --type common.Block --output ../local/config_block.json
  jq .data.data[0].payload.data.config ../local/config_block.json >"${OUTPUT}"
}

# createConfigUpdate <channel_id> <original_config.json> <modified_config.json> <output.pb>
# Takes an original and modified config, and produces the config update tx
# which transitions between the two
# NOTE: this must be run in a CLI container since it requires configtxlator
createConfigUpdate() {
  CHANNEL=$1
  ORIGINAL=$2
  MODIFIED=$3
  OUTPUT=$4

  configtxlator proto_encode --input "${ORIGINAL}" --type common.Config --output ../local/original_config.pb
  configtxlator proto_encode --input "${MODIFIED}" --type common.Config --output ../local/modified_config.pb
  configtxlator compute_update --channel_id "${CHANNEL}" --original ../local/original_config.pb --updated ../local/modified_config.pb --output ../local/config_update.pb
  configtxlator proto_decode --input ../local/config_update.pb --type common.ConfigUpdate --output ../local/config_update.json
  echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat ../local/config_update.json)'}}}' | jq . >../local/config_update_in_envelope.json
  configtxlator proto_encode --input ../local/config_update_in_envelope.json --type common.Envelope --output "${OUTPUT}"

}

# signConfigtxAsPeerOrg <org> <configtx.pb>
# Set the peerOrg admin of an org and sign the config update
signConfigtxAsPeerOrg() {
  ORG=$1
  CONFIGTXFILE=$2

  peer channel signconfigtx -f "${CONFIGTXFILE}"

}
