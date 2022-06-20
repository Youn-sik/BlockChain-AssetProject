const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')

let bodyParser = require('body-parser')

const {request} = require('http')
const {response} = require('express')

// BN과 CA에 접속하기 위한 모듈
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const { json } = require('body-parser')

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// 서버 using
const PORT = 3000
const HOST = '0.0.0.0'

app.use(express.static(path.join(__dirname, 'views')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


app.get('/', (req, res)=> {
    res.sendFile(__dirname+ '/views/index.html')
})

app.get('/asset', (req, res)=> {
    res.sendFile(__dirname+ '/views/index.html')
})

app.get('/transfer', (req, res)=> {
    res.sendFile(__dirname+ '/views/transfer.html')
})

app.post('/user', async(req, res)=> {
    const mode = req.body.mode
    console.log('/user-post-'+ mode)

    if(mode == "admin"){
        try {
            const id = req.body.id
            const pw = req.body.pw
        
            console.log('/user-post-'+ id)
            console.log('/user-post-'+ pw)

            // Create a new CA client for interacting with the CA.
            const caURL = ccp.certificateAuthorities['ca.example.com'].url;
            const ca = new FabricCAServices(caURL);
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the admin user.
            const adminExists = await wallet.exists('admin');
            if (adminExists) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                const obj = JSON.parse(`{"ERR_MSG":"An identity fot thr admin user admin already in the wallet"}`)
                res.status(400).json(obj)
                return
            }
    
            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = await ca.enroll({ enrollmentID: id, enrollmentSecret: pw });
            const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
            wallet.import('admin', identity);
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
            const obj = JSON.parse(`{"PAYLOAD":"Successfully enrolled admin user admin and imported it into the wallet"}`)
            res.status(200).json(obj)
        } catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
            // client (web browser) 에게 오류 전달
            const obj = JSON.parse(`{"ERR_MSG":"Failed to enroll admin user admin: ${error}"}`)
            res.status(400).json(obj)
        }
    } else if(mode == "user"){
        try {
            const id = req.body.id
            const role = req.body.role
        
            console.log('/user-post-'+ id)
            console.log('/user-post-'+ role)

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(id);
            if (userExists) {
                console.log('An identity for the user already exists in the wallet');
                const obj = JSON.parse(`{"ERR_MSG":"An identity fot the user already exists in the wallet"}`)
                res.status(400).json(obj)
                return;
            }

            // Check to see if we've already enrolled the admin user.
            const adminExists = await wallet.exists('admin');
            if (!adminExists) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                console.log('Run the enrollAdmin.js application before retrying');
                const obj = JSON.parse(`{"ERR_MSG":An identity for the admin user admin does not exist in the wallet}`)
                res.status(400).json(obj)
                return;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

            // Get the CA client object from the gateway for interacting with the CA.
            const ca = gateway.getClient().getCertificateAuthority();
            const adminIdentity = gateway.getCurrentIdentity();
            
            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: id, role: role }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: id, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
            wallet.import(id, userIdentity);
            console.log('Successfully registered and enrolled admin user and imported it into the wallet');
            const obj = JSON.parse(`{"PAYLOAD":"Successfully registered and enrolled admin user and imported it into the wallet"}`)
            res.status(200).json(obj)

        } catch(error) {
            console.error(`Failed to enroll register user : ${error}`);
            // client (web browser) 에게 오류 전달
            const obj = JSON.parse(`{"ERR_MSG":"Failed to enroll admin user admin: ${error}"}`)
            res.status(400).json(obj)
        }
    }
})

app.post('/asset', async(req, res)=> {

    const id = req.body.id
    const key = req.body.key
    const value = req.body.value
    console.log("id, key, value:",id, key, value)

    // BN에 접속하여 simpleasset 체인코드 중 set 기능 호출

    // 0. wallet에 있는 사용자 인증서 가져오기
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(id);
    if (userExists) {
        console.log('An identity for the user already exists in the wallet');
        console.log('Run the registerUser.js application before retrying');

        const obj = JSON.parse(`{"ERR_MSG":"An identity fot the user already exists in the wallet"}`)
        res.status(400).json(obj)
        return;
    }

    // 1. gateway 접속
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: id, discovery: { enabled: false } });

    // 2. 채널 (mychannel) 접속
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // 3. chaincode 가져오기 (simpleasset)
    // Get the contract from the network.
    const contract = network.getContract('simpleasset');

    // 4. chaincode 호출하기 (set ( key, value ))
    // Submit the specified transaction.
    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
    // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
    //await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
    await contract.submitTransaction('set', key, value);
    console.log('Transaction has been submitted');

    // 5. gateway 연결 해재
    // Disconnect from the gateway.
    await gateway.disconnect();

    // return
    const resultPath = path.join(process.cwd(), './views/result.html')
    resultHTML = resultPath.replace("<div></div>", "<div><p>Transaction has been submmited</p></div>")
    response.status(200).send(resultHTML)
})

app.listen(PORT, HOST)
console.log(`Backend Server is Listening on http://${HOST}:${PORT}`)