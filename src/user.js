import { auth, db } from './firebase.js';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  doc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
  deleteField,
  where,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from 'firebase/firestore';

const signInForm = document.querySelector('#sign-in-form');
const header = document.querySelector('#header');
const loggedInEmail = document.querySelector('#logged-in-email');
const signOutBtn = document.querySelector('#signout-btn');
const todoContainer = document.querySelector('#todo-container');
const todoForm = document.querySelector('#todo-form');
const todoListDiv = document.querySelector('#todo-list');
const filterButtons = document.querySelectorAll('#filter-buttons button');
const todoCountDiv = document.querySelector('#todo-count');
const deleteCompletedBtn = document.querySelector('#delete-completed-btn');

const itemsRef = collection(db, 'items');

let currentFilter = 'all';
let latestSnapshot = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (
      signInForm &&
      (window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/')
    ) {
      window.location.href = 'todo.html';
      return;
    }

    if (todoContainer) {
      header.classList.remove('hidden');
      todoContainer.classList.remove('hidden');
      loggedInEmail.textContent = user.email;

      const q = query(
        itemsRef,
        where('ownerId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
      );

      onSnapshot(q, (snapshot) => {
        latestSnapshot = snapshot;
        renderTodos();
      });
    }
  } else {
    if (signInForm) signInForm.classList.remove('hidden');
    if (header) header.classList.add('hidden');
    if (todoContainer) todoContainer.classList.add('hidden');
  }
});

if (signInForm) {
  signInForm.onsubmit = (event) => {
    event.preventDefault();
    const fd = new FormData(signInForm);
    const email = fd.get('email');
    const password = fd.get('password');

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = 'todo.html';
      })
      .catch((error) => {
        alert('サインインに失敗しました：' + error.message);
      });
  };
}

if (todoForm) {
  signOutBtn.onclick = () => {
    signOut(auth).then(() => {
      window.location.href = 'index.html';
    });
  };

  todoForm.onsubmit = async (event) => {
    event.preventDefault();
    const fd = new FormData(todoForm);

    const item = {
      text: fd.get('text'),
      completed: false,
      favorite: fd.get('favorite') === 'on',
      timestamp: new Date(),
      ownerId: auth.currentUser.uid,
    };

    await addDoc(itemsRef, item);
    todoForm.reset();
  };

  filterButtons.forEach((btn) => {
    btn.onclick = () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (latestSnapshot) renderTodos();
    };
  });

  if (deleteCompletedBtn) {
    deleteCompletedBtn.onclick = async () => {
      if (!latestSnapshot) return;
      const completedItems = latestSnapshot.docs.filter(
        (docSnap) => docSnap.data().completed,
      );
      for (const docSnap of completedItems) {
        await deleteDoc(doc(db, 'items', docSnap.id));
      }
    };
  }
}

function renderTodos() {
  if (!latestSnapshot || !todoListDiv) return;

  todoListDiv.innerHTML = '';
  let count = 0;

  latestSnapshot.forEach((docSnapshot) => {
    const item = docSnapshot.data();
    const id = docSnapshot.id;

    if (currentFilter === 'active' && item.completed) return;
    if (currentFilter === 'completed' && !item.completed) return;

    count++;

    const div = document.createElement('div');
    div.classList.add('todo-item');
    if (item.completed) div.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.completed;
    checkbox.onchange = async () => {
      await updateDoc(doc(itemsRef, id), { completed: checkbox.checked });
    };

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = item.text;
    textInput.onchange = async () => {
      await updateDoc(doc(itemsRef, id), { text: textInput.value });
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';

    delBtn.onclick = async () => {
      await deleteDoc(doc(itemsRef, id));
    };

    div.appendChild(checkbox);
    div.appendChild(textInput);
    div.appendChild(delBtn);

    todoListDiv.appendChild(div);
    if (todoCountDiv) todoCountDiv.textContent = `todo数: ${count}`;
  });
}

function updateClock() {
  const clockElement = document.getElementById('clock');
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();

  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;

  clockElement.textContent = `${hours}:${minutes}`;
}

setInterval(updateClock, 1000);
updateClock();
