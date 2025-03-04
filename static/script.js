document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const moneyDisplay = document.getElementById('money');
  const messageDisplay = document.getElementById('message');
  const newGameBtn = document.getElementById('newGameBtn');
  const drawBtn = document.getElementById('drawBtn');
  const drawAllBtn = document.getElementById('drawAllBtn');
  const passBtn = document.getElementById('passBtn');

  // Контейнеры для карт дилера и игрока
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
  let gameOver = false;

  // Путь к изображению задней стороны карточки
  const backImagePath = "./static/cards/back.png";

  // Функция возвращает путь к изображению карты с рандомизацией вариантов
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

  // Создание элемента карточки (div с вложенным img)
  function createCardElement(imgSrc) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = "card";
    cardDiv.appendChild(img);
    return cardDiv;
  }

  // Инициализация игры: генерируются случайные карты дилера и игрока.
  // Дилер: первая карта открыта, остальные – задняя сторона.
  // Игрок: все карты закрыты.
  function initGame() {
    // Генерируем по 3 случайных числа (от 2 до 11, исключая 1)
    dealerCards = [];
    playerCards = [];
    for (let i = 0; i < 3; i++) {
      dealerCards.push(Math.floor(Math.random() * 10) + 2);
      playerCards.push(Math.floor(Math.random() * 10) + 2);
    }
    currentPlayerCardIndex = -1;
    playerScore = 0;
    gameOver = false;
    messageDisplay.textContent = '';
    newGameBtn.style.display = 'none';

    // Создаем карты дилера: первая открыта, остальные – задняя сторона
    dealerCardsContainer.innerHTML = '';
    for (let i = 0; i < dealerCards.length; i++) {
      if (i === 0) {
        dealerCardsContainer.appendChild(createCardElement(getCardImage(dealerCards[i])));
      } else {
        dealerCardsContainer.appendChild(createCardElement(backImagePath));
      }
    }

    // Создаем карты игрока: все закрыты (задняя сторона)
    playerCardsContainer.innerHTML = '';
    for (let i = 0; i < playerCards.length; i++) {
      playerCardsContainer.appendChild(createCardElement(backImagePath));
    }

    updateUI();
  }

  // Обновление интерфейса: обновляются деньги и состояние кнопок
  function updateUI() {
    moneyDisplay.textContent = playerMoney;
    if (gameOver) {
      drawBtn.disabled = true;
      drawAllBtn.disabled = true;
      passBtn.disabled = true;
    } else {
      drawBtn.disabled = false;
      passBtn.disabled = false;
      // Отключаем "Вытащить все", если игрок уже открыл хотя бы одну карту
      drawAllBtn.disabled = currentPlayerCardIndex >= 0;
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
      // Синхронно открываем соответствующую скрытую карту дилера:
      // Если игрок открыл 1-ю карту, открываем дилерскую карту с индексом 1;
      // Если игрок открыл 2-ю карту, открываем дилерскую карту с индексом 2.
      const dealerIndex = currentPlayerCardIndex + 1;
      if (dealerIndex < dealerCards.length) {
        const dealerCardDiv = dealerCardsContainer.children[dealerIndex];
        const dealerImg = dealerCardDiv.querySelector('img');
        if (dealerImg) {
          dealerImg.src = getCardImage(dealerCards[dealerIndex]);
        }
      }
    }
  }

  // Функция открытия всех оставшихся скрытых карт дилера (вызывается при завершении игры)
  function revealRemainingDealerCards() {
    for (let i = 0; i < dealerCards.length; i++) {
      const cardDiv = dealerCardsContainer.children[i];
      const img = cardDiv.querySelector('img');
      if (img && img.src.indexOf("back.png") !== -1) {
        img.src = getCardImage(dealerCards[i]);
      }
    }
  }

  // Завершение игры: открываются оставшиеся карты дилера, считается сумма дилера и определяется результат
  function endGame() {
    gameOver = true;
    revealRemainingDealerCards();
    const dealerScore = dealerCards.reduce((sum, card) => sum + card, 0);
    let result = '';
    if (playerScore > 21) {
      result = `Перебор! Ваш счет: ${playerScore}. Вы проиграли.`;
      playerMoney -= bet;
    } else if (playerScore === dealerScore) {
      result = `Ничья! Ваш счет: ${playerScore}, счет дилера: ${dealerScore}.`;
    } else if (playerScore > dealerScore || dealerScore > 21) {
      result = `Вы выиграли! Ваш счет: ${playerScore}, счет дилера: ${dealerScore}.`;
      playerMoney += bet;
    } else {
      result = `Вы проиграли. Ваш счет: ${playerScore}, счет дилера: ${dealerScore}.`;
      playerMoney -= bet;
    }
    messageDisplay.textContent = result;
    newGameBtn.style.display = 'block';
    updateUI();
  }

  // Обработчики кнопок игрока

  // "Вытащить": открывает следующую карту игрока (и синхронно соответствующую карту дилера)
  drawBtn.addEventListener('click', () => {
    if (!gameOver && currentPlayerCardIndex < playerCards.length - 1) {
      revealNextPlayerCard();
      if (playerScore > 21) {
        endGame();
      }
      // Если игрок открыл все свои карты, завершаем игру
      if (currentPlayerCardIndex === playerCards.length - 1) {
        endGame();
      }
    }
    updateUI();
  });

  // "Вытащить все": открывает все оставшиеся карты игрока (и синхронно дилера) сразу
  drawAllBtn.addEventListener('click', () => {
    if (!gameOver) {
      while (currentPlayerCardIndex < playerCards.length - 1) {
        revealNextPlayerCard();
      }
      endGame();
    }
    updateUI();
  });

  // "Пасовать": завершает ход игрока и открывает оставшиеся карты дилера
  passBtn.addEventListener('click', () => {
    if (!gameOver) {
      endGame();
    }
    updateUI();
  });

  newGameBtn.addEventListener('click', () => {
    initGame();
  });

  // Запуск игры
  initGame();
});
