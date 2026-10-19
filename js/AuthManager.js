export class AuthManager {
  constructor() {
    this.currentUser = localStorage.getItem('slide_user') || null;
    this.currentSchool = localStorage.getItem('slide_school') || null;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  login(inputVal, selectedSchool) {
    if (!selectedSchool) {
      throw new Error("Please select your institution first.");
    }

    const cleanInput = inputVal.trim();
    const studentNumRegex = /^ST\d{8,10}$/i;
    const isStudentNumValid = studentNumRegex.test(cleanInput);

    let isEmailValid = false;
    if (selectedSchool === 'other') {
      isEmailValid = cleanInput.includes('@') && cleanInput.includes('.');
    } else {
      const expectedDomain = `@${selectedSchool}`;
      isEmailValid = cleanInput.toLowerCase().endsWith(expectedDomain.toLowerCase()) && cleanInput.includes('@');
    }

    if (!isStudentNumValid && !isEmailValid) {
      if (selectedSchool === 'other') {
        throw new Error("Invalid format! Please enter a valid institutional email containing '@'.");
      } else {
        throw new Error(`Invalid format! Enter a valid student number (e.g. ST10472449) or your email ending in @${selectedSchool}.`);
      }
    }

    this.currentUser = cleanInput;
    this.currentSchool = selectedSchool;
    
    localStorage.setItem('slide_user', this.currentUser);
    localStorage.setItem('slide_school', this.currentSchool);
    
    return { user: this.currentUser, school: this.currentSchool };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentSchool() {
    return this.currentSchool;
  }

  logout() {
    this.currentUser = null;
    this.currentSchool = null;
    localStorage.removeItem('slide_user');
    localStorage.removeItem('slide_school');
  }
}