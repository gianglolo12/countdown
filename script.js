// Countdown Timer Script
class CountdownTimer {
    constructor() {
        this.init();
        this.startTimer();
    }

    init() {
        this.daysElement = document.getElementById('days');
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.progressElement = document.getElementById('progress');
        this.container = document.querySelector('.container');
        
        // Sound effects (optional)
        this.isAudioEnabled = false;
        this.setupAudio();
    }

    setupAudio() {
        // Try to enable audio context for tick sound
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isAudioEnabled = true;
        } catch (e) {
            console.log('Audio not available');
        }
    }

    playTickSound() {
        if (!this.isAudioEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently fail if audio doesn't work
        }
    }

    getTargetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(17, 0, 0, 0); // 17:00:00
        
        return tomorrow;
    }

    getCurrentTime() {
        return new Date();
    }

    calculateTimeRemaining() {
        const now = this.getCurrentTime();
        const target = this.getTargetTime();
        const difference = target.getTime() - now.getTime();

        if (difference <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true
            };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return {
            days,
            hours,
            minutes,
            seconds,
            isExpired: false,
            totalSeconds: Math.floor(difference / 1000)
        };
    }

    calculateDailyProgress() {
        const now = this.getCurrentTime();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        
        const totalDaySeconds = (endOfDay.getTime() - startOfDay.getTime()) / 1000;
        const elapsedSeconds = (now.getTime() - startOfDay.getTime()) / 1000;
        
        return Math.min((elapsedSeconds / totalDaySeconds) * 100, 100);
    }

    formatTime(value) {
        return value.toString().padStart(2, '0');
    }

    updateDisplay(timeData) {
        // Animate number changes
        this.animateNumber(this.daysElement, timeData.days);
        this.animateNumber(this.hoursElement, timeData.hours);
        this.animateNumber(this.minutesElement, timeData.minutes);
        this.animateNumber(this.secondsElement, timeData.seconds);

        // Update progress bar
        const progress = this.calculateDailyProgress();
        this.progressElement.style.width = `${progress}%`;
    }

    animateNumber(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const formattedValue = this.formatTime(newValue);
        
        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.color = '#00f2fe';
            
            setTimeout(() => {
                element.textContent = formattedValue;
                element.style.transform = 'scale(1)';
                element.style.color = 'white';
            }, 150);
            
            // Play tick sound for seconds
            if (element === this.secondsElement) {
                this.playTickSound();
            }
        }
    }

    handleExpiration() {
        // Add celebration mode
        this.container.classList.add('celebration-mode');
        
        // Update title
        document.querySelector('.subtitle').textContent = '🎉 Thời gian đã đến! Chúc mừng! 🎉';
        
        // Show fireworks effect
        this.createFireworks();
        
        // Optional: Show notification
        this.showNotification();
    }

    createFireworks() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const fireworksContainer = document.createElement('div');
        fireworksContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(fireworksContainer);

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createFirework(fireworksContainer, colors[Math.floor(Math.random() * colors.length)]);
            }, i * 100);
        }

        // Remove fireworks after 10 seconds
        setTimeout(() => {
            if (fireworksContainer.parentNode) {
                fireworksContainer.parentNode.removeChild(fireworksContainer);
            }
        }, 10000);
    }

    createFirework(container, color) {
        const firework = document.createElement('div');
        firework.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            box-shadow: 0 0 10px ${color};
            animation: firework 2s ease-out forwards;
        `;
        
        container.appendChild(firework);
        
        setTimeout(() => {
            if (firework.parentNode) {
                firework.parentNode.removeChild(firework);
            }
        }, 2000);
    }

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏰ Thời gian đã đến!', {
                body: 'Đã đến 17:00 ngày mai rồi! 🎉',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWk0xMyAxN0gxMVY3SDEzVjE3WiIgZmlsbD0iIzAwZjJmZSIvPgo8L3N2Zz4K'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startTimer() {
        // Request notification permission on first load
        this.requestNotificationPermission();
        
        // Initial update
        this.updateTimer();
        
        // Update every second
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        const timeData = this.calculateTimeRemaining();
        
        if (timeData.isExpired) {
            this.updateDisplay(timeData);
            this.handleExpiration();
            clearInterval(this.timerInterval);
            return;
        }
        
        this.updateDisplay(timeData);
        
        // Add special effects when getting close to target time
        if (timeData.totalSeconds <= 10) {
            this.container.style.animation = 'pulse 0.5s infinite';
        } else if (timeData.totalSeconds <= 60) {
            this.container.style.borderColor = '#ff4757';
        }
    }

    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// Add firework animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes firework {
        0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the countdown timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.countdownTimer = new CountdownTimer();
});

// Handle page visibility changes to keep timer accurate
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.countdownTimer) {
        // Immediately update when page becomes visible again
        window.countdownTimer.updateTimer();
    }
});

// Add click handler for manual refresh
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('time-value')) {
        e.target.style.transform = 'scale(1.2)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 200);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        // Manual refresh
        if (window.countdownTimer) {
            window.countdownTimer.updateTimer();
        }
    }
});
