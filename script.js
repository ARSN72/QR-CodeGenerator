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
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            } 
        });
        scannerVideo.srcObject = stream;
        await scannerVideo.play();
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
    
    if (scannerVideo.readyState === scannerVideo.HAVE_ENOUGH_DATA) {
        canvas.width = scannerVideo.videoWidth;
        canvas.height = scannerVideo.videoHeight;
        context.drawImage(scannerVideo, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Try different scanning options
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth", // Try both normal and inverted
            greyScaleWeights: {
                red: 0.2126,
                green: 0.7152,
                blue: 0.0722,
            },
            canOverwriteImage: true,
        });
        
        if (code) {
            scanOutput.textContent = code.data;
            stopScanning();
        }
    }
    
    requestAnimationFrame(scanFrame);
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
                const previewImg = document.createElement('img');
                previewImg.src = event.target.result;
                uploadPreview.appendChild(previewImg);
                
                // Create a larger canvas for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                // Set canvas size to match image dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image with better quality
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                context.drawImage(img, 0, 0);
                
                // Try to enhance the image for better scanning
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                enhanceImage(imageData);
                
                // Try different scanning options
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "attemptBoth",
                    greyScaleWeights: {
                        red: 0.2126,
                        green: 0.7152,
                        blue: 0.0722,
                    },
                    canOverwriteImage: true,
                });
                
                if (code) {
                    scanOutput.textContent = code.data;
                } else {
                    // If first attempt fails, try with image enhancement
                    const enhancedData = enhanceImageForQR(imageData);
                    const enhancedCode = jsQR(enhancedData.data, enhancedData.width, enhancedData.height, {
                        inversionAttempts: "attemptBoth",
                        greyScaleWeights: {
                            red: 0.2126,
                            green: 0.7152,
                            blue: 0.0722,
                        },
                        canOverwriteImage: true,
                    });
                    
                    if (enhancedCode) {
                        scanOutput.textContent = enhancedCode.data;
                    } else {
                        scanOutput.textContent = 'No QR code found in image';
                    }
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Enhance image for better QR code detection
function enhanceImage(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
    }
    
    // Increase contrast
    const factor = 1.5;
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * factor + intercept;
        data[i + 1] = data[i + 1] * factor + intercept;
        data[i + 2] = data[i + 2] * factor + intercept;
    }
    
    return imageData;
}

// Additional enhancement specifically for QR codes
function enhanceImageForQR(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Create a new ImageData for the enhanced version
    const enhancedData = new ImageData(width, height);
    const enhanced = enhancedData.data;
    
    // Apply threshold
    const threshold = 128;
    
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = avg > threshold ? 255 : 0;
        enhanced[i] = enhanced[i + 1] = enhanced[i + 2] = value;
        enhanced[i + 3] = data[i + 3];
    }
    
    return enhancedData;
}

// Stop scan button
stopScan.addEventListener('click', stopScanning);

// Initialize
initTheme();
updateQR(); 