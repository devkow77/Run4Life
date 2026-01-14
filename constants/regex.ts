const usernameRegex = /^[a-zA-Z0-9]{3,35}$/; // np. tylko litery i cyfry, 3-20 znaków
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,30}$/;

export { emailRegex, passwordRegex, usernameRegex };
