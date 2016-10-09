/* globals console,document,window,cordova */

document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('touchstart', startFinger, false);        
document.addEventListener('touchmove', moveFinger, false);
document.addEventListener('touchcancel', cancelFinger, false);
//document.addEventListener('backbutton', goBack, false);
document.addEventListener('scroll',Hide, false);
document.addEventListener('onwheel',Hide, false);

isNS4 = (document.layers) ? true : false;
isIE4 = (document.all && !document.getElementById) ? true : false;
isIE5 = (document.all && document.getElementById) ? true : false;
isNS6 = (!document.all && document.getElementById) ? true : false;

var dir;
// very important, can't do writing in other functions without this variable being set to true in initial onDeviceReady function
var deviceReady = false;
var deviceNotReadyInTime = false;
// myPath is also set at the moment that onDeviceReady cums
var myPath;
// loadReady is created onload
var loadReady = false;
// bookmark is created onload, its kept up to date automatically, but we don't want to do that every nanosecond
var bookmark;
var lastseconds = 0;
lastseconds = new Date().getTime() / 1000;
// wordmark is created onload if coming from words page
var wordmark = "";
var elem_id = "";
// make this optional
var autosave = "on";
var page_id;
var lastpage_id = 0;

var firstTry = true;
var displayedOfflineMsg = false;
// browser check
var standalone = window.navigator.standalone, 
userAgent = window.navigator.userAgent.toLowerCase(),
msie = /msie |windows nt/.test( userAgent ),
msie5 = /msie 5/.test( userAgent ),
msie6 = /msie 6/.test( userAgent ),
msie7 = /msie 7/.test( userAgent ),
msie8 = /msie 8/.test( userAgent ),
msie9 = /msie 9/.test( userAgent ),
msie10 = /msie 10/.test( userAgent ),
safari = /safari/.test( userAgent ), 
ios = /iphone|ipod|ipad/.test( userAgent );
// generic, msg and audio vars
var targetPage;
var currenttime;
var stateOfPlay = false;
var userStopped = false;
var currentPlaying = 0;
var defaultMsgTime = 2000;
var noTipUp = false; // this should be retrieved from preferences
var showingMsg = false;
var msgTimeout;
var counting;
var loadTimeout;
var fadeTimebit;
var fadePerc;
var fadeTime;
var msgTime;
var lastClicked = "";
var lastShown = "";
var clickTimeout;
var clickedPopInt = false;
var clickedAudio = false;
var my_media;
var old_media;
var mediaJustStopped = false;
var mediaJustStarted = false;
// swipe
var xFinger = null;
var yFinger = null;
var xUnfinger = null;
var yUnfinger = null;
var startMove = 0;
var endMove = 0;
// from index
var fromIndex = false;

toggleDirect("","","draw",6000);

function onDeviceReady() {

  deviceReady = true;
  var pagego = 0;

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
    if ( loadReady === true && language_key === language_code ) {
      var textparts = storykey.split('_');
      indexpath = textparts[0];
      indexauthor = textparts[1];
      indextext = textparts[2];
      // writing targetfile
      var targetfile = "texts/" + language_key + "/" + indexauthor + "_" + indextext + "/text_" + curpint + "_" + curaudio + ".htm#" + bookmark;
      // first write the current chosen file to "lastchosen"
      dir.getFile("lastchosen", { create: true }, function (lastchosenfile) {
        var textObject = lastchosenfile;
        textObject.createWriter(function (fileWriter) {
          fileWriter.write(targetfile);
        }, fail);
      });
    }
  
    // load optionHash
    dir.getFile("optionhash", { create: true }, function (file) {
      // Checking optionhash file
      var textObj = file;
      textObj.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          // finished read, checking results
          var textdata = this.result;
          if (textdata !== null && textdata !== undefined && textdata !== "") {
            // found optionhash file, dissecting contents into optionHash
            var textparts = textdata.split(',');
            var itemnumber = 0;
            // reading results
            for (itemnumber = 0; itemnumber < textparts.length; itemnumber++) {
              itemparts = textparts[itemnumber].split('=');
              optionHash[itemparts[0]] = itemparts[1];
            }
            
            // override translationDefault=curpint and audioDefault=curaudio
            optionHash["translationCurrent"] = curpint;
            optionHash["audioCurrent"] = curaudio;
            
            if ( loadReady === true ) {

              // setting style again in case of faulty first time
              setStyle("2nd try");
  	
              var hash = window.location.hash;
              // save bookmark
              bookmark = hash.substring(hash.indexOf("#page")+5);
              if (bookmark > 0) {
              	pagego = bookmark;
                bookmark = "page" + bookmark;
                //console.log("Did not come from Index as hash is " + hash);
              } else {
                // from index
                bookmark = hash.substring(hash.indexOf("#indx")+5);
                if (bookmark > 0) {
                  pagego = bookmark;
                  bookmark = "page" + bookmark;
                  fromIndex = true;
                  //console.log("Came from Index as hash is " + hash);
                } else {
      	          //console.log("Did not come from Index as hash is " + hash);
                }
              }
              // auto play if this was refresh
              var autoaudio = hash.substring(hash.indexOf("#playpage")+9);
              // Going to new audio page
              if (autoaudio > 0) {
                firstTry = false;
                // this was refresh, play page
                var autopage = audioToPageArray[autoaudio];
                playAudio('pageplay',autoaudio,autopage);
              }
              //texts/hun/Moricz_AVegekJulija/text_int_man.htm#wordpage2___word_id___mean_id
              var wordmarkstring = "";
              wordmarkstring = hash.substring(hash.indexOf("#wordpage")+9);
              if (wordmarkstring !== "") {
                var wordmarkstringparts = wordmarkstring.split('___');
                if (wordmarkstringparts[0] > 0) {
                  word_id = wordmarkstringparts[1];
                  mean_id = wordmarkstringparts[2];
                  item_nr = wordmarkstringparts[3];
                  // embolden word and mean id
                  document.getElementById(word_id).style.fontWeight='bold';
                  document.getElementById(mean_id).style.fontWeight='bold';
                  // filling in wordmark means we can use it later to 'go back' to correct word in word list
                  wordmark = item_nr;
                  //remember word_id as elem_id as the one we're going to
                  elem_id = word_id;
                  // don't forget to change bookmark to regular page in case of wordpage entry
                  bookmark = "page" + wordmarkstringparts[0];
                  // turn autosave off if we're here only for words and not for reading
                  autosave = "off";
                  //go to word after timeout, this number should be editable for slow phones, 100 is too small for mine
                  toggleDirect("text_" + curpint + "_" + curaudio + ".htm#" + word_id,"","scroll",300);
                }
              }
              if ( pagego > 0) {
              	//console.log("trying to go to page " + pagego);
                page_id = pagego;
                top.location.href = "text_" + curpint + "_" + curaudio + ".htm#page" + page_id;
              }
            } else {
              if (document.getElementById("wholething").style.visibility === "hidden") {
                document.getElementById("wholething").style.visibility='visible';
              }
            }
            bookMark(bookmark);
          } else {	
            // no contents for optionhash, must be first time
            
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
            
            if ( loadReady === true ) {

              // setting style again in case of faulty first time
              setStyle("2nd try");
  	
              var hash = window.location.hash;
              // save bookmark
              bookmark = hash.substring(hash.indexOf("#page")+5);
              if (bookmark > 0) {
              	pagego = bookmark;
                bookmark = "page" + bookmark;
                //console.log("Did not come from Index as hash is " + hash);
              } else {
                // from index
                bookmark = hash.substring(hash.indexOf("#indx")+5);
                if (bookmark > 0) {
                  pagego = bookmark;
                  bookmark = "page" + bookmark;
                  fromIndex = true;
                  //console.log("Came from Index as hash is " + hash);
                } else {
      	          //console.log("Did not come from Index as hash is " + hash);
                }
              }
              // auto play if this was refresh
              var autoaudio = hash.substring(hash.indexOf("#playpage")+9);
              // Going to new audio page
              if (autoaudio > 0) {
                firstTry = false;
                // this was refresh, play page
                var autopage = audioToPageArray[autoaudio];
                playAudio('pageplay',autoaudio,autopage);
              }
              //texts/hun/Moricz_AVegekJulija/text_int_man.htm#wordpage2___word_id___mean_id
              var wordmarkstring = "";
              wordmarkstring = hash.substring(hash.indexOf("#wordpage")+9);
              if (wordmarkstring !== "") {
                var wordmarkstringparts = wordmarkstring.split('___');
                if (wordmarkstringparts[0] > 0) {
                  word_id = wordmarkstringparts[1];
                  mean_id = wordmarkstringparts[2];
                  item_nr = wordmarkstringparts[3];
                  // embolden word and mean id
                  document.getElementById(word_id).style.fontWeight='bold';
                  document.getElementById(mean_id).style.fontWeight='bold';
                  // filling in wordmark means we can use it later to 'go back' to correct word in word list
                  wordmark = item_nr;
                  //remember word_id as elem_id as the one we're going to
                  elem_id = word_id;
                  // don't forget to change bookmark to regular page in case of wordpage entry
                  bookmark = "page" + wordmarkstringparts[0];
                  // turn autosave off if we're here only for words and not for reading
                  autosave = "off";
                  //console.log("Trying to go to " + "text_" + curpint + "_" + curaudio + ".htm#" + word_id);
                  //go to word after timeout, this number should be editable for slow phones, 100 is too small for mine
                  toggleDirect("text_" + curpint + "_" + curaudio + ".htm#" + word_id,"","scroll",300);
                }
              }
              if ( pagego > 0) {
              	//console.log("frying to go to page " + pagego);
                page_id = pagego;
                top.location.href = "text_" + curpint + "_" + curaudio + ".htm#page" + page_id;
              }
            } else {
              if (document.getElementById("wholething").style.visibility === "hidden") {
                document.getElementById("wholething").style.visibility='visible';
              }
            }
          }
        }
        reader.readAsText(file);
      });
    }, fail); // can't get file handle to either read or write
  });
  
  // overwrite menu if in story to enable switching format
  if ( undefined !== curpint && null !== curpint && curpint !== "" && curpint !== "vocabulary" ) {
    menuArray = ["Settings_bold_dummy","Switch Format","Reading","Practice","Advanced","Back_dimgray_cancel"];
  }
}
// setStyle line height alghorythm based on font size
function setStyle(time) {
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (null === time || undefined === time || time === "" || time === 0) {
    document.getElementById("wholething").style.visibility='hidden';
  }
  // get rid of bottom scrollbar
  document.documentElement.style.overflowX = 'hidden';  // firefox, chrome
    
  // poppelepee, if this is pnt we need to make it invisible (had to leave the default invisible out or the visible-on-press option doesn't work
  if (curpint === "pnt") {
    document.styleSheets.hypLern.addRule("span.int","visibility: hidden");
  }
  // remove margins if device is not windows
  if (device !== "windows") {
    document.styleSheets.hypLern.addRule("span.pl","width: 0%");
    document.styleSheets.hypLern.addRule("img.pl","width: 0%");
    document.styleSheets.hypLern.addRule("span.pr","width: 0%");
    document.styleSheets.hypLern.addRule("img.pr","width: 0%");
    document.styleSheets.hypLern.addRule("span.pl","display: none");
    document.styleSheets.hypLern.addRule("img.pl","display: none");
    document.styleSheets.hypLern.addRule("span.pr","display: none");
    document.styleSheets.hypLern.addRule("img.pr","display: none");
    document.getElementById("wholething").style.marginLeft='3%';
    document.getElementById("wholething").style.marginRight='2%';
  } else {
    document.getElementById("wholething").style.width='80%';
    document.getElementById("wholething").style.maxWidth='80%';
    document.getElementById("wholething").style.marginLeft='8%';
    document.getElementById("wholething").style.marginRight='12%';
    document.styleSheets.hypLern.addRule("span.pl","width: 8%");
    document.styleSheets.hypLern.addRule("span.pr","width: 12%");
    document.styleSheets.hypLern.addRule("img.pl","width: 100%");
    document.styleSheets.hypLern.addRule("img.pr","width: 100%");
  }
  // set current style from optionHash
  document.styleSheets.hypLern.addRule("div.page","font-size: " + optionHash["fontSize"]);
  document.styleSheets.hypLern.addRule("div.page","font-family: " + optionHash["fontType"]);
  if (curpint == "pop") {
    var linesize = "1.5";
    document.styleSheets.hypLern.addRule("span.main","line-height: " + linesize);
    var fontsize = optionHash["fontSize"].substring(0,2) / 1;
    if ( fontsize > 24 && w < 800 ) {
      // better put a max to the pop-up font-size in case of small screens
      document.styleSheets.hypLern.addRule("span.int","font-size: 20pt");
      document.styleSheets.hypLern.addRule("span.int","font-family: " + optionHash["fontType"]);
    } else {
      document.styleSheets.hypLern.addRule("span.int","font-size: " + fontsize + "pt");
      document.styleSheets.hypLern.addRule("span.int","font-family: " + optionHash["fontType"]);
    }
  } else {
    var subsize = ( optionHash["fontSize"].substring(0,2) / 3 ) * 2;
    document.styleSheets.hypLern.addRule("span.int","font-size: " + subsize + "pt");
    document.styleSheets.hypLern.addRule("span.int","font-family: " + optionHash["fontType"]);
    document.styleSheets.hypLern.addRule("span.int","color: " + optionHash["interlinearColor"]);
    var fontsize = optionHash["fontSize"].substring(0,2) / 1;
    var linesize = ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) * 2.1 ) - ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) - 1.5 );
    if ( fontsize === 36 ) {
      var linesize = ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) * 1.5 ) - ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) - 1.5 );
    }
    if ( fontsize === 24 ) {
      var linesize = ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) * 1.7 ) - ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) - 1.5 );
    }
    if ( fontsize === 21 ) {
      var linesize = ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) * 1.9 ) - ( ( optionHash["fontSize"].substring(0,1) + "." + optionHash["fontSize"].substring(1,1) ) - 1.5 );
    }
    linesize = ( linesize / 1 ) + ( optionHash["linesizePlus"] / 1 ) ;
    document.styleSheets.hypLern.addRule("span.main","line-height: " + linesize);
  }
  var sublinesize = subsize / 12;
  if ( ( fontsize / 1 ) > 15 ) {
    sublinesize = 1.1;
  } else {
    sublinesize = 0.9;
  }
  sublinesize = ( sublinesize / 1 ) + ( optionHash["sublinesizePlus"] / 1 ) ;
  document.styleSheets.hypLern.addRule("span.int","line-height: " + sublinesize);
  var sublinetop = optionHash["fontSize"].substring(0,2) * 1.6 + 1;
  sublinetop = sublinetop + "dummy";
  sublinetop = sublinetop.substring(0,2);
  sublinetop = ( sublinetop / 1 ) + ( optionHash["sublinetopPlus"] / 1 ) ;
  document.styleSheets.hypLern.addRule("span.int","top: " + sublinetop + "px");
  
  if (null === time || undefined === time || time === "" || time === 0) {
    document.getElementById("wholething").style.visibility='hidden';
  } else {
    document.getElementById("wholething").style.visibility='visible';
  }
}
// is not being used atm
function disableSelection(target){
if (typeof target.onselectstart!="undefined") //IE route
	target.onselectstart=function(){return false}
else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
	target.style.MozUserSelect="none"
else //All other route (ie: Opera)
	target.onmousedown=function(){return false}
target.style.cursor = "default"
}

function fail(e) {
  //console.log("error<br><br>");
  if (document.getElementById("wholething").style.visibility === "hidden") {
    document.getElementById("wholething").style.visibility='visible';
  }
}

function dumbAudio(audio_id,page_id) {
  //zucht
}

function doNuthing() {
  //poop
  return (false);
}

function playAudio(action,audio_id,page_id) {
  var logmsg = "Starting audio play, ";
  var alignToPage = false;
  if (action === "manplay") {
    logmsg = logmsg + "Action is manplay, ";
    userStopped = false;
    if (my_media) {
      logmsg = logmsg + "my_media is loaded, ";
      mediaJustStopped = true;
      my_media.stop();
      my_media.release();
      mediaJustStopped = false;
    }
    logmsg = logmsg + "set action to play, ";
    action = "play";
    //manual attempts to play still get offline msg
    displayedOfflineMsg = false;
    alignToPage = true;
    logmsg = logmsg + "set alignpage to true, ";
  }
  if (action === "pageplay") {
    action = "play";
    userStopped = false;
    alignToPage = true;
  }
  if (action === "play" && stateOfPlay === true) {
    action = "stop";
  }

  if (action === "autoplay") {
    userStopped = false;
    stateOfPlay = false;
    if (my_media) {
      mediaJustStopped = true;
      my_media.stop();
      my_media.release();
      mediaJustStopped = false;
    }
    action = "play";
  }
  
  if (action === "pause" && device === "android") {
    action = "stop";
  }
  
  logmsg = logmsg + "Going into playaudio routine, audio_id is " + audio_id + " lastaudio is " + lastaudio + ", ";
  audio_id = audio_id / 1;
  if (audio_id > 0 && audio_id < lastaudio) {
    currentPlaying = audio_id;
    
    logmsg = logmsg + "audio_id is larger than 0 and audio_id is less than lastaudio, ";
    //console.log("action is " + action);
    
    if (action === "play") {
      logmsg = logmsg + "action is play, ";
      if (stateOfPlay === true && null !== my_media && undefined !== my_media) {
        logmsg = logmsg + "stateOfPlay is true and my_media is loaded - stopping media, ";
      	mediaJustStopped = true;
        my_media.stop();
        my_media.release();
        mediaJustStopped = false;
      }
      if (my_media) {
        logmsg = logmsg + "media is loaded - stopping media, ";
      	mediaJustStopped = true;
        my_media.stop();
        my_media.release();
        mediaJustStopped = false;
      }
      
      //console.log("creating new media file");
      
      if (device === "android") {
        var mediaroot = "/android_asset";
      }
      if (device === "windows") {
      	var mediaroot = "ms-appx://";
      }
      
      if (stateOfPlay !== true) {
        logmsg = logmsg + "stateOfPlay not true - trying to load file " + mediaroot + "/www/texts/" + language_key + "/" + authorstory + "/sounds/" + audiokey + "Page" + audio_id + ".mp3, ";
      	mediaJustStarted = true;
      	stateOfPlay = true;
        my_media = new Media(mediaroot + "/www/texts/" + language_key + "/" + authorstory + "/sounds/" + audiokey + "Page" + audio_id + ".mp3",
          // success callback
          function () {
            if (mediaJustStopped !== true && mediaJustStarted !== true) {
              //console.log("playAudio():Audio Success");
              stateOfPlay = false;
              if (curaudio === 'all' && userStopped !== true) {
                //console.log("userStopped is false, continue playing, lastplaying (currentPlaying) was " + currentPlaying);
                audio_id = ( currentPlaying * 1 ) + 1;
                // make this optional
                // auto page aligning when playing all
                page_id = audioToPageArray[audio_id]; // specific array to avoid picture pages
                //console.log("Audio file " + currentPlaying + " ended and curaudio is all...");
                if ( optionHash["audioScroll"] === "Page" ) {
                  //console.log("align page");
                  playAudio('pageplay',audio_id,page_id);
                } else {
                  // no auto page aligning when playing all
                  //console.log("align page is off");
                  playAudio('play',audio_id,'dummy');
                }
              } else {
                //console.log("userStopped is true");
                stateOfPlay = false;
                mediaJustStopped = false;
                //console.log("Audio file " + currentPlaying + " ended...");
              }
            } else {
              mediaJustStopped = false;
            }
          },
          // error callback
          function (err) {
            //console.log("playAudio():Audio Error: www/texts/" + language_key + "/" + authorstory + "/sounds/" + audiokey + "Page" + audio_id + ".mp3" + err);
          },
          // status callback
          function (stat) {
            //console.log("playAudio():Audio Status: " + stat);
          }
        );
      } else {
      	logmsg = logmsg + "stateOfPlay is true, ";
        //stateOfPlay = true;
      }
      currenttime = 0;
      mediaJustStarted = true;
      my_media.play();
      stateOfPlay = true;
      userStopped = false;
      mediaJustStarted = false;
    }
    if (action === "pause") {
      if (stateOfPlay === true) {
        //console.log("Pressing pause ");
        my_media.pause();
        stateOfPlay = false;
        userStopped = true;
      } else {
        if (null !== my_media && undefined !== my_media) {
          my_media.getCurrentPosition(
            // success callback
            function (position) {
              if (position > -1) {
                //console.log((position) + " sec");
                currenttime = position;
              }
              my_media.pause();
            },
            // error callback
            function (e) {
              //console.log("Error getting pos=" + e);
            }
          );
          if (currenttime > 0) {
            my_media.play();
            stateOfPlay = true;
            userStopped = false;
          }
        } else {
          // do nuth'n, we're not playing anyting
        }
      }
    }
    if (action === "stop") {
      if (curaudio === "all") {
        page_id = audioToPageArray[audio_id];
        //toggleDirect("",logmsg + "action is stop - curaudio is all - reloading page, ","noGlass",30000);
        top.location.href = "text_" + curpint + "_" + curaudio + ".htm#page" + page_id;
        location.reload(true);
      } else {
      	userStopped = true;
      	stateOfPlay = false;
        if (my_media) {
      	  mediaJustStopped = true;
          my_media.stop();
          my_media.release();
          mediaJustStopped = false;
        }
      }
    }
    logmsg = logmsg + "checking whether to align page " + page_id + ", ";
    if (alignToPage === true && page_id > 0) {
      top.location.href = "text_" + curpint + "_" + curaudio + ".htm#page" + page_id;
      //toggleDirect("",logmsg + "aligning page. ","noGlass",30000);
    } else {
      //toggleDirect("",logmsg + "not aligning page. ","noGlass",30000);
    }
  }
}
function bookmarkPage(movedonpage_id) {
  // safety net versus blank screens
  if (document.getElementById("wholething").style.visibility === "hidden") {
    document.getElementById("wholething").style.visibility='visible';
  }
  if (autosave === "on") {
    bookMark(movedonpage_id);
  } else {
    page_id = movedonpage_id;
  }
}
function clickPage(page_id,audio_id,audio_id_last,audio_id_next) {
  var y = event.clientY;
  var x = event.clientX;
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  
  // safety net versus blank screens
  if (document.getElementById("wholething").style.visibility === "hidden") {
    document.getElementById("wholething").style.visibility='visible';
  }
  
  //console.log("Whats happening: x=" + x + ", y=" + y + ", w=" + w + ", h=" + h);
  if (x > 60 && x < 91 && y > 10 && y < 55) {
    toggleAudio(page_id);
    //console.log("trying to toggle audio at page " + page_id);
    return false;
  }
  if (x > 0 && x < 40 && y > 10 && y < 55) {
    togglePopInt(page_id);
    return false;
  }
  if (autosave === "off") {
    if ( ((x - w) < 80) && ((x - w) > -120) && y < 55 ) {
      bookMark(page_id);
      toggleDirect("text_" + curpint + "_" + curaudio + ".htm#page" + page_id,"Bookmarked to Page " + page_id + " for this story!","fadeOn",defaultMsgTime);
      return false;
    }
  }
  if ( device === "windows" && x > 0 && x < 40 && y > 55 ) {
    goPage(page_id - 1,audio_id_last);
  }
  if ( device === "windows" && ((x - w) < 0) && ((x - w) > -40) && y > 55 ) {
    goPage(page_id + 1,audio_id_next);
  }
}
function ShowAll(option) {
    // this is the pnt interlinear pop-up mousedown/up event, show/hide all interlinear
    document.styleSheets.hypLern.addRule("span.int","visibility: " + option);
}
function Show(orig_id, mean_id, audio_id, page_id) {
  // remember orig_id for pop up
  lastShown = orig_id;
  // find location
  var y = event.clientY;
  var x = event.clientX;
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  //if ( (((x - w) < 40) && ((x - w) > -80) && y < 55 ) && (!msie || curpint !== "pop")) {
  // save new page
  if (autosave === "on") {
    bookMark(page_id);
  }
  if ((x > 0 && x < 91 && y > 10 && y < 55) && ( device !== "windows" || curpint !== "pop")) {
    if (x > 60 && x < 91 && y > 10 && y < 55) {
      toggleAudio(page_id);
      //console.log("trying to toggle audio at page " + page_id);
      return false;
    }
    if (x > 0 && x < 40 && y > 10 && y < 55) {
      togglePopInt(page_id);
      return false;
    } 
  } else {
    // pop-up is a special case, add onclick to onmouseover, with all id's included :-(
    if ((lastClicked !== "" && document.getElementById(mean_id).style.visibility === "visible") || (curpint === "pop" && lastClicked !== "" && document.getElementById("popup_block").innerHTML === document.getElementById(mean_id).innerHTML && document.getElementById("popup_block").style.visibility === "visible" ) || (curpint !== "pop" && lastClicked === "" && document.getElementById(mean_id).style.visibility === "visible") || curpint === "int") {
      // only add word for language of this App
      if (language_key === language_code) {
        addWord(orig_id,mean_id,page_id);
      } else {
        toggleDirect("","Adding words to your wordlist can be done in the App for " + language + "!","fadeOn",defaultMsgTime);
      }
      //toggleDirect("","Clicked word with code " + orig_id,"fadeOn",defaultMsgTime);
      if (curpint !== "int") {
        lastClicked = "";
      }
      // if tipup is false, just flash the background or something to show you've added flashcard ???
    } else {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        lastClicked = orig_id;
      },500);
      lastClicked = "";
      c = document.all(mean_id);
      a = document.all(orig_id);
      if (null != c && null == c.length && null != a && null == a.length)
      {
      	var cw = c.offsetWidth;
      	//var cl = ((w - cw) / 2) ;
      	if ( ( x + cw ) > w ) {
          var cl = w - cw ;
          if ( cl < 0 ) {
            cl = ((w - cw) / 2) ;
          }
        } else {
          var cl = x ;
        }
      	var ct = y / 1 ;
      	// setting left of pop-up to x, unless x + cw exceeds screen, then place at w - cw, setting top to y + 50 places it below the original
      	cl = cl + ".grutjes";
      	var clparts = cl.split('.');
      	cl = clparts[0];
      	cl = cl + "px";
      	if (optionHash["popPos"] === "Below") {
          ct = ct + 20 + optionHash["fontSize"].substring(0,2) / 1;
        } else {
          // place over word depending on fontsize and meaning size
          var subtractNumber = -1;
          var meaningAll = document.getElementById(mean_id).innerHTML;
          //console.log("Checking whether <br> exists in meaning " + testMean);
          if (meaningAll.indexOf("<br>") > 0) {
            var testMean = meaningAll.substring(meaningAll.indexOf("<br>")+4);
            //console.log("Checking whether another <br> exists in meaning " + testMean);
            if (testMean.indexOf("<br>") > 0) {
              // three lines, leave subtractNumber at 0
            } else { 
              //console.log("Two line meaning...");
              // two line meaning
              subtractNumber = 1;
            }
          } else {
            //console.log("One line meaning...");
            // one line meaning
            subtractNumber = 2;
          }
          if (optionHash["fontSize"].substring(0,2) / 1 > 24 && w < 800) {
            if (subtractNumber = -1) {
              subtractNumber = 0;
            }
            ct = ct - ((optionHash["fontSize"].substring(0,2) / 1)*(5-subtractNumber));
          } else {
            ct = ct - ((optionHash["fontSize"].substring(0,2) / 1)*(6-subtractNumber));
          }
        }
      	ct = ct + "px";
      	if (curpint === "pop") {
      	  var fontsize = optionHash["fontSize"].substring(0,2) / 1;
          if ( fontsize > 24 ) {
            if ( w < 800 ) {
              // better put a max to the pop-up font-size
              document.styleSheets.hypLern.addRule("span.int","font-size: 20pt");
            } else {
              document.styleSheets.hypLern.addRule("span.int","font-size: " + fontsize + "pt");
            }
          }
          document.getElementById("popup_block").style.left = cl;
          document.getElementById("popup_block").style.top = ct;
      	  document.getElementById("popup_block").innerHTML = document.getElementById(mean_id).innerHTML;
      	  document.getElementById("popup_block").style.display = 'block';
      	  document.getElementById("popup_block").style.visibility = 'visible';
      	} else {
      	  // this would be in case of pnt
          c.style.visibility = "visible";
        }
        if (curpint === "pnt") {
          // if there's an idiom sentence we have to make the whole thing visible
          var wordcodeArray = orig_id.split('_');
          pagecounter = wordcodeArray[0].substring(1);
          wordcounter = wordcodeArray[1];
          idiom_beg = "ibeg" + pagecounter + "_" + wordcounter;
          idiom_mid = "imid" + pagecounter + "_" + wordcounter;
          idiom_end = "iend" + pagecounter + "_" + wordcounter;
          ibeg = document.all(idiom_beg);
          imid = document.all(idiom_mid);
          iend = document.all(idiom_end);
          if (null != ibeg && null == ibeg.length) {
            ibeg.style.visibility = "visible";
            for (number = (wordcounter/1) + 1; number < wordcounter + 10; number++) {
              idiom_mid = "imid" + pagecounter + "_" + number;
              idiom_end = "iend" + pagecounter + "_" + number;
              imid = document.all(idiom_mid);
              iend = document.all(idiom_end);
              if (null != imid && null == imid.length) {
                imid.style.visibility = "visible";
              }
              if (null != iend && null == iend.length) {
                iend.style.visibility = "visible";
                number = wordcounter + 11;
              }
            }
          } else {
            if (null != imid && null == imid.length) {
              imid.style.visibility = "visible";
              for (number = (wordcounter/1) - 1; number > wordcounter - 10; number--) {
                idiom_beg = "ibeg" + pagecounter + "_" + number;
                idiom_mid = "imid" + pagecounter + "_" + number;
                ibeg = document.all(idiom_beg);
                imid = document.all(idiom_mid);
                if (null != ibeg && null == ibeg.length) {
                  ibeg.style.visibility = "visible";
                  number = wordcounter - 11;
                }
                if (null != imid && null == imid.length) {
                  imid.style.visibility = "visible";
                }
              }
              for (number = (wordcounter/1) + 1; number < wordcounter + 10; number++) {
                idiom_mid = "imid" + pagecounter + "_" + number;
                idiom_end = "iend" + pagecounter + "_" + number;
                imid = document.all(idiom_mid);
                iend = document.all(idiom_end);
                if (null != imid && null == imid.length) {
                  imid.style.visibility = "visible";
                }
                if (null != iend && null == iend.length) {
                  iend.style.visibility = "visible";
                  number = wordcounter + 11;
                }
              }
            } else {
              if (null != iend && null == iend.length) {
                iend.style.visibility = "visible";
                for (number = (wordcounter/1) - 1; number > wordcounter - 10; number--) {
                  idiom_beg = "ibeg" + pagecounter + "_" + number;
                  idiom_mid = "imid" + pagecounter + "_" + number;
                  ibeg = document.all(idiom_beg);
                  imid = document.all(idiom_mid);
                  if (null != ibeg && null == ibeg.length) {
                    ibeg.style.visibility = "visible";
                    number = wordcounter - 11;
                  }
                  if (null != imid && null == imid.length) {
                    imid.style.visibility = "visible";
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
function Hide() {
  if (curpint === "pop") {
    document.getElementById("popup_block").style.display = 'none';
    document.getElementById("popup_block").style.visibility = 'hidden';
  }
  lastClicked = "";
}
function addWord(word_id,mean_id,page_id) {
  var wordParts = wordHash[word_id.substring(1)].split(',');
  var seconds = new Date().getTime() / 1000;    // gets you time in seconds sinds midnight 1 jan 1970
  seconds = seconds + ".dummytext";
  var splitSeconds = seconds.split(".");
  seconds = splitSeconds[0];
  // need to do something with &#3; in character codes when writing words to words.js? for example always change &#<3 decimal(s)>; to &<3 decimal(s)>, when printing to screen change &<decimal(s)> to &#<decimal(s)>;
  // or create code hash for certain languages... For now just write html chars
  // wordParts[1] is wordfreq and further parts might be(come) wordroot and wordrootfreq, these can be used to skip "easy" words
  var wordkey = seconds + "#0_" + wordParts[0] + "_" + wordParts[1] + ".txt";
  // as an experiment, I'm going to try to get the whole meaning instead of the literal
  var wholeMeaningMess = document.getElementById(mean_id).innerHTML;
  var wholeMeaningParts = wholeMeaningMess.split('\<span class\=\"intmess\"');
  var wholeMeaning = wholeMeaningParts[0];
  // if intmess exists, popmess exists... get it!
  if (wholeMeaningParts.length > 1) {
    wholeMeaningMess = wholeMeaningParts[1];
    wholeMeaningParts = wholeMeaningMess.split('class\=\"popmess\"\>');
    wholeMeaningMess = wholeMeaningParts[1];
    var newWholeMeaningMess = wholeMeaningMess.replace(/<BR>|<br>/g," ");
    wholeMeaningParts = newWholeMeaningMess.split('\<\/span\>');
    wholeMeaning = wholeMeaning + wholeMeaningParts[0];
    //toggleDirect("","Adding \"" + wordParts[0] + "\" plus \"" + wholeMeaning + "\" to my word list!","noGlass",1000);
  } else {
    // try looking for popmess directly
    wholeMeaningParts = wholeMeaningMess.split('\<span class\=\"popmess\"\>');
    if (wholeMeaningParts.length > 1) {
      wholeMeaning = wholeMeaningParts[0];
      //toggleDirect("","Adding \"" + wordParts[0] + "\" plus \"" + wholeMeaning + "\" to my word list!","noGlass",1000);
      wholeMeaningMess = wholeMeaningParts[1];
      var newWholeMeaningMess = wholeMeaningMess.replace(/<BR>|<br>/g," ");
      wholeMeaningParts = newWholeMeaningMess.split('\<\/span\>');
      wholeMeaning = wholeMeaning + wholeMeaningParts[0];
    } else {
      //toggleDirect("","Adding \"" + wordParts[0] + "\" plus \"" + wholeMeaning + "\" to my word list!","noGlass",1000);
    }
  }
  // replace any <BR> by <br> and remove spaces around it
  var newWholeMeaning = wholeMeaning.replace(/<BR>/g,"<br>");
  var newerWholeMeaning = newWholeMeaning.replace(/\&nbsp\;\&nbsp\;\&nbsp\;/g,"&nbsp;");
  var newestWholeMeaning = newerWholeMeaning.replace(/\&nbsp\;\&nbsp\;/g,"&nbsp;");
  wholeMeaning = newestWholeMeaning.replace(/^\&nbsp\;/g,"");
  newWholeMeaning = wholeMeaning.replace(/<br>\&nbsp\;/g,"<br>");
  newerWholeMeaning = newWholeMeaning.replace(/\&nbsp\;/g," ");
  toggleDirect("","Added word \"" + wordParts[0] + "\" to my word list!","noGlass",1000);
  // create file and bury meaning and root inside the file   
  window.resolveLocalFileSystemURL(myPath + "/myWords/", function (dir) {
    //console.log("Write to " + myPath + "/myWords/");
    dir.getFile(wordkey, { create: true }, function (file) {
      var textObj = file;
      textObj.file(function (file) {
        textObj.createWriter(function (fileWriter) {
          // in wordfile, add whole meaning
          // in wordfile, add word_id and page link, and bookmark to specify that there's a link back to this word card
          // onLoad if url contains wordlink go to that page and mark word in bold red or whatever
      	  var textparts = storykey.split('_');
          indexpath = textparts[0];
          indexauthor = textparts[1];
          indextext = textparts[2];
          // using int and man because this is just the link to word on page where we want to see all meanings
          var wordtargetfile = "texts/" + language_key + "/" + indexauthor + "_" + indextext + "/text_int_man.htm#wordpage" + page_id;
          var infoToWrite = newerWholeMeaning + "###" + wordtargetfile + "###" + word_id + "###" + mean_id;
          fileWriter.write(infoToWrite);
        }, fail);
      });
    });
  });
}
function findIndex(indexlanguage) {
      // check persistent settings (large or detail, author or words)
      window.resolveLocalFileSystemURL(myPath, function (dir) {
        dir.getFile("persistencefile", { create: false }, function (file) {
            var textObj = file;
            textObj.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    var indexfile = this.result;
                    if (indexfile !== null && indexfile !== undefined && indexfile !== "") {
                        top.location.href = "../" + indexfile + ".html";
                        return false;
                    }
                }
                reader.readAsText(file);
            });
        });
        return false;
      });
}
function bookMark(page_id) {
  // we only want to go through the trouble of rewriting if page is not same (optional disallow lower pages?) and if not a wordmark visit
  // plus build in timer to do max autosave once per 10 seconds
  var seconds = new Date().getTime() / 1000;
  //console.log("Trying to bookmark, lastseconds is " + lastseconds + ", seconds is " + seconds + ", page_id is " + page_id + ", lastpage_id is " + lastpage_id + ", storykey is " + storykey + ", wordmark is " + wordmark);
  if ( ((lastseconds + 10) < seconds ) && page_id !== lastpage_id && storykey !== "" && undefined !== storykey && null !== storykey && wordmark === "") {
    //console.log("Bookmarking");
    window.resolveLocalFileSystemURL(myPath, function (dir) {
        dir.getFile(storykey + ".htm", { create: true }, function (file) {
            var textObj = file;
            textObj.file(function (file) {
                textObj.createWriter(function (fileWriter) {
                    fileWriter.write(curpint + "_" + curaudio + "_page" + page_id);
                    lastpage_id = page_id;
                    lastseconds = seconds;
                }, fail);
            });
        });
    });
  }
}
function togglePopInt(page_id) {
  // find location
  var logmsg;
  var y = event.clientY;
  var x = event.clientX;
  if (null !== x && undefined !== x && x !== 0) {
    logmsg = "..";
    if (x > 40 || y > 55) {
      return;
    }
  } else {
    logmsg = ".";
  }
  if (!showingMsg) {
    if (curpint === "int") {
      //console.log("Tryin ter toggle text from int to pnt at page " + page_id);
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        clickedPopInt = true;
        toggleDirect("text_pnt_" + curaudio + ".htm#page" + page_id,"Switching to Pop-up Interlinear." + logmsg,"fadeOn",defaultMsgTime);
      },1);
      clickedPopInt = false;
    }
    if (curpint === "pnt") {
      //console.log("Tryin ter toggle text from pnt to pop at page " + page_id);
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        clickedPopInt = true;
        toggleDirect("text_pop_" + curaudio + ".htm#page" + page_id,"Switching to Text with Pop-ups." + logmsg,"fadeOn",defaultMsgTime);
      },1);
      clickedPopInt = false;
    }
    if (curpint === "pop") {
      //console.log("Tryin ter toggle text from pop to int at page " + page_id);
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        clickedPopInt = true;
        toggleDirect("text_int_" + curaudio + ".htm#page" + page_id,"Switching to Interlinear Text." + logmsg,"fadeOn",defaultMsgTime);
      },1);
      clickedPopInt = false;
    }
  } else {
    if (clickedPopInt) {
      if (curpint === "int") {
        //console.log("Tryin ter toggle text from int to pop at page " + page_id);
        clickedPopInt = false;
        toggleDirect("text_pop_" + curaudio + ".htm#page" + page_id,"Switching to Text with Pop-ups." + logmsg,"fadeOn",defaultMsgTime);
      }
      if (curpint === "pnt") {
        //console.log("Tryin ter toggle text from pnt to int at page " + page_id);
        clickedPopInt = false;
        toggleDirect("text_int_" + curaudio + ".htm#page" + page_id,"Switching to Interlinear Text." + logmsg,"fadeOn",defaultMsgTime);
      }
      if (curpint === "pop") {
        //console.log("Tryin ter toggle text from pop to pnt at page " + page_id);
        clickedPopInt = false;
        toggleDirect("text_pnt_" + curaudio + ".htm#page" + page_id,"Switching to Pop-up Interlinear." + logmsg,"fadeOn",defaultMsgTime);
      }
    }
  }
}
function toggleAudio(wrong_page_id) {
  // keep the global page_id
  // find location to be sure the audio toggle was meant
  var logmsg;
  var y = event.clientY;
  var x = event.clientX;
  //console.log("Trying to click toggleAudio button with x " + x + " and y " + y);
  if (null !== x && undefined !== x && x !== 0) {
    logmsg = "..";
    if (x < 60 || x > 91 || y < 10 || y > 55) {
      return;
    }
  } else {
    logmsg = ".";
  }
  if (!showingMsg) {
    if (curaudio === "all") {
      //console.log("Tryin ter toggle audio from all to man on page " + page_id);
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        clickedAudio = true;
       toggleDirect("text_" + curpint + "_man.htm#page" + page_id,"Switching to Play Manually." + logmsg,"fadeOn",defaultMsgTime);
      },1);
      clickedAudio = false;
    }
    if (curaudio === "man") {
      //console.log("Tryin ter toggle audio from man to aut");
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        clickedAudio = true;
        toggleDirect("text_" + curpint + "_aut.htm#page" + page_id,"Switching to Play Autopage." + logmsg,"fadeOn",defaultMsgTime);
      },1);
      clickedAudio = false;
    }
    if (curaudio === "aut") {
      //console.log("Tryin ter toggle audio from aut to all");
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function() {
        clickedAudio = true;
        toggleDirect("text_" + curpint + "_all.htm#page" + page_id,"Switching to Play All Pages." + logmsg,"fadeOn",defaultMsgTime);
      },1);
      clickedAudio = false;
    }
  } else {
    if (clickedAudio) {
      if (curaudio === "all") {
        //console.log("Tryin ter toggle audio from all to aut");
        clickedAudio = false;
        toggleDirect("text_" + curpint + "_aut.htm#page" + page_id,"Switching to Play Autopage." + logmsg,"fadeOn",defaultMsgTime);
      }
      if (curaudio === "man") {
        //console.log("Tryin ter toggle audio from man to all");
        clickedAudio = false;
        toggleDirect("text_" + curpint + "_all.htm#page" + page_id,"Switching to Play All Pages." + logmsg,"fadeOn",defaultMsgTime);
      }
      if (curaudio === "aut") {
        //console.log("Tryin ter toggle audio from aut to man");
        clickedAudio = false;
        toggleDirect("text_" + curpint + "_man.htm#page" + page_id,"Switching to Play Manually." + logmsg,"fadeOn",defaultMsgTime);
      }
    }
  }
}

function toggleformatFromMenu(texttype,audiotype) {
  //console.log("Switching to format " + texttype + " and " + audiotype + ".");
  top.location.href = "text_" + texttype + "_" + audiotype + ".htm#page" + page_id;
}

function goPage(page_id,audio_id,swiped) {
  if (device === "windows" || ( device === "android" && swiped === "yes" ) ) {
    var x;
    var y;
    y = event.clientY;
    x = event.clientX;
    if (x > 0 && x < 91 && y > 10 && y < 55) {
      // save new page
      if (autosave === "on") {
        bookMark(page_id+1);
      }
      // do nuthin
      togglePopInt(page_id+1);
      return false;
    } else {
      if (curaudio === "aut") {
        // save new page
        if (autosave === "on") {
          bookMark(page_id);
        }
        // play page audio
        userStopped = false;
        playAudio('autoplay',audio_id,page_id);
      }
      // go to desired spot
      top.location.href = "text_" + curpint + "_" + curaudio + ".htm#page" + page_id;
    }
  }
}

function endFinger(page_id,audio_id,audio_id_last,audio_id_next) {
  //toggleDirect("","Detected swipe.","fadeOff",defaultMsgTime);
  if ( null !== xFinger || null !== yFinger || undefined !== xFinger || undefined !== yFinger || xFinger !== "" || yFinger !== "" || null !== xUnfinger || null !== yUnfinger || undefined !== xUnfinger || undefined !== yUnfinger || xUnfinger !== "" || yUnfinger !== "" ) {
    var xDelta = ( xFinger / 1 ) - ( xUnfinger / 1 );
    var yDelta = ( yFinger / 1 ) - ( yUnfinger / 1 );
    if ( Math.abs( yDelta ) < 15 && Math.abs( xDelta ) > 15 && ( endMove - startMove ) > 100 && ( endMove - startMove ) < 99999 ) {
      if ( Math.abs( xDelta ) > Math.abs( yDelta ) ) {      // x finger delta larger than y finger delta
        if ( xDelta > 0 ) {        // swipe left, go right
          page_id = ( page_id / 1 ) + 1;
          page = document.all("page" + page_id);
          goPage(page_id,audio_id_next,"yes");
        } else {
          // swipe right, go left
          page_id = ( page_id / 1 ) - 1;
          page = document.all("page" + page_id);
          if (page_id > 0) {
            // go to desired spot
            goPage(page_id,audio_id_last,"yes");
          }
        }
      } else {
        // this is just scrolling up / down on android
        if (curpint === "pop") {
          Hide();
        }
      }
    }
    // re-init xFinger and yFinger
    xFinger = null;
    yFinger = null;
    xUnfinger = null;
    yUnfinger = null;
    startMove = 0;
    endMove = 0;
  } else {
    // re-init xFinger and yFinger
    xFinger = null;
    yFinger = null;
    xUnfinger = null;
    yUnfinger = null;
    startMove = 0;
    endMove = 0;
    return;
  }
  // re-init xFinger and yFinger
  xFinger = null;
  yFinger = null;
  xUnfinger = null;
  yUnfinger = null;
  startMove = 0;
  endMove = 0;
}
function startFinger(go) {

  // safety net versus blank screens
  if (document.getElementById("wholething").style.visibility === "hidden") {
    document.getElementById("wholething").style.visibility='visible';
  }
  
  startMove = new Date().getTime() ;    // gets you time in miliseconds sinds midnight 1 jan 1970
  xFinger = go.touches[0].clientX;
  yFinger = go.touches[0].clientY;
  xUnfinger = null;
  yUnfinger = null;
  endMove = 0;
}
function moveFinger(go) {
  endMove = new Date().getTime() ;    // gets you time in miliseconds sinds midnight 1 jan 1970
  if ( ( endMove - startMove ) > 100 && ( endMove - startMove ) < 99999 ) {
    xUnfinger = go.touches[0].clientX;
    yUnfinger = go.touches[0].clientY;
  }
  // make regular touches
}
function cancelFinger(go) {
  // re-init xFinger and yFinger
  xFinger = null;
  yFinger = null;
  xUnfinger = null;
  yUnfinger = null;
  startMove = 0;
  endMove = 0;
}

function toggleDirect(targetPage,msgToShow,command,timeToShow) {
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (noTipUp === true && targetPage !== "") {
    // direct to page after timeout finishes
    clearTimeout(loadTimeout);
    loadTimeout = setTimeout(function() {
      top.location.href = targetPage;
    },timeToShow);
  } else {
    if (msgToShow !== "") {
      // set msg block
      showingMsg = true;
      document.getElementById("msg_block").innerHTML = msgToShow;
      // display total block
      if (command === "fadeOn") {
        opacityBase = 0;
        document.getElementById("msg").style.opacity='0';
        document.getElementById("msg").style.display='block';
        document.getElementById("glass").style.display='block';
        fadeTime = timeToShow / 2;   //2000 -> 1000
        fadeTimebit = fadeTime / 20;
        fadePerc = 0;
        // fade in and out
        clearTimeout(msgTimeout);
        counting = "Down";
        msgTimeout = setInterval(goFadeMsg,fadeTimebit);
      } else {
        clearTimeout(msgTimeout);
        document.getElementById("msg").style.opacity='1';
        document.getElementById("msg").style.display='block';
        if (command === "noGlass") {
          // don't show tinted glass
        } else {
          document.getElementById("glass").style.display='block';
        }
        msgTimeout = setInterval(interruptFade,timeToShow);
      }
    } else {
      // no msgToShow, so don't show, it's just a timeout plus redirect
    }
    // if targetPage is not empty, direct to page after timeout finishes
    clearTimeout(loadTimeout);
    if (targetPage !== "") {
      // Setting msg timeout
      loadTimeout = setTimeout(function() {
        top.location.href = targetPage;
        if (command === "scroll") {
          var currentYPos = window.pageYOffset;
          window.scrollTo(0, window.pageYOffset - 200);
          // now check if this actually did something
          if (currentYPos === window.pageYOffset ) {
            // nuttin happened, must be on android, pluck element id apart
            var element_parts = elem_id.split('_');
            var element_main = element_parts[0];
            var element_number = element_parts[1];
            // get lowest element id on current page
            var zootje = document.getElementById(bookmark).innerHTML;
            zootjeParts = zootje.split('\<\!\-\-');
            zootje = zootjeParts[1];
            zootjeParts = zootje.split('\-\->');
            zootje = zootjeParts[0];
            zootjeParts = zootje.split('_');
            var fontsize = optionHash["fontSize"].substring(0,2) / 1;
            var nowts = 10; // Number Of Words To Shift from top of page so word to go to is not right at the top
            if ( fontsize === 21 && w < 800 ) {
              nowts = 6;
            }
            if ( fontsize === 24 && w < 800 ) {
              nowts = 4;
            }
            if ( fontsize > 24 && w < 800 ) {
              nowts = 2;
            }
            if ( element_number > ((zootjeParts[2]/1) + nowts) ) {
              element_number = element_number - nowts;
              elem_id = element_main + "_" + element_number;
              top.location.href = "text_" + curpint + "_" + curaudio + ".htm#" + elem_id;
            } else {
              top.location.href = "text_" + curpint + "_" + curaudio + ".htm#" + bookmark;
            }
          } else {
            // Repositioning worked...
          }
        }
      },timeToShow*1.3);
    } else {
      loadTimeout = setTimeout(function() {
      	showingMsg = false;
      	if (command === "draw" && document.getElementById("wholething").style.visibility === "hidden") {
      	  //console.log("Timeout for drawing, force screen draw!");
          document.getElementById("wholething").style.visibility='visible';
      	}
      },timeToShow*1.3);
    }
  }
}
function goFadeMsg() {
  if (counting === "Down") {
    if (fadePerc < 105) {
      //console.log("Fading in at " + fadePerc);
      fadePerc = fadePerc + 5;
      opacityBase = fadePerc / 20;
      document.getElementById("msg").style.opacity = opacityBase;
    } else {
      // end of fade in cycle
      counting = "Up";
    }
  } else {
    if (fadePerc > 9) {
      //console.log("Fading out at " + fadePerc);
      fadePerc = fadePerc - 5;
      opacityBase = fadePerc / 20;
      document.getElementById("msg").style.opacity = opacityBase;
    } else {
      // end of fade cycle
      document.getElementById("msg").style.display='none';
      document.getElementById("glass").style.display='none';
      clearTimeout(msgTimeout);
    }
  }
}
function interruptFade() {
  // end fade cycle
  document.getElementById("msg").style.display='none';
  document.getElementById("glass").style.display='none';
  clearTimeout(msgTimeout);
  noTipUp = true;
}
function onLoad() {
  loadReady = true;
    
  // keep an eye on scrolling
  var oldScrollY = document.body.scrollTop;

  // to make sure current file is written to lastchosen, either onLoad or onDeviceReady will have to write it!
  if ( deviceReady === true && language_key === language_code ) {
    window.resolveLocalFileSystemURL(myPath, function (dir) {
      var textparts = storykey.split('_');
      indexpath = textparts[0];
      indexauthor = textparts[1];
      indextext = textparts[2];
      //console.log("writing targetfile");
      var targetfile = "texts/" + language_key + "/" + indexauthor + "_" + indextext + "/text_" + curpint + "_" + curaudio + ".htm#" + bookmark;
      // first write the current chosen file to "lastchosen"
      dir.getFile("lastchosen", { create: true }, function (lastchosenfile) {
        var textObject = lastchosenfile;
        textObject.createWriter(function (fileWriter) {
          fileWriter.write(targetfile);
        }, fail);
      });
    });
  }
  if ( deviceReady === true ) {  
    // poppelepoo, if this is anything we need to set the font-size and type too!
    setStyle('grutjes');
    // get url hash
    var hash = window.location.hash;
    // save bookmark
    bookmark = hash.substring(hash.indexOf("#page")+5);
    if (bookmark > 0) {
      bookmark = "page" + bookmark;
      //console.log("Did not come from Index as hash is " + hash);
    } else {
      // from index
      bookmark = hash.substring(hash.indexOf("#indx")+5);
      if (bookmark > 0) {
        bookmark = "page" + bookmark;
        fromIndex = true;
        //console.log("Came from Index as hash is " + hash);
      } else {
      	//console.log("Did not come from Index as hash is " + hash);
      }
    }
    // auto play if this was refresh
    var autoaudio = hash.substring(hash.indexOf("#playpage")+9);
    if (autoaudio > 0) {
      firstTry = false;
      //don't forget to change bookmark to regular page in case of audio play refresh entry
      bookmark = "page" + autopage;
      // this was refresh, play page
      var autopage = audioToPageArray[autoaudio];
      //play audio page " + autoaudio + " on actual page " + autopage;
      playAudio('pageplay',autoaudio,autopage);
    }
    //texts/hun/Moricz_AVegekJulija/text_int_man.htm#wordpage2___word_id___mean_id
    var wordmarkstring = "";
    wordmarkstring = hash.substring(hash.indexOf("#wordpage")+9);
    if (wordmarkstring !== "") {
      var wordmarkstringparts = wordmarkstring.split('___');
      if (wordmarkstringparts[0] > 0) {
        word_id = wordmarkstringparts[1];
        mean_id = wordmarkstringparts[2];
        item_nr = wordmarkstringparts[3];
        // embolden word and mean id
        document.getElementById(word_id).style.fontWeight='bold';
        document.getElementById(mean_id).style.fontWeight='bold';
        //filling in wordmark now means we can 'go back' later to correct word in word list
        wordmark = item_nr;
        //remember word_id as elem_id as the one we're going to
        elem_id = word_id;
        // don't forget to change bookmark to regular page in case of wordpage entry
        bookmark = "page" + wordmarkstringparts[0];
        // turn autosave off if we're here only for words and not for reading
        autosave = "off";
        //go to word after timeout, this number should be editable for slow phones, 100 is too small for mine
        toggleDirect("text_" + curpint + "_" + curaudio + ".htm#" + word_id,"","scroll",300);
      }
    }
    var pagego = hash.substring(hash.indexOf("#page")+5);
    if ( pagego > 0) {
      //console.log("crying to go to page " + pagego);
      page_id = pagego;
      top.location.href = "text_" + curpint + "_" + curaudio + ".htm#page" + page_id;
    }
  }
}
function goBack() {
  if (wordmark !== "") {
    top.location.href = "../../../vocabulary.html#goword" + wordmark;
  } else {
    if (fromIndex === true) {
      top.location.href = "../../../index.html";
    } else {
      findIndex(language_key);
    }
  }
}
function appOnline() {
  // legacy for audio
}
function appOffline() {
  // legacy for audio
}