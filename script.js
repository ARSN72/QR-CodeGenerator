// DOM Elements
const qrText = document.getElementById('qr-text');
const errorCorrection = document.getElementById('error-correction');
const foregroundColor = document.getElementById('foreground-color');
const backgroundColor = document.getElementById('background-color');
const logoInput = document.getElementById('logo-upload');
const qrCanvas = document.getElementById('qr-canvas');
const downloadBtn = document.getElementById('download-png');
const resetBtn = document.getElementById('reset-btn');
const generateBtn = document.getElementById('generate-btn');
const securityType = document.getElementById('security-type');
const passwordInput = document.getElementById('qr-password');
const expiryType = document.getElementById('expiry-type');
const expiryTime = document.getElementById('expiry-time');
const expiryUnit = document.getElementById('expiry-unit');
const maxScans = document.getElementById('max-scans');

// State variables
let qr = null;
let logo = null;
let securitySettings = {
    type: 'none',
    password: '',
    expiryType: 'time',
    expiryTime: 0,
    expiryUnit: 'minutes',
    maxScans: 0
};

// Initialize QR code
function initQR() {
    if (!qrText.value) {
        qrText.value = 'Enter text or URL';
    }
    
    qr = qrcode(0, errorCorrection.value);
    qr.addData(qrText.value);
    qr.make();
    updateQR();
}

// Update QR code
function updateQR() {
    if (!qr) return;
    
    const ctx = qrCanvas.getContext('2d');
    const size = qrCanvas.width;
    const moduleCount = qr.getModuleCount();
    const tileSize = size / moduleCount;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor.value;
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR code
    ctx.fillStyle = foregroundColor.value;
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }
    }
    
    // Add logo if present
    if (logo) {
        const logoSize = size * 0.2;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    }
}

// Reset QR code
function resetQR() {
    qrText.value = '';
    errorCorrection.value = 'M';
    foregroundColor.value = '#000000';
    backgroundColor.value = '#FFFFFF';
    logoInput.value = '';
    logo = null;
    securityType.value = 'none';
    passwordInput.value = '';
    expiryType.value = 'time';
    expiryTime.value = '30';
    expiryUnit.value = 'minutes';
    maxScans.value = '5';
    securitySettings = {
        type: 'none',
        password: '',
        expiryType: 'time',
        expiryTime: 30,
        expiryUnit: 'minutes',
        maxScans: 5
    };
    handleSecurityTypeChange();
    handleExpiryTypeChange();
    initQR();
}

// Handle security type change
function handleSecurityTypeChange() {
    const type = securityType.value;
    securitySettings.type = type;
    
    // Show/hide relevant inputs
    const passwordOptions = document.getElementById('password-options');
    const expiryOptions = document.getElementById('expiry-options');
    
    if (type === 'none') {
        passwordOptions.style.display = 'none';
        expiryOptions.style.display = 'none';
    } else if (type === 'password') {
        passwordOptions.style.display = 'block';
        expiryOptions.style.display = 'none';
    } else if (type === 'expiry') {
        passwordOptions.style.display = 'none';
        expiryOptions.style.display = 'block';
    } else if (type === 'both') {
        passwordOptions.style.display = 'block';
        expiryOptions.style.display = 'block';
    }
}

// Handle expiry type change
function handleExpiryTypeChange() {
    const type = expiryType.value;
    securitySettings.expiryType = type;
    
    // Show/hide relevant inputs
    const timeExpiry = document.getElementById('time-expiry');
    const scansExpiry = document.getElementById('scans-expiry');
    
    if (type === 'time') {
        timeExpiry.style.display = 'block';
        scansExpiry.style.display = 'none';
    } else if (type === 'scans') {
        timeExpiry.style.display = 'none';
        scansExpiry.style.display = 'block';
    } else if (type === 'both') {
        timeExpiry.style.display = 'block';
        scansExpiry.style.display = 'block';
    }
}

// Event Listeners
qrText.addEventListener('input', () => {
    if (qr) {
        qr.clearData();
        qr.addData(qrText.value || 'Enter text or URL');
        qr.make();
        updateQR();
    }
});

errorCorrection.addEventListener('change', () => {
    initQR();
});

foregroundColor.addEventListener('input', updateQR);
backgroundColor.addEventListener('input', updateQR);

logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            logo = new Image();
            logo.onload = updateQR;
            logo.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

passwordInput.addEventListener('input', () => {
    securitySettings.password = passwordInput.value;
});

expiryTime.addEventListener('input', () => {
    securitySettings.expiryTime = parseInt(expiryTime.value) || 0;
});

expiryUnit.addEventListener('change', () => {
    securitySettings.expiryUnit = expiryUnit.value;
});

maxScans.addEventListener('input', () => {
    securitySettings.maxScans = parseInt(maxScans.value) || 0;
});

generateBtn.addEventListener('click', () => {
    initQR();
});

resetBtn.addEventListener('click', resetQR);

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
});

securityType.addEventListener('change', handleSecurityTypeChange);
expiryType.addEventListener('change', handleExpiryTypeChange);

// Initialize on page load
window.addEventListener('load', () => {
    // Set canvas size
    qrCanvas.width = 300;
    qrCanvas.height = 300;
    
    initQR();
    handleSecurityTypeChange();
    handleExpiryTypeChange();
}); 