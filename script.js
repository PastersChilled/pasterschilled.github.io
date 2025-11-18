let currentUser = '';
let currentContact = '';
let allUsers = [];
let callState = 'none'; // none, calling, incoming, ongoing
const socket = io();

function updateCallUI() {
    const acceptBtn = document.getElementById('acceptBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    const muteBtn = document.getElementById('muteBtn');
    const shareBtn = document.getElementById('shareBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const hangupBtn = document.getElementById('hangupBtn');
    const statusP = document.getElementById('callStatus');

    if (callState === 'incoming') {
        statusP.textContent = `Incoming call from ${currentContact}`;
        acceptBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
        muteBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        cameraBtn.style.display = 'none';
        hangupBtn.style.display = 'none';
    } else if (callState === 'calling') {
        statusP.textContent = `Calling ${currentContact}...`;
        acceptBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
        muteBtn.style.display = 'inline-block';
        shareBtn.style.display = 'inline-block';
        cameraBtn.style.display = 'inline-block';
        hangupBtn.style.display = 'inline-block';
    } else if (callState === 'ongoing') {
        statusP.textContent = `In call with ${currentContact}`;
        acceptBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
        muteBtn.style.display = 'inline-block';
        shareBtn.style.display = 'inline-block';
        cameraBtn.style.display = 'inline-block';
        hangupBtn.style.display = 'inline-block';
    }
}

document.getElementById('loginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    if (username) {
        currentUser = username;
        socket.emit('login', username);
        document.getElementById('login').classList.remove('visible');
        document.getElementById('chat').classList.add('visible');
        loadContacts();
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
        loadUsers(filter, allUsers);
    }
});

function loadContacts(filter = '') {
    const contacts = allUsers.filter(contact => contact.toLowerCase().includes(filter.toLowerCase()));
    const contactsList = document.getElementById('contacts');
    contactsList.innerHTML = '';
    contacts.forEach(contact => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.classList.add('glass-btn', 'contact-btn');
        btn.textContent = contact;
        btn.addEventListener('click', () => selectContact(contact));
        li.appendChild(btn);
        contactsList.appendChild(li);
    });
}

function loadUsers(filter = '', allUsers = []) {
    const users = allUsers.filter(user => user.toLowerCase().includes(filter.toLowerCase()));
    const usersList = document.getElementById('users');
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.classList.add('glass-btn', 'contact-btn');
        btn.textContent = user;
        btn.addEventListener('click', () => selectContact(user));
        li.appendChild(btn);
        usersList.appendChild(li);
    });
}

function selectContact(contact) {
    currentContact = contact;
    loadMessages(contact);
}

function loadMessages(contact) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
}

document.getElementById('sendBtn').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value;
    if (text && currentContact) {
        socket.emit('sendMessage', { to: currentContact, text });
        messageInput.value = '';
    }
});

document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('sendBtn').click();
    }
});

document.getElementById('callBtn').addEventListener('click', function() {
    if (currentContact) {
        socket.emit('call', { to: currentContact });
        callState = 'calling';
        updateCallUI();
        document.getElementById('call').classList.add('visible');
        document.getElementById('messages').classList.remove('visible');
    }
});

document.getElementById('acceptBtn').addEventListener('click', function() {
    callState = 'ongoing';
    updateCallUI();
});

document.getElementById('rejectBtn').addEventListener('click', function() {
    callState = 'none';
    document.getElementById('call').classList.remove('visible');
    document.getElementById('messages').classList.add('visible');
});

document.getElementById('hangupBtn').addEventListener('click', function() {
    callState = 'none';
    document.getElementById('call').classList.remove('visible');
    document.getElementById('messages').classList.add('visible');
});

document.getElementById('muteBtn').addEventListener('click', function() {
    const btn = this;
    if (btn.textContent === 'Mute Mic') {
        btn.textContent = 'Unmute Mic';
    } else {
        btn.textContent = 'Mute Mic';
    }
});

document.getElementById('shareBtn').addEventListener('click', function() {
    const btn = this;
    if (btn.textContent === 'Share Screen') {
        btn.textContent = 'Stop Sharing';
    } else {
        btn.textContent = 'Share Screen';
    }
});

document.getElementById('cameraBtn').addEventListener('click', function() {
    const btn = this;
    if (btn.textContent === 'Camera') {
        btn.textContent = 'Turn Off Camera';
    } else {
        btn.textContent = 'Camera';
    }
});

socket.on('users', (users) => {
    allUsers = users;
    loadContacts();
    loadUsers('', users);
});

socket.on('receiveMessage', (data) => {
    const { from, text } = data;
    if (from !== currentUser) {
        // If not current contact, switch to this user
        if (currentContact !== from) {
            currentContact = from;
            loadMessages(currentContact);
        }
    }
    const messagesDiv = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(from === currentUser ? 'sent' : 'received');
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('incomingCall', (data) => {
    const { from } = data;
    currentContact = from;
    callState = 'incoming';
    updateCallUI();
    document.getElementById('call').classList.add('visible');
    document.getElementById('messages').classList.remove('visible');
});