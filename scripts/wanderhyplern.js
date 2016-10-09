/* globals console,document,window,cordova */

//document.addEventListener("backbutton", goBackFromWanderlust, false);

var indexfile;

function fail(e) {
    //document.getElementById("log_e").innerHTML = "grutjes, dat gaat niet goed!";
}

function findIndex(indexlanguage) {
  // load library, check persistent settings (large or detail, author or words)
  if (indexfile !== null && indexfile !== undefined && indexfile !== "") {
    top.location.href = "texts/" + indexlanguage + "/" + indexfile + ".html";
    return false;
  } else {
    top.location.href = "texts/" + indexlanguage + "/index_large_words.html";
    return false;
  }
}

function goBackFromWanderlust() {
  top.location.href = "index.html";
}