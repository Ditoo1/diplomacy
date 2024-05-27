document.getElementById('login-btn').addEventListener('click', function() {
  document.getElementById('login-modal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('login-modal').style.display = 'none';
});

document.getElementById('submit-btn').addEventListener('click', function() {
  var password = document.getElementById('password-input').value;
  // Aquí puedes verificar la contraseña ingresada
  // Por simplicidad, compararemos con una contraseña fija
  if (password === 'tucontraseña') {
    document.getElementById('top-left').contentEditable = true;
    document.getElementById('login-modal').style.display = 'none';
  } else {
    alert('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
  }
});
