// etherjs setup: abi contract, provider
let provider = new ethers.providers.Web3Provider(window.ethereum);
let diamondAddress = "0xDC9d861138c16c8E6f99b70ed1839CA88a70F426";

import FirstAvalancheValidatorHealthAndUpgradesFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorHealthAndUpgradesFacet.sol/FirstAvalancheValidatorHealthAndUpgradesFacet.json" //assert {type: 'json'};
import FirstERC1155Facet from "../artifacts/contracts/validator/facets/FirstERC1155Facet.sol/FirstERC1155Facet.json" //assert {type: 'json'};

let _FirstAvalancheValidatorHealthAndUpgradesFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorHealthAndUpgradesFacet.abi, provider);
let _FirstERC1155Facet = new ethers.Contract(diamondAddress, FirstERC1155Facet.abi, provider);

let signer;
let signer_FirstAvalancheValidatorHealthAndUpgradesFacet;

// connect to metamask
const metamaskButton = document.querySelector(".metamaskButton");
metamaskButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== 'undefined') {
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        let address = await signer.getAddress();

        signer_FirstAvalancheValidatorHealthAndUpgradesFacet = _FirstAvalancheValidatorHealthAndUpgradesFacet.connect(signer);

        await update(address, (await provider.getNetwork()).chainId);
        await displaySupplyAndLevels();
    } else {
        alert("Install Metamask");
    }
});

// display supply and levels possible
let level1beforeText = document.querySelector(".level1beforeText");
let level2beforeText = document.querySelector(".level2beforeText");
let level3beforeText = document.querySelector(".level3beforeText");
let level4beforeText = document.querySelector(".level4beforeText");

let level1afterText = document.querySelector(".level1afterText");
let level2afterText = document.querySelector(".level2afterText");
let level3afterText = document.querySelector(".level3afterText");
let level4afterText = document.querySelector(".level4afterText");

async function displaySupplyAndLevels() {
    let balances = [];
    for (let i = 0; i < 5; ++i) {
        balances[i] = (await _FirstERC1155Facet.balanceOf(await signer.getAddress(), i)).toString();
    }

    level1beforeText.innerHTML = "" + balances[0];
    level2beforeText.innerHTML = "" + balances[1];
    level3beforeText.innerHTML = "" + balances[2];
    level4beforeText.innerHTML = "" + balances[3];

    level1afterText.innerHTML = "" + Math.floor((balances[0] / 10)).toFixed(0);
    level2afterText.innerHTML = "" + Math.floor((balances[1] / 10)).toFixed(0);
    level3afterText.innerHTML = "" + Math.floor((balances[2] / 10)).toFixed(0);
    level4afterText.innerHTML = "" + Math.floor((balances[3] / 10)).toFixed(0);
}

// level Up
let level1Icon = document.querySelector(".level1Icon");
let level2Icon = document.querySelector(".level2Icon");
let level3Icon = document.querySelector(".level3Icon");
let level4Icon = document.querySelector(".level4Icon");

level1Icon.addEventListener('click', async () => {
    let upgrades = document.querySelector(".level1afterText").innerHTML;
    if (upgrades > 0) {
        let txLvl1up = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.upgradeAvalancheValidatorLevel([0], [upgrades], {gasLimit: 3_000_000});
        await txLvl1up.wait(1);
        await displaySupplyAndLevels();
    }
});
level2Icon.addEventListener('click', async () => {
    let upgrades = document.querySelector(".level2afterText").innerHTML;
    if (upgrades > 0) {
        let txLvl2up = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.upgradeAvalancheValidatorLevel([1], [upgrades], {gasLimit: 3_000_000});
        await txLvl2up.wait(1);
        await displaySupplyAndLevels();
    }
});
level3Icon.addEventListener('click', async () => {
    let upgrades = document.querySelector(".level3afterText").innerHTML;
    if (upgrades > 0) {
        let txLvl3up = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.upgradeAvalancheValidatorLevel([2], [upgrades], {gasLimit: 3_000_000});
        await txLvl3up.wait(1);
        await displaySupplyAndLevels();
    }
});
level4Icon.addEventListener('click', async () => {
    let upgrades = document.querySelector(".level4afterText").innerHTML;
    if (upgrades > 0) {
        let txLvl4up = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.upgradeAvalancheValidatorLevel([3], [upgrades], {gasLimit: 3_000_000});
        await txLvl4up.wait(1);
        await displaySupplyAndLevels();
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
        await displaySupplyAndLevels();
    };
});

// check account changes
window.ethereum.on('accountsChanged', async function (accounts) {
    if (signer != undefined) {
        await update(accounts[0], undefined);
        await displaySupplyAndLevels();
    };
});

// Refresh
setTimeout(async () => {
    await displaySupplyAndLevels();
}, 30000); // 30s