import React, { useState, useEffect } from 'react';
const { useStoredState } = hatch;

const StartupTycoon = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [menuTab, setMenuTab] = useState('main'); // main, faq
  
  const [gameState, setGameState] = useStoredState('startupTycoon', {
    resources: {
      code: 100,
      ideas: 50,
      money: 1000,
      reputation: 10,
      energy: 80
    },
    skills: {
      frontend: 1,
      backend: 1,
      design: 0,
      marketing: 0,
      management: 0
    },
    company: {
      stage: 'solo', // solo -> freelancer -> mvp -> startup -> company -> corporation
      employees: 0,
      products: 0,
      users: 0,
      revenue: 0
    },
    buildings: {
      workspace: 1,
      computer: 1,
      coffee: 0,
      office: 0,
      server: 0,
      lab: 0,
      marketing: 0
    },
    day: 1,
    level: 1,
    exp: 0,
    difficulty: 'normal' // easy, normal, hard
  });

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [events, setEvents] = useState([]);
  const [gameTime, setGameTime] = useState(0);

  // Проверяем, есть ли сохранённая игра
  const hasSavedGame = gameState.day > 1 || gameState.company.products > 0 || gameState.resources.money !== 1000;
  
  // Обеспечиваем совместимость со старыми сохранениями
  const currentDifficulty = gameState.difficulty || 'normal';

  // Настройки сложности
  const difficultySettings = {
    easy: {
      name: '😊 Лёгкий',
      description: 'Больше ресурсов, меньше расходов, больше событий',
      startResources: { code: 200, ideas: 100, money: 2000, reputation: 20, energy: 100 },
      multipliers: { income: 1.5, expenses: 0.7, events: 1.3 }
    },
    normal: {
      name: '⚖️ Обычный',
      description: 'Сбалансированная игра для всех',
      startResources: { code: 100, ideas: 50, money: 1000, reputation: 10, energy: 80 },
      multipliers: { income: 1.0, expenses: 1.0, events: 1.0 }
    },
    hard: {
      name: '😤 Сложный',
      description: 'Меньше ресурсов, больше расходов, суровые события',
      startResources: { code: 50, ideas: 25, money: 500, reputation: 5, energy: 60 },
      multipliers: { income: 0.8, expenses: 1.3, events: 0.8 }
    }
  };

  const startNewGame = (difficulty = 'normal') => {
    const settings = difficultySettings[difficulty];
    setGameState({
      resources: { ...settings.startResources },
      skills: {
        frontend: 1,
        backend: 1,
        design: 0,
        marketing: 0,
        management: 0
      },
      company: {
        stage: 'solo',
        employees: 0,
        products: 0,
        users: 0,
        revenue: 0
      },
      buildings: {
        workspace: 1,
        computer: 1,
        coffee: 0,
        office: 0,
        server: 0,
        lab: 0,
        marketing: 0
      },
      day: 1,
      level: 1,
      exp: 0,
      difficulty: difficulty
    });
    setEvents([]);
    setGameTime(0);
    setShowMenu(false);
    setGameStarted(true);
  };

  const continueGame = () => {
    setShowMenu(false);
    setGameStarted(true);
  };

  const returnToMenu = () => {
    setShowMenu(true);
    setGameStarted(false);
  };

  const buildings = {
    workspace: { 
      name: 'Рабочее место', 
      cost: { money: 500, ideas: 5 }, 
      effect: '+10 код/день',
      icon: '💻'
    },
    computer: { 
      name: 'Мощный комп', 
      cost: { money: 2000, code: 50 }, 
      effect: '+15 код/день, +5 энергия',
      icon: '🖥️'
    },
    coffee: { 
      name: 'Кофе-машина', 
      cost: { money: 800, energy: 10 }, 
      effect: '+20 энергии/день',
      icon: '☕'
    },
    office: { 
      name: 'Офис', 
      cost: { money: 10000, reputation: 25 }, 
      effect: 'Можно нанимать до 5 сотрудников',
      icon: '🏢'
    },
    server: { 
      name: 'Сервер', 
      cost: { money: 5000, code: 200 }, 
      effect: '+50% пользователей продуктов',
      icon: '🖲️'
    },
    lab: { 
      name: 'R&D лаба', 
      cost: { money: 15000, ideas: 100 }, 
      effect: '+25 идей/день',
      icon: '🔬'
    },
    marketing: { 
      name: 'Маркетинг отдел', 
      cost: { money: 8000, reputation: 15 }, 
      effect: '+10 репутация/день',
      icon: '📈'
    }
  };

  const randomEvents = [
    {
      title: '🏆 Хакатон',
      description: 'Вы победили в хакатоне!',
      effect: () => ({ code: 100, ideas: 50, reputation: 10 })
    },
    {
      title: '💰 Инвестор',
      description: 'Инвестор заинтересовался вашим проектом',
      effect: () => ({ money: 5000, reputation: 15 })
    },
    {
      title: '🐛 Критический баг',
      description: 'В продакшене обнаружен критический баг',
      effect: () => ({ code: -50, reputation: -5, energy: -20 })
    },
    {
      title: '🔥 Вирусность',
      description: 'Ваш пост в соцсетях стал вирусным!',
      effect: () => ({ reputation: 20, users: 1000 })
    },
    {
      title: '🎯 Новая идея',
      description: 'Во время душа пришла гениальная идея!',
      effect: () => ({ ideas: 75, energy: 10 })
    },
    {
      title: '💻 Выгорание',
      description: 'Вы чувствуете усталость от кодинга',
      effect: () => ({ energy: -30, code: -25 })
    },
    {
      title: '📱 Конкурент',
      description: 'Конкурент запустил похожий продукт',
      effect: () => ({ users: -500, reputation: -10 })
    }
  ];

  useEffect(() => {
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
      
      if (gameTime % 10 === 0) { // Каждые 10 секунд = новый день
        advanceDay();
      }
      
      if (gameTime % 30 === 0 && Math.random() < 0.3 * difficultySettings[currentDifficulty].multipliers.events) {
        triggerRandomEvent();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameTime, gameStarted]);

  const advanceDay = () => {
    setGameState(prev => {
      const newState = { ...prev };
      const difficulty = difficultySettings[prev.difficulty || 'normal'];
      newState.day += 1;
      
      // Базовое производство (навыки влияют на производство)
      const baseCodeGen = (5 + (prev.skills.frontend + prev.skills.backend) * 3 + prev.skills.management * 2) * difficulty.multipliers.income;
      const baseIdeasGen = (2 + prev.skills.design * 3 + prev.skills.marketing * 1) * difficulty.multipliers.income;
      
      newState.resources.code += Math.floor(baseCodeGen);
      newState.resources.ideas += Math.floor(baseIdeasGen);
      newState.resources.energy += 10;
      
      // Производство от зданий
      newState.resources.code += Math.floor(prev.buildings.workspace * 10 * difficulty.multipliers.income);
      newState.resources.code += Math.floor(prev.buildings.computer * 15 * difficulty.multipliers.income);
      newState.resources.energy += prev.buildings.coffee * 20;
      newState.resources.energy += prev.buildings.computer * 5;
      newState.resources.ideas += Math.floor(prev.buildings.lab * 25 * difficulty.multipliers.income);
      newState.resources.reputation += prev.buildings.marketing * 10;
      
      // Производство от сотрудников (менеджмент увеличивает эффективность)
      const managementBonus = 1 + (prev.skills.management * 0.15); // +15% за уровень менеджмента
      newState.resources.code += Math.floor(prev.company.employees * 20 * difficulty.multipliers.income * managementBonus);
      newState.resources.ideas += Math.floor(prev.company.employees * 5 * difficulty.multipliers.income * managementBonus);
      
      // Доходы от продуктов (маркетинг увеличивает доход)
      if (prev.company.products > 0) {
        const baseRevenue = prev.company.users * 0.1 * difficulty.multipliers.income;
        const serverBonus = prev.buildings.server > 0 ? 1.5 : 1;
        const marketingBonus = 1 + (prev.skills.marketing * 0.1); // +10% за уровень маркетинга
        const revenue = Math.floor(baseRevenue * serverBonus * marketingBonus);
        newState.company.revenue += revenue;
        newState.resources.money += revenue;
      }
      
      // Расходы (с учётом сложности)
      newState.resources.energy -= prev.company.employees * 5;
      newState.resources.money -= Math.floor(prev.company.employees * 100 * difficulty.multipliers.expenses);
      newState.resources.money -= Math.floor(prev.buildings.office * 500 * difficulty.multipliers.expenses);
      
      // Прогрессия уровня
      newState.exp += 10 + prev.company.employees * 2;
      if (newState.exp >= newState.level * 100) {
        newState.level += 1;
        newState.exp = 0;
        // Бонус за уровень
        newState.resources.ideas += 20;
        newState.resources.reputation += 5;
      }
      
      // Проверка стадий развития
      if (prev.company.stage === 'solo' && newState.resources.money >= 5000) {
        newState.company.stage = 'freelancer';
      }
      if (prev.company.stage === 'freelancer' && newState.company.products >= 1) {
        newState.company.stage = 'mvp';
      }
      if (prev.company.stage === 'mvp' && newState.company.employees >= 2) {
        newState.company.stage = 'startup';
      }
      if (prev.company.stage === 'startup' && newState.company.employees >= 10) {
        newState.company.stage = 'company';
      }
      if (prev.company.stage === 'company' && newState.resources.money >= 100000) {
        newState.company.stage = 'corporation';
      }
      
      // Ограничения ресурсов
      Object.keys(newState.resources).forEach(resource => {
        newState.resources[resource] = Math.max(0, Math.min(999999, newState.resources[resource]));
      });
      
      return newState;
    });
  };

  const triggerRandomEvent = () => {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    const effect = event.effect();
    
    setEvents(prev => [event, ...prev.slice(0, 2)]);
    
    setGameState(prev => {
      const newState = { ...prev };
      Object.keys(effect).forEach(key => {
        if (key === 'users') {
          newState.company.users += effect[key];
        } else if (newState.resources[key] !== undefined) {
          newState.resources[key] += effect[key];
        }
      });
      return newState;
    });
  };

  const canBuild = (buildingType) => {
    const building = buildings[buildingType];
    return Object.keys(building.cost).every(resource => 
      gameState.resources[resource] >= building.cost[resource]
    );
  };

  const buildStructure = (buildingType) => {
    if (!canBuild(buildingType)) return;

    setGameState(prev => {
      const newState = { ...prev };
      const building = buildings[buildingType];
      
      // Списание ресурсов
      Object.keys(building.cost).forEach(resource => {
        newState.resources[resource] -= building.cost[resource];
      });
      
      // Строительство
      newState.buildings[buildingType] += 1;
      
      return newState;
    });
  };

  const learnSkill = (skill) => {
    const cost = (gameState.skills[skill] + 1) * 50;
    if (gameState.resources.code >= cost && gameState.resources.ideas >= cost / 2) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          code: prev.resources.code - cost,
          ideas: prev.resources.ideas - cost / 2
        },
        skills: {
          ...prev.skills,
          [skill]: prev.skills[skill] + 1
        }
      }));
    }
  };

  const createProduct = () => {
    const cost = { code: 200, ideas: 100, money: 1000 };
    if (Object.keys(cost).every(res => gameState.resources[res] >= cost[res])) {
      setGameState(prev => {
        // Дизайн и маркетинг влияют на количество пользователей нового продукта
        const baseUsers = 100;
        const designBonus = 1 + (prev.skills.design * 0.2); // +20% за уровень дизайна
        const marketingBonus = 1 + (prev.skills.marketing * 0.15); // +15% за уровень маркетинга
        const newUsers = Math.floor(baseUsers * designBonus * marketingBonus);
        
        return {
          ...prev,
          resources: {
            ...prev.resources,
            code: prev.resources.code - cost.code,
            ideas: prev.resources.ideas - cost.ideas,
            money: prev.resources.money - cost.money
          },
          company: {
            ...prev.company,
            products: prev.company.products + 1,
            users: prev.company.users + newUsers
          }
        };
      });
    }
  };

  const hireEmployee = () => {
    const cost = 2000 + gameState.company.employees * 500;
    if (gameState.resources.money >= cost && gameState.resources.reputation >= 10) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          money: prev.resources.money - cost,
          reputation: prev.resources.reputation - 10
        },
        company: {
          ...prev.company,
          employees: prev.company.employees + 1
        }
      }));
    }
  };

  const getStatusColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage > 70) return 'text-green-500';
    if (percentage > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // FAQ контент
  const renderFAQ = () => (
    <div className="text-left max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">❓ FAQ и Гайд по игре</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-400 mb-3">🎯 Что дают навыки?</h3>
          <div className="space-y-3 text-sm">
            <div><strong>💻 Frontend:</strong> +3 кода в день за уровень</div>
            <div><strong>⚙️ Backend:</strong> +3 кода в день за уровень</div>
            <div><strong>🎨 Design:</strong> +3 идеи в день за уровень + 20% больше пользователей при создании продукта</div>
            <div><strong>📈 Marketing:</strong> +1 идея в день за уровень + 10% доход с продуктов + 15% больше пользователей</div>
            <div><strong>👔 Management:</strong> +2 кода в день за уровень + 15% эффективность сотрудников</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-purple-400 mb-3">🚀 Стадии развития</h3>
          <div className="space-y-2 text-sm">
            <div><strong>🧑‍💻 Соло-разработчик:</strong> Изучайте навыки, накапливайте ресурсы</div>
            <div><strong>💼 Фрилансер:</strong> Накопите $5000 для перехода</div>
            <div><strong>🚀 MVP:</strong> Создайте первый продукт (200 код, 100 идей, $1000)</div>
            <div><strong>⭐ Стартап:</strong> Наймите 2+ сотрудников</div>
            <div><strong>🏢 Компания:</strong> Расширьтесь до 10+ сотрудников</div>
            <div><strong>🌍 Корпорация:</strong> Накопите $100,000 капитала</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">💰 Как зарабатывать деньги?</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Продукты:</strong> Каждый пользователь приносит $0.1 в день</div>
            <div><strong>Сервер:</strong> Увеличивает доход с пользователей на 50%</div>
            <div><strong>Маркетинг:</strong> +10% доход за каждый уровень навыка</div>
            <div><strong>События:</strong> Инвесторы, хакатоны, вирусные посты</div>
            <div><strong>Совет:</strong> Создавайте продукты → получайте пользователей → доход растет</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-red-400 mb-3">🏗️ Оборудование и постройки</h3>
          <div className="space-y-2 text-sm">
            <div><strong>💻 Рабочее место:</strong> +10 код/день ($500, 5 идей)</div>
            <div><strong>🖥️ Мощный комп:</strong> +15 код/день, +5 энергия ($2000, 50 код)</div>
            <div><strong>☕ Кофе-машина:</strong> +20 энергия/день ($800, 10 энергия)</div>
            <div><strong>🏢 Офис:</strong> Позволяет нанимать до 5 сотрудников ($10000, 25 репутация)</div>
            <div><strong>🖲️ Сервер:</strong> +50% доход с пользователей ($5000, 200 код)</div>
            <div><strong>🔬 R&D лаба:</strong> +25 идей/день ($15000, 100 идей)</div>
            <div><strong>📈 Маркетинг отдел:</strong> +10 репутация/день ($8000, 15 репутация)</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-blue-400 mb-3">💡 Советы по игре</h3>
          <div className="space-y-2 text-sm">
            <div>• <strong>Начало:</strong> Прокачивайте Frontend и Backend для большего кода</div>
            <div>• <strong>Деньги:</strong> Создавайте продукты как можно раньше для дохода</div>
            <div>• <strong>Команда:</strong> Нанимайте сотрудников только когда есть стабильный доход</div>
            <div>• <strong>Дизайн:</strong> Прокачивайте перед созданием продуктов для больших пользователей</div>
            <div>• <strong>Менеджмент:</strong> Важен при большой команде (+15% эффективность)</div>
            <div>• <strong>Энергия:</strong> Следите за уровнем, покупайте кофе-машины</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-orange-400 mb-3">🎲 Случайные события</h3>
          <div className="space-y-2 text-sm">
            <div><strong>🏆 Хакатон:</strong> +100 код, +50 идей, +10 репутация</div>
            <div><strong>💰 Инвестор:</strong> +$5000, +15 репутация</div>
            <div><strong>🔥 Вирусность:</strong> +20 репутация, +1000 пользователей</div>
            <div><strong>🎯 Новая идея:</strong> +75 идей, +10 энергия</div>
            <div><strong>🐛 Критический баг:</strong> -50 код, -5 репутация, -20 энергия</div>
            <div><strong>💻 Выгорание:</strong> -30 энергия, -25 код</div>
            <div><strong>📱 Конкурент:</strong> -500 пользователей, -10 репутация</div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => setMenuTab('main')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg transition-colors"
        >
          ← Назад к меню
        </button>
      </div>
    </div>
  );

  // Стартовое меню
  if (showMenu) {
    return (
      <div className="w-full h-full bg-gray-900 text-white p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Табы меню - ОЧЕНЬ ЗАМЕТНЫЕ */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-3 rounded-xl border-4 border-blue-500 shadow-2xl">
              <div className="flex gap-4">
                <button
                  onClick={() => setMenuTab('main')}
                  className={`px-10 py-4 rounded-xl font-black text-xl transition-all duration-300 transform ${
                    menuTab === 'main' 
                      ? 'bg-blue-500 text-white shadow-2xl scale-105 border-2 border-white' 
                      : 'bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 hover:scale-102 border-2 border-gray-600'
                  }`}
                >
                  🏠 ГЛАВНАЯ
                </button>
                <button
                  onClick={() => setMenuTab('faq')}
                  className={`px-10 py-4 rounded-xl font-black text-xl transition-all duration-300 transform ${
                    menuTab === 'faq' 
                      ? 'bg-green-500 text-white shadow-2xl scale-105 border-2 border-white' 
                      : 'bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 hover:scale-102 border-2 border-gray-600'
                  }`}
                >
                  ❓ FAQ & ГАЙД
                </button>
              </div>
            </div>
          </div>

          {menuTab === 'faq' ? renderFAQ() : (
            <div className="text-center">
              <div className="mb-8">
                <h1 className="text-5xl font-bold text-blue-400 mb-4">💻 СТАРТАП ТАЙКУН</h1>
                <h2 className="text-2xl text-gray-300 mb-6">От кода к корпорации</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Начните как соло-разработчик и постройте IT-империю! Изучайте навыки, создавайте продукты, 
                  нанимайте команду и станьте tech-магнатом.
                </p>
              </div>

          {hasSavedGame && (
            <div className="mb-8 p-6 bg-green-900 border border-green-600 rounded-lg">
              <h3 className="text-xl font-bold mb-4">📊 Сохранённая игра</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">День</div>
                  <div className="font-bold">{gameState.day}</div>
                </div>
                <div>
                  <div className="text-gray-400">Стадия</div>
                  <div className="font-bold">
                    {gameState.company.stage === 'solo' && '🧑‍💻 Соло'}
                    {gameState.company.stage === 'freelancer' && '💼 Фрилансер'}
                    {gameState.company.stage === 'mvp' && '🚀 MVP'}
                    {gameState.company.stage === 'startup' && '⭐ Стартап'}
                    {gameState.company.stage === 'company' && '🏢 Компания'}
                    {gameState.company.stage === 'corporation' && '🌍 Корпорация'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Деньги</div>
                  <div className="font-bold">${gameState.resources.money}</div>
                </div>
                <div>
                  <div className="text-gray-400">Сложность</div>
                  <div className="font-bold">{difficultySettings[currentDifficulty].name}</div>
                </div>
              </div>
              <button
                onClick={continueGame}
                className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors"
              >
                Продолжить игру
              </button>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Выберите сложность</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(difficultySettings).map(([key, settings]) => (
                <div key={key} className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 hover:border-blue-500 transition-colors">
                  <div className="text-2xl mb-3">{settings.name}</div>
                  <p className="text-sm text-gray-400 mb-4">{settings.description}</p>
                  <div className="text-xs text-left space-y-1 mb-4">
                    <div><strong>Стартовые ресурсы:</strong></div>
                    <div>💻 Код: {settings.startResources.code}</div>
                    <div>💡 Идеи: {settings.startResources.ideas}</div>
                    <div>💰 Деньги: ${settings.startResources.money}</div>
                    <div>⭐ Репутация: {settings.startResources.reputation}</div>
                  </div>
                  <button
                    onClick={() => startNewGame(key)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors"
                  >
                    Начать игру
                  </button>
                </div>
              ))}
            </div>
          </div>

              <div className="text-sm text-gray-500">
                <p>💡 Совет: Начните с лёгкого уровня, если играете впервые!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 text-white p-4 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={returnToMenu}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              ← Меню
            </button>
            <div className="text-sm text-gray-400">
              Сложность: {difficultySettings[currentDifficulty].name}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-400 mb-2">💻 СТАРТАП ТАЙКУН: ОТ КОДА К КОРПОРАЦИИ</h1>
          <div className="text-lg">
            День {gameState.day} | Уровень {gameState.level} | 
            <span className="ml-2 px-2 py-1 bg-purple-600 rounded text-sm">
              {gameState.company.stage === 'solo' && '🧑‍💻 Соло-разработчик'}
              {gameState.company.stage === 'freelancer' && '💼 Фрилансер'}
              {gameState.company.stage === 'mvp' && '🚀 MVP'}
              {gameState.company.stage === 'startup' && '⭐ Стартап'}
              {gameState.company.stage === 'company' && '🏢 Компания'}
              {gameState.company.stage === 'corporation' && '🌍 Корпорация'}
            </span>
          </div>
        </div>

        {/* Ресурсы */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl">💻</div>
            <div className="text-sm text-gray-400">Код</div>
            <div className={`text-xl font-bold ${getStatusColor(gameState.resources.code, 500)}`}>
              {gameState.resources.code}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl">💡</div>
            <div className="text-sm text-gray-400">Идеи</div>
            <div className={`text-xl font-bold ${getStatusColor(gameState.resources.ideas, 200)}`}>
              {gameState.resources.ideas}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl">💰</div>
            <div className="text-sm text-gray-400">Деньги</div>
            <div className={`text-xl font-bold ${getStatusColor(gameState.resources.money, 10000)}`}>
              ${gameState.resources.money}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl">⭐</div>
            <div className="text-sm text-gray-400">Репутация</div>
            <div className={`text-xl font-bold ${getStatusColor(gameState.resources.reputation, 100)}`}>
              {gameState.resources.reputation}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-2xl">⚡</div>
            <div className="text-sm text-gray-400">Энергия</div>
            <div className={`text-xl font-bold ${getStatusColor(gameState.resources.energy, 100)}`}>
              {gameState.resources.energy}
            </div>
          </div>
        </div>

        {/* Статус компании */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-3">📊 Статус компании</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Сотрудники:</span>
                <span className="font-bold text-blue-400">{gameState.company.employees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Продукты:</span>
                <span className="font-bold text-green-400">{gameState.company.products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Пользователи:</span>
                <span className="font-bold text-purple-400">{gameState.company.users.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Доход:</span>
                <span className="font-bold text-yellow-400">${gameState.company.revenue}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-3">🎯 Навыки</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Frontend:</span>
                <span className="font-bold text-blue-400">LVL {gameState.skills.frontend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Backend:</span>
                <span className="font-bold text-green-400">LVL {gameState.skills.backend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Design:</span>
                <span className="font-bold text-purple-400">LVL {gameState.skills.design}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Marketing:</span>
                <span className="font-bold text-red-400">LVL {gameState.skills.marketing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Management:</span>
                <span className="font-bold text-yellow-400">LVL {gameState.skills.management}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Прогресс уровня */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-3">📈 Прогресс</h3>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">EXP:</span>
            <div className="flex-1 bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(gameState.exp / (gameState.level * 100)) * 100}%` }}
              ></div>
            </div>
            <span className="font-bold text-blue-400">{gameState.exp}/{gameState.level * 100}</span>
          </div>
        </div>

        {/* События */}
        {events.length > 0 && (
          <div className="bg-purple-900 border border-purple-600 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-3">📢 Последние события</h3>
            {events.map((event, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="font-bold">{event.title}</div>
                <div className="text-sm text-gray-300">{event.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Действия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Прокачка навыков */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">🎓 Прокачка навыков</h3>
            <div className="space-y-3">
              {Object.entries(gameState.skills).map(([skill, level]) => (
                <div key={skill} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                  <div>
                    <div className="font-bold capitalize">{skill}</div>
                    <div className="text-xs text-gray-400">Уровень {level}</div>
                    <div className="text-xs text-blue-400">
                      Стоимость: {(level + 1) * 50} код, {(level + 1) * 25} идей
                    </div>
                  </div>
                  <button
                    onClick={() => learnSkill(skill)}
                    disabled={gameState.resources.code < (level + 1) * 50 || gameState.resources.ideas < (level + 1) * 25}
                    className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                      gameState.resources.code >= (level + 1) * 50 && gameState.resources.ideas >= (level + 1) * 25
                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Изучить
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Создание продуктов и найм */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">🚀 Развитие бизнеса</h3>
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-bold">Создать продукт</div>
                <div className="text-xs text-gray-400">200 код, 100 идей, $1000</div>
                <button
                  onClick={createProduct}
                  disabled={gameState.resources.code < 200 || gameState.resources.ideas < 100 || gameState.resources.money < 1000}
                  className={`mt-2 px-3 py-1 rounded text-sm font-bold transition-colors w-full ${
                    gameState.resources.code >= 200 && gameState.resources.ideas >= 100 && gameState.resources.money >= 1000
                      ? 'bg-green-600 hover:bg-green-500 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Запустить MVP
                </button>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="font-bold">Нанять сотрудника</div>
                <div className="text-xs text-gray-400">
                  ${2000 + gameState.company.employees * 500}, 10 репутации
                </div>
                <button
                  onClick={hireEmployee}
                  disabled={gameState.resources.money < 2000 + gameState.company.employees * 500 || gameState.resources.reputation < 10}
                  className={`mt-2 px-3 py-1 rounded text-sm font-bold transition-colors w-full ${
                    gameState.resources.money >= 2000 + gameState.company.employees * 500 && gameState.resources.reputation >= 10
                      ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Нанять
                </button>
              </div>
            </div>
          </div>

          {/* Покупка оборудования */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">🛠️ Оборудование</h3>
            <div className="space-y-3">
              {Object.entries(buildings).map(([key, building]) => (
                <div key={key} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{building.icon}</span>
                    <div>
                      <div className="text-sm font-bold">{building.name}</div>
                      <div className="text-xs text-gray-400">{building.effect}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">x{gameState.buildings[key]}</div>
                    <button
                      onClick={() => buildStructure(key)}
                      disabled={!canBuild(key)}
                      className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                        canBuild(key) 
                          ? 'bg-green-600 hover:bg-green-500 text-white' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Купить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Подсказки */}
        <div className="mt-6 bg-blue-900 border border-blue-600 p-4 rounded-lg">
          <h3 className="font-bold mb-2">💡 Гайд по развитию:</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Соло-разработчик:</strong> Изучайте навыки, пишите код, генерируйте идеи</li>
            <li>• <strong>Фрилансер:</strong> Накопите $5000, создавайте первые продукты</li>
            <li>• <strong>MVP:</strong> Запустите продукт для перехода к стартапу</li>
            <li>• <strong>Стартап:</strong> Нанимайте команду (2+ человека)</li>
            <li>• <strong>Компания:</strong> Расширяйтесь до 10+ сотрудников</li>
            <li>• <strong>Корпорация:</strong> Накопите $100,000 для IPO</li>
            <li>• Высокие навыки увеличивают производство ресурсов</li>
            <li>• Сотрудники приносят пассивный доход, но требуют зарплату</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartupTycoon;
