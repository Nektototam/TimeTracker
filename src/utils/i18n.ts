import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Английский перевод
const en = {
  app: {
    title: 'Time Tracker'
  },
  auth: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signUp: 'Sign up',
    signIn: 'Sign in',
    logout: 'Logout'
  },
  nav: {
    timer: 'Timer',
    statistics: 'Statistics',
    reports: 'Reports',
    pomodoro: 'Pomodoro',
    settings: 'Settings',
    logout: 'Logout'
  },
  timer: {
    start: 'Start',
    pause: 'Pause',
    stop: 'Stop',
    waiting: 'Waiting',
    running: 'Running',
    paused: 'Paused',
    currentTask: 'Current task',
    notSelected: 'Not selected',
    workType: 'Work type',
    addLimitation: 'Time limit',
    resetLimitation: 'Reset limit',
    limitValue: 'Limit:',
    timeLimit: {
      setLimit: 'Set time limit',
      enterValue: 'Enter custom type',
      hours: 'Hours',
      minutes: 'Minutes'
    },
    dailyTotal: 'Total today',
    standard: {
      development: 'Development',
      design: 'Design',
      marketing: 'Marketing',
      meeting: 'Meeting',
      other: 'Other',
      new: 'Add custom type'
    }
  },
  pomodoro: {
    workTime: 'Work time',
    restTime: 'Rest time',
    longRestTime: 'Long rest',
    cycles: 'Cycles',
    start: 'Start',
    pause: 'Pause',
    stop: 'Stop',
    reset: 'Reset',
    settings: 'Settings',
    work: 'Work',
    rest: 'Rest',
    longRest: 'Long rest',
    cyclesCompleted: 'Cycles completed',
    nextCycle: 'Next cycle',
    nextRest: 'Next rest',
    nextWork: 'Next work',
    nextLongRest: 'Next long rest',
    minutes: 'minutes',
    autostart: 'Auto-start next phase'
  },
  periods: {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    custom: 'Custom',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    all: 'All time'
  },
  settings: {
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    defaultScreen: 'Default screen',
    dark: 'Dark',
    light: 'Light',
    system: 'System'
  },
  save: 'Save',
  cancel: 'Cancel',
  error: 'Error',
  success: 'Success',
  loading: 'Loading...'
};

// Русский перевод
const ru = {
  app: {
    title: 'Учет времени'
  },
  auth: {
    login: 'Вход',
    register: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    rememberMe: 'Запомнить меня',
    forgotPassword: 'Забыли пароль?',
    dontHaveAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    signUp: 'Зарегистрироваться',
    signIn: 'Войти',
    logout: 'Выйти'
  },
  nav: {
    timer: 'Таймер',
    statistics: 'Статистика',
    reports: 'Отчеты',
    pomodoro: 'Помидоро',
    settings: 'Настройки',
    logout: 'Выход'
  },
  timer: {
    start: 'Запустить',
    pause: 'Пауза',
    stop: 'Стоп',
    waiting: 'Ожидание',
    running: 'Запущен',
    paused: 'На паузе',
    currentTask: 'Текущая задача',
    notSelected: 'Не выбрана',
    workType: 'Тип работы',
    addLimitation: 'Ограничение',
    resetLimitation: 'Сбросить',
    limitValue: 'Лимит:',
    timeLimit: {
      setLimit: 'Установите ограничение времени',
      enterValue: 'Введите свой тип',
      hours: 'Часы',
      minutes: 'Минуты'
    },
    dailyTotal: 'Сегодня отработано',
    standard: {
      development: 'Веб-разработка',
      design: 'Дизайн',
      marketing: 'Маркетинг',
      meeting: 'Встреча',
      other: 'Другое',
      new: 'Добавить свой тип'
    }
  },
  pomodoro: {
    workTime: 'Время работы',
    restTime: 'Время отдыха',
    longRestTime: 'Длинный отдых',
    cycles: 'Циклы',
    start: 'Старт',
    pause: 'Пауза',
    stop: 'Стоп',
    reset: 'Сброс',
    settings: 'Настройки',
    work: 'Работа',
    rest: 'Отдых',
    longRest: 'Длинный отдых',
    cyclesCompleted: 'Завершено циклов',
    nextCycle: 'Следующий цикл',
    nextRest: 'Следующий отдых',
    nextWork: 'Следующая работа',
    nextLongRest: 'Следующий длинный отдых',
    minutes: 'минут',
    autostart: 'Автоматический переход'
  },
  periods: {
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    custom: 'Другое',
    today: 'Сегодня',
    yesterday: 'Вчера',
    thisWeek: 'Эта неделя',
    lastWeek: 'Прошлая неделя',
    thisMonth: 'Этот месяц',
    lastMonth: 'Прошлый месяц',
    all: 'Все время'
  },
  settings: {
    language: 'Язык',
    theme: 'Тема',
    notifications: 'Уведомления',
    defaultScreen: 'Экран по умолчанию',
    dark: 'Темная',
    light: 'Светлая',
    system: 'Системная'
  },
  save: 'Сохранить',
  cancel: 'Отмена',
  error: 'Ошибка',
  success: 'Успешно',
  loading: 'Загрузка...'
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

console.log('i18next initialized successfully with language:', i18n.language);

export default i18n; 