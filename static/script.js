document.addEventListener('DOMContentLoaded', () => {
  const moneyDisplay = document.getElementById('money');
  const messageDisplay = document.getElementById('message');
  const newGameBtn = document.getElementById('newGameBtn');
  const drawBtn = document.getElementById('drawBtn');
  const drawAllBtn = document.getElementById('drawAllBtn');
  const passBtn = document.getElementById('passBtn');
  const cardElements = [
    document.getElementById('card-0'),
    document.getElementById('card-1'),
    document.getElementById('card-2')
  ];

  // Исходные данные
  let playerMoney = 100;
  const bet = 10;

  let cards = [];
  let currentCardIndex = -1; // Начинаем с -1, чтобы при первом действии открыть карту с индексом 0
  let playerScore = 0;
  let bonusMultiplier = 1;
  let gameOver = false;

  // Путь к изображению задней стороны (back) карточки
  const backImagePath = "static/cards/back.png";

  // Функция возвращает путь к изображению карты (с рандомизацией вариаций)
  function getCardImage(value) {
    const variants = [
      value + ".png",
      value + "a.png",
      value + "b.png",
      value + "c.png"
    ];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return "static/cards/" + variants[randomIndex];
  }

  // Инициализация игры: создаются 3 карты с рандомными значениями от 1 до 11 и все карты получают заднюю сторону
  function initGame() {
    cards = [];
    for (let i = 0; i < 3; i++) {
      cards.push(Math.floor(Math.random() * 11) + 1);
    }
    currentCardIndex = -1;
    playerScore = 0;
    bonusMultiplier = 1;
    gameOver = false;
    messageDisplay.textContent = '';

    // Для каждого элемента-карты находим вложенный <img> и задаем ему изображение back
    cardElements.forEach((cardEl) => {
      const img = cardEl.querySelector('img');
      if (img) {
        img.src = backImagePath;
      } else {
        cardEl.innerHTML = `<img src="${backImagePath}" alt="card">`;
      }
    });

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
      // Если игрок уже открыл вторую карту (индекс 1 и выше), кнопка "Вытащить все" становится недоступной
      drawAllBtn.disabled = currentCardIndex >= 1;
    }
  }

  // Открытие следующей карты: меняем src вложенного <img> на изображение лица карты
  function revealNextCard() {
    if (currentCardIndex < cards.length - 1) {
      currentCardIndex++;
      playerScore += cards[currentCardIndex];
      const imgElement = cardElements[currentCardIndex].querySelector('img');
      if (imgElement) {
        imgElement.src = getCardImage(cards[currentCardIndex]);
      }
    }
  }

  // Завершение игры: генерируем счет дилера и сравниваем с очками игрока
  function endGame() {
    gameOver = true;
    let dealerScore = Math.floor(Math.random() * 5) + 17;
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

  // Обработчики кнопок
  drawBtn.addEventListener('click', () => {
    if (!gameOver && currentCardIndex < cards.length - 1) {
      revealNextCard();
      if (playerScore > 21) {
        endGame();
      }
      if (currentCardIndex === cards.length - 1) {
        endGame();
      }
    }
    updateUI();
  });

  drawAllBtn.addEventListener('click', () => {
    if (!gameOver) {
      bonusMultiplier = 2;
      while (currentCardIndex < cards.length - 1) {
        revealNextCard();
      }
      endGame();
    }
    updateUI();
  });

  passBtn.addEventListener('click', () => {
    if (!gameOver) {
      endGame();
    }
    updateUI();
  });

  newGameBtn.addEventListener('click', () => {
    newGameBtn.style.display = 'none';
    drawBtn.disabled = false;
    drawAllBtn.disabled = false;
    passBtn.disabled = false;
    initGame();
  });

  // Запуск игры
  initGame();
});
