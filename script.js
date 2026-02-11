// Calculator State
let currentDisplay = '0';
let previousValue = null;
let currentOperator = null;
let shouldResetDisplay = false;
let calculationHistory = '';

// Chat State
let messages = [];
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// Settings State
let settings = {
    password: '',
    deleteTime: 60,
    notifications: 'all',
    theme: 'light',
    sounds: 'on',
    language: 'ar',
    autoBackup: 'weekly'
};

// Previous view tracker
let previousView = 'calculator';

// PWA Installation
let deferredPrompt;

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        applySettings();
    }
    
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
        renderMessages();
    }
}

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

function applySettings() {
    document.getElementById('deleteTime').value = settings.deleteTime;
    document.getElementById('notifications').value = settings.notifications;
    document.getElementById('theme').value = settings.theme;
    document.getElementById('sounds').value = settings.sounds;
    document.getElementById('language').value = settings.language;
    document.getElementById('autoBackup').value = settings.autoBackup;
    
    changeTheme();
}

// Calculator Functions
function updateDisplay() {
    document.getElementById('display').textContent = currentDisplay;
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentDisplay = num;
        shouldResetDisplay = false;
    } else {
        currentDisplay = currentDisplay === '0' ? num : currentDisplay + num;
    }
    calculationHistory += num;
    updateDisplay();
}

function appendOperator(op) {
    if (currentOperator !== null) {
        calculate();
    }
    previousValue = parseFloat(currentDisplay);
    currentOperator = op;
    shouldResetDisplay = true;
    calculationHistory += op;
}

function calculate() {
    if (currentOperator === null || previousValue === null) return;
    
    const currentValue = parseFloat(currentDisplay);
    let result;
    
    switch (currentOperator) {
        case '+':
            result = previousValue + currentValue;
            break;
        case '-':
            result = previousValue - currentValue;
            break;
        case '*':
            result = previousValue * currentValue;
            break;
        case '/':
            result = previousValue / currentValue;
            break;
        case '%':
            result = previousValue % currentValue;
            break;
        default:
            return;
    }
    
    // Check for secret code: 5+5=10
    calculationHistory += '=';
    if (calculationHistory === '5+5=' || (previousValue === 5 && currentOperator === '+' && currentValue === 5)) {
        unlockChat();
    }
    
    currentDisplay = result.toString();
    updateDisplay();
    previousValue = null;
    currentOperator = null;
    shouldResetDisplay = true;
    calculationHistory = '';
}

function clearDisplay() {
    currentDisplay = '0';
    previousValue = null;
    currentOperator = null;
    shouldResetDisplay = false;
    calculationHistory = '';
    updateDisplay();
}

function deleteLast() {
    if (currentDisplay.length > 1) {
        currentDisplay = currentDisplay.slice(0, -1);
    } else {
        currentDisplay = '0';
    }
    if (calculationHistory.length > 0) {
        calculationHistory = calculationHistory.slice(0, -1);
    }
    updateDisplay();
}

// View Navigation
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function showCalculator() {
    showView('calculatorView');
    previousView = 'calculator';
}

function showChat() {
    showView('chatView');
    previousView = 'chat';
    renderMessages();
}

function showSettings() {
    showView('settingsView');
}

function backFromSettings() {
    if (previousView === 'chat') {
        showChat();
    } else {
        showCalculator();
    }
}

function unlockChat() {
    setTimeout(() => {
        showChat();
        playSound();
        addSystemMessage('تم فتح المحادثة السرية! 🔓');
    }, 500);
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (text) {
        const message = {
            id: Date.now(),
            text: text,
            type: 'sent',
            timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        };
        
        messages.push(message);
        saveMessages();
        renderMessages();
        input.value = '';
        playSound();
        
        // Auto-delete messages after specified time
        scheduleMessageDeletion(message.id);
    }
}

function addSystemMessage(text) {
    const message = {
        id: Date.now(),
        text: text,
        type: 'system',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    messages.push(message);
    saveMessages();
    renderMessages();
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '<div class="welcome-message">مرحباً! لقد فتحت المحادثة السرية 🎉</div>';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}`;
        
        let content = `<div>${msg.text}</div>`;
        if (msg.image) {
            content += `<img src="${msg.image}" class="message-image" alt="صورة">`;
        }
        if (msg.audio) {
            content += `<audio controls src="${msg.audio}"></audio>`;
        }
        content += `<div class="message-time">${msg.timestamp}</div>`;
        
        messageDiv.innerHTML = content;
        container.appendChild(messageDiv);
    });
    
    container.scrollTop = container.scrollHeight;
}

function saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function scheduleMessageDeletion(messageId) {
    setTimeout(() => {
        messages = messages.filter(msg => msg.id !== messageId);
        saveMessages();
        renderMessages();
    }, settings.deleteTime * 60 * 1000);
}

// Image Upload
document.addEventListener('DOMContentLoaded', () => {
    const imageBtn = document.getElementById('imageBtn');
    const imageInput = document.getElementById('imageInput');
    
    imageBtn.addEventListener('click', () => {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const message = {
                    id: Date.now(),
                    text: 'صورة',
                    image: event.target.result,
                    type: 'sent',
                    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                };
                messages.push(message);
                saveMessages();
                renderMessages();
                playSound();
                scheduleMessageDeletion(message.id);
            };
            reader.readAsDataURL(file);
        }
    });
});

// Microphone Recording
async function toggleRecording() {
    const micBtn = document.getElementById('micBtn');
    
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data);
            });
            
            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                const message = {
                    id: Date.now(),
                    text: 'رسالة صوتية',
                    audio: audioUrl,
                    type: 'sent',
                    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                };
                messages.push(message);
                saveMessages();
                renderMessages();
                playSound();
                scheduleMessageDeletion(message.id);
                
                stream.getTracks().forEach(track => track.stop());
            });
            
            mediaRecorder.start();
            isRecording = true;
            micBtn.classList.add('recording');
        } catch (error) {
            alert('لا يمكن الوصول إلى الميكروفون');
        }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        micBtn.classList.remove('recording');
    }
}

// Settings Functions
function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    if (newPassword) {
        settings.password = newPassword;
        saveSettings();
        alert('تم تحديث كلمة المرور بنجاح ✓');
        document.getElementById('newPassword').value = '';
    } else {
        alert('الرجاء إدخال كلمة مرور');
    }
}

function saveDeleteTime() {
    const deleteTime = parseInt(document.getElementById('deleteTime').value);
    if (deleteTime > 0) {
        settings.deleteTime = deleteTime;
        saveSettings();
        alert('تم حفظ الإعدادات ✓');
    } else {
        alert('الرجاء إدخال قيمة صحيحة');
    }
}

function changeTheme() {
    const theme = document.getElementById('theme').value;
    settings.theme = theme;
    saveSettings();
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        // Auto theme based on system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
}

function clearAllMessages() {
    if (confirm('هل أنت متأكد من حذف جميع الرسائل؟')) {
        messages = [];
        saveMessages();
        renderMessages();
        alert('تم حذف جميع الرسائل ✓');
    }
}

function playSound() {
    if (settings.sounds === 'on') {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installContainer').style.display = 'block';
});

document.getElementById('installButton').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        document.getElementById('installContainer').style.display = 'none';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    document.getElementById('installContainer').style.display = 'none';
});

// Event Listeners
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('micBtn').addEventListener('click', toggleRecording);

// Save settings on change
document.getElementById('notifications').addEventListener('change', () => {
    settings.notifications = document.getElementById('notifications').value;
    saveSettings();
});

document.getElementById('sounds').addEventListener('change', () => {
    settings.sounds = document.getElementById('sounds').value;
    saveSettings();
});

document.getElementById('language').addEventListener('change', () => {
    settings.language = document.getElementById('language').value;
    saveSettings();
});

document.getElementById('autoBackup').addEventListener('change', () => {
    settings.autoBackup = document.getElementById('autoBackup').value;
    saveSettings();
});

// Initialize app
loadSettings();
updateDisplay();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(registration => console.log('Service Worker registered'))
        .catch(error => console.log('Service Worker registration failed:', error));
}
