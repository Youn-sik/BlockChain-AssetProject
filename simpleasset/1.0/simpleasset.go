// 패키지 정의
package main

// 외부 패키지 임포트
import (
	"fmt"
	
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// 객체생성

// 체인코드 구조체 정의
type SimpleAsset struct {
}

// Init 함수
func (s *SimpleAsset) Init(stub shim.ChaincodeStubInterface) pb.Response {
	
	args := stub.GetStringArgs()
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	err := stub.PutState(args[0], []byte(args[1]))

	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to create asset : %s", args[0]))
	}

	return shim.Success([]byte("init sucess"))
}

// Invoke 함수
func (s *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	fn, args := stub.GetFunctionAndParameters()

	if fn  == "set" {
		return s.Set(stub, args)
	} else if fn == "get" {
		return s.Get(stub, args)
	} else {
		return shim.Error("Not supported function name")
	}

}

// 시나리오에 필요한 함수들~~~
// get : 잔액 조회 함수
func (s *SimpleAsset) Get(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting a key")
	}

	value, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error("Failed to get asset: " + args[0] + "with error: " + err.Error())
	}

	if value == nil {
		return shim.Error("Asset not found: " + args[0])
	}

	return shim.Success([]byte(value))
}

// set : 잔액 입력 함수
func (s *SimpleAsset) Set(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting a key and value")
	}

	err := stub.PutState(args[0], []byte(args[1]))

	if err != nil {
		return shim.Error("Failed to set asset: " + args[0])
	}

	return shim.Success([]byte("Success: asset created: " + args[0]))

}

// main 함수
func main(){
	err := shim.Start(new(SimpleAsset))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
