# Implementation Plan: Focus Tracker Enhancements

## 1. HTML Changes (`index.html`)

### **Add Manual Entry Modal**
We need a modal dialog to handle manual entry of tasks. This will be hidden by default and shown when triggered.

**Location:** Inside `<body>`, preferably at the end of `<main>` or just before `<script>`.

```html
<!-- Manual Entry Modal -->
<div id="manual-entry-modal" class="modal hidden">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Log Past Task</h2>
        
        <div class="form-group">
            <label for="manual-task-name">Task Name</label>
            <input type="text" id="manual-task-name" placeholder="What did you do?">
        </div>

        <div class="form-group">
            <label for="manual-task-type">Type</label>
            <select id="manual-task-type">
                <option value="Study">Study</option>
                <option value="Break">Break</option>
                <option value="Distraction">Distraction</option>
            </select>
        </div>

        <div class="form-group">
            <label for="manual-date">Date</label>
            <input type="date" id="manual-date">
        </div>

        <div class="time-row">
            <div class="form-group">
                <label for="manual-start-time">Start Time</label>
                <input type="time" id="manual-start-time">
            </div>
            <div class="form-group">
                <label for="manual-end-time">End Time</label>
                <input type="time" id="manual-end-time">
            </div>
        </div>

        <div class="modal-actions">
            <button id="save-manual-btn" class="btn start">Save Entry</button>
            <button id="cancel-manual-btn" class="btn cancel">Cancel</button>
        </div>
    </div>
</div>
```

### **Add "Log Past Activity" Button**
A button to manually open this modal without a gap prompt.

**Location:** Inside `<section class="timer-section">`, possibly near the controls or below them.

```html
<button id="manual-entry-btn" class="btn-text" style="margin-top: 10px; font-size: 0.9rem;">+ Log Past Activity</button>
```

---

## 2. CSS Changes (`style.css`)

### **Modal Styles**
We need styles for the overlay and the modal box.

```css
/* Modal Overlay */
.modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex; /* Centering */
    justify-content: center;
    align-items: center;
    opacity: 1;
    transition: opacity 0.3s ease;
}

.modal.hidden {
    display: none;
    opacity: 0;
    pointer-events: none;
}

/* Modal Content */
.modal-content {
    background-color: var(--card-bg);
    padding: 30px;
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    position: relative;
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 28px;
    font-weight: bold;
    color: #aaa;
    cursor: pointer;
}

.close-modal:hover {
    color: var(--text-color);
}

.form-group {
    margin-bottom: 15px;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    font-size: 0.9rem;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
}

.time-row {
    display: flex;
    gap: 15px;
}

.time-row .form-group {
    flex: 1;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
```

---

## 3. JavaScript Logic (`script.js`)

### **New DOM Elements**
Select the new modal elements (`manual-entry-modal`, inputs, buttons).

### **Gap Detection Logic**
This will run inside `startTimer()` *before* the timer actually starts.

**Algorithm:**
1.  Get the last task: `const lastTask = tasks[0];` (assuming sorted by desc time).
2.  Get current time `now`.
3.  Calculate gap: `const gapValues = now - lastTask.endTime`.
4.  Define Threshold: `const GAP_THRESHOLD = 5 * 60 * 1000;` (5 minutes).
5.  If `gap > GAP_THRESHOLD`:
    *   Format `lastTask.endTime` as "HH:MM".
    *   Format `now` as "HH:MM".
    *   Show `confirm()` or custom prompt: "Gap detected from [Start] to [End]. Log it?"
    *   If Yes:
        *   Open Modal.
        *   **Pre-fill:** Start Time = `lastTask.endTime`, End Time = `now`.
        *   **Important:** Do *not* start the timer yet. Let user save manual entry. Optionally start timer after saving, or just let them click start again.

### **Manual Entry Logic**
1.  **Open Modal Function:** `openManualEntryModal(startTime, endTime)`
    *   If `startTime` and `endTime` provided, set inputs.
    *   Set Date input to today.
    *   Remove `hidden` class.
2.  **Save Manual Task Function:**
    *   Read inputs.
    *   **Validation:**
        *   Start Time < End Time.
        *   Name required.
    *   **Create Task Object:**
        *   `startDate =` Date/Time object from inputs.
        *   `endDate =` Date/Time object from inputs.
        *   `duration = endDate - startDate`.
        *   `id = Date.now()`.
    *   **Add to Array:** `tasks.push(newTask)`.
    *   **Sort Logic:** Since we are adding past tasks, `tasks.unshift()` (add to top) might break order. We need to `tasks.sort((a,b) => b.startTime - a.startTime)` after adding to ensure history stays correct.
    *   **Save & Render:** `saveTasks()`, `renderHistory()`, `renderSummary()`.
    *   **Close Modal.**

### **Helper Functions needed**
*   `parseTimeInput(dateStr, timeStr)`: Returns timestamp.
*   `formatTimeInput(timestamp)`: Returns "HH:MM" string for inputs.
