// ===== DOM ELEMENTS =====
const fileInput = document.getElementById('file-input');
const chooseBtn = document.getElementById('choose-btn');
const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');

// Filter elements
const filterTabs = document.querySelectorAll('.filter-tab');
const brightnessSlider = document.getElementById('brightness');
const saturationSlider = document.getElementById('saturation');
const inversionSlider = document.getElementById('inversion');
const grayscaleSlider = document.getElementById('grayscale');
const sepiaSlider = document.getElementById('sepia');
const blurSlider = document.getElementById('blur');
const rotateSlider = document.getElementById('rotate');

// Rotate & Flip buttons
const rotateLeftBtn = document.getElementById('rotate-left');
const rotateRightBtn = document.getElementById('rotate-right');
const flipHorizontalBtn = document.getElementById('flip-horizontal');
const flipVerticalBtn = document.getElementById('flip-vertical');

// Undo/Redo buttons
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');

// History panel
const historyList = document.getElementById('history-list');

// ===== STATE VARIABLES =====
let originalImage = null;
let currentImage = null;

// Filter values
let filters = {
    brightness: 100,
    saturation: 100,
    inversion: 0,
    grayscale: 0,
    sepia: 0,
    blur: 0,
    rotate: 0
};

// Transform values
let transform = {
    rotation: 0,  // For 90-degree rotations
    flipH: 1,     // 1 or -1
    flipV: 1      // 1 or -1
};

// History management
let history = [];
let historyIndex = -1;

// ===== EVENT LISTENERS =====

// Choose image button
chooseBtn.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    } else {
        alert('Please select a valid image file');
    }
});

// Filter tabs
filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding slider
        const filterName = tab.dataset.filter;
        document.querySelectorAll('.slider-container .slider-item').forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(`${filterName}-slider`).classList.add('active');
    });
});

// Filter sliders
brightnessSlider.addEventListener('input', (e) => {
    filters.brightness = parseInt(e.target.value);
    document.getElementById('brightness-value').textContent = filters.brightness + '%';
    applyFilters();
    saveState('Brightness', filters.brightness + '%');
});

saturationSlider.addEventListener('input', (e) => {
    filters.saturation = parseInt(e.target.value);
    document.getElementById('saturation-value').textContent = filters.saturation + '%';
    applyFilters();
    saveState('Saturation', filters.saturation + '%');
});

inversionSlider.addEventListener('input', (e) => {
    filters.inversion = parseInt(e.target.value);
    document.getElementById('inversion-value').textContent = filters.inversion + '%';
    applyFilters();
    saveState('Inversion', filters.inversion + '%');
});

grayscaleSlider.addEventListener('input', (e) => {
    filters.grayscale = parseInt(e.target.value);
    document.getElementById('grayscale-value').textContent = filters.grayscale + '%';
    applyFilters();
    saveState('Grayscale', filters.grayscale + '%');
});

sepiaSlider.addEventListener('input', (e) => {
    filters.sepia = parseInt(e.target.value);
    document.getElementById('sepia-value').textContent = filters.sepia + '%';
    applyFilters();
    saveState('Sepia', filters.sepia + '%');
});

blurSlider.addEventListener('input', (e) => {
    filters.blur = parseInt(e.target.value);
    document.getElementById('blur-value').textContent = filters.blur + 'px';
    applyFilters();
    saveState('Blur', filters.blur + 'px');
});

rotateSlider.addEventListener('input', (e) => {
    filters.rotate = parseInt(e.target.value);
    document.getElementById('rotate-value').textContent = filters.rotate + '°';
    applyFilters();
    saveState('Rotate', filters.rotate + '°');
});

// Rotate & Flip buttons
rotateLeftBtn.addEventListener('click', () => {
    transform.rotation = (transform.rotation - 90) % 360;
    applyFilters();
    saveState('Rotate Left', '90°');
});

rotateRightBtn.addEventListener('click', () => {
    transform.rotation = (transform.rotation + 90) % 360;
    applyFilters();
    saveState('Rotate Right', '90°');
});

flipHorizontalBtn.addEventListener('click', () => {
    transform.flipH *= -1;
    applyFilters();
    saveState('Flip Horizontal', '');
});

flipVerticalBtn.addEventListener('click', () => {
    transform.flipV *= -1;
    applyFilters();
    saveState('Flip Vertical', '');
});

// Reset button
resetBtn.addEventListener('click', () => {
    resetFilters();
    applyFilters();
    saveState('Reset All', '');
});

// Save button
saveBtn.addEventListener('click', () => {
    saveImage();
});

// Undo/Redo buttons
undoBtn.addEventListener('click', () => {
    undo();
});

redoBtn.addEventListener('click', () => {
    redo();
});

// ===== CORE FUNCTIONS =====

/**
 * Load image from file
 */
function loadImage(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            currentImage = img;
            
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Hide placeholder, show canvas
            placeholder.classList.add('hidden');
            canvas.classList.add('show');
            saveBtn.disabled = false;
            
            // Reset all filters
            resetFilters();
            
            // Draw image
            applyFilters();
            
            // Initialize history
            history = [];
            historyIndex = -1;
            saveState('Original Image', '');
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

/**
 * Reset all filters to default
 */
function resetFilters() {
    filters = {
        brightness: 100,
        saturation: 100,
        inversion: 0,
        grayscale: 0,
        sepia: 0,
        blur: 0,
        rotate: 0
    };
    
    transform = {
        rotation: 0,
        flipH: 1,
        flipV: 1
    };
    
    // Update slider values
    brightnessSlider.value = 100;
    saturationSlider.value = 100;
    inversionSlider.value = 0;
    grayscaleSlider.value = 0;
    sepiaSlider.value = 0;
    blurSlider.value = 0;
    rotateSlider.value = 0;
    
    // Update displayed values
    document.getElementById('brightness-value').textContent = '100%';
    document.getElementById('saturation-value').textContent = '100%';
    document.getElementById('inversion-value').textContent = '0%';
    document.getElementById('grayscale-value').textContent = '0%';
    document.getElementById('sepia-value').textContent = '0%';
    document.getElementById('blur-value').textContent = '0px';
    document.getElementById('rotate-value').textContent = '0°';
}

/**
 * Apply all filters to the canvas
 */
function applyFilters() {
    if (!originalImage) return;
    
    // Calculate canvas dimensions based on rotation
    const angle = (transform.rotation + filters.rotate) * Math.PI / 180;
    const absAngle = Math.abs(transform.rotation % 180);
    
    let width, height;
    if (absAngle === 90) {
        width = originalImage.height;
        height = originalImage.width;
    } else {
        width = originalImage.width;
        height = originalImage.height;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Apply CSS filters
    ctx.filter = `
        brightness(${filters.brightness}%)
        saturate(${filters.saturation}%)
        invert(${filters.inversion}%)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
    `;
    
    // Move to center for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation (slider)
    ctx.rotate(filters.rotate * Math.PI / 180);
    
    // Apply 90-degree rotation
    ctx.rotate(transform.rotation * Math.PI / 180);
    
    // Apply flip
    ctx.scale(transform.flipH, transform.flipV);
    
    // Draw image centered
    if (absAngle === 90) {
        ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
    } else {
        ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
    }
    
    // Restore context state
    ctx.restore();
}

/**
 * Save current state to history
 */
function saveState(filterName, value) {
    // If we're not at the end of history, remove all future states
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    // Create state snapshot
    const state = {
        filters: {...filters},
        transform: {...transform},
        filterName: filterName,
        value: value,
        timestamp: new Date().toLocaleTimeString()
    };
    
    // Add to history
    history.push(state);
    historyIndex++;
    
    // Update UI
    updateHistoryPanel();
    updateUndoRedoButtons();
}

/**
 * Undo last action
 */
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(history[historyIndex]);
        updateHistoryPanel();
        updateUndoRedoButtons();
    }
}

/**
 * Redo next action
 */
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(history[historyIndex]);
        updateHistoryPanel();
        updateUndoRedoButtons();
    }
}

/**
 * Restore state from history
 */
function restoreState(state) {
    filters = {...state.filters};
    transform = {...state.transform};
    
    // Update sliders
    brightnessSlider.value = filters.brightness;
    saturationSlider.value = filters.saturation;
    inversionSlider.value = filters.inversion;
    grayscaleSlider.value = filters.grayscale;
    sepiaSlider.value = filters.sepia;
    blurSlider.value = filters.blur;
    rotateSlider.value = filters.rotate;
    
    // Update displayed values
    document.getElementById('brightness-value').textContent = filters.brightness + '%';
    document.getElementById('saturation-value').textContent = filters.saturation + '%';
    document.getElementById('inversion-value').textContent = filters.inversion + '%';
    document.getElementById('grayscale-value').textContent = filters.grayscale + '%';
    document.getElementById('sepia-value').textContent = filters.sepia + '%';
    document.getElementById('blur-value').textContent = filters.blur + 'px';
    document.getElementById('rotate-value').textContent = filters.rotate + '°';
    
    // Apply filters
    applyFilters();
}

/**
 * Update history panel UI
 */
function updateHistoryPanel() {
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No changes yet</p>';
        return;
    }
    
    history.forEach((state, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        if (index === historyIndex) {
            historyItem.classList.add('active');
        }
        
        historyItem.innerHTML = `
            <strong>${state.filterName}</strong>
            <small>${state.value} - ${state.timestamp}</small>
        `;
        
        historyItem.addEventListener('click', () => {
            historyIndex = index;
            restoreState(state);
            updateHistoryPanel();
            updateUndoRedoButtons();
            
            // Remove all future states
            history = history.slice(0, historyIndex + 1);
        });
        
        historyList.appendChild(historyItem);
    });
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

/**
 * Save image to disk
 */
function saveImage() {
    if (!canvas) return;
    
    // Create download link
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });
}

// ===== INITIALIZATION =====
// Update undo/redo buttons on load
updateUndoRedoButtons();