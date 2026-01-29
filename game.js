// ── Deck & Card helpers ──

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUIT_SYMBOLS = { hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663', spades: '\u2660' };

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank, 10);
}

function handScore(hand) {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += cardValue(c);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

// ── Audio (Web Audio API - no external files) ──

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const now = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);

  if (type === 'card') {
    // Short click/snap
    const osc = audioCtx.createOscillator();
    const noise = audioCtx.createBiquadFilter();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'chip') {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'win') {
    [523, 659, 784].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  } else if (type === 'lose') {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

// ── Particles ──

function initParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (6 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

// ── Confetti ──

function spawnConfetti() {
  const colors = ['#f0c850', '#e74c3c', '#2ecc71', '#3498db', '#fff', '#ff2d55'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-10px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.width = (5 + Math.random() * 8) + 'px';
    el.style.height = (5 + Math.random() * 8) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ── Balance change float ──

function showBalanceChange(amount) {
  const balEl = document.querySelector('.balance-display');
  const floater = document.createElement('div');
  floater.className = 'balance-change ' + (amount >= 0 ? 'positive' : 'negative');
  floater.textContent = (amount >= 0 ? '+' : '') + '$' + amount;
  floater.style.position = 'absolute';
  floater.style.left = '50%';
  floater.style.transform = 'translateX(-50%)';
  balEl.style.position = 'relative';
  balEl.appendChild(floater);
  floater.addEventListener('animationend', () => floater.remove());
}

// ── Rendering ──

function cardHTML(card, hidden) {
  if (hidden) {
    return '<div class="card hidden-card"></div>';
  }
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const sym = SUIT_SYMBOLS[card.suit];
  return `<div class="card face-card${isRed ? ' red' : ''}">
    <div class="corner corner-top"><span class="corner-rank">${card.rank}</span><span class="corner-suit">${sym}</span></div>
    <span class="center-suit">${sym}</span>
    <span class="center-rank">${card.rank}</span>
    <div class="corner corner-bottom"><span class="corner-rank">${card.rank}</span><span class="corner-suit">${sym}</span></div>
  </div>`;
}

function render() {
  const dc = document.getElementById('dealer-cards');
  const pc = document.getElementById('player-cards');

  pc.innerHTML = playerHand.map(c => cardHTML(c, false)).join('');

  if (gameOver) {
    dc.innerHTML = dealerHand.map(c => cardHTML(c, false)).join('');
    document.getElementById('dealer-score').textContent = handScore(dealerHand);
  } else {
    dc.innerHTML = dealerHand.map((c, i) => cardHTML(c, i === 1)).join('');
    document.getElementById('dealer-score').textContent = cardValue(dealerHand[0]);
  }

  document.getElementById('player-score').textContent = handScore(playerHand);
  document.getElementById('balance').textContent = balance;
  document.getElementById('bet-display').textContent = currentBet > 0 ? currentBet : parseInt(document.getElementById('bet-input').value, 10);
}

// ── Game state ──

let deck = [];
let playerHand = [];
let dealerHand = [];
let balance = 1000;
let currentBet = 0;
let gameOver = true;

function setButtons(deal, hit, stand, dbl) {
  document.getElementById('btn-deal').disabled = !deal;
  document.getElementById('btn-hit').disabled = !hit;
  document.getElementById('btn-stand').disabled = !stand;
  document.getElementById('btn-double').disabled = !dbl;
}

function showMessage(msg, type) {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.className = 'message';
  if (type) el.classList.add(type);
}

// ── Bet adjustment ──

function adjustBet(amount) {
  if (!gameOver) return;
  const input = document.getElementById('bet-input');
  let val = parseInt(input.value, 10) || 0;
  val = Math.max(1, Math.min(balance, val + amount));
  input.value = val;
  document.getElementById('bet-display').textContent = val;
  playSound('chip');
}

// ── Actions ──

function startGame() {
  const betInput = document.getElementById('bet-input');
  const bet = parseInt(betInput.value, 10);
  if (isNaN(bet) || bet < 1) { showMessage('Enter a valid bet.'); return; }
  if (bet > balance) { showMessage('Not enough balance!', 'lose'); return; }

  currentBet = bet;
  balance -= currentBet;
  gameOver = false;

  deck = shuffle(createDeck());
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];

  showMessage('');
  render();
  playSound('card');

  // Check for natural blackjack
  if (handScore(playerHand) === 21) {
    stand();
    return;
  }

  setButtons(false, true, true, balance >= currentBet);
}

function hit() {
  playerHand.push(deck.pop());
  playSound('card');
  render();
  if (handScore(playerHand) > 21) {
    endRound('Bust! You lose.', 'lose');
  } else if (handScore(playerHand) === 21) {
    stand();
  } else {
    // Disable double after first hit
    document.getElementById('btn-double').disabled = true;
  }
}

function stand() {
  gameOver = true;
  // Dealer draws to 17
  while (handScore(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }
  render();

  const ps = handScore(playerHand);
  const ds = handScore(dealerHand);

  if (ds > 21) {
    endRound('Dealer busts! You win!', 'win');
  } else if (ps > ds) {
    endRound('You win!', 'win');
  } else if (ps < ds) {
    endRound('Dealer wins.', 'lose');
  } else {
    endRound('Push!', 'push');
  }
}

function doubleDown() {
  balance -= currentBet;
  currentBet *= 2;
  playerHand.push(deck.pop());
  playSound('card');
  render();
  if (handScore(playerHand) > 21) {
    endRound('Bust! You lose.', 'lose');
  } else {
    stand();
  }
}

function endRound(msg, type) {
  gameOver = true;
  const prevBalance = balance;

  if (type === 'win') {
    if (playerHand.length === 2 && handScore(playerHand) === 21) {
      balance += Math.floor(currentBet * 2.5);
      msg = 'BLACKJACK! You win!';
      type = 'blackjack';
    } else {
      balance += currentBet * 2;
    }
  } else if (type === 'push') {
    balance += currentBet;
  }

  const diff = balance - prevBalance;

  render();
  showMessage(msg, type);
  setButtons(true, false, false, false);

  // Effects
  if (type === 'win' || type === 'blackjack') {
    playSound('win');
    spawnConfetti();
    if (diff !== 0) showBalanceChange(diff);
  } else if (type === 'push') {
    if (diff !== 0) showBalanceChange(diff);
  } else {
    playSound('lose');
    showBalanceChange(-currentBet);
  }

  if (balance <= 0) {
    showMessage(msg + ' Game over! Refresh to restart.', 'lose');
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  // Resume audio context on first interaction (browser policy)
  document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }, { once: true });
});
