#!/bin/bash
set -x 

# 1. 설치
# docker exec cli peer chaincode install -n simpleasset -v 1.0 -p github.com/simpleasset/1.0
docker exec cli peer chaincode install -n simpleasset -v 1.1.1 -p github.com/simpleasset/1.1
# 2. 업그래이드
# docker exec cli peer chaincode instantiate -n simpleasset -v 1.0 -c '{"Args":["a","100"]}' -C mychannel -P 'AND ("Org1MSP.member")'
docker exec cli peer chaincode upgrade -n simpleasset -v 1.1.1 -c '{"Args":[]}' -C mychannel -P 'AND ("Org1MSP.member")'
sleep 3
# 3. invoke set
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["set","c","300"]}'
sleep 3
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["set","d","400"]}'
sleep 3

# invoke transfer
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["transfer","c","d","50"]}'
sleep 3

# query get
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","c"]}'
sleep 3
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","d"]}'
sleep 3

# query history
# docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["history","c"]}'
# sleep 3
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["history","d"]}'
sleep 3

# invoke del
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["del","d"]}'
sleep 3

# query history
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["history","d"]}'
sleep 3

# query get
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","d"]}'
sleep 3