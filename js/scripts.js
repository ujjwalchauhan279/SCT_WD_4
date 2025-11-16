// Select Dom Elements
const input = document.getElementById('todo-input')
const addBtn = document.getElementById('add-btn')
const list = document.getElementById('todo-list')

// NEW/ROBUST selectors for calendar/date input (may be absent if HTML not updated)
const dateTimeInput = document.getElementById("todo-datetime");
const calendarIcon = document.getElementById("calendar-icon");

// Try to load saved todos from localStorage (if any)
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

function saveTodos() {
    // Save current todos array to localStorage
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Create a DOM node for a todo object and append it to the list
function createTodoNode(todo, index) {
    const li = document.createElement('li');

    // checkbox to toggle completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;

        // Visual feedback: strike-through when completed
        textSpan.style.textDecoration = todo.completed ? 'line-through' : "";
        textSpan.style.color = todo.completed ? '#b0b0b0' : '#fff';
        saveTodos();
    })

    // Text of the todo
    const textSpan = document.createElement("span");
    textSpan.textContent = todo.text;
    textSpan.style.margin = '0 8px';
    textSpan.style.pointerEvents = 'auto'; // ensure dblclick works
    if (todo.completed) {
        textSpan.style.textDecoration = 'line-through';
    }

    // Add double-click event listener to edit todo
    textSpan.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const newText = prompt("Edit todo", todo.text);
        if (newText !== null) {
            todo.text = newText.trim()
            textSpan.textContent = todo.text;
            saveTodos();
        }
    })

    // ⭐ Date & Time Display
    const dateSpan = document.createElement("small");
    dateSpan.style.color = "#ccc";
    dateSpan.style.display = "block";
    dateSpan.style.fontSize = "0.8rem";
    dateSpan.style.pointerEvents = "none"; // don't block dblclicks on text

    if (todo.dateTime) {
        // handle invalid date gracefully
        try {
            const d = new Date(todo.dateTime);
            if (!isNaN(d)) dateSpan.textContent = "⏱ " + d.toLocaleString();
            else dateSpan.textContent = "";
        } catch {
            dateSpan.textContent = "";
        }
    } else {
        dateSpan.textContent = ""; // keep empty if no date
    }

    // Delete Todo Button 
    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.addEventListener('click', () => {
        todos.splice(index, 1);
        render();
        saveTodos();
    })

    // Container for text + date (to preserve layout)
    const container = document.createElement("div");
    container.style.flex = "1";
    container.style.marginLeft = "10px";
    container.appendChild(textSpan);
    container.appendChild(dateSpan);

    li.appendChild(checkbox);
    li.appendChild(container);
    li.appendChild(delBtn);
    return li
}

// Render the whole todo list from todos array
function render() {
    list.innerHTML = '';

    // Recreate each item
    todos.forEach((todo, index) => {
        const node = createTodoNode(todo, index);
        list.appendChild(node)
    });
}

function addTodo() {
    const text = input.value.trim();
    const dateTime = dateTimeInput ? dateTimeInput.value : ""; // safe if missing

    if (!text) {
        return
    }

    // Push a new todo object
    todos.push({ 
        text: text, 
        completed: false,
        dateTime: dateTime
    });
    input.value = '';
    if (dateTimeInput) dateTimeInput.value = '';
    render()
    saveTodos()
}

addBtn.addEventListener("click", addTodo);
input.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        addTodo();
    }
})

// ⭐ Robust calendar icon behavior (works across browsers)
// Only attach if the elements actually exist
if (calendarIcon && dateTimeInput) {
    calendarIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        // Preferred API (some browsers) — call if available
        try {
            if (typeof dateTimeInput.showPicker === "function") {
                dateTimeInput.showPicker();
                return;
            }
        } catch (err) {
            // ignore and fallback
        }

        // Fallback: focus + click (works on most browsers)
        try {
            dateTimeInput.focus();
            // dispatch a click event as some browsers will open native picker on click
            const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
            dateTimeInput.dispatchEvent(ev);
            // also call click just in case
            dateTimeInput.click();
        } catch (err) {
            // Last resort: alert user
            console.warn("Could not programmatically open picker — please click the date box to set date/time.");
        }
    });
} else {
    // If elements not present, no-op but inform console (safe)
    if (!calendarIcon) console.warn("calendarIcon (#calendar-icon) not found in DOM.");
    if (!dateTimeInput) console.warn("dateTimeInput (#todo-datetime) not found in DOM.");
}

// Initial render
render();
