document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const addPersonBtn = document.getElementById('addPersonBtn');
  const cardsContainer = document.getElementById('cardsContainer');
  const personModal = document.getElementById('personModal');
  const closeModal = document.querySelector('.close');
  const savePersonBtn = document.getElementById('savePersonBtn');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const profileUrl = document.getElementById('profileUrl');
  const email = document.getElementById('email');
  const company = document.getElementById('company');
  const position = document.getElementById('position');
  const connectedDate = document.getElementById('connectedDate');

  let currentEditIndex = null;

  // Load data from storage
  chrome.storage.local.get('people', (result) => {
    const people = result.people || [];
    renderPeople(people);
  });

  // Add person button click
  addPersonBtn.addEventListener('click', () => {
    openModal();
  });

  // File input change
  fileInput.addEventListener('change', handleFileUpload);

  // Save person button click
  savePersonBtn.addEventListener('click', savePerson);

  // Close modal
  closeModal.addEventListener('click', () => {
    personModal.style.display = "none";
  });

  // Handle file upload
  function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const text = e.target.result;
      const people = parseCSV(text);
      savePeople(people);
      renderPeople(people);
    };

    reader.readAsText(file);
  }

  // Parse CSV
  function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];

    for (const line of lines) {
      const [firstName, lastName, profileUrl, email, company, position, connectedDate] = line.split(',');
      if (firstName && lastName && profileUrl && company && position && connectedDate) {
        result.push({ firstName, lastName, profileUrl, email, company, position, connectedDate });
      }
    }

    return result;
  }

  // Save people to storage
  function savePeople(people) {
    chrome.storage.local.set({ people });
  }

  // Render people
  function renderPeople(people) {
    cardsContainer.innerHTML = '';
    people.forEach((person, index) => {
      const card = createCard(person, index);
      cardsContainer.appendChild(card);
    });
  }

  // Create card
  function createCard(person, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h5>${person.firstName} ${person.lastName}</h5>
      <p><a href="${person.profileUrl}" target="_blank">${person.profileUrl}</a></p>
      <p>${person.email}</p>
      <p>${person.company}</p>
      <p>${person.position}</p>
      <p><small>Connected on ${person.connectedDate}</small></p>
      <div class="actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
    console.log(card.innerHTML)

    card.querySelector('.edit-btn').addEventListener('click', () => {
      openModal(person, index);
    });

    card.querySelector('.delete-btn').addEventListener('click', () => {
      deletePerson(index);
    });

    return card;
  }

  // Open modal
  function openModal(person = {}, index = null) {
    currentEditIndex = index;
    firstName.value = person.firstName || '';
    lastName.value = person.lastName || '';
    profileUrl.value = person.profileUrl || '';
    email.value = person.email || '';
    company.value = person.company || '';
    position.value = person.position || '';
    connectedDate.value = person.connectedDate || '';
    personModal.style.display = "block";
  }

  // Save person
  function savePerson() {
    const person = {
      firstName: firstName.value,
      lastName: lastName.value,
      profileUrl: profileUrl.value,
      email: email.value,
      company: company.value,
      position: position.value,
      connectedDate: connectedDate.value
    };

    if (person.firstName && person.lastName && person.profileUrl && person.email && person.company && person.position && person.connectedDate) {
      chrome.storage.local.get('people', (result) => {
        const people = result.people || [];

        if (currentEditIndex !== null) {
          people[currentEditIndex] = person;
        } else {
          people.push(person);
        }

        savePeople(people);
        renderPeople(people);
        personModal.style.display = "none";
      });
    }
  }

  // Delete person
  function deletePerson(index) {
    chrome.storage.local.get('people', (result) => {
      const people = result.people || [];
      people.splice(index, 1);
      savePeople(people);
      renderPeople(people);
    });
  }
});
