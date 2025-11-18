let currentUser = '';
let currentContact = '';

document.getElementById('loginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    if (username) {
        currentUser = username;
        document.getElementById('login').classList.remove('visible');
        document.getElementById('chat').classList.add('visible');
        loadContacts();
        loadUsers();
    }
});

document.getElementById('contactsTab').addEventListener('click', function() {
    document.getElementById('contactsTab').classList.add('active');
    document.getElementById('usersTab').classList.remove('active');
    document.getElementById('contacts').classList.add('active');
    document.getElementById('users').classList.remove('active');
});

document.getElementById('usersTab').addEventListener('click', function() {
    document.getElementById('usersTab').classList.add('active');
    document.getElementById('contactsTab').classList.remove('active');
    document.getElementById('users').classList.add('active');
    document.getElementById('contacts').classList.remove('active');
});

document.getElementById('searchInput').addEventListener('input', function() {
    const filter = this.value;
    if (document.getElementById('contacts').classList.contains('active')) {
        loadContacts(filter);
    } else {
        loadUsers(filter);
    }
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

function loadUsers(filter = '') {
    const allUsers = [];
    const users = allUsers.filter(user => user.toLowerCase().includes(filter.toLowerCase()));
    const usersList = document.getElementById('users');
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        li.addEventListener('click', () => selectContact(user));
        usersList.appendChild(li);
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