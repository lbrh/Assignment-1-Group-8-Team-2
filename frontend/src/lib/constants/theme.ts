export const THEME_STORAGE_KEY = "fori-theme";

/** Runs before first paint so a saved dark theme never flashes light. */
export const THEME_BOOT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;
