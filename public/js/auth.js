document.addEventListener("DOMContentLoaded", function () {
  // Password Show/Hide Toggle
  const togglePasswordButtons = document.querySelectorAll(".password-toggle-btn");
  togglePasswordButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      const icon = this.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
      } else {
        input.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });

  // Client-side Form Validation & Loading State
  const authForms = document.querySelectorAll(".auth-form");
  authForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const passwordInput = form.querySelector("#signup-password");
      const confirmInput = form.querySelector("#confirm-password");
      const confirmError = form.querySelector("#confirm-password-error");

      // Confirm Password Match Check for Signup Form
      if (passwordInput && confirmInput) {
        if (passwordInput.value !== confirmInput.value) {
          e.preventDefault();
          e.stopPropagation();
          confirmInput.classList.add("is-invalid");
          if (confirmError) {
            confirmError.textContent = "Passwords do not match.";
            confirmError.style.display = "block";
          }
          return false;
        } else {
          confirmInput.classList.remove("is-invalid");
          if (confirmError) {
            confirmError.style.display = "none";
          }
        }
      }

      // Check standard HTML5 / Bootstrap validity
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add("was-validated");
        return false;
      }

      // Trigger Loading State on Submit Button
      const submitBtn = form.querySelector(".auth-submit-btn");
      if (submitBtn) {
        const loadingText = submitBtn.getAttribute("data-loading-text") || "Processing...";
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${loadingText}`;
      }
    });
  });
});
