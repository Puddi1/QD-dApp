// JavaScript for toggling the sidebar menu
let toggleButton = document.getElementById("toggle-button");
let sidebar = document.getElementById('sidebar');
let centerBar = document.getElementById('center-bar');
let sidebarVisible = false;

toggleButton.addEventListener('click', () => {
    if (!sidebarVisible) {
        sidebar.classList.add('visible');
        centerBar.classList.add('visible');
        toggleButton.classList.add('visible');
        sidebarVisible = true;
    } else {
        sidebar.classList.remove('visible');
        centerBar.classList.remove('visible');
        toggleButton.classList.remove('visible');
        sidebarVisible = false;
    }
});

// Reduce the background opacity if bacdrop filter isn't present
if (!window.CSS.supports('backdrop-filter', 'blur(10px)')) {
    sidebar.style.backgroundImage = "linear-gradient(rgb(75, 0, 0, 0.9), rgba(50, 0, 0, 0.5))";
}

// etherjs setup: abi contract, provider
import { ethers } from 'ethers';
let provider = new ethers.providers.Web3Provider(window.ethereum);
let diamondAddress = import.meta.env.VITE_DIAMOND_ADDRESS;

import AvalancheValidatorFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorFacet.sol/AvalancheValidatorFacet.json";
import AvalancheValidatorSettersAndGettersFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorSettersAndGettersFacet.sol/AvalancheValidatorSettersAndGettersFacet.json";
let _AvalancheValidatorFacet = new ethers.Contract(diamondAddress, AvalancheValidatorFacet.abi, provider);
let _AvalancheValidatorSettersAndGettersFacet = new ethers.Contract(diamondAddress, AvalancheValidatorSettersAndGettersFacet.abi, provider);

let signer;
let signer_AvalancheValidatorFacet;

// connect to metamask - does a change of account refresh the address for the contract instance? probably yes
const metamaskButton = document.getElementById("button-metamask");
metamaskButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== 'undefined') {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        let address = await signer.getAddress();

        signer_AvalancheValidatorFacet = _AvalancheValidatorFacet.connect(signer);

        await update(address, (await provider.getNetwork()).chainId);
    } else {
        alert("Install Metamask");
    }
});

// change color based on input
const addressInput = document.getElementById("address-input");
addressInput.addEventListener("change", async () => {
    await updateUserStatus();
});

// update on id selection
let levels = document.getElementsByName("level");
console.log(levels)
for (let i = 0; i < levels.length; i++) {
    levels[i].addEventListener('click', async () => {
        await updateUserStatus();
    });
}
async function getCurrentRadioInput() {
    for (let i = 0; i < levels.length; i++) {
        if (levels[i].checked == true)
            return levels[i].value;
    }
}

// Update status function
const emptyWhiteAvaxLogo = document.getElementById("avalanche");
async function updateUserStatus() {
    let address = document.getElementById('address-input');
    let id = await getCurrentRadioInput();

    if (
        address.value.length == 42 &&
        address.value[0] == 0 &&
        address.value[1] == 'x' &&
        id != null &&
        signer != undefined
    ) {
        let health = (await _AvalancheValidatorSettersAndGettersFacet.getOwnerHealth(address.value, id)).toString();
        let timestamp = (await provider.getBlock(await provider.getBlockNumber())).timestamp;
        if (timestamp - health >= 60 * 60 * 4 && health > 0) { // 31*24*60*60
            console.log("not healthy == go and manage")
            emptyWhiteAvaxLogo.style.filter = "invert(80%) sepia(15%) saturate(5577%) hue-rotate(77deg) brightness(106%) contrast(102%)";
        } else {
            console.log("not healthy == don't go and manage")
            emptyWhiteAvaxLogo.style.filter = "invert(57%) sepia(74%) saturate(5550%) hue-rotate(336deg) brightness(93%) contrast(79%)";
        }
    } else {
        console.log("undefined values")
        emptyWhiteAvaxLogo.style.filter = "";
    }
}

// call the txn if there is the input
const manageButton = document.getElementById("manage-button");
manageButton.addEventListener("click", async () => {
    // address
    let address = document.getElementById('address-input');
    // id
    let id = await getCurrentRadioInput();
    // Check validity
    let health = (await _AvalancheValidatorSettersAndGettersFacet.getOwnerHealth(address.value, id)).toString();
    let timestamp = (await provider.getBlock(await provider.getBlockNumber())).timestamp;
    // execute tx
    if (timestamp - health > 60 * 60 * 4 && health > 0) { // 31*24*60*60
        let tx = await signer_AvalancheValidatorFacet.manageInactiveValidatorShares(address.value, id, { gasLimit: 3_000_000 });
        await tx.wait(1);
    }
});

// update
const metamaskIcon = document.getElementById("metamaskIcon");
async function update(_address, _networkId) {
    if (_address != undefined) {
        metamaskIcon.style.opacity = "0";
        metamaskButton.innerHTML = _address[0] + _address[1] + _address[2] + _address[3] + _address[4] + _address[5] + "..";
    } else {
        metamaskButton.innerHTML = "Disconnected";
    }
    if (
        // (_networkId != "0xa86a" || _networkId != 43114 ) && _networkId != undefined
        (_networkId != "0xa869" || _networkId != 43113) && _networkId != undefined // testnet
    ) {
        // window.ethereum.request({ // Mainnet
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
        window.ethereum.request({ // Testnet
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