// loginpage.js
// ------------------------------------------------------------------
//
// created: Sun Feb 28 13:04:06 2016
// last saved: <2024-June-14 11:21:41>
/* global localStorage */
/* jshint browser:true, esversion:9 */

const HTML_APP_ID = "10F85B4A-4ED2-4359-A488-492BCB6C8790";
const storage = {
  get: (key) => window.localStorage.getItem(`${HTML_APP_ID}.${key}`),
  set: (key, value) =>
    window.localStorage.setItem(`${HTML_APP_ID}.${key}`, value)
};

const $sel = (s) => document.querySelector(s);

function getLocalProfile(callback) {
  const profileName = storage.get("PROFILE_NAME"),
    profileImgSrc = storage.get("PROFILE_IMG_SRC"),
    profileReAuthEmail = storage.get("PROFILE_REAUTH_EMAIL");

  if (profileName && profileReAuthEmail && profileImgSrc) {
    callback(profileImgSrc, profileName, profileReAuthEmail);
  }
}

function loadProfile() {
  getLocalProfile((profileImgSrc, profileName, profileReAuthEmail) => {
    //changes in the UI
    $sel("#profile-img").setAttribute("src", profileImgSrc);
    $sel("#profile-name").innerHTML(profileName);
    $sel("#reauth-email").innerHTML(profileReAuthEmail);
    $sel("#inputEmail").classList.toggle("hidden", true);
    $sel("#remember").classList.toggle("hidden", true);
  });
}

document.addEventListener("DOMContentLoaded", (_event) => {
  /*
   * To test the script you should discomment the function
   * testLocalStorageData and refresh the page. The function
   * will load some test data and the loadProfile
   * will do the changes in the UI
   */
  // testLocalStorageData();
  // Load profile if it exits
  loadProfile();
});
