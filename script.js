let currentUser = '';
let currentContact = '';

document.getElementById('loginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    if (username) {
        currentUser = username;
        document.getElementById('login').classList.remove('visible');
        document.getElementById('chat').classList.add('visible');
        loadContacts();
    }
});

document.getElementById('searchInput').addEventListener('input', function() {
    const filter = this.value;
    loadContacts(filter);
});

function loadContacts(filter = '') {
    const allContacts = [];
    const contacts = allContacts.filter(contact => contact.toLowerCase().includes(filter.toLowerCase()));
    const contactsList = document.getElementById('contacts');
    contactsList.innerHTML = '';
    contacts.forEach(contact => {
        const li = document.createElement('li');
        li.textContent = contact;
        li.addEventListener('click', () => selectContact(contact));
        contactsList.appendChild(li);
    });
}

function selectContact(contact) {
    currentContact = contact;
    loadMessages(contact);
}

function loadMessages(contact) {
    const messages = JSON.parse(localStorage.getItem(`messages_${currentUser}_${contact}`)) || [];
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(msg.sender === currentUser ? 'sent' : 'received');
        msgDiv.textContent = msg.text;
        messagesDiv.appendChild(msgDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

document.getElementById('sendBtn').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value;
    if (text && currentContact) {
        const messages = JSON.parse(localStorage.getItem(`messages_${currentUser}_${currentContact}`)) || [];
        messages.push({ sender: currentUser, text: text });
        localStorage.setItem(`messages_${currentUser}_${currentContact}`, JSON.stringify(messages));
        messageInput.value = '';
        loadMessages(currentContact);
    }
});

document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('sendBtn').click();
    }
});

document.getElementById('callBtn').addEventListener('click', function() {
    if (currentContact) {
        document.getElementById('callContact').textContent = currentContact;
        document.getElementById('call').classList.add('visible');
        document.getElementById('messages').classList.remove('visible');
    }
});

document.getElementById('hangupBtn').addEventListener('click', function() {
    document.getElementById('call').classList.remove('visible');
    document.getElementById('messages').classList.add('visible');
});