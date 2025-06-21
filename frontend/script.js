const API = 'http://localhost:4000';
let currentUser = null;

const $ = id => document.getElementById(id);

const prompts = [
  "🌟 What made you smile today?",
  "🧘 How are you feeling right now?",
  "📅 What goals did you accomplish today?",
  "❤️ Write about someone you're grateful for.",
];

function randomPrompt() {
  $('prompt').innerText = prompts[Math.floor(Math.random() * prompts.length)];
}

window.onload = () => {
  if (localStorage.userId) {
    currentUser = localStorage.userId;
    showApp();
  }
  randomPrompt();
};

$('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const username = $('register-username').value;
  const res = await fetch(`${API}/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.userId = data.userId;
    currentUser = data.userId;
    showApp();
  } else {
    alert(data.error);
  }
};

$('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const username = $('login-username').value;
  const res = await fetch(`${API}/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.userId = data.userId;
    currentUser = data.userId;
    showApp();
  } else {
    alert(data.error);
  }
};

function showApp() {
  $('register-form').style.display = 'none';
  $('login-form').style.display = 'none';
  $('logout-btn').style.display = 'block';
  $('entry-form').style.display = 'block';
  loadEntries();
}

$('logout-btn').onclick = () => {
  localStorage.clear();
  location.reload();
};

$('entry-form').onsubmit = async (e) => {
  e.preventDefault();
  const title = $('title').value;
  const content = $('content').value;
  const res = await fetch(`${API}/entries`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, userId: currentUser })
  });
  if (res.ok) {
    e.target.reset();
    loadEntries();
  } else {
    alert("Error saving");
  }
};

async function loadEntries() {
  const res = await fetch(`${API}/entries/${currentUser}`);
  const entries = await res.json();
  $('entries').innerHTML = '';
  entries.reverse().forEach(e => {
    const div = document.createElement('div');
    div.className = 'entry';
    const date = new Date(e.createdAt).toLocaleString();
    div.innerHTML = `
      <h3>${e.title}</h3>
      <small>${date}</small>
      <p>${e.content}</p>
      <button onclick="editEntry('${e._id}', \`${e.title}\`, \`${e.content}\`)">✏️ Edit</button>
      <button onclick="deleteEntry('${e._id}')">🗑 Delete</button>
      <button onclick="exportPDF('${e.title}', \`${e.content}\`)">📄 Download PDF</button>
    `;
    $('entries').appendChild(div);
  });
}

async function deleteEntry(id) {
  await fetch(`${API}/entries/${id}`, { method: 'DELETE' });
  loadEntries();
}

function editEntry(id, title, content) {
  const newTitle = prompt("Edit title:", title);
  const newContent = prompt("Edit content:", content);
  if (newTitle && newContent) {
    fetch(`${API}/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, content: newContent })
    }).then(loadEntries);
  }
}

function exportPDF(title, content) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(title, 10, 10);
  doc.text(content, 10, 20);
  doc.save(`${title}.pdf`);
}
