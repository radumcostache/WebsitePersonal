window.onload = function() {
    const form = document.querySelector("form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const telefonInput = document.getElementById("telefon");
    const mesajInput = document.getElementById("mesaj");

    form.addEventListener("submit", function(event) {
    event.preventDefault();

    const telefonValue = telefonInput.value.trim();
    const telefonRegex = /^\+40\d{9}$/;

    if (!telefonRegex.test(telefonValue)) {
        alert("Invalid phone number. Please enter a valid phone number starting with '+40' followed by 9 digits.");
        return;
    }

    const formData = {
    nume: nameInput.value.trim(),
    email: emailInput.value.trim(),
    telefon: telefonValue,
    mesaj: mesajInput.value.trim()
    };

    localStorage.setItem("formData", JSON.stringify(formData));

    form.reset();

    alert("Form data submitted and stored in local storage.");
});
};

