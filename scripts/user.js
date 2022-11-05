// etherjs setup: abi contract, provider
let provider = new ethers.providers.Web3Provider(window.ethereum);
let diamondAddress = "0xDC9d861138c16c8E6f99b70ed1839CA88a70F426";

import FirstAvalancheValidatorFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorFacet.sol/FirstAvalancheValidatorFacet.json" assert {type: 'json'};
import FirstERC1155Facet from "../artifacts/contracts/validator/facets/FirstERC1155Facet.sol/FirstERC1155Facet.json" assert {type: 'json'};;
import FirstAvalancheValidatorSettersAndGettersFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorSettersAndGettersFacet.sol/FirstAvalancheValidatorSettersAndGettersFacet.json" assert {type: 'json'};
import FirstAvalancheValidatorDepositFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorDepositFacet.sol/FirstAvalancheValidatorDepositFacet.json" assert {type: 'json'};
import FirstAvalancheValidatorHealthAndUpgradesFacet from "../artifacts/contracts/validator/facets/FirstAvalancheValidatorHealthAndUpgradesFacet.sol/FirstAvalancheValidatorHealthAndUpgradesFacet.json" assert {type: 'json'};

let _FirstAvalancheValidatorFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorFacet.abi, provider);
let _FirstERC1155Facet = new ethers.Contract(diamondAddress, FirstERC1155Facet.abi, provider);
let _FirstAvalancheValidatorSettersAndGettersFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorSettersAndGettersFacet.abi, provider);
let _FirstAvalancheValidatorDepositFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorDepositFacet.abi, provider);
let _FirstAvalancheValidatorHealthAndUpgradesFacet = new ethers.Contract(diamondAddress, FirstAvalancheValidatorHealthAndUpgradesFacet.abi, provider);

let signer;
let signer_FirstAvalancheValidatorFacet;
let signer_FirstAvalancheValidatorDepositFacet;
let signer_FirstAvalancheValidatorHealthAndUpgradesFacet;

// connect to metamask
const metamaskButton = document.querySelector(".metamaskButton");
metamaskButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== 'undefined') {
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        let address = await signer.getAddress();

        signer_FirstAvalancheValidatorDepositFacet = _FirstAvalancheValidatorDepositFacet.connect(signer);
        signer_FirstAvalancheValidatorFacet =  _FirstAvalancheValidatorFacet.connect(signer);
        signer_FirstAvalancheValidatorHealthAndUpgradesFacet = _FirstAvalancheValidatorHealthAndUpgradesFacet.connect(signer);

        await updateChanges(address, (await provider.getNetwork()).chainId);
        await whiteAvaxLogoUpdate();
        await displaySupply();
        await displayHealth();
        await displayRewards();
    } else {
        alert("Install Metamask");
    }
});

// change avax background based on supply - better with new function on contract
let emptyWhiteAvaxLogo = document.querySelector(".emptyWhiteAvaxLogo");
async function whiteAvaxLogoUpdate() {
    let totSupply = (await _FirstAvalancheValidatorSettersAndGettersFacet.getTotalCurrentSupplyPondered()).toString();

    let percentage = (totSupply / 30000000) * 100;

    emptyWhiteAvaxLogo.style.background = "linear-gradient(black " + (100 - percentage.toFixed(3)) + "%, #D7504A)";

    console.log()
}

// mint new tokens
let buttonInput = document.querySelector(".buttonInput");
buttonInput.addEventListener("click", async () => {
    let numberInput = document.querySelector(".numberInput").value;

    if (0 < numberInput) {
        let _shareCost = ((await _FirstAvalancheValidatorSettersAndGettersFacet.getShareCost()).toString() / 1e18);
        let _value = ethers.utils.parseEther("" + (numberInput * _shareCost).toFixed(6));

        let txnMint = await signer_FirstAvalancheValidatorDepositFacet.mintAvalancheValidatorShare(numberInput, "0x", {value: _value});
        await txnMint.wait(1);

        await whiteAvaxLogoUpdate();
        await displaySupply();
        await displayHealth();
    }
});

// display supply
let quantityLVL1 = document.querySelector(".quantityLVL1");
let quantityLVL2 = document.querySelector(".quantityLVL2");
let quantityLVL3 = document.querySelector(".quantityLVL3");
let quantityLVL4 = document.querySelector(".quantityLVL4");
let quantityLVL5 = document.querySelector(".quantityLVL5");
async function displaySupply() {
    let balances = [];
    for (let i = 0; i < 5; ++i) {
        balances[i] = (await _FirstERC1155Facet.balanceOf(await signer.getAddress(), i)).toString();
    }

    quantityLVL1.innerHTML = "" + balances[0];
    quantityLVL2.innerHTML = "" + balances[1];
    quantityLVL3.innerHTML = "" + balances[2];
    quantityLVL4.innerHTML = "" + balances[3];
    quantityLVL5.innerHTML = "" + balances[4];

    await displayLevelUpIcons(balances);
}

// display remaining health days
let healthLVL1 = document.querySelector(".healthLVL1");
let healthLVL2 = document.querySelector(".healthLVL2");
let healthLVL3 = document.querySelector(".healthLVL3");
let healthLVL4 = document.querySelector(".healthLVL4");
let healthLVL5 = document.querySelector(".healthLVL5");
async function displayHealth() {
    let health = [];
    let timestamp = (await provider.getBlock(await provider.getBlockNumber())).timestamp;

    for (let i = 0; i < 5; ++i) { 
        let ownerHealth = (await _FirstAvalancheValidatorSettersAndGettersFacet.getOwnerHealth(await signer.getAddress(), i)).toString();

        if (ownerHealth > 0 && ownerHealth <= timestamp) {
            let activityPeriod = (await _FirstAvalancheValidatorSettersAndGettersFacet.getActivityPeriod()).toString();
            health[i] = Math.round((activityPeriod - (timestamp - ownerHealth)) / 3600); // 86400 for 31d for 12h you eed hours: 60*60
        } else {
            health[i] = 0;
        }
    }

    healthLVL1.innerHTML = health[0] + "d";
    healthLVL2.innerHTML = health[1] + "d";
    healthLVL3.innerHTML = health[2] + "d";
    healthLVL4.innerHTML = health[3] + "d";
    healthLVL5.innerHTML = health[4] + "d";
}

// get and display rewards
let rewardLVL1 = document.querySelector(".rewardLVL1");
let rewardLVL2 = document.querySelector(".rewardLVL2");
let rewardLVL3 = document.querySelector(".rewardLVL3");
let rewardLVL4 = document.querySelector(".rewardLVL4");
let rewardLVL5 = document.querySelector(".rewardLVL5");
async function displayRewards() {
    let rewards = [];

    rewards = await _FirstAvalancheValidatorSettersAndGettersFacet.getAllOwnerRewards(await signer.getAddress());

    rewardLVL1.innerHTML = rewards[0].toString() + "";
    rewardLVL2.innerHTML = rewards[1].toString() + "";
    rewardLVL3.innerHTML = rewards[2].toString() + "";
    rewardLVL4.innerHTML = rewards[3].toString() + "";
    rewardLVL5.innerHTML = rewards[4].toString() + "";
}

// based on rewards display level up icons
let levelUpIcon1 = document.querySelector(".levelUpIcon1");
let levelUpIcon2 = document.querySelector(".levelUpIcon2");
let levelUpIcon3 = document.querySelector(".levelUpIcon3");
let levelUpIcon4 = document.querySelector(".levelUpIcon4");
let levelUpIcon5 = document.querySelector(".levelUpIcon5");
async function displayLevelUpIcons(_balances) {
    for (let i = 0; i < 5; ++i) {
        if (_balances[i] / 10 >= 1) {
            if (i == 0) {
                levelUpIcon1.style.opacity = "1";
            } else if (i == 1) {
                levelUpIcon2.style.opacity = "1";
            } else if (i == 2) {
                levelUpIcon3.style.opacity = "1";
            } else if (i == 3) {
                levelUpIcon4.style.opacity = "1";
            } else if (i == 4) {
                levelUpIcon5.style.opacity = "1";
            }
        } else {
            if (i == 0) {
                levelUpIcon1.style.opacity = "0";
            } else if (i == 1) {
                levelUpIcon2.style.opacity = "0";
            } else if (i == 2) {
                levelUpIcon3.style.opacity = "0";
            } else if (i == 3) {
                levelUpIcon4.style.opacity = "0";
            } else if (i == 4) {
                levelUpIcon5.style.opacity = "0";
            }
        }
    }
}

// collect rewards
let rewardIcon1 = document.querySelector(".rewardIcon1");
let rewardIcon2 = document.querySelector(".rewardIcon2");
let rewardIcon3 = document.querySelector(".rewardIcon3");
let rewardIcon4 = document.querySelector(".rewardIcon4");
let rewardIcon5 = document.querySelector(".rewardIcon5");
let allRewardIcons = document.querySelector(".allRewardIcons");

rewardIcon1.addEventListener('click', async () => {
    let txnR1 = await signer_FirstAvalancheValidatorFacet.collectRewards([0]);
    await txnR1.wait(1);
    await displayRewards();
})
rewardIcon2.addEventListener('click', async () => {
    let txnR2 = await signer_FirstAvalancheValidatorFacet.collectRewards([1]);
    await txnR2.wait(1);
    await displayRewards();
})
rewardIcon3.addEventListener('click', async () => {
    let txnR3 = await signer_FirstAvalancheValidatorFacet.collectRewards([2]);
    await txnR3.wait(1);
    await displayRewards();
})
rewardIcon4.addEventListener('click', async () => {
    let txnR4 = await signer_FirstAvalancheValidatorFacet.collectRewards([3]);
    await txnR4.wait(1);
    await displayRewards();
})
rewardIcon5.addEventListener('click', async () => {
    let txnR5 = await signer_FirstAvalancheValidatorFacet.collectRewards([4]);
    await txnR5.wait(1);
    await displayRewards();
})
allRewardIcons.addEventListener('click', async () => {
    let txnRall = await signer_FirstAvalancheValidatorFacet.collectRewards([0, 1, 2, 3, 4]);
    await txnRall.wait(1);
    await displayRewards();
})

// refresh health
let healthIcon1 = document.querySelector(".healthIcon1");
let healthIcon2 = document.querySelector(".healthIcon2");
let healthIcon3 = document.querySelector(".healthIcon3");
let healthIcon4 = document.querySelector(".healthIcon4");
let healthIcon5 = document.querySelector(".healthIcon5");
let allHealthIcons = document.querySelector(".allHealthIcons");

healthIcon1.addEventListener('click', async () => {
    let txnH1 = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth([0]);
    await txnH1.wait(1);
    await displayHealth();
});
healthIcon2.addEventListener('click', async () => {
    let txnH2 = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth([1]);
    await txnH2.wait(1);
    await displayHealth();
});
healthIcon3.addEventListener('click', async () => {
    let txnH3 = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth([2]);
    await txnH3.wait(1);
    await displayHealth();
});
healthIcon4.addEventListener('click', async () => {
    let txnH4 = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth([3]);
    await txnH4.wait(1);
    await displayHealth();
});
healthIcon5.addEventListener('click', async () => {
    let txnH5 = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth([4]);
    await txnH5.wait(1);
    await displayHealth();
});
allHealthIcons.addEventListener('click', async () => {
    let txnHall = await signer_FirstAvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth([0, 1, 2, 3, 4]);
    await txnHall.wait(1);
    await displayHealth();
});

// update
const metamaskIcon = document.querySelector(".metamaskIcon");
async function updateChanges(_address, _networkId) {
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
        await updateChanges(address, networkId);
        await whiteAvaxLogoUpdate();
        await displaySupply();
        await displayHealth();
        await displayRewards();
    };
});

// check account changes
window.ethereum.on('accountsChanged', async function (accounts) {
    if (signer != undefined) {
        await updateChanges(accounts[0], undefined);
        await whiteAvaxLogoUpdate();
        await displaySupply();
        await displayHealth();
        await displayRewards();
    };
});

// throwing function to update global variables
setTimeout(async () => {
    await whiteAvaxLogoUpdate();
    await displayRewards();
}, 30000); // 30s
setTimeout(async () => {
    await displayHealth();
}, 86400000); // 1d