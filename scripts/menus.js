/* globals console,document,window,cordova */
  
// current menu array is global var
var currentMenuArray;
var currentMenu;
// change of format occurred
var changedFormat = false;
var changedType = "int";
// define main menu
//var menuArray = ["Settings_bold_dummy","Generic","Text","Audio","Vocabulary","Practice","Cancel_dimgray_cancel"];
var menuArray = ["Settings_bold_dummy","Reading","Practice","Advanced","Back_dimgray_cancel"];
// define sub or different menu
var menuHash = {};
  //menuHash["Generic"] = "Generic_bold_dummy###Messages###Program###Back_dimgray_main";
  //  menuHash["Messages"] = "Messages_bold_dummy,Show message when adding to my words?__option_messageWord_On/Off###";
  //  menuHash["Messages"] = menuHash["Messages"] + "Show message when you toggle text or audio format?__option_messageToggle_On/Off###Back_dimgray_main";
  //  menuHash["Program"] = "Program_bold_dummy,Let App guide story order and word practice?__option_programState_On/Off###";
  //  menuHash["Program"] = menuHash["Program"] + "Word practice is based on frequency in:__option_programFreq_Story/Group/Level/Total/Corpus###";
  //  menuHash["Program"] = menuHash["Program"] + "Correct test only counts within schedule (plus margin):__option_programCorrect_On/Off###";
  //  menuHash["Program"] = menuHash["Program"] + "Delete word automatically if enough tests:__option_programCorrect_On/Off###";
  //  menuHash["Program"] = menuHash["Program"] + "Back_dimgray_main";
  

  menuHash["Switch Format"] = "Switch Format_bold_dummy###";
  menuHash["Switch Format"] = menuHash["Switch Format"] + "Translation Format__option_translationCurrent_Interlinear=int/Interlinear-on-demand=pnt/Pop-up=pop_Leave on Custom setting to enable each story to have its own custom format, or choose the standard format of the text and the translation. Interlinear will be permanently visible, while interlinear-on-demand can be revealed word for word or temporarily as a whole when the button on the bottom left is pressed. Pop-up displayes a temporary box with the literal and idiomatic meaning. A change in this option will come into effect once you quit the menu. If you leave this option on Custom, to set a custom format per page use the top left button on the story page.###";
  menuHash["Switch Format"] = menuHash["Switch Format"] + "Audio Format__option_audioCurrent_Manual=man/Automatic=aut/All=all_Leave on Custom setting to enable each story to have its own custom format, or choose the standard format of how audio plays. Manual means each page's audio needs to be activated manually with the play button. Automatic means that audio will play for a page if you go to that page using swipe or next page. All means that all audio is played at once. A change in this option will come into effect once you quit the menu. If you leave this option on Custom, to set a custom format per page use the second top left button on the story page.###";
  menuHash["Switch Format"] = menuHash["Switch Format"] + "Back_dimgray_main";  
  
  menuHash["Reading"] = "Reading_bold_dummy###";
  menuHash["Reading"] = menuHash["Reading"] + "Font Type__option_fontType_Arial/Times New Roman###";
  if (device === "windows") {
    menuHash["Reading"] = menuHash["Reading"] + "Font Size__option_fontSize_15pt/18pt/21pt/24pt/36pt###";
  } else {
    menuHash["Reading"] = menuHash["Reading"] + "Font Size__option_fontSize_12pt/15pt/18pt/21pt/24pt###";
  }
  menuHash["Reading"] = menuHash["Reading"] + "Interlinear Color__option_interlinearColor_Default=dimgray/light blue/blue/light purple=mediumpurple/purple/light red=pink/red/light yellow=yellow/yellow=gold/light green/green/black_Choose the color of the interlinear text. The default color is gray.###";

  menuHash["Reading"] = menuHash["Reading"] + "Pop Up Position__option_popPos_Below/Above###";
  menuHash["Reading"] = menuHash["Reading"] + "Page follows audio__option_audioScroll_Off/Page_When listening to the audio, this option indicates whether the current page in the audio is loaded on the screen, i.e. whether the pages follow the audio.###";  
  menuHash["Reading"] = menuHash["Reading"] + "Back_dimgray_main";
  
  menuHash["Advanced"] = "Advanced_bold_dummy###";
  menuHash["Advanced"] = menuHash["Advanced"] + "Default Translation__option_translationDefault_Custom=cus/Interlinear=int/Interlinear-on-demand=pnt/Pop-up=pop_Leave on Custom setting to enable each story to have its own custom format, or choose the standard format of the text and the translation. Interlinear will be permanently visible, while interlinear-on-demand can be revealed word for word or temporarily as a whole when the button on the bottom left is pressed. Pop-up displayes a temporary box with the literal and idiomatic meaning. A change in this option will come into effect once you quit the menu. If you leave this option on Custom, to set a custom format per page use the top left button on the story page.###";
  menuHash["Advanced"] = menuHash["Advanced"] + "Default Audio__option_audioDefault_Custom=cus/Manual=man/Automatic=aut/All=all_Leave on Custom setting to enable each story to have its own custom format, or choose the standard format of how audio plays. Manual means each page's audio needs to be activated manually with the play button. Automatic means that audio will play for a page if you go to that page using swipe or next page. All means that all audio is played at once. A change in this option will come into effect once you quit the menu. If you leave this option on Custom, to set a custom format per page use the second top left button on the story page.###";
  menuHash["Advanced"] = menuHash["Advanced"] + "Line Size__option_linesizePlus_Default=0.0/0.1/0.2/0.3/0.4/0.5/0.6/0.7/0.8/0.9_Adjust if the interlinear is too close to the original. This defines the distance between the lines of original text. Default is 0.0.###";
  menuHash["Advanced"] = menuHash["Advanced"] + "Sub Line Size__option_sublinesizePlus_Default=0.0/0.1/0.2/0.3/0.4/0.5/0.6/0.7/0.8/0.9_Adjust if the interlinear is too close to the original. This defines the distance between the two interlinear lines. Default is 0.0.###";
  menuHash["Advanced"] = menuHash["Advanced"] + "Sub Line Top__option_sublinetopPlus_Default=0/2/4/6/8/10/12/14/16/18/20_Adjust if the interlinear is too close to the original. This defines the start height of the interlinear lines compared to the main line of original text. Default is 0.###";
  menuHash["Advanced"] = menuHash["Advanced"] + "Back_dimgray_main";
  
  //menuHash["Audio"] = "Audio_bold_dummy###";
  //menuHash["Audio"] = menuHash["Audio"] + "Default__option_audioFormat_Manual=man/Automatic per page=aut/Play all=all###";
  //menuHash["Audio"] = menuHash["Audio"] + "Page follows audio__option_audioScroll_Off/Page###";
  //menuHash["Audio"] = menuHash["Audio"] + "Audio Speed__option_audioSpeed_Normal/Slow###"; // add this option later
  //menuHash["Audio"] = menuHash["Audio"] + "Back_dimgray_main";
  //menuHash["Vocabulary"] = "Vocabulary_bold_dummy###";
  //menuHash["Vocabulary"] = menuHash["Vocabulary"] + "Mark My Words__option_wordsMark_On/Off###";
  //menuHash["Vocabulary"] = menuHash["Vocabulary"] + "Show My Words__option_wordsShow_On/Off###";
  //menuHash["Vocabulary"] = menuHash["Vocabulary"] + "Mark Low Freq__option_wordsLow_On/Off###"; // add this option later (need better/more freqs)
  //menuHash["Vocabulary"] = menuHash["Vocabulary"] + "Back_dimgray_main";
  menuHash["Practice"] = "Practice_bold_dummy###";
  //menuHash["Practice"] = menuHash["Practice"] + "Reminder At Test Ready Words__option_testRemind_0/10/25/50/100###";
  menuHash["Practice"] = menuHash["Practice"] + "First Interval__option_testSched_Off=0/Minute=60/Two Minutes=120/Five Minutes=300/An Hour=3600/Six Hours=21600/Twelve Hours=43200/A Day=86400/Two Days=172800/Week=604800_After adding a word to your wordlist this gives you the time before you are first able to practice it. If you don't have an interval it means you can just practice them as much as you want.###";
  menuHash["Practice"] = menuHash["Practice"] + "Increment__option_testIncr_1/1.2/1.5/2/2.5/3_For example, an interval of one day and an increment of 1 gives you a daily practice schedule, while an interval of a day and an increment of 2 gives you a reminder after one day, then three days, then seven days, etc. up to the interval ceiling set below.###";
  menuHash["Practice"] = menuHash["Practice"] + "Schedule Margin__option_testMargin_None=0/5%=0.05/10%=0.10/25%=0.25/50%=0.50_For example, a margin of 10% with a first interval of one day gives you a reminder 2.4 hours early so if you studied a word at 11.50 PM, you can study it from 09.26 PM the next day.###";
  menuHash["Practice"] = menuHash["Practice"] + "Interval Ceiling__option_testCeiling_None=0/Day=86400/Two Days=172800/Week=604800/Two Weeks=1209600/Month=2419200/Two Months=4838400/Half Year=14515200_Only relevant when setting an Increment higher than one. Decide on the maximum interval between word 'meetings'. If you plan to use this tool for half a year to become fluent in reading it makes no sense to have a n-th incremented interval amounting to one year and you should set it to three months for example.###";
  menuHash["Practice"] = menuHash["Practice"] + "Auto Open Card__option_testAutopen_On/Off_After you confirm whether you knew the meaning of a word on a word card, this opens a new word card automatically. In word list mode this opens the top card in the word list, and in single flash card mode this means you don't need to click the card anymore and it shows the meaning immediately.###";
  menuHash["Practice"] = menuHash["Practice"] + "Back_dimgray_main";
  
  menuHash["MyWords"] = "My Words_bold_dummy###";
  menuHash["MyWords"] = menuHash["MyWords"] + "Show My Words<br><span class='menuchoice'>(and optional in-list flash card practice)</span>__target_vocabulary.html#modedefault###";
  menuHash["MyWords"] = menuHash["MyWords"] + "Flash Card Practice<br><span class='menuchoice'>(review single flash cards)</span>__target_vocabulary.html#modesingle###";
  menuHash["MyWords"] = menuHash["MyWords"] + "Cancel_dimgray_cancel";

// menu functions
function showMenu(menu) {
  currentMenu = menu;
  if (menu !== "main") {
    currentMenuArray = menuHash[menu].split('###');
  } else {
    currentMenuArray = menuArray;
  }
  //document.getElementById("log_d").innerHTML = "Menu is " + menu + "<br>";
  var itemnumber;
  var divisionPercentage;
  var textpostPercentage;
  var positionPercentage;
  document.getElementById("menu").style.display='block';
  document.getElementById("glass").style.display='block';
  // go through given menu item array and visibilize menu items
  for (itemnumber = 0; itemnumber < currentMenuArray.length; itemnumber++) {
    divisionPercentage = itemnumber * 100/currentMenuArray.length;
    divisionEndPerc = (itemnumber + 1) * 100/currentMenuArray.length;
    positionPercentage = divisionPercentage + "%";
    positionEndPerc = divisionEndPerc + "%";
    textdivPercentage = ((itemnumber * (100 / currentMenuArray.length)) + ( ((itemnumber + 1) * 100/currentMenuArray.length) - (itemnumber * (100 / currentMenuArray.length)) ) / 20 );
    textposPercentage = textdivPercentage + "%";
    menuItemParts = currentMenuArray[itemnumber].split('_');
    if (menuItemParts[1] === "bold") {
      document.getElementById("menu_itemtext" + itemnumber).style.fontWeight='bold';
    }
    if (menuItemParts[1] === "dimgray") {
      document.getElementById("menu_itemtext" + itemnumber).style.color='dimgray';
    }
    document.getElementById("menu_item" + itemnumber).style.display='block';
    document.getElementById("menu_itemtext" + itemnumber).style.display='block';
    document.getElementById("menu_itemtext" + itemnumber).innerHTML=menuItemParts[0];
    if (menuItemParts[2] === "option") {
      // Show message when adding to my words?__option_messageWord_On/Off,Show message when you toggle text or audio format?__option_messageToggle_On/Off
      // add options to menu item between round brackets (<options>) and fill the next line with current option
      var menuOptions = menuItemParts[4].split('/');
      var optionnumber = 0;
      var optionsDisplay = "";
      var optionCurrent = optionHash[menuItemParts[3]];
      if (menuItemParts[3] === "translationCurrent") {
        optionCurrent = curpint;
      }
      if (menuItemParts[3] === "audioCurrent") {
        optionCurrent = curaudio;
      }
      for (optionnumber=0;optionnumber < menuOptions.length; optionnumber++) {
        var optionItems = menuOptions[optionnumber].split('=');
        // find current option
        if ( optionItems[1] !== null && optionItems[1] !== undefined && optionItems[1] !== "" && optionHash[menuItemParts[3]] === optionItems[1] ) {
          // this is a translated option
          optionCurrent = optionItems[0];
        }
        if (menuItemParts[3] === "translationCurrent" && curpint === optionItems[1] ) {
          // this is a translated option
          optionCurrent = optionItems[0];
        }
        if (menuItemParts[3] === "audioCurrent" && curaudio === optionItems[1] ) {
          // this is a translated option
          optionCurrent = optionItems[0];
        }
        // and build all option display
        if (optionnumber === 0) {
          optionsDisplay = optionsDisplay + optionItems[0];
        } else {
          optionsDisplay = optionsDisplay + "/" + optionItems[0];
        }
      }
      optionHelp = menuItemParts[5];
      if (optionHelp !== null && optionHelp !== undefined && optionHelp !== "") {
        document.getElementById("menu_itemtext" + itemnumber).innerHTML = "<br>" + document.getElementById("menu_itemtext" + itemnumber).innerHTML + "<br><span class='menuchoice'>(" + optionsDisplay + ")<br>&lt;</span><span class='menuchosen'><b>&nbsp;&nbsp;" + optionCurrent + "&nbsp;&nbsp</b></span><span class='menuchoice'>&gt;</span><br><span id='menuhelp_itemtext" + itemnumber + "' class='menuhelp'>" + optionHelp + "<br></span><br>";
        document.getElementById("menuhelp_itemtext" + itemnumber).style.display='block';
      } else {
        document.getElementById("menu_itemtext" + itemnumber).innerHTML = "<br>" + document.getElementById("menu_itemtext" + itemnumber).innerHTML + "<br><span class='menuchoice'>(" + optionsDisplay + ")<br>&lt;</span><span class='menuchosen'><b>&nbsp;&nbsp;" + optionCurrent + "&nbsp;&nbsp</b></span><span class='menuchoice'>&gt;</span><br><br>";
      }
    } else {
      document.getElementById("menu_itemtext" + itemnumber).innerHTML = "<br>" + document.getElementById("menu_itemtext" + itemnumber).innerHTML + "<br><br>";
    }
  }
}
function actionItem(itemnumber) {
  var y = event.clientY;
  var x = event.clientX;
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  if (x < (w / 2)) {
    var optionToggle = "back";
  } else {
    var optionToggle = "forward";
  }
  var menuItemParts = currentMenuArray[itemnumber].split('_');
  //document.getElementById("log_d").innerHTML = "Chosen item is " + menuItemParts[2] + "<br>";
  if (menuItemParts[2] === "cancel") {
    // erase menu
    document.getElementById("menu").style.display='none';
    document.getElementById("glass").style.display='none';
    // go through given menu item array and invisibilize and defaultize menu items again
    for (itemnumber = 0; itemnumber < currentMenuArray.length; itemnumber++) {
      //document.getElementById("log_e").innerHTML = "deleting menu item " + itemnumber;
      document.getElementById("menu_item" + itemnumber).style.display='none';
      document.getElementById("menu_itemtext" + itemnumber).style.fontWeight='normal';
      document.getElementById("menu_itemtext" + itemnumber).style.color='black';
      document.getElementById("menu_itemtext" + itemnumber).style.display='none';
    }
    if (changedFormat === true) {
      if ( undefined !== curpint && null !== curpint && curpint !== "" && curpint !== "vocabulary" ) {
      	//console.log("Quit Menu. Change text or audio format to " + changedType + ".");
        toggleformatFromMenu(curpint,curaudio);
      } else {
      	//console.log("Trying to change lastchosen format.");
        if ( curpint === "" ) {
      	  //console.log("Changing lastchosen format.");
          getLastChosen(language_code + "_" + indexauthor + "_" + indextext,indexauthor + "_" + indextext);
        }
      }
    }
  }
  if (menuItemParts[2] === "main") {
    // erase menu
    document.getElementById("menu").style.display='none';
    //document.getElementById("glass").style.display='none';
    // go through given menu item array and invisibilize and defaultize menu items again
    for (itemnumber = 0; itemnumber < currentMenuArray.length; itemnumber++) {
      //document.getElementById("log_e").innerHTML = "going back, deleting menu item " + itemnumber;
      document.getElementById("menu_item" + itemnumber).style.display='none';
      document.getElementById("menu_itemtext" + itemnumber).style.fontWeight='normal';
      document.getElementById("menu_itemtext" + itemnumber).style.color='black';
      document.getElementById("menu_itemtext" + itemnumber).style.display='none';
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
            // go to submenu
            showMenu("main");
          }, fail);
        });
      });
    });
  }
  if (menuItemParts[2] === "target") {
    // go to file or bookmark specified
    if (null !== menuItemParts[3] && undefined !== menuItemParts[3] && menuItemParts[3] !== "") {
      //console.log("Off to " + menuItemParts[3]);
      top.location.href = menuItemParts[3];
    }
  }
  if (menuItemParts[2] === "option") {
    // Show help for this option if it exists
    if (menuItemParts[5] !== null && menuItemParts[5] !== undefined && menuItemParts[5] !== "") {
      document.getElementById("menuhelp_itemtext" + itemnumber).style.display='block';
    }
    // first unpack options
    var menuOptions = menuItemParts[4].split('/');
    // now do stuff with it, ehh toggle through it
    for (itemnumber=0; itemnumber < menuOptions.length; itemnumber++) {
      // find current chosen option
      var optionItems = menuOptions[itemnumber].split('=');
      if ( ( optionItems[1] !== null && optionItems[1] !== undefined && optionItems[1] !== "" && optionHash[menuItemParts[3]] === optionItems[1] ) || optionHash[menuItemParts[3]] === menuOptions[itemnumber]) {
        // this is current chosen option, toggle to next (back or forward depending on where you click)
        if ( optionToggle === "forward" ) {
          if ( itemnumber < menuOptions.length - 1) {
            optionItems = menuOptions[itemnumber+1].split('=');
            if ( optionItems[1] !== null && optionItems[1] !== undefined && optionItems[1] !== "" ) {
              optionHash[menuItemParts[3]] = optionItems[1];
            } else {
              optionHash[menuItemParts[3]] = menuOptions[itemnumber+1];
            }
            itemnumber = 99999;
          } else {
            optionItems = menuOptions[0].split('=');
            if ( optionItems[1] !== null && optionItems[1] !== undefined && optionItems[1] !== "" ) {
              optionHash[menuItemParts[3]] = optionItems[1];
            } else {
              optionHash[menuItemParts[3]] = menuOptions[0];
            }
            itemnumber = 99999
          }
        } else {
          // optionToggle === "back"
          if ( itemnumber > 0) {
            optionItems = menuOptions[itemnumber-1].split('=');
            if ( optionItems[1] !== null && optionItems[1] !== undefined && optionItems[1] !== "" ) {
              optionHash[menuItemParts[3]] = optionItems[1];
            } else {
              optionHash[menuItemParts[3]] = menuOptions[itemnumber-1];
            }
            itemnumber = 99999;
          } else {
            optionItems = menuOptions[menuOptions.length - 1].split('=');
            if ( optionItems[1] !== null && optionItems[1] !== undefined && optionItems[1] !== "" ) {
              optionHash[menuItemParts[3]] = optionItems[1];
            } else {
              optionHash[menuItemParts[3]] = menuOptions[menuOptions.length - 1];
            }
            itemnumber = 99999
          }
        }
      }
    }
    if ( ( undefined !== curpint && null !== curpint && curpint !== "" && curpint !== "vocabulary" ) && ( menuItemParts[3] === "fontSize" || menuItemParts[3] === "fontType" || menuItemParts[3] === "linesizePlus" || menuItemParts[3] === "sublinesizePlus" || menuItemParts[3] === "sublinetopPlus" || menuItemParts[3] === "interlinearColor" ) ) {
      setStyle("frommenu");
    }
    if ( menuItemParts[3] === "testSched" || menuItemParts[3] === "testIncr" || menuItemParts[3] === "testMargin" || menuItemParts[3] === "testCeiling" ) {
      // re-calculate optionHash["reminder" + number] settings
      var beforelastReminder = optionHash["testSched"]; // this is first interval
      var testCeiling = (optionHash["testCeiling"]/1); // this is max interval duration
      if ( beforelastReminder < testCeiling || testCeiling === 0) {
        optionHash["reminder1"] = beforelastReminder;
      } else {
        optionHash["reminder1"] = testCeiling;
      }
      var lastReminder = ((beforelastReminder/1)*optionHash["testIncr"]);
      if ( lastReminder < testCeiling || testCeiling === 0) {
        optionHash["reminder2"] = lastReminder;
      } else {
        optionHash["reminder2"] = testCeiling;
      }
      var reMinder;
      for (var reminderNumber=3; reminderNumber < 22; reminderNumber++) {
        reMinder = Math.round((lastReminder/1)*optionHash["testIncr"]);
        if ( reMinder < testCeiling || testCeiling === 0) {
          optionHash["reminder" + reminderNumber] = reMinder;
        } else {
          optionHash["reminder" + reminderNumber] = testCeiling;
        }
        //console.log("At reminder number " + reminderNumber + " time is " + reMinder);
        beforelastReminder = Math.round(lastReminder/1);
        lastReminder = Math.round(reMinder/1);
      }
      if ( curpint === "vocabulary" ) {
        listPath(myPath + "/myWords/");
      }
    }
      if (menuItemParts[3] === "translationCurrent" || (menuItemParts[3] === "translationDefault" && optionHash[menuItemParts[3]] !== "cus" && curpint !== "") ) {
        curpint = optionHash[menuItemParts[3]];
      }
      if (menuItemParts[3] === "audioCurrent" || (menuItemParts[3] === "audioDefault" && optionHash[menuItemParts[3]] !== "cus" && curpint !== "") ) {
        curaudio = optionHash[menuItemParts[3]];
      }
    if ( ( undefined !== curpint && null !== curpint && curpint !== "vocabulary" ) && ( menuItemParts[3] === "translationDefault" || menuItemParts[3] === "audioDefault" || menuItemParts[3] === "translationCurrent" || menuItemParts[3] === "audioCurrent") ) {
      //console.log("Trying to change text or audio format.");
      changedFormat = true;
      if (optionHash[menuItemParts[3]] !== "cus") {
        changedType = optionHash[menuItemParts[3]];
      }
    }
    showMenu(currentMenu);
  }
  if (menuItemParts[2] !== "option" && menuItemParts[2] !== "cancel" && menuItemParts[2] !== "back" && null !== menuHash[menuItemParts[0]] && undefined !== menuHash[menuItemParts[0]] && menuHash[menuItemParts[0]] !== "") {
    // erase menu
    document.getElementById("menu").style.display='none';
    //document.getElementById("glass").style.display='none';
    // go through given menu item array and invisibilize and defaultize menu items again
    for (itemnumber = 0; itemnumber < currentMenuArray.length; itemnumber++) {
      //document.getElementById("log_e").innerHTML = "deleting menu item " + itemnumber;
      document.getElementById("menu_item" + itemnumber).style.display='none';
      document.getElementById("menu_itemtext" + itemnumber).style.fontWeight='normal';
      document.getElementById("menu_itemtext" + itemnumber).style.color='black';
      document.getElementById("menu_itemtext" + itemnumber).style.display='none';
    }
    // go to submenu
    showMenu(menuItemParts[0]);
  }
}