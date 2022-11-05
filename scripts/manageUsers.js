// etherjs setup: abi contract, provider
let provider = new ethers.providers.Web3Provider(window.ethereum);
let diamondAddress = "0xB070F8536ce64EbCa7525cde737128A1FCcCE3f2";

import FirstAvalancheValidatorFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorFacet.sol/FirstAvalancheValidatorFacet.json" assert {type: 'application/json'};;
import FirstAvalancheValidatorSettersAndGettersFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorSettersAndGettersFacet.sol/FirstAvalancheValidatorSettersAndGettersFacet.json" assert {type: 'application/json'};
let _FirstAvalancheValidatorFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorFacet.abi, provider);
let _FirstAvalancheValidatorSettersAndGettersFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorSettersAndGettersFacet.abi, provider);

let signer;
let signer_FirstAvalancheValidatorFacet;

// connect to metamask - does a change of account refresh the address for the contract instance? probably yes
const metamaskButton = document.querySelector(".metamaskButton");
metamaskButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== 'undefined') {
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        let address = await signer.getAddress();

        signer_FirstAvalancheValidatorFacet = _FirstAvalancheValidatorFacet.connect(signer);

        await update(address, (await provider.getNetwork()).chainId);
    } else {
        alert("Install Metamask");
    }
});

// change color based on input
const addressInput = document.querySelector(".addressInput");
addressInput.addEventListener("change", async () => {
    await updateUserStatus();
});

// update on id
const _id = document.querySelector('.idInput');
_id.addEventListener("change", async () => {
    await updateUserStatus();
});

// Update status function
const emptyWhiteAvaxLogo = document.querySelector(".emptyWhiteAvaxLogo");
async function updateUserStatus() {
    let address = document.querySelector('.addressInput');
    let _id = document.querySelector('.idInput');
    let id = _id.value - 1;

    if (
        0 <= id &&
        id <= 4 &&
        address.value.length == 42 &&
        id != null &&
        signer != undefined
        ) {
        let health = (await _FirstAvalancheValidatorSettersAndGettersFacet.getOwnerHealth(address.value, id)).toString();
        let timestamp = (await provider.getBlock(await provider.getBlockNumber())).timestamp;
        if (timestamp - health >= 60*60*4 && health > 0) { // 31*24*60*60
            console.log("not healthy = go and manage")
            emptyWhiteAvaxLogo.style.filter = "invert(80%) sepia(15%) saturate(5577%) hue-rotate(77deg) brightness(106%) contrast(102%)";
        } else {
            console.log("not healthy = don't go and manage")
            emptyWhiteAvaxLogo.style.filter = "invert(57%) sepia(74%) saturate(5550%) hue-rotate(336deg) brightness(93%) contrast(79%)";
        }
    } else {
        console.log("undefined")
        emptyWhiteAvaxLogo.style.filter = "";
    }
}

// call the txn if there is the input
const manageButton = document.querySelector(".manageButton");
manageButton.addEventListener("click", async () => {
    let address = document.querySelector('.addressInput');
    let _id = document.querySelector('.idInput');
    let id = _id.value - 1;

    let health = (await _FirstAvalancheValidatorSettersAndGettersFacet.getOwnerHealth(address.value, id)).toString();
    let timestamp = (await provider.getBlock(await provider.getBlockNumber())).timestamp;

    if (timestamp - health > 60*60*4 && health > 0) { // 31*24*60*60
        let txnManageShares = await signer_FirstAvalancheValidatorFacet.manageUnactiveValidatorShares(address.value, id);
        await txnManageShares.wait(1);
    }
});

// update
const metamaskIcon = document.querySelector(".metamaskIcon");
async function update(_address, _networkId) {
    if (_address != undefined) {
        metamaskButton.innerHTML = _address;
        metamaskIcon.style.opacity = "0";
    } else {
        metamaskButton.innerHTML = "Disconnected";
    }
    if (
        // (_networkId != "0xa86a" || _networkId != 43114 ) && _networkId != undefined
        (_networkId != "0xa869" || _networkId != 43113 ) && _networkId != undefined // testnet
    ) {
        // window.ethereum.request({
        //     method: "wallet_addEthereumChain",
        //     params: [{
        //         chainId: "0xa86a",
        //         rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        //         chainName: "Avalanche C-Chain",
        //         nativeCurrency: {
        //             name: "AVAX",
        //             symbol: "AVAX",
        //             decimals: 18
        //         },
        //         blockExplorerUrls: ["https://snowtrace.io/"]
        //     }]
        // });
        window.ethereum.request({ // testnet
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xa869",
                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                chainName: "Avalanche Fuji Testnet",
                nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18
                },
                blockExplorerUrls: ["https://testnet.snowtrace.io/"]
            }]
        });
    }
}

// check chain changes
window.ethereum.on('chainChanged', async function (networkId) {
    if (signer != undefined) {
        let address = await signer.getAddress();
        await update(address, networkId);
    };
});

// check account changes
window.ethereum.on('accountsChanged', async function (accounts) {
    if (signer != undefined) {
        await update(accounts[0], undefined);
    };
});