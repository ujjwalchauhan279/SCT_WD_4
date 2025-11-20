// Select Dom Elements
const input = document.getElementById('todo-input')
const addBtn = document.getElementById('add-btn')
const list = document.getElementById('todo-list')

// NEW selectors for calendar/date input
const dateTimeInput = document.getElementById("todo-datetime");
const calendarIcon = document.getElementById("calendar-icon");

// NEW popup selectors
const popup = document.getElementById("datetime-popup");
const popupDate = document.getElementById("popup-date");
const popupTime = document.getElementById("popup-time");
const saveDT = document.getElementById("save-datetime");

// Load saved todos
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Create todo items
function createTodoNode(todo, index) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;

        textSpan.style.textDecoration = todo.completed ? 'line-through' : "";
        textSpan.style.color = todo.completed ? '#b0b0b0' : '#fff';
        saveTodos();
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = todo.text;
    textSpan.style.margin = '0 8px';
    if (todo.completed) textSpan.style.textDecoration = 'line-through';

    // edit on double click
    textSpan.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const newText = prompt("Edit todo", todo.text);
        if (newText !== null) {
            todo.text = newText.trim();
            textSpan.textContent = todo.text;
            saveTodos();
        }
    });

    const dateSpan = document.createElement("small");
    dateSpan.style.color = "#ccc";
    dateSpan.style.display = "block";
    dateSpan.style.fontSize = "0.8rem";

    if (todo.dateTime) {
        const d = new Date(todo.dateTime);
        if (!isNaN(d)) dateSpan.textContent = "⏱ " + d.toLocaleString();
    }

    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.addEventListener('click', () => {
        todos.splice(index, 1);
        render();
        saveTodos();
    });

    const container = document.createElement("div");
    container.style.flex = "1";
    container.style.marginLeft = "10px";
    container.appendChild(textSpan);
    container.appendChild(dateSpan);

    li.appendChild(checkbox);
    li.appendChild(container);
    li.appendChild(delBtn);

    return li;
}

// Render list
function render() {
    list.innerHTML = '';
    todos.forEach((todo, index) => {
        const node = createTodoNode(todo, index);
        list.appendChild(node)
    });
}

function addTodo() {
    const text = input.value.trim();
    const dateTime = dateTimeInput ? dateTimeInput.value : "";

    if (!text) return;

    todos.push({
        text: text,
        completed: false,
        dateTime: dateTime
    });

    input.value = '';
    if (dateTimeInput) dateTimeInput.value = '';
    popupDate.value = '';
    popupTime.value = '';

    render();
    saveTodos();
}

addBtn.addEventListener("click", addTodo);
input.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') addTodo();
});

calendarIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.style.display = popup.style.display === "flex" ? "none" : "flex";
});

saveDT.addEventListener("click", () => {
    if (dateTimeInput) {
        dateTimeInput.value = popupDate.value + "T" + popupTime.value;
    }
    popup.style.display = "none";
});

document.addEventListener("click", () => {
    popup.style.display = "none";
});

popup.addEventListener("click", (e) => e.stopPropagation());

render();
