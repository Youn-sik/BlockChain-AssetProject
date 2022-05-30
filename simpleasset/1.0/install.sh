#!/bin/bash
set -x

# 1. install chain code
docker exec cli peer chaincode install -n simpleasset -v 1.0 -p github.com/simpleasset/1.0

# 2. instantiate chain code
docker exec cli peer chaincode instantiate -n simpleasset -v 1.0 -c '{"Args":["a","100"]}' -C mychannel -P 'AND ("Org1MSP.member")'

sleep 5

docker exec cli peer chaincode list --instantiated -C mychannel

# 3. test chain code
# non creation block(get)
# creation block(set)

docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get", "a"]}' 
sleep 1

docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["set", "b", "250"]}'
sleep 3

docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get", "b"]}' 
