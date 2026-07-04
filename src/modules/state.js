import { TODAY_ISO, TODAY } from './utils.js';

// ── APP STATE ─────────────────────────────────────────────────
const _state = {
  // Auth
  firebaseAuth:     null,
  currentAuthUser:  null,
  authMode:         'login',

  // Family
  familyId:   localStorage.getItem('fp_family_id')   || '',
  familyName: localStorage.getItem('fp_family_name') || '',

  // Members
  members:        [],
  av:             {},
  photos:         {},
  memberColorMap: {},

  // User
  curUser: localStorage.getItem('fp_user') || '',

  // UI
  tab:     'overview',
  modalEl: null,

  // Tasks
  tasks:            [],
  selDay:           TODAY,
  selISO:           TODAY_ISO,
  taskSaving:       false,
  todayView:        'mine',
  todayMember:      null,
  fd: {
    title: '', emoji: '', day: TODAY, date: TODAY_ISO,
    time: '12:00', endTime: '', color: localStorage.getItem('fp_last_color') || '#007AFF',
    recurring: 'once', recurringInterval: 1, weekdays: [], type: 'task',
    location: '', attendees: [], openTodo: false, visibleTo: 'all',
  },
  ed: null,

  // Calendar
  calView:   'month',
  calYear:   new Date().getFullYear(),
  calMonth:  new Date().getMonth(),
  calSelISO: TODAY_ISO,
  calDayView: 'timeline',
  calZoom:         0,
  calShowTimeline: false,
  todayTimeline:  false,
  todayGrouped:   true,
  dayNotes:       {},

  // Comments
  taskComments: {},

  // Shopping
  shopItems:      [],
  shopLists:      [],
  activeShopList: localStorage.getItem('fp_active_shop_list') || 'Wocheneinkauf',
  shopView:       'list',
  collapsedCats:  new Set(),

  // Meals
  meals:          {},
  mealRecipes:    {},
  mealWeekOffset: 0,
  newMealEmoji:   '🍽️',

  // Board
  boardPosts:    {},
  boardLastSeen: 0,

  // Plan / Premium
  userPlan:       'free',
  _verifiedPlan:  'free',
  userPlanData:   {},
  _planLastVerified: 0,

  // Push
  _reminderTimers:   [],
  _boardLastVisible: 0,

  // Onboarding
  obCurrentSlide: 0,
  obSelectedEmoji: '🧑',
};

const _listeners = [];

export const state = new Proxy(_state, {
  set(target, key, value) {
    target[key] = value;
    _listeners.forEach(fn => fn(key, value));
    return true;
  }
});

export function setState(patch) {
  Object.entries(patch).forEach(([k, v]) => { state[k] = v; });
}

export function onStateChange(fn) {
  _listeners.push(fn);
}

export function DB() {
  return `https://family-task-2cacf-default-rtdb.europe-west1.firebasedatabase.app/families/${state.familyId}`;
}
