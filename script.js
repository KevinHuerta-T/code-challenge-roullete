let bankroll = 0;
let bet = {};

function startGame() {
    const initialBankroll = parseInt(document.getElementById('bankroll-input').value);
    if (isNaN(initialBankroll) || initialBankroll <= 0) {
        alert("Please enter a valid initial bankroll.");
        return;
    }
    bankroll = initialBankroll;
    document.getElementById('current-bankroll').textContent = bankroll;
    document.getElementById('setup-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    updateBetOptions();
}

function updateBetOptions() {
    const betType = document.getElementById('bet-type').value;
    const optionsContainer = document.getElementById('bet-options-container');
    optionsContainer.innerHTML = '';

    let optionsHTML = '';
    switch (betType) {
        case 'red_black':
            optionsHTML = `
                <div class="bet-options">
                    <label>
                        <input type="radio" name="rb-choice" value="red" checked> Red
                    </label>
                    <label>
                        <input type="radio" name="rb-choice" value="black"> Black
                    </label>
                </div>
            `;
            break;
        case 'dozen':
            optionsHTML = `
                <div class="bet-options">
                    <label>
                        <input type="radio" name="dozen-choice" value="Dozen: 1-12" checked> 1-12
                    </label>
                    <label>
                        <input type="radio" name="dozen-choice" value="Dozen: 13-24"> 13-24
                    </label>
                    <label>
                        <input type="radio" name="dozen-choice" value="Dozen: 25-36"> 25-36
                    </label>
                </div>
            `;
            break;
        case 'single':
            optionsHTML = `
                <div class="bet-options">
                    <label for="single-number">Choose a number (1-36):</label>
                    <input type="number" id="single-number" min="1" max="36" value="1">
                </div>
            `;
            break;
        case 'high_low':
            optionsHTML = `
                <div class="bet-options">
                    <label>
                        <input type="radio" name="hl-choice" value="low" checked> Low (1-18)
                    </label>
                    <label>
                        <input type="radio" name="hl-choice" value="high"> High (19-36)
                    </label>
                </div>
            `;
            break;
    }
    optionsContainer.innerHTML = optionsHTML;
}

function placeBet() {
    const betType = document.getElementById('bet-type').value;
    const wager = parseInt(document.getElementById('wager-amount').value);

    if (isNaN(wager) || wager <= 0) {
        alert("Please enter a valid wager amount.");
        return;
    }

    if (wager > bankroll) {
        alert("You cannot bet more than your current bankroll.");
        return;
    }
    
    document.getElementById('place-bet-button').disabled = true;
    document.getElementById('spin-wheel-button').disabled = false;
    
    bankroll -= wager;
    document.getElementById('current-bankroll').textContent = bankroll;

    let betValue;
    switch (betType) {
        case 'red_black':
            betValue = document.querySelector('input[name="rb-choice"]:checked').value;
            break;
        case 'dozen':
            betValue = document.querySelector('input[name="dozen-choice"]:checked').value;
            break;
        case 'single':
            betValue = parseInt(document.getElementById('single-number').value);
            if (isNaN(betValue) || betValue < 1 || betValue > 36) {
                alert("Please enter a valid number between 1 and 36.");
                return;
            }
            break;
        case 'high_low':
            betValue = document.querySelector('input[name="hl-choice"]:checked').value;
            break;
    }

    bet = {
        type: betType,
        value: betValue,
        wager: wager
    };

    const betValueText = betType === 'high_low' ? (betValue === 'low' ? 'Low (1-18)' : 'High (19-36)') : bet.value;
    document.getElementById('results-text').textContent = `Bet placed: $${bet.wager} on ${betValueText}. Spin the wheel!`;
}

function spinWheel() {
    if (!bet.wager) {
        alert("You must place a bet first.");
        return;
    }
    
    document.getElementById('spin-wheel-button').disabled = true;

    const rouletteDisplay = document.getElementById('roulette-display');
    const resultsText = document.getElementById('results-text');
    const wager = bet.wager;

    resultsText.textContent = '';
    
    let animationInterval = setInterval(() => {
        const tempNumber = Math.floor(Math.random() * 36) + 1;
        const isRed = tempNumber % 2 === 0;
        const colorClass = isRed ? 'red' : 'black';
        rouletteDisplay.innerHTML = `<div class="roulette-number ${colorClass}">${tempNumber}</div>`;
    }, 100);

    setTimeout(() => {
        clearInterval(animationInterval);
        
        document.getElementById('place-bet-button').disabled = false;
        document.getElementById('spin-wheel-button').disabled = true;

        const winningNumber = Math.floor(Math.random() * 36) + 1;
        let resultText = `The wheel spun and the winning number is: ${winningNumber}.`;
        const isRed = winningNumber % 2 === 0;
        const colorClass = isRed ? 'red' : 'black';

        rouletteDisplay.innerHTML = `<div class="roulette-number ${colorClass}">${winningNumber}</div>`;

        let winnings = 0;
        const { type, value } = bet;
        let isWinner = false;

        switch (type) {
            case 'red_black':
                if ((value === 'red' && isRed) || (value === 'black' && !isRed)) {
                    isWinner = true;
                    winnings = wager;
                }
                break;
            case 'dozen':
                let winningDozen;
                if (winningNumber >= 1 && winningNumber <= 12) {
                    winningDozen = 'Dozen: 1-12';
                } else if (winningNumber >= 13 && winningNumber <= 24) {
                    winningDozen = 'Dozen: 13-24';
                } else {
                    winningDozen = 'Dozen: 25-36';
                }
                if (value === winningDozen) {
                    isWinner = true;
                    winnings = wager * 2;
                }
                break;
            case 'single':
                if (winningNumber === value) {
                    isWinner = true;
                    winnings = wager * 35;
                }
                break;
            case 'high_low':
                const isLow = winningNumber >= 1 && winningNumber <= 18;
                const isHigh = winningNumber >= 19 && winningNumber <= 36;
                if ((value === 'low' && isLow) || (value === 'high' && isHigh)) {
                    isWinner = true;
                    winnings = wager;
                }
                break;
        }

        if (isWinner) {
            bankroll += wager + winnings; 
            resultText += ` Congratulations! You won $${winnings}. 🤑`;
        } else {
            resultText += ` Sorry, you lost your bet. ☹️`;
        }

        document.getElementById('current-bankroll').textContent = bankroll;
        resultsText.textContent = resultText;
        
        bet = {};

        if (bankroll <= 0) {
            setTimeout(() => {
                const gameSections = document.querySelectorAll('.game-section');
                gameSections.forEach(section => section.style.display = 'none');
                
                const mainContainer = document.querySelector('.container');
                const gameOverMessage = document.createElement('div');
                gameOverMessage.id = 'game-over-message-final';
                gameOverMessage.innerHTML = `
                    <p>You are out of money. Game over!</p>
                    <div id="game-over-emoji">😞</div>
                `;
                mainContainer.appendChild(gameOverMessage);
            }, 3000);
        }
    }, 2000);
}

function quitGame() {
    alert(`Thanks for playing. You are leaving with $${bankroll}.`);
    window.location.reload();
}