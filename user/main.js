// Require xhr for HTTPS requests
const xhr = new XMLHttpRequest();

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

// ethers set up
import { ethers } from 'ethers';
// etherjs setup: abi contract, provider
let provider = new ethers.providers.Web3Provider(window.ethereum);

// Base variables setup
const baseURL = import.meta.env.VITE_BASE_URL;
let diamondAddress = import.meta.env.VITE_DIAMOND_ADDRESS;
const thorToken = import.meta.env.VITE_THOR_ADDRESS;
const odinNFT = import.meta.env.VITE_OGODIN_ADDRESS;
const thorNFT = import.meta.env.VITE_OGTHOR_ADDRESS;
const OGOdinImage = import.meta.env.VITE_OGODIN_IMAGE;
const OGThorImage = import.meta.env.VITE_OGTHOR_IMAGE;
const address0 = "0x0000000000000000000000000000000000000000";

// Import contracts
import AvalancheValidatorFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorFacet.sol/AvalancheValidatorFacet.json";
import ERC1155Facet from "../artifacts/contracts/validator/facets/ERC1155Facet.sol/ERC1155Facet.json";
import AvalancheValidatorSettersAndGettersFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorSettersAndGettersFacet.sol/AvalancheValidatorSettersAndGettersFacet.json";
import AvalancheValidatorDepositFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorDepositFacet.sol/AvalancheValidatorDepositFacet.json";
import AvalancheValidatorHealthAndUpgradesFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorHealthAndUpgradesFacet.sol/AvalancheValidatorHealthAndUpgradesFacet.json";
import AvalancheValidatorTokenFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorTokenFacet.sol/AvalancheValidatorTokenFacet.json";
import AvalancheValidatorViewTokenFacet from "../artifacts/contracts/validator/facets/AvalancheValidatorViewTokenFacet.sol/AvalancheValidatorViewTokenFacet.json";
import IERC20 from "../artifacts/contracts/shared/interfaces/IERC20.sol/IERC20.json";
import IERC721 from "../artifacts/contracts/shared/interfaces/IERC721.sol/IERC721.json";
// Create contracts
let _AvalancheValidatorFacet = new ethers.Contract(diamondAddress, AvalancheValidatorFacet.abi, provider);
let _ERC1155Facet = new ethers.Contract(diamondAddress, ERC1155Facet.abi, provider);
let _AvalancheValidatorSettersAndGettersFacet = new ethers.Contract(diamondAddress, AvalancheValidatorSettersAndGettersFacet.abi, provider);
let _AvalancheValidatorDepositFacet = new ethers.Contract(diamondAddress, AvalancheValidatorDepositFacet.abi, provider);
let _AvalancheValidatorHealthAndUpgradesFacet = new ethers.Contract(diamondAddress, AvalancheValidatorHealthAndUpgradesFacet.abi, provider);
let _AvalancheValidatorTokenFacet = new ethers.Contract(diamondAddress, AvalancheValidatorTokenFacet.abi, provider);
let _AvalancheValidatorViewTokenFacet = new ethers.Contract(diamondAddress, AvalancheValidatorViewTokenFacet.abi, provider);
let _thorIERC20 = new ethers.Contract(thorToken, IERC20.abi, provider);
let _thorIERC721 = new ethers.Contract(thorNFT, IERC721.abi, provider);
let _odinIERC721 = new ethers.Contract(odinNFT, IERC721.abi, provider);
// Base user variable and connected user contracts
let signer;
let signer_AvalancheValidatorFacet;
let signer_AvalancheValidatorDepositFacet;
let signer_AvalancheValidatorHealthAndUpgradesFacet;
let signer_AvalancheValidatorTokenFacet;
let signer_thorIERC20;
let signer_thorIERC721;
let signer_odinIERC721;
// Base contract variables
let signerAvalancheBalance;
let shareCost;
let signerThorBalance;

// Get contract price, if 0 get oracle value from contract
let thorPrice;
let odinPriceNFT;
let thorPriceNFT;

let messageContainer = document.getElementById('message-container');
let messageHeader = document.getElementById('message-header-paragraph');
let messageBody = document.getElementById('message-body-paragraph');

// connect to metamask
const metamaskButton = document.getElementById("button-metamask");
metamaskButton.addEventListener("click", async () => {
    messageContainer.classList.remove('visibleMessage');
    if (typeof window.ethereum != 'undefined') {
        // get user
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        let address = await signer.getAddress();

        // get user and variables
        signerAvalancheBalance = Number((await provider.getBalance(address)).toString());
        shareCost = Number((await _AvalancheValidatorSettersAndGettersFacet.getShareCost()).toString());
        signerThorBalance = Number((await _thorIERC20.balanceOf(address)).toString());
        thorPrice = Number((await _AvalancheValidatorViewTokenFacet.fetchTokenPrice(thorToken)).toString());
        odinPriceNFT = Number((await _AvalancheValidatorViewTokenFacet.fetchTokenPrice(odinNFT)).toString());
        odinPriceNFT = 0.24 * 1e18;
        thorPriceNFT = Number((await _AvalancheValidatorViewTokenFacet.fetchTokenPrice(thorNFT)).toString());
        thorPriceNFT = 0.02 * 1e18;

        // connect user to contracts
        signer_AvalancheValidatorDepositFacet = _AvalancheValidatorDepositFacet.connect(signer);
        signer_AvalancheValidatorFacet =  _AvalancheValidatorFacet.connect(signer);
        signer_AvalancheValidatorHealthAndUpgradesFacet = _AvalancheValidatorHealthAndUpgradesFacet.connect(signer);
        signer_AvalancheValidatorTokenFacet = _AvalancheValidatorTokenFacet.connect(signer);
        signer_thorIERC20 = _thorIERC20.connect(signer);
        signer_thorIERC721 = _thorIERC721.connect(signer);
        signer_odinIERC721 = _odinIERC721.connect(signer);
    
        // update UI with user login
        await updateChanges(address, (await provider.getNetwork()).chainId);
        await whiteAvaxLogoUpdate();
        await displaySupply();
        await displayHealth();
        await displayRewards();
        await updateCompanion();

        // Activate UI after signed
        buttonToken.disabled = false;
        addReferralButton.disabled = false;
        removeReferralButton.diables = false;
        buttonToken_Companions.disabled = false;
    } else {
        alert("Install Metamask");
        messageHeader.innerHTML = "Missing metamask";
        messageBody.innerHTML = "Please in order to use the dApp install Metamask";
        setTimeout(() => {
            messageContainer.classList.add('visibleMessage');
        }, 500);
    }
});
// Deactivate UI before signing in
let buttonToken = document.getElementById("button-dropdown");
let addReferralButton = document.getElementById('companions-add-button');
let removeReferralButton = document.getElementById('companions-remove-button');
let buttonToken_Companions = document.getElementById("companions-suggestion-div");
buttonToken.disabled = true;
addReferralButton.disabled = true;
removeReferralButton.disabled = true;
buttonToken_Companions.disabled = true;

// change avax background based on supply - better with new function on contract
let gradientBackgroundAvaxLogo = document.getElementById("Gradient2");
async function whiteAvaxLogoUpdate() {
    let totalSupply = (await _AvalancheValidatorSettersAndGettersFacet.getTotalCurrentSupplyPondered()).toString();
    let percentage = (totalSupply / 30_000_000) * 100;
    let y2 = 2.5 - 2.5 * percentage / 100;

    gradientBackgroundAvaxLogo.setAttribute('y2', y2.toString());
}

// Select token and selection of suggested companions
// open and close token selection
let dropdownTokenContainer = document.getElementById("dropdown-token-container");
let buttonClosingToken = document.getElementById('dropdown-token-header-button');
buttonToken.addEventListener('click', async () => {
    dropdownTokenContainer.style.display = "flex";
});
buttonClosingToken.addEventListener('click', async () => {
    dropdownTokenContainer.style.display = "none";
});

// open and close companions selection
let dropdownTokenContainer_Companions = document.getElementById("dropdown-token-container-companions");
let buttonClosingToken_Companions = document.getElementById('dropdown-token-header-button-companions');
buttonToken_Companions.addEventListener('click', async () => {
    dropdownTokenContainer_Companions.style.display = "flex";
});
buttonClosingToken_Companions.addEventListener('click', async () => {
    dropdownTokenContainer_Companions.style.display = "none";
});

// open and close token and companions selection if outsideclick
let dropdownSection = document.getElementById('dropdown-token-section');
let dropdownSection_Companions = document.getElementById('dropdown-token-section-companions');
window.addEventListener('click', (e) => {
    if (!isElementOnPath(e, dropdownSection) && dropdownTokenContainer.style.display == 'flex' && !isElementOnPath(e, buttonToken)) {
        dropdownTokenContainer.style.display = "none";
    }
    if (!isElementOnPath(e, dropdownSection_Companions) && dropdownTokenContainer_Companions.style.display == 'flex' && !isElementOnPath(e, buttonToken_Companions)) {
        dropdownTokenContainer_Companions.style.display = "none";
    }
});
function isElementOnPath(event, element) {
    let path = event.composedPath();

    for (let i = 0; i < path.length; i++) {
        if (element == path[i]) {
            return true;
        }
    }

    return false;
}

// Companions selection logic
let thorFiCompanions = document.getElementById('ThorFi-token-companions');
let QDCompanions = document.getElementById('QD-token-companions');
let inputAddressCompanion = document.getElementById('companions-input');
thorFiCompanions.addEventListener('click', () => {
    inputAddressCompanion.value = "0xAddressThorFi";
    dropdownTokenContainer_Companions.style.display = "none";
});
QDCompanions.addEventListener('click', () => {
    inputAddressCompanion.value = "0xAddressQD";
    dropdownTokenContainer_Companions.style.display = "none";
});

// Companions actions logic
async function updateCompanion() {
    let companion = (await _AvalancheValidatorSettersAndGettersFacet.getReferredAddress(await signer.getAddress())).toString();
    if (companion == address0) {
        inputAddressCompanion.placeholder = "Nobody";
    } else {
        inputAddressCompanion.placeholder = companion;
    }
}
addReferralButton.addEventListener('click', async () => {
    messageContainer.classList.remove('visibleMessage');

    let correctResponse = inputAddressCompanion.value[0] == '0' && inputAddressCompanion.value[1] == 'x' && inputAddressCompanion.value.length == 42;
    if (correctResponse) {
        try {
            let tx = await signer_AvalancheValidatorHealthAndUpgradesFacet.manageReferralAddress(inputAddressCompanion.value);
            await tx.wait(1);

            messageHeader.innerHTML = "Companion Added Successfully";
            messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
            setTimeout(() => {
                messageContainer.classList.add('visibleMessage');
            }, 500);
    
            await updateCompanion();
        } catch (err) {
            messageHeader.innerHTML = "Add Companion Error";
            messageBody.innerHTML = err;
            setTimeout(() => {
                messageContainer.classList.add('visibleMessage');
            }, 500);
        }
    } else {
        messageHeader.innerHTML = "Wrong Address";
        messageBody.innerHTML = "It is not a correct address format.\nCorrext address format example: 0x000..0";
        setTimeout(() => {
            messageContainer.classList.add('visibleMessage');
        }, 500);
    }
})
removeReferralButton.addEventListener('click', async () => {
    messageContainer.classList.remove('visibleMessage');

    try {
        let tx = await signer_AvalancheValidatorHealthAndUpgradesFacet.manageReferralAddress(address0);
        let recepit = await tx.wait(1);

        messageHeader.innerHTML = "Companion Removed Successfully";
        messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
        setTimeout(() => {
            messageContainer.classList.add('visibleMessage');
        }, 500);

        await updateCompanion();
    } catch (err) {
        messageHeader.innerHTML = "Remove Companion Error";
        messageBody.innerHTML = err;
        setTimeout(() => {
            messageContainer.classList.add('visibleMessage');
        }, 500);
    }
});

// Tokens selection logic
let avaxTokenIcon = document.getElementById('avalanche-token');
let avaxIcon = '<img id="avalanche-icon-selected" src="../miniEmptyWhiteAvaxLogo.svg" alt="Token">'
let avaxName = 'AVAX'
let thorTokenIcon = document.getElementById('thor-token');
let thorIcon = '<img src="../miniThor.svg" alt="Token">'
let thorName = 'THOR'
let OGOdinTokenIcon = document.getElementById('OGodin-token');
let OGOdinIcon = '<img id="OGOdin-icon-selected" src="../OGOdinWhite.svg" alt="Token">'
let OGOdinName = 'OG ODIN'
let OGThorTokenIcon = document.getElementById('OGthor-token');
let OGThorIcon = '<img id="OGThor-icon-selected" src="../OGThorWhite.svg" alt="Token">'
let OGThorName = 'OG THOR'
let iconButton = document.getElementById('icon-button-dropdown');
let nameButton = document.getElementById('name-button-dropdown');
let inputToken = document.getElementById('input-token');
let inputShares = document.getElementById('input-shares');
inputShares.disabled = true;
inputToken.disabled = true;
// Left / remaining
let remainingContainer = document.getElementById('mintingInput-remaining-container');
let remainingLeftNumber = document.getElementById('left-leftNumber-paragraph');
let remainingRightNumber = document.getElementById('left-rightNumber-paragraph');
remainingContainer.style.opacity = "0";
remainingLeftNumber.style.opacity = "0";
remainingRightNumber.style.opacity = "0";
let baseAvaxRemaining
avaxTokenIcon.addEventListener('click', async () => { // Select shares
    inputToken.value = "";
    inputShares.value = "";
    displayTokenGrid.innerHTML = "";
    iconButton.innerHTML = avaxIcon;
    nameButton.innerHTML = avaxName;

    remainingContainer.style.opacity = "1";

    // Calculate max possiblle user value
    baseAvaxRemaining = Math.floor(signerAvalancheBalance / shareCost);
    remainingRightNumber.innerHTML = baseAvaxRemaining;
    remainingRightNumber.style.opacity = "1";

    // Silent token amount
    inputToken.disabled = true;
    inputShares.disabled = false;

    dropdownTokenContainer.style.display = "none";
})
thorTokenIcon.addEventListener('click', async () => { // Select shares
    displayTokenGrid.innerHTML = "";
    inputToken.value = "";
    inputShares.value = "";
    iconButton.innerHTML = thorIcon;
    nameButton.innerHTML = thorName;

    // Add approve token for contract
    await checkApproval20(_thorIERC20, 0);

    remainingContainer.style.opacity = "1";

    // Calculate max possiblle user value, constraints: thor balance user, deposit for thortoken
    let thorTokenAvaxDeposit = Number((await _AvalancheValidatorViewTokenFacet.fetchTokenPrice(thorToken)).toString());
    let maxDepositShare = Math.floor(thorTokenAvaxDeposit / shareCost);
    let maxThorTokenShares = Math.floor((signerThorBalance / (shareCost / thorPrice)));
    baseAvaxRemaining = maxDepositShare > maxThorTokenShares ? maxThorTokenShares : maxDepositShare;
    remainingRightNumber.innerHTML = baseAvaxRemaining;
    remainingRightNumber.style.opacity = "1";

    // Silent token amount
    inputToken.disabled = true;
    inputShares.disabled = false;

    dropdownTokenContainer.style.display = "none";
})
let OGOdinDocumentInstances;
OGOdinTokenIcon.addEventListener('click', async () => { // Select tokens
    inputToken.value = "";
    inputShares.value = "";
    iconButton.innerHTML = OGOdinIcon;
    nameButton.innerHTML = OGOdinName;

    // Add approve token for contract
    await checkApproval721(_odinIERC721);

    // Display all NFTs under the page
    await addOGOdinNFTs();

    OGOdinDocumentInstances = document.getElementsByClassName('token-grid');

    dropdownTokenContainer.style.display = "none";

    let thorTokenAvaxDeposit = Number((await _AvalancheValidatorViewTokenFacet.fetchTokenPrice(odinNFT)).toString());
    let nftOwner = OGOdinDocumentInstances.length;
    let maxAvaxDepositNFTs = Math.floor(thorTokenAvaxDeposit / (odinPriceNFT * 1e18));
    baseAvaxRemaining = maxAvaxDepositNFTs > nftOwner ? nftOwner : maxAvaxDepositNFTs;
    remainingLeftNumber.innerHTML = baseAvaxRemaining;
    remainingContainer.style.opacity = "1";
    remainingLeftNumber.style.opacity = "1";

    // Silent shares amount
    inputShares.disabled = true;
    inputToken.disabled = false;

    await addListener(OGOdinDocumentInstances, odinPriceNFT);
})
let OGThorDocumentInstances;
OGThorTokenIcon.addEventListener('click', async () => { // Select tokens
    inputToken.value = "";
    inputShares.value = "";
    iconButton.innerHTML = OGThorIcon;
    nameButton.innerHTML = OGThorName;

    // Add approve token for contract
    await checkApproval721(_thorIERC721);

    // Display all NFTs under the page
    await addOGThorNFTs();

    OGThorDocumentInstances = document.getElementsByClassName('token-grid');

    dropdownTokenContainer.style.display = "none";

    let thorTokenAvaxDeposit = Number((await _AvalancheValidatorViewTokenFacet.fetchTokenPrice(thorNFT)).toString());
    let nftOwner = OGThorDocumentInstances.length;
    let maxAvaxDepositNFTs = Math.floor(thorTokenAvaxDeposit / (thorPriceNFT * 1e18));
    baseAvaxRemaining = maxAvaxDepositNFTs > nftOwner ? nftOwner : maxAvaxDepositNFTs;
    remainingLeftNumber.innerHTML = baseAvaxRemaining;
    remainingContainer.style.opacity = "1";
    remainingLeftNumber.style.opacity = "1";

    // Silent shares amount
    inputShares.disabled = true;
    inputToken = false;

    await addListener(OGThorDocumentInstances, thorPriceNFT);
})

// inputs logic
inputShares.addEventListener('input', async () => {
    if (nameButton.innerHTML == avaxName && inputShares.value != "") { // calculate value := shares * shareCost
        if (shareCost * Number(inputShares.value) <= signerAvalancheBalance) {
            inputToken.value = "" + shareCost * Number(inputShares.value) / 1e18;
            remainingRightNumber.innerHTML = Number(baseAvaxRemaining) - Number(inputShares.value);
        } else {
            inputShares.value = ""; 
        }
    } else if (nameButton.innerHTML == thorName && inputShares.value != "") { // calculate value := shares * shareCost * price, where price = THOR / AVAX
        // add liquidity as if condition
        if ((shareCost * Number(inputShares.value)) / thorPrice <= signerThorBalance) {
            inputToken.value = "" + (shareCost * Number(inputShares.value) * thorPrice / 1e18);
            remainingRightNumber.innerHTML = Number(baseAvaxRemaining) - Number(inputShares.value);

            await checkApproval20(_thorIERC20, inputToken.placeholder);
        } else {
            inputShares.value = ""; 
        }
    }
});
inputToken.addEventListener('input', async () => {
    let e = document.getElementsByClassName('token-grid');

    if (nameButton.innerHTML == OGOdinName && inputToken.value <= Number(baseAvaxRemaining) && inputToken.value != "") { // calculate amount := tokens * price / shareCost, where price = AVAX / OGODIN
        // add liquidity as if condition
        // Select nfts and related IDs from start to finish
        if (inputToken.value <= NFTs.length) {
            for (let i = 0; i < inputToken.value; i++) {
                if (NFTs[i].selected == false) {
                    console.log("Selected: " + i)
                    e[i].setAttribute('id', 'token-selected');
                    NFTs[i].selected = true;
                }
            }
            for (let i = inputToken.value; i < NFTs.length - 1; i++) {
                console.log("De Selected: " + i)
                if (NFTs[i].selected == true) {
                    e[i].setAttribute('id', '');
                    NFTs[i].selected = false;
                }
            }

            // Calculate shares everytime it changes
            inputShares.value = Math.floor(odinPriceNFT / shareCost) * inputToken.value;
            remainingLeftNumber.innerHTML = Number(baseAvaxRemaining) - Number(inputToken.value);
        }

    } else if (nameButton.innerHTML == OGThorName && inputToken.value <= Number(baseAvaxRemaining) && inputToken.value != "") { // calculate amount := tokens * price / shareCost, where price = AVAX / OGTHOR
        // add liquidity as if condition
        // Select nfts and related IDs from start to finish
        if (inputToken.value <= NFTs.length) {
            for (let i = 0; i < inputToken.value; i++) {
                if (NFTs[i].selected == false) {
                    console.log("Selected: " + i)
                    e[i].setAttribute('id', 'token-selected');
                    NFTs[i].selected = true;
                }
            }
            for (let i = inputToken.value; i < NFTs.length - 1; i++) {
                console.log("De Selected: " + i)
                if (NFTs[i].selected == true) {
                    e[i].setAttribute('id', '');
                    NFTs[i].selected = false;
                }
            }

            // Calculate shares everytime it changes
            inputShares.value = Math.floor(thorPriceNFT / shareCost) * inputToken.value;
            remainingLeftNumber.innerHTML = Number(baseAvaxRemaining) - Number(inputToken.value);
        }
    }
})
// Add listener to manually selected NFTs
async function addListener(_elements, priceNFT) { // Add array of NFTs which are objects w/ id and bool selected then at the end filter selected and send related to the contract
    for (const e of _elements) {
        e.addEventListener('click', () => {
            // Get array element
            let NFTelement = NFTs.filter(x => {
                return x.id == e.nonce
            })
            // Apply status
            if (NFTelement[0].selected == false && Number(inputToken.value) + 1 <= Number(baseAvaxRemaining)) {
                e.setAttribute('id', 'token-selected');
                NFTelement[0].selected = true;
                inputToken.value = Number(inputToken.value) + 1;
                inputShares.value = Math.floor(priceNFT / shareCost) * Number(inputToken.value);
                remainingLeftNumber.innerHTML = Number(baseAvaxRemaining) - Number(inputToken.value)
            } else if (NFTelement[0].selected == true) {
                e.setAttribute('id', '');
                NFTelement[0].selected = false;
                inputToken.value = Number(inputToken.value) - 1;
                inputShares.value = Math.floor(priceNFT / shareCost) * Number(inputToken.value);
                remainingLeftNumber.innerHTML = Number(baseAvaxRemaining) - Number(inputToken.value)
            }
        })
    }
}

// Check if token is approved
async function checkApproval721(contract) {
    let approved = (await contract.isApprovedForAll(await signer.getAddress(), diamondAddress)).toString()
    if (approved === 'false') { // Allow
        buttonInput.innerHTML = 'ALLOW'
    } else { // Active
        buttonInput.innerHTML = 'OWN'
    }
}
async function checkApproval20(contract, amount) {
    let approvedAmount = Number((await contract.allowance(await signer.getAddress(), diamondAddress)).toString())
    if (approvedAmount == 0 || approvedAmount < amount) { // Allow
        buttonInput.innerHTML = 'ALLOW'
    } else { // Active
        buttonInput.innerHTML = 'OWN'
    }
}

// Get Collection with Moralis API
let response;
class NFT {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.selected = false;
    }
}
let NFTs = [];
let displayTokenGrid = document.getElementById("display-tokens-grid");
async function addOGThorNFTs() {
    NFTs = [];
    displayTokenGrid.innerHTML = "";
    // GET request to server
    // xhr.open("GET", baseURL + "/Moralis/WalletNFTs/AVALANCHE/" + (await signer.getAddress()).toString() + "/" + thorNFT, false);
    xhr.open("GET", baseURL + "/Moralis/WalletNFTs/AVALANCHE/0x0658B45130B69aaD47A01a3a898bE5EEDEcb24C3/0x825189515d0A7756436F0eFb6e4bE5A5aF87e21D", false);
    // send the Http request
    xhr.send(null);
    // Get response
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log("Correct server response")
        response = JSON.parse(xhr.response);
        await response.forEach((e) => {
            NFTs.push(new NFT(e.token_id, e.metadata.split('"')[3]));
            let display = "<div class='token-grid' nonce='"+e.token_id+"'><div class='token-image'><img src='" + OGThorImage + "' alt='Image token'></div><div class='token-label'><p class='token-name'><strong>"+e.metadata.split('"')[3]+"</strong></p><p><strong>"+e.token_id+"</strong></p></div></div>"
            displayTokenGrid.innerHTML += display;
        })
    }
}
async function addOGOdinNFTs() {
    NFTs = [];
    displayTokenGrid.innerHTML = "";
    // GET request to server
    // xhr.open("GET", baseURL + "/Moralis/WalletNFTs/AVALANCHE/" + (await signer.getAddress()).toString() + "/" + odinNFT, false);
    xhr.open("GET", baseURL + "/Moralis/WalletNFTs/AVALANCHE/0x0658B45130B69aaD47A01a3a898bE5EEDEcb24C3/0x7325e3564b89968d102b3261189ea44c0f5f1a8e", false);
    // send the Http request
    xhr.send(null);
    // Get response
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log("Correct server response")
        response = JSON.parse(xhr.response);
        await response.forEach((e) => {
            NFTs.push(new NFT(e.token_id, e.metadata.split('"')[3]));
            let display = "<div class='token-grid' nonce='"+e.token_id+"'><div class='token-image'><img src='" + OGOdinImage + "' alt='Image token'></div><div class='token-label'><p class='token-name'><strong>"+e.metadata.split('"')[3]+"</strong></p><p><strong>"+e.token_id+"</strong></p></div></div>"
            displayTokenGrid.innerHTML += display;
        })
    }
}

// mint new tokens
let buttonInput = document.getElementById("button-mint");
buttonInput.addEventListener("click", async () => {
    messageContainer.classList.remove('visibleMessage');

    // If need allowanche
    if (buttonInput.innerHTML == 'ALLOW') {
        if (nameButton.innerHTML == thorName) {
            try {
                let tx = await signer_thorIERC20.approve(diamondAddress, ethers.utils.parseEther(inputToken.value));
                let recepit = await tx.wait(1);

                messageHeader.innerHTML = "Allowance Setted";
                messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                setTimeout(() => {
                    messageContainer.classList.add('visibleMessage');
                }, 500);
            } catch (err) {
                messageHeader.innerHTML = "Allow Error";
                messageBody.innerHTML = err;
                setTimeout(() => {
                    messageContainer.classList.add('visibleMessage');
                }, 500);
            }

            await checkApproval20(_thorIERC20, ethers.utils.parseEther(inputToken.placeholder));
        } else if (nameButton.innerHTML == OGThorName) {
            try {
                let tx = await signer_thorIERC721.setApprovalForAll(diamondAddress, true);
                let recepit = await tx.wait(1);

                messageHeader.innerHTML = "Allowance Setted";
                messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                setTimeout(() => {
                    messageContainer.classList.add('visibleMessage');
                }, 500);
            } catch (err) {
                messageHeader.innerHTML = "Allow Error";
                messageBody.innerHTML = err;
                setTimeout(() => {
                    messageContainer.classList.add('visibleMessage');
                }, 500);
            }

            await checkApproval721(thorNFT);
        } else if (nameButton.innerHTML == OGOdinName) {
            try {
                let tx = await signer_odinIERC721.setApprovalForAll(diamondAddress, true);
                let recepit = await tx.wait(1);

                messageHeader.innerHTML = "Allowance Setted";
                messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                setTimeout(() => {
                    messageContainer.classList.add('visibleMessage');
                }, 500);
            } catch (err) {
                messageHeader.innerHTML = "Allow Error";
                messageBody.innerHTML = err;
                setTimeout(() => {
                    messageContainer.classList.add('visibleMessage');
                }, 500);
            }

            await checkApproval721(odinNFT);
        }
    } else if (buttonInput.innerHTML == 'OWN') {
        // Adjust mint for selection
        if (nameButton.innerHTML == avaxName) {
            if (0 < inputShares.value) {
                let _shareCost = ((await _AvalancheValidatorSettersAndGettersFacet.getShareCost()).toString() / 1e18);
                let _value = ethers.utils.parseEther("" + (inputShares.value * _shareCost).toFixed(10));

                try {
                    let txnMint = await signer_AvalancheValidatorDepositFacet.mintAvalancheValidatorShareAVAX(inputShares.value, "0x", { value: _value, gasLimit: 1_000_000 });
                    let recepit = await txnMint.wait(1);
    
                    messageHeader.innerHTML = "Succesfull Mint";
                    messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                } catch (err) {
                    messageHeader.innerHTML = "Mint Error";
                    messageBody.innerHTML = err;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                }
        
                await whiteAvaxLogoUpdate();
                await displaySupply();
                await displayHealth();
            }
        } else if (nameButton.innerHTML == thorName) {
            if (0 < inputShares.value) {
                try {
                    let txnMint = await signer_AvalancheValidatorTokenFacet.mintAvalancheValidatorShareTokenERC20(thorToken, inputShares.value, {gasLimit: 1_000_000 });
                    let recepit = await txnMint.wait(1);
    
                    messageHeader.innerHTML = "Succesfull Mint";
                    messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                } catch (err) {
                    messageHeader.innerHTML = "Mint Error";
                    messageBody.innerHTML = err;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                }
        
                await whiteAvaxLogoUpdate();
                await displaySupply();
                await displayHealth();
            }
        } else if (nameButton.innerHTML == OGOdinName) {
            console.log (nameButton.innerHTML)

            let IDs = []
    
            for (var element in NFTs) {
                if (NFTs[element].selected == true) {
                    IDs.push(Number(NFTs[element].id))
                }
            }

            console.log(IDs)
    
            if (IDs.length > 0) {
                try {
                    let txnMint = await signer_AvalancheValidatorTokenFacet.mintAvalancheValidatorShareTokenERC721(odinNFT, IDs, {gasLimit: 1_000_000 });
                    let recepit = await txnMint.wait(1);
    
                    messageHeader.innerHTML = "Succesfull Mint";
                    messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                } catch (err) {
                    messageHeader.innerHTML = "Mint Error";
                    messageBody.innerHTML = err;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                }
        
                await whiteAvaxLogoUpdate();
                await displaySupply();
                await displayHealth();
            }
        } else if (nameButton.innerHTML == OGThorName) {
            let IDs = []
    
            for (var element in NFTs) {
                if (NFTs[element].selected == true) {
                    IDs.push(Number(NFTs[element].id))
                }
            }
    
            if (IDs.length > 0) {
                try {
                    let txnMint = await signer_AvalancheValidatorTokenFacet.mintAvalancheValidatorShareTokenERC721(thorNFT, IDs, {gasLimit: 1_000_000 });
                    let recepit = await txnMint.wait(1);
    
                    messageHeader.innerHTML = "Succesfull Mint";
                    messageBody.innerHTML = "Transaction hash: " + recepit.transactionHash;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                } catch (err) {
                    messageHeader.innerHTML = "Mint Error";
                    messageBody.innerHTML = err;
                    setTimeout(() => {
                        messageContainer.classList.add('visibleMessage');
                    }, 500);
                }
        
                await whiteAvaxLogoUpdate();
                await displaySupply();
                await displayHealth();
            }
        }
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
let strokeVisualizers1 = document.getElementsByClassName("stroke-lifetimeVisualizer-level1");
let strokeVisualizers2 = document.getElementsByClassName("stroke-lifetimeVisualizer-level2");
let strokeVisualizers3 = document.getElementsByClassName("stroke-lifetimeVisualizer-level3");
let strokeVisualizers4 = document.getElementsByClassName("stroke-lifetimeVisualizer-level4");
let strokeVisualizers5 = document.getElementsByClassName("stroke-lifetimeVisualizer-level5");
async function displayHealth() {
    console.log('Refreshing health');
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

    let healthCoefficient = 0;
    for (let i = 0; i < health.length; ++i) {
        if (i == 0 && typeof(health[i]) == typeof(0) && health[i] > 0) {
            healthCoefficient = (health[i] / 5).toFixed(0);
            for (let n = 0; n < healthCoefficient; ++n) {
                strokeVisualizers1[n].setAttribute('stroke', 'rgb(215, 80, 74)');
            }
        }  else if (i == 1 && typeof(health[i]) == typeof(0) && health[i] > 0) {
            healthCoefficient = (health[i] / 5).toFixed(0);
            for (let n = 0; n < healthCoefficient; ++n) {
                strokeVisualizers2[n].setAttribute('stroke', 'rgb(215, 80, 74)');
            }
        }  else if (i == 2 && typeof(health[i]) == typeof(0) && health[i] > 0) {
            healthCoefficient = (health[i] / 5).toFixed(0);
            for (let n = 0; n < healthCoefficient; ++n) {
                strokeVisualizers3[n].setAttribute('stroke', 'rgb(215, 80, 74)');
            }
        }  else if (i == 3 && typeof(health[i]) == typeof(0) && health[i] > 0) {
            healthCoefficient = (health[i] / 5).toFixed(0);
            for (let n = 0; n < healthCoefficient; ++n) {
                strokeVisualizers4[n].setAttribute('stroke', 'rgb(215, 80, 74)');
            }
        }  else if (i == 4 && typeof(health[i]) == typeof(0) && health[i] > 0) {
            healthCoefficient = (health[i] / 5).toFixed(0);
            for (let n = 0; n < healthCoefficient; ++n) {
                strokeVisualizers5[n].setAttribute('stroke', 'rgb(215, 80, 74)');
            }
            console.log('4 level visuallizer');
        }
    }

    healthLVL1.innerHTML = health[0] + "d";
    healthLVL2.innerHTML = health[1] + "d";
    healthLVL3.innerHTML = health[2] + "d";
    healthLVL4.innerHTML = health[3] + "d";
    healthLVL5.innerHTML = health[4] + "d";
}

// get and display rewards
let rewardLVL1 = document.getElementById("rewards-level1");
let rewardLVL2 = document.getElementById("rewards-level2");
let rewardLVL3 = document.getElementById("rewards-level3");
let rewardLVL4 = document.getElementById("rewards-level4");
let rewardLVL5 = document.getElementById("rewards-level5");
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
    messageContainer.classList.remove('visibleMessage');
    let rewardsCheckboxes = document.getElementsByClassName('checkbox-rewards');
    let rewardIDs = [];

    for (let i = 0; i < rewardsCheckboxes.length; ++i) {
        if (rewardsCheckboxes[i].checked) {
            rewardIDs.push(rewardsCheckboxes[i].name);
        }
    }

    if (!(rewardIDs == 0)) {
        try {
            let tx = await signer_AvalancheValidatorFacet.collectRewards(rewardIDs, { gasLimit: 1_000_000 });
            await tx.wait(1);
            await displayRewards();
        } catch (err) {
            messageHeader.innerHTML = "Rewards Error";
            messageBody.innerHTML = "" + err;
            setTimeout(() => {
                messageContainer.classList.add('visibleMessage');
            }, 500);
        }
    } else {
        messageHeader.innerHTML = "No Rewards Selected";
        messageBody.innerHTML = "Select a level to collect rewards from.";
        setTimeout(() => {
            messageContainer.classList.add('visibleMessage');
        }, 500);
    }
})

// refresh health
let healthIcon = document.getElementById("healthIcon");
healthIcon.addEventListener('click', async () => {
    messageContainer.classList.remove('visibleMessage');
    let healthCheckboxes = document.getElementsByClassName('checkbox-health');
    let healthIDs = [];

    for (let i = 0; i < healthCheckboxes.length; ++i) {
        if (healthCheckboxes[i].checked) {
            healthIDs.push(healthCheckboxes[i].name);
        }
    }

    if (!(healthIDs == 0)) {
        try {
            let tx = await signer_AvalancheValidatorHealthAndUpgradesFacet.refreshAvalancheValidatorSharesHealth(healthIDs, { gasLimit: 1_000_000 });
            await tx.wait(1);
            await displayHealth();
        } catch (err) {
            messageHeader.innerHTML = "Health Error";
            messageBody.innerHTML = "" + err;
            setTimeout(() => {
                messageContainer.classList.add('visibleMessage');
            }, 500);
        }
    } else {
        messageHeader.innerHTML = "No Rewards Selected";
        messageBody.innerHTML = "Select a level to refresh its health.";
        setTimeout(() => {
            messageContainer.classList.add('visibleMessage');
        }, 500);
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
    if (signer != undefined) {
        console.log('timeout');
        await whiteAvaxLogoUpdate();
        await displayHealth();
        await displayRewards();
    }
}, 100); // 10s
setTimeout(async () => {
    if (signer != undefined) {
        await displayHealth();
    }
}, 120_000); // 2min