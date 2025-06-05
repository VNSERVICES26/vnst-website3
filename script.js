// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
        this.querySelector('i').classList.toggle('fa-bars');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });
}

// Image Animations
function animateImages() {
    const images = document.querySelectorAll('.animated-image');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'all 0.8s ease-out';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(img);
    });
}

// Swap Widget Configuration
const CONFIG = {
    mainnet: {
        vnstSwapAddress: "0x8FD96c769308bCf01A1F5E9f93805c552fF80713",
        vnstTokenAddress: "0xF9Bbb00436B384b57A52D1DfeA8Ca43fC7F11527",
        usdtTokenAddress: "0x55d398326f99059fF775485246999027B3197955",
        chainId: "0x38", // BSC Mainnet
        rpcUrl: "https://bsc-dataseed.binance.org/"
    }
};

let web3;
let swapContract;
let vnstToken;
let usdtToken;
let currentAccount = null;
let minBuyAmount = 0;
let vnstDecimals = 18;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    animateImages();
    
    // Buy VNST Modal
    const modal = document.getElementById("buyVNSTModal");
    const btn = document.getElementById("buyVNSTBtn");
    const span = document.getElementsByClassName("close")[0];

    if (btn && modal && span) {
        btn.onclick = function() {
            modal.style.display = "block";
            initSwapWidget();
        }

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
});

// Wallet Connection Logic
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletOptions = document.querySelector('.wallet-options');
const walletInfo = document.getElementById('walletInfo');

if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', function() {
        walletOptions.classList.toggle('hidden');
    });
}

// Handle wallet selection
document.querySelectorAll('.wallet-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const walletType = this.getAttribute('data-wallet');
        try {
            await connectWallet(walletType);
            walletOptions.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            connectWalletBtn.textContent = 'Connected';
        } catch (error) {
            showMessage(`Error connecting ${walletType}: ${error.message}`, 'error');
        }
    });
});

// Connect Wallet
async function connectWallet(walletType) {
    if (!window.ethereum && walletType === 'metamask') {
        showMessage('Please install MetaMask extension', 'error');
        return;
    }

    try {
        let provider;
        
        if (walletType === 'metamask') {
            provider = window.ethereum;
        } else if (walletType === 'trustwallet') {
            provider = window.ethereum;
        } else if (walletType === 'safepal') {
            provider = window.ethereum;
        } else {
            provider = window.ethereum;
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        // Update wallet info display
        document.getElementById('walletAddress').textContent = shortenAddress(currentAccount);
        
        // Get USDT balance
        const usdtDecimals = await usdtToken.methods.decimals().call();
        const balance = await usdtToken.methods.balanceOf(currentAccount).call();
        document.getElementById('usdtBalance').textContent = formatUnits(balance, usdtDecimals) + ' USDT';
        
        setupWalletEvents();
        showMessage('Wallet connected successfully', 'success');
        
        return true;
    } catch (error) {
        console.error('Wallet connection error:', error);
        throw error;
    }
}

// Initialize Swap Widget
async function initSwapWidget() {
    try {
        const config = CONFIG.mainnet;
        web3 = new Web3(window.ethereum || config.rpcUrl);
        
        // ABI definitions
        const swapABI = [{"inputs":[{"internalType":"address","name":"_vnstToken","type":"address"},{"internalType":"address","name":"_usdtToken","type":"address"},{"internalType":"address","name":"_sellerWallet","type":"address"},{"internalType":"address","name":"_usdtReceiver","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"current","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"required","type":"uint256"}],"name":"BuyerAllowanceLow","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMinBuy","type":"uint256"}],"name":"MinBuyUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newReceiver","type":"address"}],"name":"ReceiverUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"current","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"required","type":"uint256"}],"name":"SellerAllowanceLow","type":"event"},{"anonymous":false,"inputs":[],"name":"SwapPaused","type":"event"},{"anonymous":false,"inputs":[],"name":"SwapResumed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"usdtAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"vnstAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rateUsed","type":"uint256"}],"name":"TokensPurchased","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"uint256","name":"vnstAmount","type":"uint256"}],"name":"buyVNST","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"vnstAmount","type":"uint256"}],"name":"calculateUsdtRequired","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"buyer","type":"address"}],"name":"getBuyerAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPricePerVNST","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"vnstAmount","type":"uint256"}],"name":"getQuote","outputs":[{"internalType":"uint256","name":"usdtRequired","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSellerAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"buyer","type":"address"}],"name":"isApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isSellerApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minBuy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauseSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"resumeSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"fromDecimals","type":"uint8"},{"internalType":"uint8","name":"toDecimals","type":"uint8"}],"name":"scaleDecimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"sellerWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"totalPurchased","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newMinBuy","type":"uint256"}],"name":"updateMinBuy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"updatePrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newReceiver","type":"address"}],"name":"updateReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdtDecimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"usdtReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"usdtToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vnstDecimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vnstPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vnstToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
        const tokenABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

        swapContract = new web3.eth.Contract(swapABI, config.vnstSwapAddress);
        vnstToken = new web3.eth.Contract(tokenABI, config.vnstTokenAddress);
        usdtToken = new web3.eth.Contract(tokenABI, config.usdtTokenAddress);
        
        minBuyAmount = await swapContract.methods.minBuy().call();
        vnstDecimals = await vnstToken.methods.decimals().call();
        
        document.getElementById('minBuyAmount').textContent = formatUnits(minBuyAmount, vnstDecimals) + ' VNST';
        
        await loadContractData();
        setupEventListeners();
        
        // Check if wallet is already connected
        await checkWalletConnection();
    } catch (error) {
        showMessage(`Error initializing swap widget: ${error.message}`, 'error');
    }
}

// Load Contract Data
async function loadContractData() {
    try {
        const price = await swapContract.methods.getPricePerVNST().call();
        document.getElementById('vnstPrice').textContent = `${formatUnits(price, 18)} USDT`;
        
        const sellerWallet = await swapContract.methods.sellerWallet().call();
        const availableVNST = await vnstToken.methods.balanceOf(sellerWallet).call();
        document.getElementById('availableVNST').textContent = `${formatUnits(availableVNST, vnstDecimals)} VNST`;
        
        document.getElementById('vnstContract').textContent = await swapContract.methods.vnstToken().call();
    } catch (error) {
        showMessage(`Error loading contract data: ${error.message}`, 'error');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const approveBtn = document.getElementById('approveBtn');
    const buyBtn = document.getElementById('buyBtn');
    const copyBtn = document.getElementById('copyContractBtn');
    const vnstAmountInput = document.getElementById('vnstAmount');

    if (approveBtn) approveBtn.addEventListener('click', approveUSDT);
    if (buyBtn) buyBtn.addEventListener('click', buyVNST);
    if (copyBtn) copyBtn.addEventListener('click', copyContractAddress);
    if (vnstAmountInput) vnstAmountInput.addEventListener('input', calculateQuote);
}

// Check Wallet Connection
async function checkWalletConnection() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                updateWalletInfo();
                setupWalletEvents();
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
        }
    }
}

// Update Wallet Info
async function updateWalletInfo() {
    if (!currentAccount) return;
    
    try {
        const usdtDecimals = await usdtToken.methods.decimals().call();
        const balance = await usdtToken.methods.balanceOf(currentAccount).call();
        
        document.getElementById('walletAddress').textContent = shortenAddress(currentAccount);
        document.getElementById('usdtBalance').textContent = formatUnits(balance, usdtDecimals);
        document.getElementById('walletInfo').classList.remove('hidden');
        
        document.getElementById('connectWalletBtn').textContent = 'Connected';
    } catch (error) {
        console.error('Error updating wallet info:', error);
    }
}

// Setup Wallet Events
function setupWalletEvents() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            currentAccount = accounts.length > 0 ? accounts[0] : null;
            updateWalletInfo();
        });
        
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });

        // Handle disconnection
        window.ethereum.on('disconnect', (error) => {
            console.log('Wallet disconnected:', error);
            currentAccount = null;
            updateWalletInfo();
        });
    }
}

// Calculate Quote
async function calculateQuote() {
    try {
        const vnstAmountInput = document.getElementById('vnstAmount').value;
        
        if (!vnstAmountInput || isNaN(vnstAmountInput)) {
            document.getElementById('quoteResult').classList.add('hidden');
            return;
        }
        
        const vnstAmount = toTokenUnits(vnstAmountInput);
        const minBuy = web3.utils.toBN(minBuyAmount);
        
        if (vnstAmount.lt(minBuy)) {
            document.getElementById('quoteResult').classList.add('hidden');
            return;
        }
        
        const usdtAmount = await swapContract.methods.getQuote(vnstAmount.toString()).call();
        const usdtDecimals = await usdtToken.methods.decimals().call();
        
        document.getElementById('usdtAmount').textContent = formatUnits(usdtAmount, usdtDecimals);
        document.getElementById('quoteResult').classList.remove('hidden');
        
        const isApproved = await checkApprovalStatus(vnstAmount.toString());
        document.getElementById('approveBtn').disabled = isApproved;
        document.getElementById('buyBtn').disabled = !isApproved;
        
    } catch (error) {
        console.error('Quote calculation error:', error);
        document.getElementById('quoteResult').classList.add('hidden');
    }
}

// Check Approval Status
async function checkApprovalStatus(vnstAmount) {
    try {
        if (!vnstAmount || web3.utils.toBN(vnstAmount).lt(web3.utils.toBN(minBuyAmount))) {
            return false;
        }
        
        const requiredAllowance = await swapContract.methods.getQuote(vnstAmount).call();
        const currentAllowance = await usdtToken.methods.allowance(
            currentAccount, 
            CONFIG.mainnet.vnstSwapAddress
        ).call();
        
        return web3.utils.toBN(currentAllowance).gte(web3.utils.toBN(requiredAllowance));
    } catch (error) {
        console.error('Approval check error:', error);
        return false;
    }
}

// Approve USDT
async function approveUSDT() {
    try {
        const vnstAmountInput = document.getElementById('vnstAmount').value;
        if (!vnstAmountInput || isNaN(vnstAmountInput)) {
            showMessage('Please enter a valid VNST amount', 'error');
            return;
        }
        
        const vnstAmount = toTokenUnits(vnstAmountInput);
        
        if (vnstAmount.lt(web3.utils.toBN(minBuyAmount))) {
            showMessage(`Minimum purchase is ${formatUnits(minBuyAmount, vnstDecimals)} VNST`, 'error');
            return;
        }
        
        const requiredAllowance = await swapContract.methods.getQuote(vnstAmount.toString()).call();
        
        await handleTransaction(
            usdtToken.methods.approve(
                CONFIG.mainnet.vnstSwapAddress,
                requiredAllowance
            ).send({ from: currentAccount }),
            'USDT approved successfully!'
        );
        
        document.getElementById('approveBtn').disabled = true;
        document.getElementById('buyBtn').disabled = false;
    } catch (error) {
        if (error.code === 4001) {
            showMessage('User rejected transaction', 'error');
        } else {
            showMessage(`Approval failed: ${error.message}`, 'error');
        }
    }
}

// Buy VNST
async function buyVNST() {
    try {
        const vnstAmountInput = document.getElementById('vnstAmount').value;
        if (!vnstAmountInput || isNaN(vnstAmountInput)) {
            showMessage('Please enter a valid VNST amount', 'error');
            return;
        }
        
        const vnstAmount = toTokenUnits(vnstAmountInput);
        
        if (vnstAmount.lt(web3.utils.toBN(minBuyAmount))) {
            showMessage(`Minimum purchase is ${formatUnits(minBuyAmount, vnstDecimals)} VNST`, 'error');
            return;
        }
        
        await handleTransaction(
            swapContract.methods.buyVNST(vnstAmount.toString()).send({ from: currentAccount }),
            'VNST purchased successfully!'
        );
        
        await loadContractData();
    } catch (error) {
        if (error.code === 4001) {
            showMessage('User rejected transaction', 'error');
        } else {
            showMessage(`Purchase failed: ${error.message}`, 'error');
        }
    }
}

// Handle Transaction
async function handleTransaction(transactionPromise, successMessage) {
    try {
        showMessage('Processing transaction...', 'status');
        await transactionPromise;
        showMessage(successMessage, 'success');
    } catch (error) {
        throw error;
    }
}

// Copy Contract Address
function copyContractAddress() {
    const address = document.getElementById('vnstContract').textContent;
    navigator.clipboard.writeText(address);
    showMessage('Contract address copied!', 'success');
}

// Helper Functions
function toTokenUnits(amount, decimals = 18) {
    return web3.utils.toBN(amount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
}

function formatUnits(value, decimals) {
    return (value / 10 ** decimals).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
    });
}

function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
}

function showMessage(message, type = 'status') {
    const statusDiv = document.getElementById('statusMessages');
    if (!statusDiv) return;
    
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add(`${type}-message`);
    statusDiv.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}
