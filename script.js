document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Wallet Modal
    const walletModal = document.getElementById('walletModal');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const closeModal = document.querySelectorAll('.close-modal');
    
    connectWalletBtn.addEventListener('click', () => {
        walletModal.style.display = 'flex';
    });
    
    // Buy VNST Modal
    const buyVnstModal = document.getElementById('buyVnstModal');
    const buyVnstBtn = document.getElementById('buyVnstBtn');
    
    buyVnstBtn.addEventListener('click', (e) => {
        e.preventDefault();
        buyVnstModal.style.display = 'flex';
    });
    
    // Close modals
    closeModal.forEach(btn => {
        btn.addEventListener('click', () => {
            walletModal.style.display = 'none';
            buyVnstModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
        if (e.target === buyVnstModal) {
            buyVnstModal.style.display = 'none';
        }
    });
    
    // Wallet selection
    document.querySelectorAll('.wallet-option, .modal-wallet-option').forEach(option => {
        option.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            alert(`Connecting to ${walletType}...`);
            // Here you would add actual wallet connection logic
            walletModal.style.display = 'none';
            connectWalletBtn.textContent = `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Connected`;
        });
    });
    
    // Buy VNST functionality
    const buyAmount = document.getElementById('buyAmount');
    const vnstAmount = document.getElementById('vnstAmount');
    const confirmBuyBtn = document.getElementById('confirmBuyBtn');
    
    buyAmount.addEventListener('input', function() {
        if (this.value && !isNaN(this.value)) {
            // Simple conversion for demo (1 ETH = 1000 VNST)
            const rate = 1000;
            vnstAmount.value = (parseFloat(this.value) * rate).toFixed(2);
        } else {
            vnstAmount.value = '';
        }
    });
    
    confirmBuyBtn.addEventListener('click', function() {
        if (!buyAmount.value || isNaN(buyAmount.value)) {
            alert('Please enter a valid amount');
            return;
        }
        
        alert(`Successfully bought ${vnstAmount.value} VNST tokens!`);
        buyVnstModal.style.display = 'none';
        buyAmount.value = '';
        vnstAmount.value = '';
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Swap functionality
    const swapBtn = document.querySelector('.swap-btn');
    if (swapBtn) {
        swapBtn.addEventListener('click', function() {
            alert('Token swap functionality would be implemented here with Web3.js or Ethers.js');
        });
    }
});
