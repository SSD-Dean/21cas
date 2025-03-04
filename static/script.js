document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const moneyDisplay = document.getElementById('money');
  const messageDisplay = document.getElementById('message');
  const newGameBtn = document.getElementById('newGameBtn');
  const drawBtn = document.getElementById('drawBtn');
  const drawAllBtn = document.getElementById('drawAllBtn');
  const passBtn = document.getElementById('passBtn');
  
  // Контейнеры для карт дилера и игрока (из index.html)
  const dealerCardsContainer = document.getElementById('dealer-cards');
  const playerCardsContainer = document.getElementById('player-cards');
  
  // Исходные данные
  let playerMoney = 100;
  const bet = 10;
  
  // Массивы карт и переменные игры
  let dealerCards = [];
  let playerCards = [];
  let currentPlayerCardIndex = -1; // индекс последней открытой карты игрока
  let playerScore = 0;
  let bonusMultiplier = 1;
  let gameOver = false;
  
  // Путь к изображению задней стороны карточки
  const backImagePath = "./static/cards/back.png";
  
  // Функция, возвращающая путь к изображению карты (с рандомизацией вариаций)
  function getCardImage(value) {
    const variants = [
      value + ".png",
      value + "a.png",
      value + "b.png",
      value + "c.png"
    ];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return "./static/cards/" + variants[randomIndex];
  }
  
  // Функция для создания элемента карточки (div с img)
  function createCardElement(imgSrc) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = "card";
    cardDiv.appendChild(img);
    return cardDiv;
  }
  
  // Инициализация игры: генерируются случайные карты для дилера и игрока
  function initGame() {
    // Генерируем по 3 случайных числа (от 1 до 11)
    dealerCards = [];
    playerCards = [];
    for (let i = 0; i < 3; i++) {
      dealerCards.push(Math.floor(Math.random() * 11) + 1);
      playerCards.push(Math.floor(Math.random() * 11) + 1);
    }
    currentPlayerCardIndex = -1;
    playerScore = 0;
    bonusMultiplier = 1;
    gameOver = false;
    messageDisplay.textContent = '';
    newGameBtn.style.display = 'none';
    
    // Создаем карточки дилера:
    // Первая карта открыта, остальные — закрыты (back)
    dealerCardsContainer.innerHTML = '';
    for (let i = 0; i < dealerCards.length; i++) {
      if (i === 0) {
        dealerCardsContainer.appendChild(createCardElement(getCardImage(dealerCards[i])));
      } else {
        dealerCardsContainer.appendChild(createCardElement(backImagePath));
      }
    }
    
    // Создаем карточки игрока: все закрыты
    playerCardsContainer.innerHTML = '';
    for (let i = 0; i < playerCards.length; i++) {
      playerCardsContainer.appendChild(createCardElement(backImagePath));
    }
    
    updateUI();
  }
  
  // Обновление интерфейса (деньги и состояние кнопок)
  function updateUI() {
    moneyDisplay.textContent = playerMoney;
    if (gameOver) {
      drawBtn.disabled = true;
      drawAllBtn.disabled = true;
      passBtn.disabled = true;
    } else {
      drawBtn.disabled = false;
      passBtn.disabled = false;
      // Если игрок уже открыл вторую карту (индекс >= 1), кнопка "Вытащить все" недоступна
      drawAllBtn.disabled = currentPlayerCardIndex >= 1;
    }
  }
  
  // Функция открытия следующей карты игрока
  function revealNextPlayerCard() {
    if (currentPlayerCardIndex < playerCards.length - 1) {
      currentPlayerCardIndex++;
      playerScore += playerCards[currentPlayerCardIndex];
      const cardDiv = playerCardsContainer.children[currentPlayerCardIndex];
      const img = cardDiv.querySelector('img');
      if (img) {
        img.src = getCardImage(playerCards[currentPlayerCardIndex]);
      }
    }
  }
  
  // Функция открытия скрытых карт дилера (вызывается только при завершении игры)
  function revealDealerCards() {
    for (let i = 1; i < dealerCards.length; i++) {
      const cardDiv = dealerCardsContainer.children[i];
      const img = cardDiv.querySelector('img');
      if (img) {
        img.src = getCardImage(dealerCards[i]);
      }
    }
  }
  
  // Завершение игры: открываются скрытые карты дилера, считается сумма дилера и сравнивается с игроком
  function endGame() {
    gameOver = true;
    revealDealerCards();
    const dealerScore = dealerCards.reduce((sum, card) => sum + card, 0);
    let result = '';
    
    if (playerScore > 21) {
      result = `Перебор! Ваш счет: ${playerScore}. Вы проиграли.`;
      playerMoney -= bet * bonusMultiplier;
    } else if (playerScore === dealerScore) {
      result = `Ничья! Ваш счет: ${playerScore}, счет дилера: ${dealerScore}.`;
    } else if (playerScore > dealerScore || dealerScore > 21) {
      result = `Вы выиграли! Ваш счет: ${playerScore}, счет дилера: ${dealerScore}.`;
      playerMoney += bet * bonusMultiplier;
    } else {
      result = `Вы проиграли. Ваш счет: ${playerScore}, счет дилера: ${dealerScore}.`;
      playerMoney -= bet * bonusMultiplier;
    }
    
    messageDisplay.textContent = result;
    newGameBtn.style.display = 'block';
    updateUI();
  }
  
  // Обработчик кнопки "Вытащить" — открывает одну карту игрока
  drawBtn.addEventListener('click', () => {
    if (!gameOver && currentPlayerCardIndex < playerCards.length - 1) {
      revealNextPlayerCard();
      if (playerScore > 21) {
        endGame();
      }
      if (currentPlayerCardIndex === playerCards.length - 1) {
        endGame();
      }
    }
    updateUI();
  });
  
  // Обработчик кнопки "Вытащить все" — открывает все оставшиеся карты игрока и устанавливает бонус 2×
  drawAllBtn.addEventListener('click', () => {
    if (!gameOver) {
      bonusMultiplier = 2;
      while (currentPlayerCardIndex < playerCards.length - 1) {
        revealNextPlayerCard();
      }
      endGame();
    }
    updateUI();
  });
  
  // Обработчик кнопки "Пасовать" — завершает ход игрока и открывает скрытые карты дилера
  passBtn.addEventListener('click', () => {
    if (!gameOver) {
      endGame();
    }
    updateUI();
  });
  
  // Обработчик кнопки "Новая игра"
  newGameBtn.addEventListener('click', () => {
    initGame();
  });
  
  // Запуск игры
  initGame();
});
