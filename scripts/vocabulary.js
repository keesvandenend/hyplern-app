/* globals console,document,window,cordova */
 
document.addEventListener('deviceready', onDeviceReady, false);
//document.addEventListener("backbutton", goBackFromVocabulary, false);

// very important, can't do writing in other functions without this variable being set to true in initial onDeviceReady function
var deviceReady = false;
// loadReady is created onload
var loadReady = false;
var myPath;
var myWordsPath;
var dir;
var targetfile;
var targetitem;
var deviceReady = false;
var wordfileArray = [""];
var lastItem = 99999;
var lastzIndex;
var wordinfo;
var extendedAction = false;
var cardOpen = false;
var wordTest = false;
var justReturned = false;
var lastSlotFilled = -1;
var testedcorrect;
var openingWord = false;
// this one prevents first time opening at screen load or return from word-in-sentence look-up
var firstLoad = true;
// this one prevents a bug that the re-listing of the words is faster than the deleting of the last file
var justDeleted = "seconds_original_meaning";

// if by chance we're returning from a page lookup, use this to go back to the card we were lookin at
var word_id = -1;

// for single word practice
var openItemNr = 0;
 
function fail(e) {
  document.getElementById("log_listing").innerHTML = "error";
}

function onDeviceReady() {
  var logmsg = "Starting deviceReady procedure, ";
  var textObj;
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
    logmsg = logmsg + "resolved myPath, ";
    dir.getDirectory("myWords", { create: true }, function (dirEntry) {
      // this just makes sure the myWordsPath "myWords" exists to put in any flash/word cards
      myWordsPath = dirEntry.fullPath;
      logmsg = logmsg + "running listPath, " + myWordsPath;
      logmsg = logmsg + "finished listPath. ";
 
      //document.getElementById("log_devicestart").innerHTML = logmsg;
    },onFailCallback);
    
    listPath(myPath + "/myWords/");
    deviceReady = true;
  });
}

function listPath(myChosenPath) {
  var logmsg = "Starting listing override, ";
  window.resolveLocalFileSystemURL(myChosenPath, function (dirEntry) {
    logmsg = logmsg + "resolved myChosenPath, ";
    var directoryReader = dirEntry.createReader();
    directoryReader.readEntries(onSuccessCallback, onFailCallback);
  },fail);
  logmsg = logmsg + "finishing listing override. ";
  //document.getElementById("log_devicepath").innerHTML = logmsg;
}


function onSuccessCallback(entries) {
  var logmsg = "Starting link overwriting, ";
  var savedwordfile = "";
  var savedwordfileparts = "";
  var savedwordfilenameArray;
  var savedword = "";
  var savedwordcontents = "";
  var seconds = new Date().getTime() / 1000;    // gets you time in seconds sinds midnight 1 jan 1970
  if ( entries.length < 1 ) {
    logmsg = logmsg + "no entries found, return false. ";
    //console.log("no card was shown");
    document.getElementById("nowordsortest").style.display='block';
    if ( entries.length < 1 ) {
      //console.log("no entries");
      document.getElementById("nowordstext").style.display='block';
    }
    return(false);
  }
  // depending on sort, sort (next reminder, alphabetical)
  for (i = 0; i < entries.length; i++) {
    var row = entries[i];
    if (row.isDirectory) {
      // skip
      i = i - 1;
    } else {
      savedwordfile = row.name;
      if (savedwordfile !== justDeleted) {
        savedwordfileparts = savedwordfile.split(".txt");
        savedwordfilenameArray = savedwordfileparts[0].split("_");
        if (savedwordfilenameArray.length > 2) {
          var wordageandtested = savedwordfilenameArray[0].split("#");
          wordage = Math.round(wordageandtested[0]);
          if (null !== wordageandtested[1] && undefined !== wordageandtested[1] && NaN !== wordageandtested[1] && wordageandtested[1] !== "" && wordageandtested[1] !== "NaN" && wordageandtested[1] !== "undefined") {
            var wordtested = ( wordageandtested[1] / 1 );
            var wordremindernumber = ( wordtested / 1 ) + 1;
          } else {
            var wordtested = 0;
            var wordremindernumber = 1;
          }
          if (wordtested < 10) {
            wordtested = "00" + wordtested;
          } else {
            if (wordtested < 99) {
              wordtested = "0" + wordtested;
            }
          }
          if ( ( wordremindernumber / 1 ) > 21) {
            wordremindernumber = 21;
          }
          wordage = ( wordage / 1 ) + ( optionHash["reminder" + (wordremindernumber/1)] / 1 );
          var wordoriginal = savedwordfilenameArray[1];
          var wordmeaning = savedwordfilenameArray[2];
          // now put in the order you would like to sort
          if ( optionHash["wordSort"] === "reminder" ) {
            entries[i].name = wordage + "#" + wordtested + "_" + wordoriginal + "_" + wordmeaning;
          } else {
            entries[i].name = wordoriginal + "_" + wordmeaning + "_" + wordage + "#" + wordtested;
          }
          //console.log("reshufling entry name to become " + entries[i].name);
        } else {
          // this entry seems corrupt
        }
      } else {
        // don't bother with it, it was just deleted
      }          
    }
  }
  // first sort entries mess in case of Android
  entries.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );
  // variable to make sure at least one card is shown, or for single, a max of 1 card is shown
  shownCard = false;
  document.getElementById("nowordsortest").style.display='none';
  document.getElementById("nowordstext").style.display='none';
  document.getElementById("noteststext").style.display='none';
  document.getElementById("word_rightarrow").style.display='none';
  // and now?
  var hash = window.location.hash;
  var flashes = hash.substring(hash.indexOf("#mode")+5);
  if ( flashes === "default" || flashes === "single" ) {
    optionHash["testFlash"] = flashes;
    if ( flashes === "single" ) {
      optionHash["wordSort"] = "reminder";
    }
  }
  //console.log("Mode is " + optionHash["testFlash"]);
  // now go through them
  for (i = 0; i < entries.length; i++) {
    var row = entries[i];
    if (row.isDirectory) {
      // skip
      i = i - 1;
    } else {
      savedwordfile = row.name;
      if (savedwordfile !== justDeleted) {
        //console.log("Checking entry name " + entries[i].name);
        // we have 200 slots, so max 100 are filled so the 100 others can be filled if we 'do' the 100
        if ( ( i < 100 && optionHash["testFlash"] !== "single" ) || ( optionHash["testFlash"] === "single" && shownCard !== true) ) {
          logmsg = logmsg + "trying to link in " + savedwordfile + ", ";
          savedwordfileparts = savedwordfile.split(".txt");
          savedwordfilenameArray = savedwordfileparts[0].split("_");
          if (savedwordfilenameArray.length > 2) {
            if ( optionHash["wordSort"] === "reminder" ) {
              var wordageandtested = savedwordfilenameArray[0].split("#");
              var wordoriginal = savedwordfilenameArray[1];
              var wordmeaning = savedwordfilenameArray[2];
            } else {
              var wordageandtested = savedwordfilenameArray[2].split("#");
              var wordoriginal = savedwordfilenameArray[0];
              var wordmeaning = savedwordfilenameArray[1];
            }
            var wordage = wordageandtested[0];
            var wordtested = Math.round(wordageandtested[1]);
            if (wordageandtested[1] !== "000") {
              var wordremindernumber = ( wordtested / 1 ) + 1;
            } else {
              var wordremindernumber = 1;
            }
            if ( ( wordremindernumber / 1 ) > 21) {
              wordremindernumber = 21;
            }
            wordage = wordage - ( optionHash["reminder" + (wordremindernumber/1)] / 1 );
            // save wordfile
            wordfileArray[i] = wordage + "#" + wordtested + "_" + wordoriginal + "_" + wordmeaning + ".txt";
            //console.log("Refixed file name to " + wordfileArray[i]);
            var wordreminder = optionHash["reminder" + wordremindernumber];
            // add possible check on wordage dependent on SRS option
            if (null != wordoriginal && undefined != wordoriginal && "" != wordoriginal) {
              var textlink = document.all("word_item" + i);
              if (null != textlink && undefined != textlink) {
                // this wordlink exists, fill wordlist item or fill item for single if red
                //console.log("if wordage " + wordage + " plus reminder length " + wordreminder + " minus margin reminder length " + ( wordreminder / 1 * ( optionHash["testMargin"] / 1 ) ) + " is smaller than seconds " + seconds);
                if ( ( ( wordage / 1 ) + ( wordreminder / 1 ) - ( wordreminder / 1 * ( optionHash["testMargin"] / 1 ) ) ) < seconds ) {
              	  document.getElementById("word_itemtext" + i).style.color='red';
                } else {
              	  document.getElementById("word_itemtext" + i).style.color='black';
                }
                if ( optionHash["testFlash"] !== "single" || document.getElementById("word_itemtext" + i).style.color === "red" ) {
                  shownCard = true;
                  document.getElementById("word_item" + i).style.display='block';
                  // if this is single testing, add some bs to word original and show the right arrow at the bottom
                  if ( optionHash["testFlash"] === "single") {
                    document.getElementById("word_itemtext" + i).innerHTML = wordoriginal + "<br><br><br><span class='wordbs'>Try to remember the meaning of this word. Then click the word or the right arrow below to reveal the card, and use the buttons on the bottom to confirm whether you remembered it correctly or not.</span><br>";
                    document.getElementById("word_rightarrow").style.display='block';
                    openItemNr = i;
                  } else {
                    document.getElementById("word_itemtext" + i).innerHTML = wordoriginal;
                  }
                  // extended meaning inside file has to wait until wordcard is clicked
                  document.getElementById("word_extended" + i).innerHTML = wordmeaning;
                  // keep word_file# on tabs so we can open it up
                  document.getElementById("word_file" + i).innerHTML = row.name;
                  //appendLog("create wordlinks for original " + wordoriginal + " and meaning " + wordmeaning);
                  logmsg = logmsg + "create wordlinks for original " + wordoriginal + " and meaning " + wordmeaning + ", ";
                  lastSlotFilled = i;
                } else {
                  //console.log("no cigar, we're in single mode and this is not a card that's up for practice!");
                }
              } else {
                // seems like wordlink spaces are finished, need to refer to some kind of next page or keep it to these (or extend wordlink spaces :PPPP )
                logmsg = logmsg + "out of wordlink space for original " + wordoriginal + " and meaning " + wordmeaning + "!!! ";
              }
            } else {
              logmsg = logmsg + "wordfile with name " + row.name + " seems not regular wordfile!!! ";
            }
          } else {
            //appendLog("savedwordfile string " + savedwordfile + " does not contain correct elementsj!");
            logmsg = logmsg + "problem with file " + savedwordfileparts[0] + ", ";
          }
        } else {
      	  // what to do with the rest? nothing I guess, they're being saved in wordfileArray, at least turn display off, in case we're refreshing
      	  document.getElementById("word_item" + i).style.display='none';
        }
      } else {
      	// this file was/is in the process of being deleted so skip it
      }
    }
 
    if (savedwordfile !== undefined) {
      ////console.log("html " + savedwordfile);
      //appendLog("html " + savedwordfile);
      logmsg = logmsg + "finished. ";
    } else {
      ////console.log("html error " + savedwordfile);
      //appendLog("html error " + savedwordfile);
      logmsg = logmsg + "no links found. ";
    }
  }
  //console.log("dropping by no words section");
  if (shownCard !== true) {
    //console.log("no card was shown");
    document.getElementById("nowordsortest").style.display='block';
    if ( entries.length < 1 ) {
      //console.log("no entries");
      document.getElementById("nowordstext").style.display='block';
    }
    if ( optionHash["testFlash"] === "single" ) {
      document.getElementById("noteststext").style.display='block';
    }
  }
  // clear the rest
  for (i = i; i < 199; i++) {
    document.getElementById("word_item" + i).style.display='none';
  }
  //we're returning from story word lookup, if url is something like this: ../../../vocabulary.htm#goword2
  if (word_id > -1) {
    if (justReturned === true) {
      justReturned = false;
      goWord(word_id);
    }
  }
  extendedAction = false;

  if (firstLoad !== true) {
    // if auto learn is on, it should open next wordcard (lastItem + 1, or first filled top card it can find) which automatically shows yes/no buttons again
    if ( optionHash["testAutopen"] === "On" ) {
      //console.log("Trying to open new word card");
      // if auto learn is on, it should open next wordcard (lastItem + 1, or first filled top card it can find) which automatically shows yes/no buttons again
      for (i = 0; i < 200; i++) {
        if (document.getElementById("word_item" + i).style.display === "block" && document.getElementById("word_itemtext" + i).style.color === "red") {
          //console.log("Opening card " + i);
          openingWord = true;
          actionWord(i);
          openingWord = false;
          i = 99999;
          cardOpen = true;
          justDeleted = "seconds_original_meaning";
        }
      }
      //console.log("End check for card to open routine...");
    }
  } else {
    firstLoad = false;
    var hash = window.location.hash;
    var flashes = hash.substring(hash.indexOf("#mode")+5);
    if ( flashes === "default" || flashes === "single" ) {
      optionHash["testFlash"] = flashes;
      if ( flashes === "single" ) {
        optionHash["wordSort"] = "reminder";
      }
    }
    //console.log("Mode is now " + optionHash["testFlash"]);
    // now quick! write it down!
    window.resolveLocalFileSystemURL(myPath, function (dir) {
      dir.getFile("optionhash", { create: true }, function (file) {
        textObj = file;
        textObj.file(function (file) {
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
        });
      });
    });
  }
  //document.getElementById("log_d").innerHTML = logmsg;
}
function actionWord(item_nr) {
  var logmsg = "Running actionWord, ";
  document.getElementById("word_rightarrow").style.display='none';
  if (null === item_nr || undefined === item_nr || item_nr === "") {
    item_nr = openItemNr;
  }
  // retrieve testedcorrect from filename
  var savedwordfilenameArray = wordfileArray[item_nr].split("_");
  if (savedwordfilenameArray.length > 2) {
    var wordageandtested = savedwordfilenameArray[0].split("#");
    if (null !== wordageandtested[1] && undefined !== wordageandtested[1] && NaN !== wordageandtested[1] && wordageandtested[1] !== "" && wordageandtested[1] !== "NaN" && wordageandtested[1] !== "undefined" && wordageandtested[1] !== "000") {
      testedcorrect = ( Math.round(wordageandtested[1]) / 1 );
    } else {
      testedcorrect = 0;
    }
    var wordage = wordageandtested[0];
    var wordfileoriginal = savedwordfilenameArray[1];
    var wordfilemeaning = savedwordfilenameArray[2];
  } else {
    // something's amiss
  }
  //console.log("testedcorrect is " + testedcorrect);
  // offer alternative word file name without testedcorrect for older versions
  var alternativeWordFilename = wordage + "_" + wordfileoriginal + "_" + wordfilemeaning;
  //console.log("Checking if extendedAction " + extendedAction + " is false or openingWord " + openingWord + " is true, AND justDeleted " + justDeleted + " is not equal to wordfileArray[item_nr] " + wordfileArray[item_nr] + "...");
  if ( ( extendedAction === false || openingWord === true ) && justDeleted !== wordfileArray[item_nr]) {
    var wordfile = wordfileArray[item_nr];
    if (lastItem === 99999 || cardOpen === false) {
      //console.log("No card to hide...");
      // this is first word clicked, we don't have to hide last card
    } else {
      //console.log("hiding card " + lastItem);
      document.getElementById("word_item" + lastItem).style.zIndex=lastzIndex;
      document.getElementById("word_extended" + lastItem).style.display = 'none';
      document.getElementById("word_extendedplus" + lastItem).style.display = 'none';
      document.getElementById("word_page" + lastItem).style.display = 'none';
      document.getElementById("wordyes").style.display='none';
      document.getElementById("wordno").style.display='none';
      document.getElementById("word_rightarrow").style.display='none';
    }
    //console.log("checking whether lastItem " + lastItem + " does not equal item_nr " + item_nr + " and cardOpen " + cardOpen + " equals false.");
    if (lastItem !== item_nr || cardOpen === false) {
      lastItem = item_nr;
      //console.log("we're still good here...");
      lastzIndex = document.getElementById("word_item" + item_nr).style.zIndex;
      document.getElementById("word_item" + item_nr).style.zIndex=1000000000;
      document.getElementById("word_extended" + item_nr).style.display='block';
      //console.log("now we're good here...");
      logmsg = logmsg + "word file is " + wordfile + ", ";
      // open word file, display extended meaning, use constants.js to puzzle together the story name to display, save targetfile in global variable,
      // including the word_id and mean_id so when going to target, you can find the correct word to mark bold
      //console.log(logmsg);
      var foundWordFile = false;
      window.resolveLocalFileSystemURL(myPath + "/myWords/", function (dir) {
        var indexfile
        dir.getFile(wordfile, { create: false }, function (file) {
          //console.log("got the file?");
          var textObj = file;
          textObj.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
              wordinfo = this.result;
              if (wordinfo !== null && wordinfo !== undefined && wordinfo !== "") {
              	foundWordFile = true;
                // split wordinfo and display, use keys to create wordpage sentence, and keep targetpage with wordkeys ready to load when wordpage sentence is is pressed
                // V�g&nbsp;<br>[A&nbsp;V�GEK&nbsp;JULIJA;<br>Juli&nbsp;from&nbsp;the&nbsp;clan&nbsp;of&nbsp;the&nbsp;V�gs]###texts/hun/Moricz_AVegekJulija/text_int_man.htm#wordpage2###word_id###mean_id
                var wordinfoParts = wordinfo.split('###');
                var wordmeaning = wordinfoParts[0];
                var wordpage = wordinfoParts[1];
                var wordid = wordinfoParts[2];
                var meanid = wordinfoParts[3];
                wordinfo = wordinfoParts[0] + "###" + wordinfoParts[1] + "###" + wordinfoParts[2] + "###" + wordinfoParts[3] + "###";
                // if this is single testing, reprint word meaning without the bs
                if ( optionHash["testFlash"] === "single" ) {
                  document.getElementById("word_itemtext" + item_nr).innerHTML = savedwordfilenameArray[1];
                }
                // saving page with bookmark info!
                targetfile = wordpage + "___" + wordid + "___" + meanid + "___";
                targetitem = item_nr;
                wordinfoParts = wordpage.split('#');
                wordpage = wordinfoParts[0];
                var wordpagenr = wordinfoParts[1].substring(8);
                wordinfoParts = wordpage.split('\/');
                var wordcode = wordinfoParts[2];
                wordinfoParts = storyHash[wordcode].split('_');
                // make nice sentence directing you to page
                document.getElementById("word_page" + item_nr).innerHTML = "Page " + wordpagenr + " of '" + wordinfoParts[1] + "' by " + wordinfoParts[0] + ".";
                if ( document.getElementById("word_itemtext" + item_nr).style.color === "red" ) {
                  // only open up wordcard yes/no when red (over time)
                  document.getElementById("wordno").style.display = 'block';
                  document.getElementById("wordyes").style.display = 'block';
                }
                document.getElementById("word_page" + item_nr).style.display='block';
                logmsg = logmsg + "Page " + wordpagenr + " of '" + wordinfoParts[1] + "' by " + wordinfoParts[0] + ".";
                // fix word meaning a little, if first part of extended meaning in wordfile contains '(', use meaning from filename
                wordinfoParts = wordmeaning.split('<br>');
                if (wordinfoParts.length > 1) {
                  document.getElementById("word_extendedplus" + item_nr).innerHTML = wordinfoParts[1];
                  document.getElementById("word_extendedplus" + item_nr).style.display='block';
                } else {
                  document.getElementById("word_extendedplus" + item_nr).innerHTML = "<br>";
                  document.getElementById("word_extendedplus" + item_nr).style.display='block';
                }
                if (wordinfoParts[0].indexOf('(') === -1) {
                  document.getElementById("word_extended" + item_nr).innerHTML = wordinfoParts[0];
                }
              }
            }
            reader.readAsText(file);
          });
        },onFailCallback);
        //console.log("are we still there?");
        if (foundWordFile === false) {
          //console.log("file not found, using alt file " + alternativeWordFilename);
          dir.getFile(alternativeWordFilename, { create: false }, function (file) {
            //console.log("got the alternative file?");
            var textObj = file;
            textObj.file(function (file) {
              var reader = new FileReader();
              reader.onloadend = function (e) {
                wordinfo = this.result;
                if (wordinfo !== null && wordinfo !== undefined && wordinfo !== "") {
              	  foundWordFile = true;
              	  wordfileArray[item_nr] = alternativeWordFilename;
                  // split wordinfo and display, use keys to create wordpage sentence, and keep targetpage with wordkeys ready to load when wordpage sentence is is pressed
                  // V�g&nbsp;<br>[A&nbsp;V�GEK&nbsp;JULIJA;<br>Juli&nbsp;from&nbsp;the&nbsp;clan&nbsp;of&nbsp;the&nbsp;V�gs]###texts/hun/Moricz_AVegekJulija/text_int_man.htm#wordpage2###word_id###mean_id
                  var wordinfoParts = wordinfo.split('###');
                  var wordmeaning = wordinfoParts[0];
                  var wordpage = wordinfoParts[1];
                  var wordid = wordinfoParts[2];
                  var meanid = wordinfoParts[3];
                  wordinfo = wordinfoParts[0] + "###" + wordinfoParts[1] + "###" + wordinfoParts[2] + "###" + wordinfoParts[3] + "###";
                  // if this is single testing, reprint word meaning without the bs
                  if ( optionHash["testFlash"] === "single" ) {
                    document.getElementById("word_itemtext" + item_nr).innerHTML = savedwordfilenameArray[1];
                  }
                  // saving page with bookmark info!
                  targetfile = wordpage + "___" + wordid + "___" + meanid + "___";
                  targetitem = item_nr;
                  wordinfoParts = wordpage.split('#');
                  wordpage = wordinfoParts[0];
                  var wordpagenr = wordinfoParts[1].substring(8);
                  wordinfoParts = wordpage.split('\/');
                  var wordcode = wordinfoParts[2];
                  wordinfoParts = storyHash[wordcode].split('_');
                  // make nice sentence directing you to page
                  document.getElementById("word_page" + item_nr).innerHTML = "Page " + wordpagenr + " of '" + wordinfoParts[1] + "' by " + wordinfoParts[0] + ".";
                  if ( document.getElementById("word_itemtext" + item_nr).style.color === "red" ) {
                    // only open up wordcard yes/no when red (over time)
                    document.getElementById("wordno").style.display = 'block';
                    document.getElementById("wordyes").style.display = 'block';
                  }
                  document.getElementById("word_page" + item_nr).style.display='block';
                  logmsg = logmsg + "Page " + wordpagenr + " of '" + wordinfoParts[1] + "' by " + wordinfoParts[0] + ".";
                  // fix word meaning a little, if first part of extended meaning in wordfile contains '(', use meaning from filename
                  wordinfoParts = wordmeaning.split('<br>');
                  if (wordinfoParts.length > 1) {
                    document.getElementById("word_extendedplus" + item_nr).innerHTML = wordinfoParts[1];
                    document.getElementById("word_extendedplus" + item_nr).style.display='block';
                  } else {
                    document.getElementById("word_extendedplus" + item_nr).innerHTML = "<br>";
                    document.getElementById("word_extendedplus" + item_nr).style.display='block';
                  }
                  if (wordinfoParts[0].indexOf('(') === -1) {
                    document.getElementById("word_extended" + item_nr).innerHTML = wordinfoParts[0];
                  }
                }
              }
              reader.readAsText(file);
            });
          },onFailCallback);
          //console.log("did it go right this time?");
          if (foundWordFile === false) {
            //console.log("just can't find the right file...");
            // if this is single testing, reprint word meaning
            if ( optionHash["testFlash"] === "single" ) {
              document.getElementById("word_itemtext" + item_nr).innerHTML = savedwordfilenameArray[1];
            }
            // make excuses for the fact that there's no page info
            document.getElementById("word_page" + item_nr).innerHTML = "Problem with wordfile, no extended or page info...";
            if ( document.getElementById("word_itemtext" + item_nr).style.color === "red" ) {
              // only open up wordcard yes/no when red (over time)
              document.getElementById("wordno").style.display = 'block';
              document.getElementById("wordyes").style.display = 'block';
            }
            document.getElementById("word_page" + item_nr).style.display='block';
          }
        }
        return false;
      });
      cardOpen = true;
    } else {
      cardOpen = false;
    }
  } else {
    extendedAction = false;
  }
  //document.getElementById("log_g").innerHTML = logmsg;
}
// please remove the item_nr slot from here and vocabulary.html (don't forget the yes/no buttons)
function actionWordExtended(item_nr,option) {
  extendedAction = true;
  if (option === "del") {
    justDeleted = wordfileArray[item_nr];
    if (cardOpen === true) {
      document.getElementById("word_item" + item_nr).style.zIndex=lastzIndex;
      document.getElementById("word_item" + item_nr).style.display='none';
      document.getElementById("word_extended" + item_nr).style.display='none';
      document.getElementById("word_extendedplus" + item_nr).style.display = 'none';
      document.getElementById("word_page" + item_nr).style.display = 'none';
      document.getElementById("wordyes").style.display='none';
      document.getElementById("wordno").style.display='none';
      document.getElementById("word_rightarrow").style.display='none';
    }
    if (targetitem > item_nr) {
      targetitem = targetitem - 1;
    }
    word_id = -1;
    delWordfile(item_nr);
    cardOpen = false;
    //document.getElementById("log_d").innerHTML = "Deleted file... word_id is " + word_id;
  }
  if (option === "no" || option === "yes") {
    // make sure word sort is on reminder
    optionHash["wordSort"] = "reminder";
    // get numbah of seconds
    var seconds = new Date().getTime() / 1000;    // gets you time in seconds sinds midnight 1 jan 1970
    seconds = seconds + ".dummytext";
    var splitSeconds = seconds.split(".");
    // just give current date as new date file...
    seconds = splitSeconds[0];
    justDeleted = wordfileArray[lastItem];
    // if yes, add one to testedcorrect
    if (option === "yes") {
      if ( ( testedcorrect / 1 ) === 0 ) {
      	testedcorrect = 1;
      } else {
        testedcorrect = ( testedcorrect / 1 ) + 1;
      }
    }
    // if no, reset testedcorrect
    if (option === "no") {
      testedcorrect = 0;
    }
    // just invizibilize card for now, have to move it to the end to a free spot
    document.getElementById("word_item" + lastItem).style.zIndex=lastzIndex;
    document.getElementById("word_item" + lastItem).style.display='none';
    document.getElementById("word_extended" + lastItem).style.display='none';
    document.getElementById("word_extendedplus" + lastItem).style.display='none';
    document.getElementById("word_page" + lastItem).style.display='none';
    document.getElementById("wordyes").style.display='none';
    document.getElementById("wordno").style.display='none';
    document.getElementById("word_rightarrow").style.display='none';
    cardOpen = false;
    if (targetitem > item_nr) {
      targetitem = targetitem - 1;
    }
    // create new word card using global wordinfo and delete old one if successful
    var wordfile = wordfileArray[lastItem];
    var wordfileparts = wordfile.split("_");
    if (wordfileparts.length > 2) {
      wordkey = seconds + "#" + testedcorrect + "_" + wordfileparts[1] + "_" + wordfileparts[2];
      window.resolveLocalFileSystemURL(myPath + "/myWords/", function (dir) {
        dir.getFile(wordkey, { create: true }, function (file) {
          var textObj = file;
          textObj.file(function (file) {
            textObj.createWriter(function (fileWriter) {
              fileWriter.write(wordinfo + testedcorrect);
              //console.log("Deleting word");
              delWordfile(lastItem);
            }, fail);
          });
        });
      });
    } else {
      //console.log("Something wrong with wordfile " + wordfile);
    }
  }
  if (undefined === option || null === option || option === "") {
    // go to page saved in targetfile
    top.location.href = targetfile + targetitem;
  }
}
function delWordfile(item_nr) {
    document.getElementById("word_item" + item_nr).style.display='none';
    var wordfile = wordfileArray[item_nr];
    window.resolveLocalFileSystemURL(myPath + "/myWords/", function (dir) {
      dir.getFile(wordfile, { create: false }, function (file) {
        file.remove(fillWordSlot('del',item_nr),fail);
      });
    });
}
function fillWordSlot(option,item_nr) {
  //console.log("Filling word slot");
  var logmsg = "Array length before del " + wordfileArray.length + ", ";
  var seconds = new Date().getTime() / 1000;    // gets you time in seconds sinds midnight 1 jan 1970
  var i = lastSlotFilled + 1;
  // if this is a delete, first remove the removed bit from wordfileArray
  if (option === 'del') {
    wordfileArray.splice(item_nr, 1);
  }
  logmsg = logmsg + "array length after del " + wordfileArray.length + ", slot trying to fill is " + i + ", ";
  // get new wordfile if any
  if (undefined !== wordfileArray[i] && null !== wordfileArray[i] && wordfileArray[i] !== "") {
    var wordfile = wordfileArray[i];
    logmsg = logmsg + "trying to link in " + wordfile + ", ";
    var wordfileparts = wordfile.split(".txt");
    var wordfilenameArray = wordfileparts[0].split("_");
    if (wordfilenameArray.length > 2) {
        var wordageandtested = wordfilenameArray[0].split("#");
        wordage = wordageandtested[0];
        if (null !== wordageandtested[1] && undefined !== wordageandtested[1] && NaN !== wordageandtested[1] && wordageandtested[1] !== "" && wordageandtested[1] !== "NaN" && wordageandtested[1] !== "undefined") {
          var wordremindernumber = ( wordageandtested[1] / 1 ) + 1;
        } else {
          var wordremindernumber = 1;
        }
        if ( ( wordremindernumber / 1 ) > 21) {
          wordremindernumber = 21;
        }
        var wordreminder = optionHash["reminder" + wordremindernumber];
        var wordoriginal = wordfilenameArray[1];
        var wordmeaning = wordfilenameArray[2];
        if (null !== wordoriginal && undefined !== wordoriginal && "" !== wordoriginal) {
          var textlink = document.all("word_item" + i);
          if (null !== textlink && undefined !== textlink) {
            // this wordlink exists, fill
            document.getElementById("word_item" + i).style.display='block';
            //console.log("if wordage " + wordage + " plus reminder length " + wordreminder + " minus margin reminder length " + ( wordreminder / 1 * ( optionHash["testMargin"] / 1 ) ) + " is smaller than seconds " + seconds);
            if ( ( ( wordage / 1 ) + ( wordreminder / 1 ) - ( wordreminder / 1 * ( optionHash["testMargin"] / 1 ) ) ) < seconds ) {
              document.getElementById("word_itemtext" + i).style.color='red';
            } else {
              document.getElementById("word_itemtext" + i).style.color='black';
            }
            document.getElementById("word_itemtext" + i).innerHTML = wordoriginal;
            // extended meaning inside file has to wait until wordcard is clicked
            document.getElementById("word_extended" + i).innerHTML = wordmeaning;
            // keep word_file# on tabs so we can open it up
            document.getElementById("word_file" + i).innerHTML = wordfile;
            //console.log("create wordlinks for original " + wordoriginal + " and meaning " + wordmeaning);
            logmsg = logmsg + "create wordlinks for original " + wordoriginal + " and meaning " + wordmeaning + ", ";
            lastSlotFilled = i;
          } else {
            // seems like wordlink spaces are finished, need to refer to some kind of next page or keep it to these (or extend wordlink spaces :PPPP )
            logmsg = logmsg + "out of wordlink space for original " + wordoriginal + " and meaning " + wordmeaning + "!!! ";
            // in this case we'll just refresh, unless we're doing the auto wordcard thing
            if (wordTest === false) {
              listPath(myPath + "/myWords/");
            }
          }
        } else {
          logmsg = logmsg + "wordfile with name '" + wordfile + "' seems not regular wordfile!!! ";
        }
    } else {
      //appendLog("savedwordfile string " + savedwordfile + " does not contain correct elementsj!");
      logmsg = logmsg + "problem with file '" + wordfileparts[0] + "', ";
    }
  } else {
    if (wordTest === false) {
      logmsg = logmsg + " wordfile is empty, I guess we can refresh so wordlist stays at max words visible ";
      listPath(myPath + "/myWords/");
    } else {
      logmsg = logmsg + " doing word test so wordlist can leak empty ";
    }
  }
  //document.getElementById("log_block").innerHTML = logmsg;
}
function onFailCallback() {
  //console.log("something went wrong");
}

function success() {
  //console.log("Sucess");
}
 
function getFilepath(thefilepath) {
  //alert(thefilepath);
}

function goBackFromVocabulary() {
  top.location.href = "../index.html";
}
function goWord(word_id) {
    actionWord(word_id);
    top.location.href = "#worditem" + word_id;
    window.scrollTo(0, window.pageYOffset - 100);
}
function sortWords() {
  if ( optionHash["wordSort"] === "reminder" ) {
    optionHash["wordSort"] = "words";
  } else {
    optionHash["wordSort"] = "reminder";
  }
  window.resolveLocalFileSystemURL(myPath, function (dir) {
    dir.getFile("optionhash", { create: true }, function (file) {
      textObj = file;
      textObj.file(function (file) {
        textObj.createWriter(function (fileWriter) {
          // writing to optionhash file, dissecting optionHash into textdata
          var itemnumber = 0;
          var textdata = "";
          for (var key in optionHash) {
            textdata = textdata + key + "=" + optionHash[key] + ",";
          }
          textdata = textdata.substring(0, textdata.length - 1);
          fileWriter.write(textdata);
          listPath(myPath + "/myWords/");
        }, fail);
      });
    });
  });
}
function toggleFlash() {
  //console.log("Trying to toggleFlash");
  if ( optionHash["testFlash"] === "default" ) {
    //console.log("Current mode is default, so going single");
    top.location.href = "vocabulary.html#modesingle";
    location.reload(true);
  } else {
    //console.log("Current mode is single, so going default");
    top.location.href = "vocabulary.html#modedefault";
    location.reload(true);
  }
}
function onLoad() {
  var hash = window.location.hash;
  //we're returning from story word lookup, if url is something like this: ../../../vocabulary.htm#goword2
  word_id = hash.substring(hash.indexOf("#goword")+7);
  if (word_id === "") {
    word_id = -1;
  } else {
    justReturned = true;
  }
  var flashes = hash.substring(hash.indexOf("#mode")+5);
  if ( flashes === "default" || flashes === "single" ) {
    optionHash["testFlash"] = flashes;
    if ( flashes === "single" ) {
      optionHash["wordSort"] = "reminder";
    }
  }
}