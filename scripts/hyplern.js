/* globals console,document,window,cordova */
document.addEventListener('deviceready', onDeviceReady, false);
//document.addEventListener("backbutton", goBackFromHome, false);

var dir;
var deviceReady = false;
var myPath;
var myWordsPath;
var indexfile;
var lastchosen;
var indexauthor;
var indextext;

function fail(e) {
    //document.getElementById("log_e").innerHTML = "grutjes, dat gaat niet goed!";
}

function onDeviceReady() {
  //document.getElementById("log_devicestart").innerHTML = "starting tool";
  deviceReady = true;
  if (device === "windows") {
    myPath = cordova.file.dataDirectory; //Windows
  }
  if (device === "android") {
    myPath = cordova.file.externalDataDirectory; //Android
  }
  if (device === "ios") {
    myPath = cordova.file.dataDirectory; //??iOS??
  }
  //document.getElementById("log_devicepath").innerHTML = "path is " + myPath;
  window.resolveLocalFileSystemURL(myPath, function (dir) {
    var targetfile;
    var textdata;
    var indexpath;
    var textnumber;
    var textObj;
    // add wordcards directory if missing
    dir.getDirectory("myWords", { create: true }, function (dirEntry) {
      // this just makes sure the myWordsPath "myWords" exists to put in any flash/word cards
      myWordsPath = dirEntry.fullPath;
    });
    // for each key, add keyfile
    //document.getElementById("log_devicekeys").innerHTML = "going through keys";
    for (textnumber = 0; textnumber < textnames.length; textnumber++) {
      dir.getFile(textnames[textnumber] + ".htm", { create: true }, function (file) {
        var textnumberstring = textnumber.toString();
        //document.getElementById("log_devicekey" + textnumberstring).innerHTML = "key " + textnumberstring + " is " + textnames[textnumber];
        textObj = file;
        textObj.createWriter(function (fileWriter) {
          //append if possible
          fileWriter.seek(fileWriter.length);
          if (fileWriter.length < 1) {
            //all, man or aut is audio, pop, pnt or int is text
            var key = "int_man_page1";
            fileWriter.write(key);
          }
        }, fail);
      });
    };
    // load lastchosen and set picture for it on dashboard
    var seconds = new Date().getTime() / 1000;
    //document.getElementById("log_d").innerHTML = seconds;
    dir.getFile("lastchosen", { create: false }, function (file) {
      textObj = file;
      textObj.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          textdata = this.result;
          if (textdata !== null && textdata !== undefined && textdata !== "") {
            // found a bookmark for last used file, use data as link and img
            var textparts = textdata.split('/');
            textdata = textparts[2];
            var textparts = textdata.split('_');
            indexauthor = textparts[0];
            indextext = textparts[1];
            // do something with indexpath and indextext to get picture
            document.getElementById("dashboard_last").innerHTML = "<a href='#'><img src='texts/" + language_code + "/" + indexauthor + "_" + indextext + "/" + indextext + ".jpg'\/></a>";
            // get lastchosen real bookmark from latest story file
            getLastChosen(language_code + "_" + indexauthor + "_" + indextext,indexauthor + "_" + indextext);
          } else {
            // no lastchosen, so show first book from keys as current one and extract image data
            textdata = textnames[0];
            var textparts = textdata.split('_');
            indexpath = textparts[0];
            indexauthor = textparts[1];
            indextext = textparts[2];
            var textmode = "int";
            var audiomode = "man";
            if (optionHash["translationDefault"] !== "cus") {
              textmode = optionHash["translationDefault"];
            }
            if (optionHash["audioDefault"] !== "cus") {
              audiomode = optionHash["audioDefault"];
            }
            lastchosen = "texts/" + indexpath + "/" + indexauthor + "_" + indextext + "/text_" + textmode + "_" + audiomode + ".htm#indx1";
            // do something with first story key to get picture as well
            document.getElementById("dashboard_last").innerHTML = "<a href='#'><img src='texts/" + language_code + "/" + indexauthor + "_" + indextext + "/" + indextext + ".jpg'\/></a>";
          }
        }
        reader.readAsText(file);
      });
    }, noLastchosen);
    // create persistencefile if not existent (!== null)
    dir.getFile("persistencefile", { create: true }, function (file) {
      textObj = file;
      textObj.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          indexfile = this.result;
          if (indexfile !== null && indexfile !== undefined && indexfile !== "") {
            //index file exists, will be used when loading library
          } else {
            textObj.createWriter(function (fileWriter) {
              indexfile = "index_large_words";
              fileWriter.write(indexfile);
            }, fail);
          }
        }
        reader.readAsText(file);
      });
    });
    

    // load optionHash
    dir.getFile("optionhash", { create: true }, function (file) {
      //document.getElementById("log_d").innerHTML = "Checking optionhash file";
      var textObj = file;
      textObj.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          //document.getElementById("log_e").innerHTML = "starting read";
          var textdata = this.result;
          if (textdata !== null && textdata !== undefined && textdata !== "") {
            //document.getElementById("log_f").innerHTML = textdata;
            // found optionhash file, dissecting contents into optionHash
            var textparts = textdata.split(',');
            var itemnumber = 0;
            //document.getElementById("log_g").innerHTML = "reading";
            for (itemnumber = 0; itemnumber < textparts.length; itemnumber++) {
              itemparts = textparts[itemnumber].split('=');
              optionHash[itemparts[0]] = itemparts[1];
            }

          } else {	
            //document.getElementById("log_f").innerHTML = "no contents";
            
            textObj.createWriter(function (fileWriter) {
              // writing to optionhash file, dissecting optionHash into textdata
              var itemnumber = 0;
              var textdata = "";
              for (var key in optionHash) {
                textdata = textdata + key + "=" + optionHash[key] + ",";
              }
              textdata = textdata.substring(0, textdata.length - 1);
              fileWriter.write(textdata);
            }, fail);
            
          }
        }
        reader.readAsText(file);
      });
    }, fail); // can't get file handle to either read or write

  });
}
function noLastchosen() {
    var textdata = textnames[0];
    var textparts = textdata.split('_');
    var indexpath = textparts[0];
    var indexauthor = textparts[1];
    indextext = textparts[2];
    var textmode = "int";
    var audiomode = "man";
    if (optionHash["translationDefault"] !== "cus") {
      textmode = optionHash["translationDefault"];
    }
    if (optionHash["audioDefault"] !== "cus") {
      audiomode = optionHash["audioDefault"];
    }
    lastchosen = "texts/" + indexpath + "/" + indexauthor + "_" + indextext + "/text_" + textmode + "_" + audiomode + ".htm#indx1";
    // do something with first story key to get picture as well
    document.getElementById("dashboard_last").innerHTML = "<a href='#'><img src='texts/" + indexpath + "/" + indexauthor + "_" + indextext + "/" + indextext + ".jpg'\/></a>";
    return false;
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
function actionDashboard(action_id) {
  if (action_id === "libr") {
    // language code must be defined in some base .js called "language.js"
    findIndex(language_code);
  }
  if (action_id === "last" && lastchosen !== null && lastchosen !== undefined && lastchosen !== "") {
    // lastchosen should have been extracted onDeviceReady from "lastchosen" file
    top.location.href = lastchosen;
  }
  if (action_id === "conf") {
    // for now just load settings menu, in the future expand settings menu accross page for this case (hence via dashboard so can give extra option)
    showMenu('main');
  }
  return false;
}
function getLastChosen(filename,filepath) {
  var textObj;
  var textdata;
  //document.getElementById("log_d").innerHTML = "why? " + filename;
  var fullfilename = filename + ".htm";
  //console.log("Setting lastchosen format.");
  window.resolveLocalFileSystemURL(myPath, function (dir) {
    dir.getFile(fullfilename, { create: false }, function (file) {
      //console.log("Trying to open lastchosen file.");
      textObj = file;
      textObj.file(function (file) {
        var reader = new FileReader();
        //console.log("Trying to read lastchosen format.");
        reader.onloadend = function (e) {
          textdata = this.result;
          //console.log("Reading lastchosen format.");
          if (textdata !== null && textdata !== undefined && textdata !== "") {
            // get lastchosen real bookmark from latest story file
            var textparts = textdata.split('_');
            var textmode = textparts[0];
            var audiomode = textparts[1];
            var pagemark = textparts[2];
            var bookmark = pagemark.substring(pagemark.indexOf("#page")+5);
            if (optionHash["translationDefault"] !== "cus") {
              textmode = optionHash["translationDefault"];
            }
            if (optionHash["audioDefault"] !== "cus") {
              audiomode = optionHash["audioDefault"];
            }
            //console.log("Set lastchosen format to " + textmode + " and " + audiomode + " and page " + bookmark + ".");
            lastchosen = "texts/" + language_code + "/" + filepath + "/text_" + textmode + "_" + audiomode + ".htm#indx" + bookmark;
            //document.getElementById("log_d").innerHTML = lastchosen;
          } else {
            // no story file, so just go to page 1 of this story
            textdata = textnames[0];
            var textparts = textdata.split('_');
            var indexpath = textparts[0];
            var indexauthor = textparts[1];
            indextext = textparts[2];
            var textmode = "int";
            var audiomode = "man";
            if (optionHash["translationDefault"] !== "cus") {
              textmode = optionHash["translationDefault"];
            }
            if (optionHash["audioDefault"] !== "cus") {
              audiomode = optionHash["audioDefault"];
            }
            //console.log("No story file, set lastchosen format to " + textmode + " and " + audiomode + ".");
            // make up lastchosen in absense of story file
            lastchosen = "texts/" + indexpath + "/" + indexauthor + "_" + indextext + "/text_" + textmode + "_" + audiomode + ".htm#indx1";+ "/" + indexauthor + "_" + indextext + "/" + indextext + ".jpg'\/></a>";
          }
        }
        reader.readAsText(file);
      });
    }, noLastchosen);
  });
}
function goBackFromHome() {
  // do nothing
}