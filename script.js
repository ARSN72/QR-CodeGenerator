// DOM Elements
const qrText = document.getElementById('qr-text');
const errorCorrection = document.getElementById('error-correction');
const foregroundColor = document.getElementById('foreground-color');
const backgroundColor = document.getElementById('background-color');
const logoUpload = document.getElementById('logo-upload');
const downloadBtn = document.getElementById('download-png');
const resetBtn = document.getElementById('reset-btn');
const generateBtn = document.getElementById('generate-btn');
const qrCanvas = document.getElementById('qr-canvas');
const ctx = qrCanvas.getContext('2d');
const themeToggle = document.getElementById('theme-toggle');

// Mode switching elements
const generateMode = document.getElementById('generate-mode');
const scanMode = document.getElementById('scan-mode');
const generateSection = document.getElementById('generate-section');
const scanSection = document.getElementById('scan-section');

// Scanner elements
const cameraScan = document.getElementById('camera-scan');
const uploadScan = document.getElementById('upload-scan');
const cameraSection = document.getElementById('camera-section');
const uploadSection = document.getElementById('upload-section');
const scannerVideo = document.getElementById('scanner-video');
const scannerCanvas = document.getElementById('scanner-canvas');
const scanOutput = document.getElementById('scan-output');
const stopScan = document.getElementById('stop-scan');
const qrUpload = document.getElementById('qr-upload');
const uploadPreview = document.getElementById('upload-preview');

// QR Code settings
let qr = qrcode(0, 'M');
let logo = null;
let scanning = false;

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Initialize QR Code
function initQR() {
    const text = qrText.value || 'Enter text or URL';
    qr = qrcode(0, errorCorrection.value);
    qr.addData(text);
    qr.make();
    
    // Set canvas size
    const moduleCount = qr.getModuleCount();
    const tileSize = Math.floor(300 / moduleCount);
    const size = moduleCount * tileSize;
    
    qrCanvas.width = size;
    qrCanvas.height = size;
    
    // Draw QR Code
    ctx.fillStyle = backgroundColor.value;
    ctx.fillRect(0, 0, size, size);
    
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

// Update QR Code
function updateQR() {
    initQR();
}

// Reset QR Code
function resetQR() {
    qrText.value = '';
    errorCorrection.value = 'M';
    foregroundColor.value = '#000000';
    backgroundColor.value = '#FFFFFF';
    logoUpload.value = '';
    logo = null;
    updateQR();
}

// Handle logo upload
logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            logo = new Image();
            logo.onload = () => {
                updateQR();
            };
            logo.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Download QR Code
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
});

// Event listeners for QR Code generation
qrText.addEventListener('input', updateQR);
errorCorrection.addEventListener('change', updateQR);
foregroundColor.addEventListener('input', updateQR);
backgroundColor.addEventListener('input', updateQR);
resetBtn.addEventListener('click', resetQR);
generateBtn.addEventListener('click', updateQR);

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Mode switching
generateMode.addEventListener('click', () => {
    generateMode.classList.add('active');
    scanMode.classList.remove('active');
    generateSection.classList.remove('hidden');
    scanSection.classList.add('hidden');
    stopScanning();
});

scanMode.addEventListener('click', () => {
    scanMode.classList.add('active');
    generateMode.classList.remove('active');
    scanSection.classList.remove('hidden');
    generateSection.classList.add('hidden');
    stopScanning();
});

// Scanner functionality
cameraScan.addEventListener('click', () => {
    cameraScan.classList.add('active');
    uploadScan.classList.remove('active');
    cameraSection.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    startScanning();
});

uploadScan.addEventListener('click', () => {
    uploadScan.classList.add('active');
    cameraScan.classList.remove('active');
    uploadSection.classList.remove('hidden');
    cameraSection.classList.add('hidden');
    stopScanning();
});

// Start camera scanning
async function startScanning() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        scannerVideo.srcObject = stream;
        scanning = true;
        scanFrame();
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Error accessing camera. Please make sure you have granted camera permissions.');
    }
}

// Stop scanning
function stopScanning() {
    scanning = false;
    if (scannerVideo.srcObject) {
        scannerVideo.srcObject.getTracks().forEach(track => track.stop());
    }
}

// Scan frame
function scanFrame() {
    if (!scanning) return;
    
    const canvas = scannerCanvas;
    const context = canvas.getContext('2d');
    
    canvas.width = scannerVideo.videoWidth;
    canvas.height = scannerVideo.videoHeight;
    context.drawImage(scannerVideo, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
        scanOutput.textContent = code.data;
        stopScanning();
    } else {
        requestAnimationFrame(scanFrame);
    }
}

// Handle QR code upload
qrUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                uploadPreview.innerHTML = '';
                uploadPreview.appendChild(img);
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    scanOutput.textContent = code.data;
                } else {
                    scanOutput.textContent = 'No QR code found in image';
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Stop scan button
stopScan.addEventListener('click', stopScanning);

// Initialize
initTheme();
updateQR(); 