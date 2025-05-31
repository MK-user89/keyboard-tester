document.addEventListener('DOMContentLoaded', () => {
    const keyName = document.getElementById('key-name');
    const keyCode = document.getElementById('key-code');
    const keyLocation = document.getElementById('key-location');
    const keyHoldTime = document.getElementById('key-hold-time');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeInstructions = document.getElementById('mode-instructions');
    
    const maxHistory = 20;
    let keyHistory = [];
    let currentMode = 'free';
    let pressedKeys = new Set();
    let keyPressStartTimes = new Map();

    const modeInstructionsText = {
        free: 'Press any key to test your keyboard. The pressed key will be highlighted and its information will be displayed below.',
        ghosting: 'Press multiple keys simultaneously to test for keyboard ghosting issues.',
        holdtime: 'Press and hold keys to test their response time and consistency.'
    };

    function getLocationName(location) {
        switch(location) {
            case 0: return 'Standard';
            case 1: return 'Left';
            case 2: return 'Right';
            case 3: return 'Numpad';
            default: return 'Unknown';
        }
    }

    function updateVisualKeyboard(event, isKeyDown) {
        const key = document.querySelector(`[data-key="${event.code}"]`);
        if (key) {
            if (isKeyDown) {
                key.classList.add('pressed');
            } else {
                key.classList.remove('pressed');
            }
        }
    }

    function handleKeyDown(event) {
        // Prevent default behavior for some keys
        if (['Tab', 'Alt', 'Control', 'Shift'].includes(event.key)) {
            event.preventDefault();
        }

        // Update visual keyboard
        updateVisualKeyboard(event, true);

        // Start timing for hold time measurement
        if (!keyPressStartTimes.has(event.code)) {
            keyPressStartTimes.set(event.code, Date.now());
        }

        // Track pressed keys for ghosting test
        pressedKeys.add(event.code);

        // Update the key information display
        keyName.textContent = event.key === ' ' ? 'Space' : event.key;
        keyCode.textContent = event.code;
        keyLocation.textContent = getLocationName(event.location);

        // Only add to history in free mode
        if (currentMode === 'free') {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item active';
            historyItem.textContent = event.key === ' ' ? 'Space' : event.key;

            keyHistory.unshift(historyItem);
            if (keyHistory.length > maxHistory) {
                keyHistory.pop();
            }

            historyList.innerHTML = '';
            keyHistory.forEach(item => {
                historyList.appendChild(item.cloneNode(true));
            });

            setTimeout(() => {
                const activeItems = document.querySelectorAll('.history-item.active');
                activeItems.forEach(item => item.classList.remove('active'));
            }, 300);
        }

        // Update mode-specific displays
        if (currentMode === 'ghosting') {
            keyHoldTime.textContent = `${pressedKeys.size} keys pressed`;
        }
    }

    function handleKeyUp(event) {
        // Update visual keyboard
        updateVisualKeyboard(event, false);

        // Calculate and display hold time
        const startTime = keyPressStartTimes.get(event.code);
        if (startTime) {
            const holdTime = Date.now() - startTime;
            if (currentMode === 'holdtime') {
                keyHoldTime.textContent = `${holdTime} ms`;
            }
            keyPressStartTimes.delete(event.code);
        }

        // Remove from pressed keys set
        pressedKeys.delete(event.code);

        // Update ghosting test display
        if (currentMode === 'ghosting') {
            keyHoldTime.textContent = `${pressedKeys.size} keys pressed`;
        }
    }

    function switchMode(mode) {
        currentMode = mode;
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        modeInstructions.textContent = modeInstructionsText[mode];
        
        // Reset displays
        clearHistory();
        pressedKeys.clear();
        keyPressStartTimes.clear();
        keyHoldTime.textContent = mode === 'ghosting' ? '0 keys pressed' : '0 ms';
    }

    function clearHistory() {
        keyHistory = [];
        historyList.innerHTML = '';
        keyName.textContent = 'None';
        keyCode.textContent = 'None';
        keyLocation.textContent = 'None';
        keyHoldTime.textContent = currentMode === 'ghosting' ? '0 keys pressed' : '0 ms';
    }

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
}); 