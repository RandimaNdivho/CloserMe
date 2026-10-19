export class ThemeManager {
  static toggleResNights() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    
    if (currentTheme === 'res-nights') {
      htmlElement.removeAttribute('data-theme');
      return "Switched to Standard Day Mode";
    } else {
      htmlElement.setAttribute('data-theme', 'res-nights');
      return "Context Switch: Res Nights Activated 🌙";
    }
  }
}