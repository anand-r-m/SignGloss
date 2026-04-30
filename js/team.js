const form = document.getElementById('contact-form');
const nameInput = document.getElementById('contact-name');
const emailInput = document.getElementById('contact-email');
const messageInput = document.getElementById('contact-message');
const successAlert = document.getElementById('contact-success');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateField(input, condition) {
  if (condition) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
  }
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  return false;
}

nameInput.addEventListener('input', () => {
  validateField(nameInput, nameInput.value.trim().length > 0);
});

emailInput.addEventListener('input', () => {
  validateField(emailInput, validateEmail(emailInput.value.trim()));
});

messageInput.addEventListener('input', () => {
  validateField(messageInput, messageInput.value.trim().length >= 10);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameOk = validateField(nameInput, nameInput.value.trim().length > 0);
  const emailOk = validateField(emailInput, validateEmail(emailInput.value.trim()));
  const msgOk = validateField(messageInput, messageInput.value.trim().length >= 10);

  if (nameOk && emailOk && msgOk) {
    successAlert.classList.remove('d-none');
    form.reset();
    [nameInput, emailInput, messageInput].forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    setTimeout(() => {
      successAlert.classList.add('d-none');
    }, 5000);
  }
});
