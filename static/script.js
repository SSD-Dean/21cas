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

  // Изначально деньги игрока – 100, ставка – 10
  let playerMoney = 100;
  const bet = 10;

  // Переменные игры
  let cards = [];
  let currentCardIndex = -1; // начинаем с -1, чтобы при первом действии открыть первую карту (индекс 0)
  let playerScore = 0;
  let bonusMultiplier = 1; // по умолчанию 1, при выборе "Вытащить все" становится 2
  let gameOver = false;

  // Функция для выбора изображения карты по её значению.
  // Для каждой карты доступны 4 варианта: базовый (например, "11.png") и три варианта (например, "11a.png", "11b.png", "11c.png").
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

  // Функция для получения изображения обратной стороны карты.
  function getBackImage() {
    return "static/cards/back.png";
  }

  // Инициализация игры: генерируются 3 карты со значениями от 1 до 11 и задаётся обратная сторона карт.
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

    // Для каждого элемента-карты находим вложенный <img> и устанавливаем ему изображение обратной стороны.
    cardElements.forEach((cardEl) => {
      const img = cardEl.querySelector('img');
      if (img) {
        img.src = getBackImage();
      } else {
        cardEl.innerHTML = `<img src="${getBackImage()}" alt="card">`;
      }
    });

    updateUI();
  }

  // Обновление интерфейса
  function updateUI() {
    moneyDisplay.textContent = playerMoney;
    if (gameOver) {
      drawBtn.disabled = true;
      drawAllBtn.disabled = true;
      passBtn.disabled = true;
    } else {
      drawBtn.disabled = false;
      passBtn.disabled = false;
      // Если игрок уже открыл вторую карту (индекс 1), кнопка "Вытащить все" недоступна
      drawAllBtn.disabled = currentCardIndex >= 1;
    }
  }

  // Функция для открытия следующей карты: меняем src вложенного <img> на изображение карты.
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

  // Завершение игры: генерируется счет дилера (от 17 до 21) и производится сравнение результатов.
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

  // Обработчик кнопки "Вытащить" – открывает одну следующую карту.
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

  // Обработчик кнопки "Вытащить все" – открывает все оставшиеся карты и устанавливает бонус (2×).
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

  // Обработчик кнопки "Пасовать" – завершает игру и сравнивает результат с дилером.
  passBtn.addEventListener('click', () => {
    if (!gameOver) {
      endGame();
    }
    updateUI();
  });

  // Обработчик кнопки "Новая игра"
  newGameBtn.a
