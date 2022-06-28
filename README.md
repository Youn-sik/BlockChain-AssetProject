# BlockChain-AssetProject

자세한 설계 및 기능은 https://fascinated-capricorn-a40.notion.site/BlockChain-AssetProject-45a35d11785548e38115b14b747130ac 을 참고 해 주시기 바랍니다.


HyperLeader Fabric 1.4 버전을 활용하여 CA의 인증서 기반으로 자산을 담을 수 있는 지갑을 발급 받으며, 해당 지갑에 자산을 생성, 송금이 가능하며 블록 생성 내역(자산 생성 및 송금 등) 을 조회할 수 있습니다.

BN, CC, DAPP 을 각 모두 생성하였으며 BN은 Docker Container로 생성하며, CC는 GOlang으로 작성, DAPP 중 서버 사이드는 Nodejs, 클라이언트 사이드는 간단한 HTML 을 사용하였습니다.
