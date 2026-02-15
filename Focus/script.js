// State Variables
let tasks = [];
let timerInterval = null;
let startTime = null;
let isRunning = false;
let currentTaskName = "";
let currentTaskType = "Study";

// DOM Elements
const timerDisplay = document.getElementById('timer');
const taskNameInput = document.getElementById('task-name');
const taskTypeSelect = document.getElementById('task-type');
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const cancelBtn = document.getElementById('cancel-btn');
const historyList = document.getElementById('history-list');
const summaryContainer = document.getElementById('summary-container');
const clockDisplay = document.getElementById('real-time-clock');
const clearDataBtn = document.getElementById('clear-data-btn');

// Manual Entry Elements
const manualEntryBtn = document.getElementById('manual-entry-btn');
const manualModal = document.getElementById('manual-entry-modal');
const closeModalSpan = document.querySelector('.close-modal');
const saveManualBtn = document.getElementById('save-manual-btn');
const cancelManualBtn = document.getElementById('cancel-manual-btn');
const manualNameInput = document.getElementById('manual-task-name');
const manualTypeInput = document.getElementById('manual-task-type');
const manualDateInput = document.getElementById('manual-task-date');
const manualStartTimeInput = document.getElementById('manual-start-time');
const manualEndTimeInput = document.getElementById('manual-end-time');

let activityChartInstance = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setInterval(updateClock, 1000);
    updateClock(); // Initial call
    updateUIState();
    renderTodoList(); // Added

    // Initialize SPA features
    initSPA();
    console.log("Focus App Initialized");
});

/* --- SPA & New Features Logic --- */

// State for new features
let currentUser = localStorage.getItem('focusUser') || null;
let currentView = 'dashboard-view';
let events = JSON.parse(localStorage.getItem('focusEvents')) || {};
let journalEntries = JSON.parse(localStorage.getItem('focusJournal')) || {};
let todos = JSON.parse(localStorage.getItem('focusTodos')) || {};
let currentTodoDate = new Date();
let selectedDateKey = null;

// Calendar State
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Elements
const loginView = document.getElementById('login-view');
const appContainer = document.getElementById('app-container');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const navButtons = document.querySelectorAll('.nav-btn[data-view]');
const views = document.querySelectorAll('.view-section');

// Calendar Elements
const calendarGrid = document.getElementById('calendar-grid');
const monthYearDisplay = document.getElementById('month-year-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const eventModal = document.getElementById('event-modal');
const closeEventModalBtn = document.querySelector('.close-event-modal');
const eventDateDisplay = document.getElementById('event-date-display');
const eventInput = document.getElementById('event-input');
const eventTimeInput = document.getElementById('event-time-input');
const saveEventBtn = document.getElementById('save-event-btn');
const eventListDisplay = document.getElementById('event-list-display');
const todoDateDisplay = document.getElementById('todo-date-display');
const todoDatePicker = document.getElementById('todo-date-picker');
const prevDayBtn = document.getElementById('prev-day-btn');
const nextDayBtn = document.getElementById('next-day-btn');
const newTodoInput = document.getElementById('new-todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const todoEmptyState = document.getElementById('todo-empty-state');

// Journal Elements
const journalDatePicker = document.getElementById('journal-date-picker');
const journalSummary = document.getElementById('journal-summary');
const journalGood = document.getElementById('journal-good');
const journalImprove = document.getElementById('journal-improve');
const saveJournalBtn = document.getElementById('save-journal-btn');
const journalStatus = document.getElementById('journal-status');
const journalList = document.getElementById('journal-list'); // Added

function initSPA() {
    // Check Login
    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }

    // Event Listeners
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);

    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;
            switchView(targetView);
        });
    });

    // Calendar
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    closeEventModalBtn.addEventListener('click', () => eventModal.classList.add('hidden'));
    saveEventBtn.addEventListener('click', saveEvent);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            eventModal.classList.add('hidden');
        }
    });

    // To-Do Logic
    renderTodoList();
    prevDayBtn.addEventListener('click', () => changeTodoDate(-1));
    nextDayBtn.addEventListener('click', () => changeTodoDate(1));
    todoDatePicker.addEventListener('change', (e) => {
        if(e.target.value) {
            const [y, m, d] = e.target.value.split('-').map(Number);
            currentTodoDate = new Date(y, m - 1, d);
            renderTodoList();
        }
    });
    addTodoBtn.addEventListener('click', addTodo);
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Journal
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    journalDatePicker.value = today;
    loadJournal(today);
    renderJournalList(); // Added

    journalDatePicker.addEventListener('change', (e) => loadJournal(e.target.value));
    saveJournalBtn.addEventListener('click', saveJournal);
}

// --- Auth & Navigation ---

function login() {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('focusUser', currentUser);
        showApp();
    } else {
        alert("Please enter a username");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('focusUser');
    showLogin();
}

function showApp() {
    loginView.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userDisplay.textContent = `(${currentUser})`;
    switchView('dashboard-view');
    renderCalendar(currentMonth, currentYear);
    renderTodoList(); // Added
}

function showLogin() {
    loginView.classList.remove('hidden');
    appContainer.classList.add('hidden');
    usernameInput.value = "";
}

function switchView(viewId) {
    // Update Content
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    });

    // Update Nav Buttons
    navButtons.forEach(btn => {
        if (btn.dataset.view === viewId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    currentView = viewId;
    renderTodoList(); // Added
    if (viewId === 'journal-view') renderJournalList();
}

// --- Calendar Logic ---

function renderCalendar(month, year) {
    calendarGrid.innerHTML = "";
    
    // Update Header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dayCount = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // 1. Render Days of Week Header
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day-header');
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // 2. Empty Slots for previous month
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    // 3. Days of the Month
    const today = new Date();
    
    for (let i = 1; i <= dayCount; i++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');

        // Check if Today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayCell.classList.add('today');
        }

        // Date Number
        const dateNum = document.createElement('div');
        dateNum.classList.add('day-number');
        dateNum.textContent = i;
        dayCell.appendChild(dateNum);

        // Date Key for Data Lookup (YYYY-MM-DD)
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // Add Events Dots/List
        const dayEvents = events[dateKey] || [];
        const dayTodos = todos[dateKey] || [];
        
        // Render max 3 items (mix of events and todos) to avoid overflow
        const totalItems = dayEvents.length + dayTodos.length;
        const displayLimit = 3; 

        // 1. Events (Blue)
        dayEvents.slice(0, displayLimit).forEach(evt => {
            const evtDiv = document.createElement('div');
            evtDiv.classList.add('calendar-event');
            evtDiv.textContent = evt.time ? `${evt.time} ${evt.text}` : evt.text;
            evtDiv.title = evt.text;
            dayCell.appendChild(evtDiv);
        });

        // 2. Todos (Green/Check)
        // If we have space left
        if (dayEvents.length < displayLimit) {
            const todoLimit = displayLimit - dayEvents.length;
            dayTodos.slice(0, todoLimit).forEach(todo => {
                const todoDiv = document.createElement('div');
                todoDiv.classList.add('calendar-todo');
                if(todo.completed) todoDiv.classList.add('completed');
                todoDiv.textContent = `• ${todo.text}`;
                dayCell.appendChild(todoDiv);
            });
        }

        // More indicator
        if (totalItems > displayLimit) {
            const moreDiv = document.createElement('div');
            moreDiv.classList.add('calendar-more');
            moreDiv.textContent = `+${totalItems - displayLimit} more`;
            dayCell.appendChild(moreDiv);
        }

        // Corrected: Open Event Modal for Reminders/Events
        dayCell.addEventListener('click', () => {
             // Keep the Todo date sync just in case user switches tabs manually after clicking
            currentTodoDate = new Date(year, month, i);
            openEventModal(dateKey);
        });

        calendarGrid.appendChild(dayCell);
    }
}

// Ensure "events" and "todos" are globally accessible (they are declared at top)

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
}

// NOTE: eventModal, openEventModal, renderEventList, saveEvent are likely no longer needed 
// if we are switching to a "Day View" approach on click. 
// BUT, if you want to keep the modal for "Events" specifically, we can keep them.
// The user prompt said: "Replace the old Calendar logic and append the new Todo logic."
// AND the user plan said: "Calendar & Todo Logic: Replace the old Calendar logic and append the new Todo logic."
// The previous code had a "modal" for events. The new logic I wrote above switches to 'todo-view'.

// I will keep the event modal helper functions just in case, but they might be unused if we switch views.
// However, the "saveEvent" function is used by the "Add Event" button possibly?
// Let's assume the "Day View" (Todo View) handles both or we just use Todo View now.
// The user said "append the new Todo logic". 
// I will assume my new renderCalendar implementation is what's desired for "Calendar Logic".

// Let's also include the "new Todo logic" if it was meant to be appended/replaced.
// But I saw "To-Do Logic" already in the file.
// If the user meant "ensure the Todo logic I gave you is what is in the file", I should check.
// Since I don't have "new" todo logic provided in the prompt, I will assume the user wanted me to *modify* renderCalendar to *show* todos (as I did above) and perhaps ensure the `renderTodoList` function interacts correctly.

// Wait, looking at the previous file content, `renderCalendar` was lines 222-268. 
// I will replace that block with the new one I wrote.


function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
}

function openEventModal(dateKey) {
    selectedDateKey = dateKey;
    eventDateDisplay.textContent = dateKey;
    eventInput.value = "";
    eventTimeInput.value = "";
    renderEventList(dateKey);
    eventModal.classList.remove('hidden');
}

function renderEventList(dateKey) {
    eventListDisplay.innerHTML = "";
    if (events[dateKey]) {
        events[dateKey].forEach((evt, index) => {
            const li = document.createElement('li');
            // If evt is old string format or new object format
            if (typeof evt === 'string') {
                li.textContent = evt;
            } else {
                li.textContent = `${evt.time ? evt.time + ' - ' : ''}${evt.text}`;
            }
            eventListDisplay.appendChild(li);
        });
    }
}

function saveEvent() {
    const text = eventInput.value.trim();
    const time = eventTimeInput.value;
    if (!text) return;

    if (!events[selectedDateKey]) {
        events[selectedDateKey] = [];
    }

    // Save as object
    events[selectedDateKey].push({ text, time });
    
    // Sort events by time if available
    events[selectedDateKey].sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });

    localStorage.setItem('focusEvents', JSON.stringify(events));
    
    renderEventList(selectedDateKey);
    eventInput.value = "";
    eventTimeInput.value = "";
    renderCalendar(currentMonth, currentYear); // Refresh grid to show new event
}

// --- To-Do Logic ---

function getTodoDateKey(date) {
    return date.toISOString().split('T')[0];
}

function renderTodoList() {
    // Update Header Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todoDateDisplay.textContent = currentTodoDate.toLocaleDateString('en-US', options);

    const year = currentTodoDate.getFullYear();
    const month = String(currentTodoDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentTodoDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // Sync Date Picker
    todoDatePicker.value = dateKey;

    const dailyTodos = todos[dateKey] || [];

    todoList.innerHTML = "";
    
    if (dailyTodos.length === 0) {
        todoEmptyState.classList.remove('hidden');
    } else {
        todoEmptyState.classList.add('hidden');
        dailyTodos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.classList.add('todo-item');
            if (todo.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <button class="delete-todo-btn" title="Delete Task">&times;</button>
            `;

            // Event Listeners
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleTodo(dateKey, index));

            const deleteBtn = li.querySelector('.delete-todo-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(dateKey, index));

            todoList.appendChild(li);
        });
    }
}

function changeTodoDate(days) {
    currentTodoDate.setDate(currentTodoDate.getDate() + days);
    renderTodoList();
}

function addTodo() {
    const text = newTodoInput.value.trim();
    if (!text) return;

    const year = currentTodoDate.getFullYear();
    const month = String(currentTodoDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentTodoDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    if (!todos[dateKey]) {
        todos[dateKey] = [];
    }

    todos[dateKey].push({
        text: text,
        completed: false,
        createdAt: new Date().getTime()
    });

    localStorage.setItem('focusTodos', JSON.stringify(todos));
    newTodoInput.value = "";
    renderTodoList();
}

function toggleTodo(dateKey, index) {
    todos[dateKey][index].completed = !todos[dateKey][index].completed;
    localStorage.setItem('focusTodos', JSON.stringify(todos));
    renderTodoList();
}

function deleteTodo(dateKey, index) {
    if (confirm("Are you sure you want to delete this task?")) {
        todos[dateKey].splice(index, 1);
        if (todos[dateKey].length === 0) {
            delete todos[dateKey];
        }
        localStorage.setItem('focusTodos', JSON.stringify(todos));
        renderTodoList();
    }
}

// --- Journal Logic ---

function loadJournal(dateKey) {
    // dateKey is YYYY-MM-DD from input[type="date"]
    const entry = journalEntries[dateKey] || { summary: '', good: '', improve: '' };
    
    journalSummary.value = entry.summary;
    journalGood.value = entry.good;
    journalImprove.value = entry.improve;
    journalStatus.textContent = "";
}

function saveJournal() {
    const dateKey = journalDatePicker.value;
    if (!dateKey) {
        alert("Please select a date");
        return;
    }

    journalEntries[dateKey] = {
        summary: journalSummary.value,
        good: journalGood.value,
        improve: journalImprove.value
    };

    localStorage.setItem('focusJournal', JSON.stringify(journalEntries));
    renderJournalList(); // Added to refresh list + sort
    setTimeout(() => { journalStatus.textContent = ""; }, 2000);
}

function renderJournalList() {
    journalList.innerHTML = "";
    const sortedDates = Object.keys(journalEntries).sort((a,b) => b.localeCompare(a));
    
    if (sortedDates.length === 0) {
        journalList.innerHTML = "<p style='text-align:center; opacity:0.7;'>No journal entries found.</p>";
        return;
    }

    sortedDates.forEach(date => {
        const entry = journalEntries[date];
        const card = document.createElement('div');
        
        // Inline styles for card
        card.style.cssText = `
            background: var(--bg-card);
            padding: 15px;
            border-radius: 10px;
            cursor: pointer;
            border: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.2s ease;
        `;
        
        // Hover effect helper via JS since inline styles are tricky for hover
        card.onmouseover = () => card.style.transform = "translateY(-2px)";
        card.onmouseout = () => card.style.transform = "translateY(0)";

        const dateObj = new Date(date);
        // Correct date display for timezones (using simple string parsing or UTC to avoid off-by-one)
        // Since YYYY-MM-DD is local from input, standard Date(str) treats as UTC or Local depending on browser/version.
        // Let's just parse the parts.
        const [y, m, d] = date.split('-');
        const dateStr = new Date(y, m-1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

        const dateSpan = document.createElement('div');
        dateSpan.innerHTML = `<strong>${dateStr}</strong>`;
        
        const previewText = entry.summary ? (entry.summary.substring(0, 40) + (entry.summary.length > 40 ? "..." : "")) : "No summary";
        const textSpan = document.createElement('div');
        textSpan.textContent = previewText;
        textSpan.style.opacity = "0.7";
        textSpan.style.fontSize = "0.9em";

        card.appendChild(dateSpan);
        card.appendChild(textSpan);

        card.addEventListener('click', () => {
            journalDatePicker.value = date;
            loadJournal(date);
            // Scroll to top of journal view
            document.querySelector('.journal-section').scrollIntoView({ behavior: 'smooth' });
        });

        journalList.appendChild(card);
    });
    setTimeout(() => { journalStatus.textContent = ""; }, 2000);
}

// Real-time Clock
function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Timer Logic
function checkAndStartTimer() {
    // 1. Check for basic input validation
    if (!taskNameInput.value.trim()) {
        alert("Please enter a task name.");
        return;
    }

    // 2. Check for Gaps
    if (tasks.length > 0) {
        // Find the latest end time
        const lastTask = tasks.reduce((prev, current) => (prev.endTime > current.endTime) ? prev : current);
        const lastEndTime = lastTask.endTime;
        const now = Date.now();
        const gapThreshold = 5 * 60 * 1000; // 5 minutes

        // Only check gap if the last task was essentially "today" (within last 24h) to avoid prompting after a night's sleep differently
        // But requested is simple gap detection.
        if (now - lastEndTime > gapThreshold) {
            const timeDiffMinutes = Math.floor((now - lastEndTime) / 60000);
            const confirmGap = confirm(
                `Gap detected! You haven't tracked anything for the last ${timeDiffMinutes} minutes.\n` +
                `Time: ${formatTimeOfDay(lastEndTime)} to ${formatTimeOfDay(now)}.\n\n` +
                `Click OK to log this gap manually first.\n` +
                `Click Cancel to ignore and start the timer now.`
            );

            if (confirmGap) {
                 openManualEntryModal(lastEndTime, now);
                 return;
            }
        }
    }

    startTimer();
}

function startTimer() {
    if (!taskNameInput.value.trim()) {
        alert("Please enter a task name.");
        return;
    }

    isRunning = true;
    currentTaskName = taskNameInput.value.trim();
    currentTaskType = taskTypeSelect.value;
    startTime = Date.now();

    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateUIState();
}

function updateTimerDisplay() {
    const elapsed = Date.now() - startTime;
    timerDisplay.textContent = formatDuration(elapsed);
}

function stopTimer(save = true) {
    if (!isRunning) return;

    clearInterval(timerInterval);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (save) {
        const newTask = {
            id: Date.now(),
            name: currentTaskName,
            type: currentTaskType,
            startTime: startTime,
            endTime: endTime,
            duration: duration
        };
        tasks.unshift(newTask); // Add to beginning of list
        saveTasks();
        renderHistory();
        renderSummary();
    }

    // Reset State
    isRunning = false;
    startTime = null;
    timerDisplay.textContent = "00:00:00";
    taskNameInput.value = "";
    updateUIState();
}

function cancelTimer() {
    stopTimer(false);
}

// Helper: Format milliseconds to HH:MM:SS
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Helper: Format Time for Display
function formatTimeOfDay(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// UI Updates
function updateUIState() {
    if (isRunning) {
        startBtn.disabled = true;
        endBtn.disabled = false;
        cancelBtn.disabled = false;
        taskNameInput.disabled = true;
        taskTypeSelect.disabled = true;
    } else {
        startBtn.disabled = false;
        endBtn.disabled = true;
        cancelBtn.disabled = true;
        taskNameInput.disabled = false;
        taskTypeSelect.disabled = false;
    }
}

// Data Persistence
function saveTasks() {
    localStorage.setItem('focusTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const stored = localStorage.getItem('focusTasks');
    if (stored) {
        tasks = JSON.parse(stored);
        renderHistory();
        renderSummary();
    }
}

function clearAllData() {
    if (confirm("Are you sure you want to delete all history?")) {
        tasks = [];
        saveTasks();
        renderHistory();
        renderSummary();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderHistory();
    renderSummary();
}

// Rendering
function renderHistory() {
    historyList.innerHTML = "";

    // Sort tasks by newest first
    tasks.sort((a, b) => b.startTime - a.startTime);
    
    // Group by date logic could be added here, currently just listing all
    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.name}</td>
            <td><span class="type-badge ${task.type.toLowerCase()}">${task.type}</span></td>
            <td>${formatTimeOfDay(task.startTime)}</td>
            <td>${formatTimeOfDay(task.endTime)}</td>
            <td>${formatDuration(task.duration)}</td>
            <td><button class="delete-btn" onclick="deleteTask(${task.id})">×</button></td>
        `;
        historyList.appendChild(row);
    });
}

function renderSummary() {
    // Filter tasks for today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todaysTasks = tasks.filter(t => t.startTime >= startOfDay);

    // Aggregate by type
    const summary = {
        'Study': 0,
        'Break': 0,
        'Distraction': 0,
        'Total': 0
    };

    todaysTasks.forEach(t => {
        summary[t.type] = (summary[t.type] || 0) + t.duration;
        summary['Total'] += t.duration;
    });

    // Generate HTML
    summaryContainer.innerHTML = `
        <div class="summary-card">
            <h3>Productivity (Study)</h3>
            <p style="color: var(--success-color);">${formatDuration(summary['Study'])}</p>
        </div>
        <div class="summary-card">
            <h3>Break Time</h3>
            <p style="color: var(--warning-color);">${formatDuration(summary['Break'])}</p>
        </div>
        <div class="summary-card">
            <h3>Distraction</h3>
            <p style="color: var(--danger-color);">${formatDuration(summary['Distraction'])}</p>
        </div>
        <div class="summary-card">
            <h3>Total Time</h3>
            <p>${formatDuration(summary['Total'])}</p>
        </div>
    `;

    renderChart(summary);
}

function renderChart(summaryData) {
    const ctx = document.getElementById('activityChart').getContext('2d');

    // Prepare data
    const labels = ['Study', 'Break', 'Distraction'];
    const data = [
        summaryData['Study'] / 1000 / 60, // Convert ms to minutes
        summaryData['Break'] / 1000 / 60,
        summaryData['Distraction'] / 1000 / 60
    ];

    // Colors match the CSS variables: success, warning, danger
    const backgroundColors = ['#2ecc71', '#f1c40f', '#e74c3c'];

    if (activityChartInstance) {
        activityChartInstance.data.datasets[0].data = data;
        activityChartInstance.update();
    } else {
        activityChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Activity Distribution (Minutes)'
                    }
                }
            }
        });
    }
}

// Event Listeners
startBtn.addEventListener('click', checkAndStartTimer);
endBtn.addEventListener('click', () => stopTimer(true));
cancelBtn.addEventListener('click', cancelTimer);
clearDataBtn.addEventListener('click', clearAllData);

// Manual Entry Event Listeners
manualEntryBtn.addEventListener('click', () => openManualEntryModal());
closeModalSpan.addEventListener('click', closeManualEntryModal);
cancelManualBtn.addEventListener('click', closeManualEntryModal);
saveManualBtn.addEventListener('click', saveManualEntry);
window.addEventListener('click', (event) => {
    if (event.target == manualModal) {
        closeManualEntryModal();
    }
});

// Manual Entry Functions
function openManualEntryModal(startTimeMs = null, endTimeMs = null) {
    manualModal.style.display = 'flex';
    
    // Default Date to Today
    const now = new Date();
    manualDateInput.valueAsDate = now;

    // Reset Inputs if not provided
    manualNameInput.value = "";
    manualTypeInput.value = "Study";
    
    if (startTimeMs && endTimeMs) {
        // Pre-fill times if suggested by Gap Detection
        // Note: input type="time" expects HH:MM string in 24h format
        manualStartTimeInput.value = new Date(startTimeMs).toTimeString().substring(0, 5);
        manualEndTimeInput.value = new Date(endTimeMs).toTimeString().substring(0, 5);
        
        // Auto-suggest "Break" or "Distraction" for gaps? Let's leave it to user but maybe default the name
        manualNameInput.value = "Untracked Time";
        manualNameInput.focus();
    } else {
        manualStartTimeInput.value = "";
        manualEndTimeInput.value = "";
    }
}

function closeManualEntryModal() {
    manualModal.style.display = 'none';
}

function saveManualEntry() {
    const name = manualNameInput.value.trim();
    const type = manualTypeInput.value;
    const dateVal = manualDateInput.value;
    const startVal = manualStartTimeInput.value;
    const endVal = manualEndTimeInput.value;

    if (!name || !dateVal || !startVal || !endVal) {
        alert("Please fill in all fields.");
        return;
    }

    // Construct Date Objects
    const startDateTime = new Date(`${dateVal}T${startVal}`);
    const endDateTime = new Date(`${dateVal}T${endVal}`);

    if (endDateTime <= startDateTime) {
        alert("End time must be after start time.");
        return;
    }

    const duration = endDateTime - startDateTime;

    const newTask = {
        id: Date.now(),
        name: name,
        type: type,
        startTime: startDateTime.getTime(),
        endTime: endDateTime.getTime(),
        duration: duration
    };

    tasks.push(newTask);
    tasks.sort((a,b) => b.startTime - a.startTime); // Re-sort by newest first
    
    saveTasks();
    renderHistory();
    renderSummary();
    closeManualEntryModal();
}

