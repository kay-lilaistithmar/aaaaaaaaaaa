// المتغيرات الأساسية
let currentInput = ""; // يخزن ما يكتبه المستخدم في الحاسبة
let secretPassword = "5+5"; // كلمة السر الافتراضية للدردشة السرية

// جلب العناصر من HTML للتحكم بها
const calcDisplay = document.getElementById('calc-display');
const calcView = document.getElementById('calculator-view');
const chatView = document.getElementById('chat-view');
const settingsView = document.getElementById('settings-view');

// ================= وظائف الحاسبة =================

// إضافة الأرقام والرموز إلى شاشة الحاسبة
function appendValue(value) {
    currentInput += value;
    calcDisplay.value = currentInput;
}

// مسح شاشة الحاسبة
function clearDisplay() {
    currentInput = "";
    calcDisplay.value = "";
}

// إجراء العملية الحسابية (أو فتح الدردشة السرية)
function calculate() {
    // التحقق: هل ما كُتب يطابق كلمة السر السرية؟
    if (currentInput === secretPassword) {
        // إذا كان صحيحاً: أخفِ الحاسبة وأظهر الدردشة
        calcView.classList.add('hidden');
        chatView.classList.remove('hidden');
        currentInput = ""; // تصفير الإدخال لحماية السرية
        calcDisplay.value = "";
    } else {
        // إذا كان إدخالاً عادياً: قم بالعملية الحسابية
        try {
            // دالة eval تقوم بحساب النص الرياضي، مثلا "5+2" تصبح 7
            let result = eval(currentInput); 
            calcDisplay.value = result;
            currentInput = result.toString();
        } catch (error) {
            // في حال كتب المستخدم رموز خاطئة مثل "++5"
            calcDisplay.value = "خطأ";
            currentInput = "";
        }
    }
}

// ================= وظائف الدردشة =================

// إرسال رسالة
function sendMessage() {
    const inputField = document.getElementById('message-input');
    const messageText = inputField.value;

    if (messageText.trim() !== "") {
        // إنشاء عنصر رسالة جديد
        const messageContainer = document.getElementById('chat-messages');
        const newMessage = document.createElement('div');
        newMessage.className = 'message sent';
        newMessage.innerText = messageText;
        
        // إضافته إلى شاشة الدردشة
        messageContainer.appendChild(newMessage);
        inputField.value = ""; // مسح الحقل بعد الإرسال

        // التمرير التلقائي للأسفل لرؤية الرسالة الجديدة
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // ميزة حذف الرسائل تلقائياً بناءً على الإعدادات
        const deleteTimer = document.getElementById('delete-timer').value;
        if (deleteTimer !== "never") {
            const timeInMs = parseInt(deleteTimer) * 1000;
            setTimeout(() => {
                newMessage.remove(); // حذف الرسالة بعد مرور الوقت
            }, timeInMs);
        }
    }
}

// ================= وظائف الإعدادات =================

// فتح وإغلاق الإعدادات
function toggleSettings() {
    settingsView.classList.toggle('hidden');
}

// تغيير الرمز السري (كلمة السر)
function changePassword() {
    const newPassInput = document.getElementById('new-password');
    if (newPassInput.value.trim() !== "") {
        secretPassword = newPassInput.value.trim();
        alert('تم تغيير الرمز السري بنجاح!');
        newPassInput.value = ""; // تفريغ الحقل
    }
}

// تغيير ألوان التطبيق (الثيمات)
function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    // إزالة السِمات القديمة
    document.body.classList.remove('theme-dark', 'theme-blue', 'theme-red');
    // إضافة السِمة الجديدة التي اختارها المستخدم
    document.body.classList.add(theme);
}
// ================= تسجيل عامل الخدمة (PWA) =================
// نتحقق أولاً مما إذا كان المتصفح يدعم هذه الميزة
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('تم تشغيل Service Worker بنجاح:', registration.scope);
            })
            .catch((error) => {
                console.log('فشل تشغيل Service Worker:', error);
            });
    });
}
