/* globals console,document,window,cordova */
 
document.addEventListener('deviceready', onDeviceReady, false);
//document.addEventListener("backbutton", goBackFromIndex, false);
 
var logOb;
var bookmarkOb;
var myPath
var dir;
var targetfile;
var deviceReady = false;
 
function fail(e) {
  document.getElementById("log_listing").innerHTML = "error";
}
 
function onDeviceReady() {
  var logmsg = "Starting deviceReady procedure, ";
  var textObj;
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
  window.resolveLocalFileSystemURL(myPath, function (dir) {
    //logmsg = logmsg + "resolved myPath, ";
    dir.getFile("persistencefile", { create: false }, function (file) {
        textObj = file;
        textObj.createWriter(function (fileWriter) {
            var key = indexfilename
            fileWriter.write(key);
        }, fail);
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
  //logmsg = logmsg + "running listPath, ";
  listPath(myPath);
  //logmsg = logmsg + "finished listPath. ";
  //document.getElementById("log_start").innerHTML = logmsg;
}

function goBackFromIndex() {
  top.location.href = indexbacktarg;
}

function findText(localfile) {
  if (deviceReady === true) {
    var indexmark;
    var extindex;
    var indexline;
    extindex = localfile.indexOf('.htm')
    if (extindex > -1) {
      var localpath = localfile.substring(4, extindex);
    }
    window.resolveLocalFileSystemURL(myPath, function (dir) {
      var textObj;
      dir.getFile(localfile, { create: false }, function (file) {
        textObj = file;
        textObj.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function (e) {
            indexline = this.result;
            if (indexline !== null && indexline !== undefined && indexline !== "") {
              // found a bookmark for this file
              var marks = indexline.split('_');
              var textmode = marks[0];
              var audiomode = marks[1];
              indexmark = marks[2];
              if (optionHash["translationDefault"] !== "cus") {
                textmode = optionHash["translationDefault"];
                //console.log("Overruling format to " + textmode + ".");
              }
              if (optionHash["audioDefault"] !== "cus") {
                audiomode = optionHash["audioDefault"];
                //console.log("Overruling format to " + audiomode + ".");
              }
              targetfile = localpath + "/text_" + textmode + "_" + audiomode + ".htm#" + indexmark;
            } else {
              var textmode = "int";
              var audiomode = "man";
              if (optionHash["translationDefault"] !== "cus") {
                textmode = optionHash["translationDefault"];
                //console.log("Overruling format to " + textmode + ".");
              }
              if (optionHash["audioDefault"] !== "cus") {
                audiomode = optionHash["audioDefault"];
                //console.log("Overruling format to " + audiomode + ".");
              }
              targetfile = localpath + "/text_" + textmode + "_" + audiomode + ".htm#page1";
            }
            top.location.href = targetfile;
            return false;
          }
          reader.readAsText(file);
        });
      });
    });
  }
}

function sortIndex(indexfile) {
    if (deviceReady === true) {
        var textObj;
        // check persistent settings (large or detail, author or words)
        window.resolveLocalFileSystemURL(myPath, function (dir) {
            dir.getFile("persistencefile", { create: true }, function (file) {
                textObj = file;
                textObj.createWriter(function (fileWriter) {
                    //var blob = new Blob([indexfile], { type: 'text/plain' });
                    fileWriter.write(indexfile);
                    top.location.href = indexfile + ".html";
                    return false;
                }, fail);

            });

        });
    }

}
 
//function appendLog(str) {
//  if (!logOb) return;
//  var log = str + " [" + (new Date()) + "]\n";
//  //console.log("going to log " + log);
//  logOb.createWriter(function (fileWriter) {
// 
//    //append if possible
//    fileWriter.seek(fileWriter.length);
//
//    var blob = new Blob([log], { type: 'text/plain' });
//    fileWriter.write(blob);
// 
//  }, fail);
//}
 
/**
* This function will draw the given path.
*/
function listPath(myPath) {
  //var logmsg = "Starting listing override, ";
  window.resolveLocalFileSystemURL(myPath, function (dirEntry) {
 	//logmsg = logmsg + "resolved myPath, ";
    var directoryReader = dirEntry.createReader();
    directoryReader.readEntries(onSuccessCallback, onFailCallback);
  });
  //logmsg = logmsg + "finishing listing override. ";
  //document.getElementById("log_listing").innerHTML = logmsg;
}
 
 
function onSuccessCallback(entries) {

  var logmsg = "Starting link overwriting, ";
  var safehtml = "";
  var safehtmlfile = "";
  var allkeys = "#" + textnames.join('#') + "#";

  //logmsg = logmsg + allkeys + "  ";
  
  if ( entries.length < 1 ) {
    //logmsg = logmsg + "no entries found, return false. ";
    //document.getElementById("log").innerHTML = logmsg;
    return(false);
  }

  for (i = 0; i < entries.length; i++) {
    var row = entries[i];
    if (row.isDirectory) {
      // We will draw the content of the clicked folder
      //html = '<li onclick="listPath(' + "'" + row.nativeURL + "'" + ');">' + row.name + '</li>';
      //html = '<li href="' + row.nativeURL + '">' + row.name + '</li>';
      //safehtml[i] = row.name;
      //logmsg = logmsg + "skipped path token, ";
    } else {
      // alert the path of file
      //html = '<li onclick="getFilepath(' + "'" + row.nativeURL + "'" + ');">' + row.name + '</li>';
      //html = '<li href="' + row.nativeURL + '">' + row.name + '</li>';
      safehtml = row.name;
      //logmsg = logmsg + "trying to link in " + safehtml + ", ";
      safehtmlfile = safehtml.split(".");
      var keynumber = allkeys.indexOf("#" + safehtmlfile[0] + "#");
      if (keynumber > -1) {
        safehtmlfileparts = safehtmlfile[0].split("_");
        if (safehtmlfileparts.length > 2) {
          subsafelang = safehtmlfileparts[0];
          subsafeauthor = safehtmlfileparts[1];
          subsafestory = safehtmlfileparts[2];
          subsafepath = subsafeauthor + "_" + subsafestory;
          if (null != storyHash[subsafeauthor + "_" + subsafestory] && undefined != storyHash[subsafeauthor + "_" + subsafestory]) {
            subsafestoryandwords = storyHash[subsafeauthor + "_" + subsafestory].split("_");
            if (subsafestoryandwords.length > 2) {
              subsafestorynice = subsafestoryandwords[0];
              subsafeauthornice = subsafestoryandwords[1];
              subsafestorywords = subsafestoryandwords[2];
              //appendLog("subsafehtml " + safehtmlfile[0]);
              var textlink = document.all("ownlink_" + safehtmlfile[0]);
              if (null != textlink) {
                // we're in large, empty buylink_ as well!
                document.getElementById("ownlink_" + safehtmlfile[0]).innerHTML = "<a href='#'><img class='library' src='" + subsafepath + "/" + subsafestory + ".jpg' style='width: 160px;' \/></a>";
                document.getElementById("buylink_" + safehtmlfile[0]).innerHTML = "";
                //appendLog("create textlink " + "<a href='#'><img src='" + subsafepath + "/" + subsafestory + ".jpg' style='width: 160px;' \/></a>");
                //logmsg = logmsg + "succeeded linking " + safehtmlfile[0] + ", ";
              } else {
                var textlink = document.all("ownlink_detail_" + safehtmlfile[0]);
                if (null != textlink) {
                  // we're in detail, empty buylink_detail_ as well!
                  document.getElementById("ownlink_detail_" + safehtmlfile[0]).innerHTML = "<FORM><FIELDSET class='link' style='width: 90%; color: blue;'><span>" + subsafeauthornice + "</span>,&nbsp;<span>" + subsafestorynice + "</span>,&nbsp;<span>" + subsafestorywords + " words</span></FIELDSET></FORM>";
                  document.getElementById("buylink_detail_" + safehtmlfile[0]).innerHTML = "";
                  //appendLog("create textlink " + "<a href='#'>" + subsafestorynice + "</a>");
                  //logmsg = logmsg + "succeeded linking " + safehtmlfile[0] + ", ";
                } else {
                  //logmsg = logmsg + "missing link " + safehtmlfile[0] + ", ";
                  //appendLog("missed textlink " + "<a href='#'><img src='" + subsafepath + "/" + subsafestory + ".jpg'></a> or " + "<a href='#'>" + subsafestorynice + "</a>");
                }
              }
            } else {
              //appendLog("safehtmlfile string " + storyHash[subsafeauthor + "_" + subsafestory] + " does not contain <storynice>_<authornice>_<level and words>!");
            }
          } else {
            //appendLog("safehtmlfile string " + storyHash[subsafeauthor + "_" + subsafestory] + " does not contain <storynice>_<authornice>_<level and words>!");
          }
        } else {
          //appendLog("safehtmlfile string " + safehtmlfile + " does not contain <langcode>_<authorcode>_<storycode>!");
        }
      } else {
        //appendLog("safehtmlfile string " + safehtmlfile + " does not exist in keys!");
        //logmsg = logmsg + " filename " + safehtmlfile[0] + " is not in allkeys! ";
      }
    }
 
    if (safehtml !== undefined) {
      ////console.log("html " + safehtml);
      //appendLog("html " + safehtml);
      //logmsg = logmsg + "finished. ";
    } else {
      ////console.log("html error " + safehtml);
      //appendLog("html error " + safehtml);
      //logmsg = logmsg + "no links found. ";
    }
  }
  //document.getElementById("log_linking").innerHTML = logmsg;
}
 
function onFailCallback() {
  ////console.log("something went wrong" + e);
  //appendLog("wrong went something, said Yoda" + e);
}
 
function getFilepath(thefilepath) {
  //alert(thefilepath);
}
