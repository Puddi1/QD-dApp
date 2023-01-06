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
let diamondAddress = "0x65d020B53860ab9d2954bC63758a604bb7d489Dd";

import AvalancheValidatorHealthAndUpgradesFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorHealthAndUpgradesFacet.sol/AvalancheValidatorHealthAndUpgradesFacet.json";
import ERC1155Facet from "../artifacts/contracts/validator/facets/ERC1155Facet.sol/ERC1155Facet.json";

let _AvalancheValidatorHealthAndUpgradesFacet = new ethers.Contract(diamondAddress, AvalancheValidatorHealthAndUpgradesFacet.abi, provider);
let _ERC1155Facet = new ethers.Contract(diamondAddress, ERC1155Facet.abi, provider);

let signer;
let signer_AvalancheValidatorHealthAndUpgradesFacet;

// connect to metamask
const metamaskButton = document.getElementById("button-metamask");
metamaskButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== 'undefined') {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        let address = await signer.getAddress();

        signer_AvalancheValidatorHealthAndUpgradesFacet = _AvalancheValidatorHealthAndUpgradesFacet.connect(signer);

        await update(address, (await provider.getNetwork()).chainId);
        await displaySupply();
    } else {
        alert("Install Metamask");
    }
});

// display supply and levels possible
let balanceTextLevel1 = document.getElementById("balanceText-level1");
let balanceTextLevel2 = document.getElementById("balanceText-level2");
let balanceTextLevel3 = document.getElementById("balanceText-level3");
let balanceTextLevel4 = document.getElementById("balanceText-level4");
let balanceTextLevel5 = document.getElementById("balanceText-level5");

let startingBalance1 = 0;
let startingBalance2 = 0;
let startingBalance3 = 0;
let startingBalance4 = 0;
let startingBalance5 = 0;

async function displaySupply() {
    let balances = [];
    for (let i = 0; i < 5; ++i) {
        balances[i] = (await _ERC1155Facet.balanceOf(await signer.getAddress(), i)).toString();
    }

    balanceTextLevel1.innerHTML = "" + balances[0];
    balanceTextLevel2.innerHTML = "" + balances[1];
    balanceTextLevel3.innerHTML = "" + balances[2];
    balanceTextLevel4.innerHTML = "" + balances[3];
    balanceTextLevel5.innerHTML = "" + balances[4];

    startingBalance1 = Number(balances[0]);
    startingBalance2 = Number(balances[1]);
    startingBalance3 = Number(balances[2]);
    startingBalance4 = Number(balances[3]);
    startingBalance5 = Number(balances[4]);
}

// Manage level up selection
let upgradeTextLevel1 = document.getElementById("upgradeText-level1");
let upgradeTextLevel2 = document.getElementById("upgradeText-level2");
let upgradeTextLevel3 = document.getElementById("upgradeText-level3");
let upgradeTextLevel4 = document.getElementById("upgradeText-level4");
let upgradesLevel1 = 0;
let upgradesLevel2 = 0;
let upgradesLevel3 = 0;
let upgradesLevel4 = 0;

let minusLevel1 = document.getElementById("minusLevel1");
let minusLevel2 = document.getElementById("minusLevel2");
let minusLevel3 = document.getElementById("minusLevel3");
let minusLevel4 = document.getElementById("minusLevel4");

let plusLevel1 = document.getElementById("plusLevel1");
let plusLevel2 = document.getElementById("plusLevel2");
let plusLevel3 = document.getElementById("plusLevel3");
let plusLevel4 = document.getElementById("plusLevel4");

minusLevel1.addEventListener('click', async () => {
    await updateBalances(1, false);
});
plusLevel1.addEventListener('click', async () => {
    await updateBalances(1, true);
});
minusLevel2.addEventListener('click', async () => {
    await updateBalances(2, false);
});
plusLevel2.addEventListener('click', async () => {
    await updateBalances(2, true);
});
minusLevel3.addEventListener('click', async () => {
    await updateBalances(3, false);
});
plusLevel3.addEventListener('click', async () => {
    await updateBalances(3, true);
});
minusLevel4.addEventListener('click', async () => {
    await updateBalances(4, false);
});
plusLevel4.addEventListener('click', async () => {
    await updateBalances(4, true);
});

let pressed1 = true;
let pressed2 = true;
let pressed3 = true;
let pressed4 = true;
document.addEventListener('keypress', async (e) => {
    if (
        (e.key == 1 ||
        e.key == 2 ||
        e.key == 3 ||
        e.key == 4) &&
        balanceTextLevel5.innerHTML != "/"
    ) {
        await allLevelUpgrades(e.key);
    }
})
async function allLevelUpgrades(key) {
    if (key == 1) { // direct update too slow for loop
        if (pressed1) {
            let supplyAvailable = Number(balanceTextLevel1.innerHTML);
            let updatesAvailable = Math.floor(supplyAvailable / 10);

            balanceTextLevel1.innerHTML = Number(balanceTextLevel1.innerHTML) - updatesAvailable * 10;
            upgradeTextLevel1.innerHTML = Number(upgradeTextLevel1.innerHTML) + updatesAvailable;
            upgradesLevel1 += updatesAvailable;

            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) + updatesAvailable;

            await updateColors(1);
        } else {
            let supplyAvailableNextLevel = Number(balanceTextLevel2.innerHTML);
            let supplyDowngradesAvailables = supplyAvailableNextLevel * 10;

            balanceTextLevel1.innerHTML = Number(balanceTextLevel1.innerHTML) + supplyDowngradesAvailables;
            upgradeTextLevel1.innerHTML = Number(upgradeTextLevel1.innerHTML) - supplyAvailableNextLevel;
            upgradesLevel1 -= supplyAvailableNextLevel;

            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) - supplyAvailableNextLevel;

            await updateColors(1);
        }

        pressed1 = !pressed1;
    } else if (key == 2) {
        if (pressed2) {
            let supplyAvailable = Number(balanceTextLevel2.innerHTML);
            let updatesAvailable = Math.floor(supplyAvailable / 10);

            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) - updatesAvailable * 10;
            upgradeTextLevel2.innerHTML = Number(upgradeTextLevel2.innerHTML) + updatesAvailable;
            upgradesLevel2 += updatesAvailable;

            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) + updatesAvailable;

            await updateColors(2);
        } else {
            let supplyAvailableNextLevel = Number(balanceTextLevel3.innerHTML);
            let supplyDowngradesAvailables = supplyAvailableNextLevel * 10;

            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) + supplyDowngradesAvailables;
            upgradeTextLevel2.innerHTML = Number(upgradeTextLevel2.innerHTML) - supplyAvailableNextLevel;
            upgradesLevel2 -= supplyAvailableNextLevel;

            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) - supplyAvailableNextLevel;

            await updateColors(2);
        }

        pressed2 = !pressed2;
    } else if (key == 3) {
        if (pressed3) {
            let supplyAvailable = Number(balanceTextLevel3.innerHTML);
            let updatesAvailable = Math.floor(supplyAvailable / 10);

            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) - updatesAvailable * 10;
            upgradeTextLevel3.innerHTML = Number(upgradeTextLevel3.innerHTML) + updatesAvailable;
            upgradesLevel3 += updatesAvailable;

            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) + updatesAvailable;

            await updateColors(3);
        } else {
            let supplyAvailableNextLevel = Number(balanceTextLevel4.innerHTML);
            let supplyDowngradesAvailables = supplyAvailableNextLevel * 10;

            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) + supplyDowngradesAvailables;
            upgradeTextLevel3.innerHTML = Number(upgradeTextLevel3.innerHTML) - supplyAvailableNextLevel;
            upgradesLevel3 -= supplyAvailableNextLevel;

            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) - supplyAvailableNextLevel;

            await updateColors(3);
        }

        pressed3 = !pressed3;
    } else if (key == 4) {
        if (pressed4) {
            let supplyAvailable = Number(balanceTextLevel4.innerHTML);
            let updatesAvailable = Math.floor(supplyAvailable / 10);

            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) - updatesAvailable * 10;
            upgradeTextLevel4.innerHTML = Number(upgradeTextLevel4.innerHTML) + updatesAvailable;
            upgradesLevel4 += updatesAvailable;

            balanceTextLevel5.innerHTML = Number(balanceTextLevel5.innerHTML) + updatesAvailable;

            await updateColors(4);
        } else {
            let supplyAvailableNextLevel = Number(balanceTextLevel5.innerHTML);
            let supplyDowngradesAvailables = supplyAvailableNextLevel * 10;

            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) + supplyDowngradesAvailables;
            upgradeTextLevel4.innerHTML = Number(upgradeTextLevel4.innerHTML) - supplyAvailableNextLevel;
            upgradesLevel4 -= supplyAvailableNextLevel;

            balanceTextLevel5.innerHTML = Number(balanceTextLevel5.innerHTML) - supplyAvailableNextLevel;

            await updateColors(4);
        }

        pressed4 = !pressed4;
    }
}

async function updateBalances(level, increase) {
    if (level == 1) {
        if (increase) {
            if (Number(balanceTextLevel1.innerHTML) - 10 < 0) {
                return;
            }

            upgradesLevel1 += 1;
            upgradeTextLevel1.innerHTML = upgradesLevel1;

            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) + 1;
            balanceTextLevel1.innerHTML = Number(balanceTextLevel1.innerHTML) - 10;

            await updateColors(1);
        } else {
            if (upgradesLevel1 == 0 || Number(balanceTextLevel2.innerHTML) == 0) {
                return;
            }

            upgradesLevel1 -= 1;
            upgradeTextLevel1.innerHTML = upgradesLevel1;

            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) - 1;
            balanceTextLevel1.innerHTML = Number(balanceTextLevel1.innerHTML) + 10;

            await updateColors(1);
        }
    } else if (level == 2) {
        if (increase) {
            if (Number(balanceTextLevel2.innerHTML) - 10 < 0) {
                return;
            }

            upgradesLevel2 += 1;
            upgradeTextLevel2.innerHTML = upgradesLevel2;

            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) + 1;
            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) - 10;

            await updateColors(2);
        } else {
            if (upgradesLevel2 == 0 || Number(balanceTextLevel3.innerHTML) == 0) {
                return;
            }

            upgradesLevel2 -= 1;
            upgradeTextLevel2.innerHTML = upgradesLevel2;

            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) - 1;
            balanceTextLevel2.innerHTML = Number(balanceTextLevel2.innerHTML) + 10;

            await updateColors(2);
        }
    } else if (level == 3) {
        if (increase) {
            if (Number(balanceTextLevel3.innerHTML) - 10 < 0) {
                return;
            }

            upgradesLevel3 += 1;
            upgradeTextLevel3.innerHTML = upgradesLevel3;

            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) + 1;
            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) - 10;

            await updateColors(3);
        } else {
            if (upgradesLevel3 == 0 || Number(balanceTextLevel4.innerHTML) == 0) {
                return;
            }

            upgradesLevel3 -= 1;
            upgradeTextLevel3.innerHTML = upgradesLevel3;

            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) - 1;
            balanceTextLevel3.innerHTML = Number(balanceTextLevel3.innerHTML) + 10;

            await updateColors(3);
        }
    } else if (level == 4) {
        if (increase) {
            if (Number(balanceTextLevel4.innerHTML) - 10 < 0) {
                return;
            }

            upgradesLevel4 += 1;
            upgradeTextLevel4.innerHTML = upgradesLevel4;

            balanceTextLevel5.innerHTML = Number(balanceTextLevel5.innerHTML) + 1;
            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) - 10;

            await updateColors(4);
        } else {
            if (upgradesLevel4 == 0 || Number(balanceTextLevel5.innerHTML) == 0) {
                return;
            }

            upgradesLevel4 -= 1;
            upgradeTextLevel4.innerHTML = upgradesLevel4;

            balanceTextLevel5.innerHTML = Number(balanceTextLevel5.innerHTML) - 1;
            balanceTextLevel4.innerHTML = Number(balanceTextLevel4.innerHTML) + 10;

            await updateColors(4);
        }
    }
}

async function updateColors(level) {
    if (level == 1) {
        if (balanceTextLevel1.innerHTML > startingBalance1) {
            balanceTextLevel1.style.color = 'green';
        } else if (balanceTextLevel1.innerHTML < startingBalance1) {
            balanceTextLevel1.style.color = 'red';
        } else {
            balanceTextLevel1.style.color = 'white';
        }
        if (balanceTextLevel2.innerHTML > startingBalance2) {
            balanceTextLevel2.style.color = 'green';
        } else if (balanceTextLevel2.innerHTML < startingBalance2) {
            balanceTextLevel2.style.color = 'red';
        } else {
            balanceTextLevel2.style.color = 'white';
        }
    } else if (level == 2) {
        if (balanceTextLevel2.innerHTML > startingBalance2) {
            balanceTextLevel2.style.color = 'green';
        } else if (balanceTextLevel2.innerHTML < startingBalance2) {
            balanceTextLevel2.style.color = 'red';
        } else {
            balanceTextLevel2.style.color = 'white';
        }
        if (balanceTextLevel3.innerHTML > startingBalance3) {
            balanceTextLevel3.style.color = 'green';
        } else if (balanceTextLevel3.innerHTML < startingBalance3) {
            balanceTextLevel3.style.color = 'red';
        } else {
            balanceTextLevel3.style.color = 'white';
        }
    } else if (level == 3) {
        if (balanceTextLevel3.innerHTML > startingBalance3) {
            balanceTextLevel3.style.color = 'green';
        } else if (balanceTextLevel3.innerHTML < startingBalance3) {
            balanceTextLevel3.style.color = 'red';
        } else {
            balanceTextLevel3.style.color = 'white';
        }
        if (balanceTextLevel4.innerHTML > startingBalance4) {
            balanceTextLevel4.style.color = 'green';
        } else if (balanceTextLevel4.innerHTML < startingBalance4) {
            balanceTextLevel4.style.color = 'red';
        } else {
            balanceTextLevel4.style.color = 'white';
        }
    } else if (level == 4) {
        if (balanceTextLevel4.innerHTML > startingBalance4) {
            balanceTextLevel4.style.color = 'green';
        } else if (balanceTextLevel4.innerHTML < startingBalance4) {
            balanceTextLevel4.style.color = 'red';
        } else {
            balanceTextLevel4.style.color = 'white';
        }
        if (balanceTextLevel5.innerHTML > startingBalance5) {
            balanceTextLevel5.style.color = 'green';
        } else if (balanceTextLevel5.innerHTML < startingBalance5) {
            balanceTextLevel5.style.color = 'red';
        } else {
            balanceTextLevel5.style.color = 'white';
        }
    }
}

// level Up
let upgradeIcon = document.getElementById("upgradeIcon");
let upgradesText = document.getElementsByClassName("upgradesText");
upgradeIcon.addEventListener('click', async () => {
    // Fetch all upgrades, and match with id, if 0 don't insert them, after send tx
    let IDs = [];
    let Upgrades = [];

    console.log(upgradesText)
    for (let i = 0; i < upgradesText.length; ++i) {
        let _upgrades = Number(upgradesText[i].innerHTML);
        if (_upgrades != 0) {
            IDs.push(i);
            Upgrades.push(_upgrades);
        }
    }

    if (IDs.length > 0) {
        let tx = await signer_AvalancheValidatorHealthAndUpgradesFacet.upgradeAvalancheValidatorLevel(IDs, Upgrades, {gasLimit: 3_000_000});
        await tx.wait(1);
        await displaySupply();
    }
})

// update
const metamaskIcon = document.getElementById("metamask");
async function update(_address, _networkId) {
    if (_address != undefined) {
        metamaskIcon.style.opacity = "0";
        metamaskButton.innerHTML = _address[0] + _address[1] + _address[2] + _address[3] + _address[4] + _address[5] + "..";
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
        await displaySupply();
    };
});
// check account changes
window.ethereum.on('accountsChanged', async function (accounts) {
    if (signer != undefined) {
        await update(accounts[0], undefined);
        await displaySupply();
    };
});