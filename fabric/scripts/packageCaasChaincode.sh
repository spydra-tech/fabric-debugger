#!/bin/bash
if peer lifecycle chaincode querycommitted -C default | grep -q "Name: $1,"; then
    cd ../local/caas
    PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid "$1.tar.gz")
    echo $PACKAGE_ID
else
{
rm -rf ../local/caas 2> /dev/null
mkdir -p ../local/caas

cat > "../local/caas/connection.json" <<CONN_EOF
{
  "address": "host.docker.internal:5999",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

cat << METADATA-EOF > "../local/caas/metadata.json"
{
    "type": "ccaas",
    "label": "$1"
}
METADATA-EOF

cd ../local/caas
tar cfz code.tar.gz connection.json
tar cfz "$1.tar.gz" metadata.json code.tar.gz

} &> /dev/null
PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid "$1.tar.gz")
echo $PACKAGE_ID

fi