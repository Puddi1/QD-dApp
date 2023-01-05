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

// // User // //
// etherjs setup: abi contract, provider
import { ethers } from 'ethers';
let provider = new ethers.providers.Web3Provider(window.ethereum);
let diamondAddress = "0x65d020B53860ab9d2954bC63758a604bb7d489Dd";

import AvalancheValidatorFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorFacet.sol/AvalancheValidatorFacet.json";
import ERC1155Facet from "../artifacts/contracts/validator/facets/ERC1155Facet.sol/ERC1155Facet.json";
import AvalancheValidatorSettersAndGettersFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorSettersAndGettersFacet.sol/AvalancheValidatorSettersAndGettersFacet.json";
import AvalancheValidatorDepositFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorDepositFacet.sol/AvalancheValidatorDepositFacet.json";
import AvalancheValidatorHealthAndUpgradesFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorHealthAndUpgradesFacet.sol/AvalancheValidatorHealthAndUpgradesFacet.json";

let _AvalancheValidatorFacet = new ethers.Contract(diamondAddress, AvalancheValidatorFacet.abi, provider);
let _ERC1155Facet = new ethers.Contract(diamondAddress, ERC1155Facet.abi, provider);
let _AvalancheValidatorSettersAndGettersFacet = new ethers.Contract(diamondAddress, AvalancheValidatorSettersAndGettersFacet.abi, provider);
let _AvalancheValidatorDepositFacet = new ethers.Contract(diamondAddress, AvalancheValidatorDepositFacet.abi, provider);
let _AvalancheValidatorHealthAndUpgradesFacet = new ethers.Contract(diamondAddress, AvalancheValidatorHealthAndUpgradesFacet.abi, provider);

let signer;
let signer_AvalancheValidatorFacet;
let signer_AvalancheValidatorDepositFacet;
let signer_AvalancheValidatorHealthAndUpgradesFacet;

// connect to metamask
const metamaskButton = document.getElementById("button-metamask");
metamaskButton.addEventListener("click", async () => {
    if (typeof window.ethereum != 'undefined') {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        let address = await signer.getAddress();

        signer_AvalancheValidatorDepositFacet = _AvalancheValidatorDepositFacet.connect(signer);
        signer_AvalancheValidatorFacet =  _AvalancheValidatorFacet.connect(signer);
        signer_AvalancheValidatorHealthAndUpgradesFacet = _AvalancheValidatorHealthAndUpgradesFacet.connect(signer);

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
let emptyWhiteAvaxLogo = document.getElementById("avalancheLogo");
async function whiteAvaxLogoUpdate() {
    let totalSupply = (await _AvalancheValidatorSettersAndGettersFacet.getTotalCurrentSupplyPondered()).toString();

    let percentage = (totalSupply / 30_000_000) * 100;

    // emptyWhiteAvaxLogo.style.background = "linear-gradient(black " + (100 - percentage.toFixed(3)) + "%, #D7504A)";
}

// mint new tokens
let buttonInput = document.getElementById("button-mint");
buttonInput.addEventListener("click", async () => {
    let numberInput = document.getElementById("input-number").value;

    if (0 < numberInput) {

        let _shareCost = ((await _AvalancheValidatorSettersAndGettersFacet.getShareCost()).toString() / 1e18);
        let _value = ethers.utils.parseEther("" + (numberInput * _shareCost).toFixed(10));

        let txnMint = await signer_AvalancheValidatorDepositFacet.mintAvalancheValidatorShare(numberInput, "0x", { value: _value, gasLimit: 3_000_000 });
        await txnMint.wait(1);

        await whiteAvaxLogoUpdate();
        await displaySupply();
        await displayHealth();
    }
});

// display supply
let quantityLVL1 = document.getElementById("quantity-level1");
let quantityLVL2 = document.getElementById("quantity-level2");
let quantityLVL3 = document.getElementById("quantity-level3");
let quantityLVL4 = document.getElementById("quantity-level4");
let quantityLVL5 = document.getElementById("quantity-level5");
async function displaySupply() {
    let balances = [];
    for (let i = 0; i < 5; ++i) {
        balances[i] = (await _ERC1155Facet.balanceOf(await signer.getAddress(), i)).toString();
    }

    quantityLVL1.innerHTML = "" + balances[0];
    quantityLVL2.innerHTML = "" + balances[1];
    quantityLVL3.innerHTML = "" + balances[2];
    quantityLVL4.innerHTML = "" + balances[3];
    quantityLVL5.innerHTML = "" + balances[4];

    await displayLevelUpIcons(balances);
}

// display remaining health days
let healthLVL1 = document.getElementById("health-level1");
let healthLVL2 = document.getElementById("health-level2");
let healthLVL3 = document.getElementById("health-level3");
let healthLVL4 = document.getElementById("health-level4");
let healthLVL5 = document.getElementById("health-level5");
let healthVisualizer1 = document.getElementById("healthVisualizer-level1");
let healthVisualizer2 = document.getElementById("healthVisualizer-level2");
let healthVisualizer3 = document.getElementById("healthVisualizer-level3");
let healthVisualizer4 = document.getElementById("healthVisualizer-level4");
let healthVisualizer5 = document.getElementById("healthVisualizer-level5");
async function displayHealth() {
    let health = [];
    let timestamp = (await provider.getBlock(await provider.getBlockNumber())).timestamp;

    for (let i = 0; i < 5; ++i) { 
        let ownerHealth = (await _AvalancheValidatorSettersAndGettersFacet.getOwnerHealth(await signer.getAddress(), i)).toString();

        if (ownerHealth > 0 && ownerHealth <= timestamp) {
            let activityPeriod = (await _AvalancheValidatorSettersAndGettersFacet.getActivityPeriod()).toString();
            health[i] = Math.round((activityPeriod - (timestamp - ownerHealth)) / 3600); // 86400 for 31d for 12h you eed hours: 60*60
        } else if (ownerHealth > 0 && ownerHealth >= timestamp) {
            health[i] = Math.round((ownerHealth - timestamp) / 3600) + "cp"; // 86400 for 31d for 12h you eed hours: 60*60
        } else {
            health[i] = 0;
        }
    }

    // healthVisualizer1.style.fill = "linear-gradient(white " + (100 - ((31 / 31) * 100).toFixed(3)) + "%, #D7504A)";
    // healthVisualizer2.style.fill = "linear-gradient(white " + (100 - ((health[1] / 31) * 100).toFixed(3)) + "%, #D7504A)";
    // healthVisualizer3.style.background = "linear-gradient(white " + (100 - ((health[2] / 31) * 100).toFixed(3)) + "%, #D7504A)";
    // healthVisualizer4.style.background = "linear-gradient(white " + (100 - ((health[3] / 31) * 100).toFixed(3)) + "%, #D7504A)";
    // healthVisualizer5.style.background = "linear-gradient(white " + (100 - ((health[4] / 31) * 100).toFixed(3)) + "%, #D7504A)";

    healthLVL1.innerHTML = health[0] + "d";
    healthLVL2.innerHTML = health[1] + "d";
    healthLVL3.innerHTML = health[2] + "d";
    healthLVL4.innerHTML = health[3] + "d";
    healthLVL5.innerHTML = health[4] + "d";
}

// get and display rewards
let rewardLVL1 = document.querySelector("rewards-level1");
let rewardLVL2 = document.querySelector("rewards-level2");
let rewardLVL3 = document.querySelector("rewards-level3");
let rewardLVL4 = document.querySelector("rewards-level4");
let rewardLVL5 = document.querySelector("rewards-level5");
async function displayRewards() {
    let rewards = [];

    rewards = await _AvalancheValidatorSettersAndGettersFacet.getAllOwnerRewards(await signer.getAddress());

    rewardLVL1.innerHTML = rewards[0].toString() + "";
    rewardLVL2.innerHTML = rewards[1].toString() + "";
    rewardLVL3.innerHTML = rewards[2].toString() + "";
    rewardLVL4.innerHTML = rewards[3].toString() + "";
    rewardLVL5.innerHTML = rewards[4].toString() + "";
}

// based on rewards display level up icons
let levelUpIcon1 = document.getElementById("levelUpIcon-level1");
let levelUpIcon2 = document.getElementById("levelUpIcon-level2");
let levelUpIcon3 = document.getElementById("levelUpIcon-level3");
let levelUpIcon4 = document.getElementById("levelUpIcon-level4");
let levelUpIcon5 = document.getElementById("levelUpIcon-level5");
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
let rewardIcon = document.getElementById("rewardIcon");
rewardIcon.addEventListener('click', async () => {
    let rewardsCheckboxes = document.getElementsByClassName('checkbox-rewards');
    let rewardIDs = [];
    console.log(rewardsCheckboxes)
    console.log(rewardsCheckboxes.length)

    for (let i = 0; i < rewardsCheckboxes.length; ++i) {
        if (rewardsCheckboxes[i].checked) {
            console.log(rewardsCheckboxes[i].checked)
            console.log(rewardsCheckboxes[i].name)
            rewardIDs.push(rewardsCheckboxes[i].name);
        }
    }

    console.log(rewardIDs);

    if (!(rewardIDs == 0)) {
        let tx = await signer_AvalancheValidatorFacet.collectRewards(rewardIDs, { gasLimit: 3_000_000 });
        await tx.wait(1);
        await displayRewards();
    }
})

// refresh health
let healthIcon = document.getElementById("healthIcon");
healthIcon.addEventListener('click', async () => {
    let healthCheckboxes = document.getElementsByClassName('checkbox-health');
    let healthIDs = [];

    for (let i = 0; i < healthCheckboxes.length; ++i) {
        if (healthCheckboxes[i].checked) {
            healthIDs.push(healthCheckboxes[i].name);
        }
    }

    if (!(healthIDs == 0)) {
        let tx = await signer_AvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth(healthIDs, { gasLimit: 3_000_000 });
        await tx.wait(1);
        await displayHealth();
    }
})


// update
const metamaskIcon = document.getElementById("metamask");
async function updateChanges(_address, _networkId) {
    if (_address != undefined) {
        metamaskButton.innerHTML = _address[0] + _address[1] + _address[2] + _address[3] + _address[4] + _address[5] + "..";
        metamaskIcon.style.opacity = "0";
    } else {
        metamaskButton.innerHTML = "Disconnected";
    }
    if (
        // (_networkId != "0xa86a" || _networkId != 43114 ) && _networkId != undefined // Mainnet
        (_networkId != "0xa869" || _networkId != 43113 ) && _networkId != undefined // testnet
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
}, 10000); // 10s
setTimeout(async () => {
    await displayHealth();
}, 120000); // 2min