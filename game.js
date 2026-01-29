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

// ── Rendering ──

function cardHTML(card, hidden) {
  if (hidden) {
    return '<div class="card hidden-card"><span class="rank">?</span><span class="suit">?</span></div>';
  }
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  return `<div class="card${isRed ? ' red' : ''}"><span class="rank">${card.rank}</span><span class="suit">${SUIT_SYMBOLS[card.suit]}</span></div>`;
}

function render() {
  const dc = document.getElementById('dealer-cards');
  const pc = document.getElementById('player-cards');

  pc.innerHTML = playerHand.map(c => cardHTML(c, false)).join('');

  if (gameOver) {
    dc.innerHTML = dealerHand.map(c => cardHTML(c, false)).join('');
    document.getElementById('dealer-score').textContent = '(' + handScore(dealerHand) + ')';
  } else {
    dc.innerHTML = dealerHand.map((c, i) => cardHTML(c, i === 1)).join('');
    document.getElementById('dealer-score').textContent = '(' + cardValue(dealerHand[0]) + ')';
  }

  document.getElementById('player-score').textContent = '(' + handScore(playerHand) + ')';
  document.getElementById('balance').textContent = balance;
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

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
}

// ── Actions ──

function startGame() {
  const betInput = document.getElementById('bet-input');
  const bet = parseInt(betInput.value, 10);
  if (isNaN(bet) || bet < 1) { showMessage('Enter a valid bet.'); return; }
  if (bet > balance) { showMessage('Not enough balance!'); return; }

  currentBet = bet;
  balance -= currentBet;
  gameOver = false;

  deck = shuffle(createDeck());
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];

  showMessage('');
  render();

  // Check for natural blackjack
  if (handScore(playerHand) === 21) {
    stand(); // auto-stand on blackjack
    return;
  }

  setButtons(false, true, true, balance >= currentBet);
}

function hit() {
  playerHand.push(deck.pop());
  render();
  if (handScore(playerHand) > 21) {
    endRound('Bust! You lose.');
  } else if (handScore(playerHand) === 21) {
    stand();
  }
  // Disable double after first hit
  document.getElementById('btn-double').disabled = true;
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
    endRound('Dealer busts! You win!', true);
  } else if (ps > ds) {
    endRound('You win!', true);
  } else if (ps < ds) {
    endRound('Dealer wins.');
  } else {
    endRound('Push!', false, true);
  }
}

function doubleDown() {
  balance -= currentBet;
  currentBet *= 2;
  playerHand.push(deck.pop());
  render();
  if (handScore(playerHand) > 21) {
    endRound('Bust! You lose.');
  } else {
    stand();
  }
}

function endRound(msg, win, push) {
  gameOver = true;
  if (win) {
    // Check if player has natural blackjack (2 cards, score 21) and pays 3:2
    if (playerHand.length === 2 && handScore(playerHand) === 21) {
      balance += Math.floor(currentBet * 2.5);
    } else {
      balance += currentBet * 2;
    }
  } else if (push) {
    balance += currentBet;
  }
  render();
  showMessage(msg);
  setButtons(true, false, false, false);

  if (balance <= 0) {
    showMessage(msg + ' Game over - you\'re out of money! Refresh to restart.');
  }
}
