// login.js - SOLO el login
document.getElementById('loginButton').onclick = function() {
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (password === "ChichosAd6869") {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').style.display = 'block';
        document.getElementById('description').focus();
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
        setTimeout(() => errorDiv.style.display = 'none', 3000);
    }
};

document.getElementById('loginPassword').onkeypress = function(e) {
    if (e.key === 'Enter') document.getElementById('loginButton').click();
};