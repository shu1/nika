"use strict";
var xmlHttp = null;

function httpGet(argUrl){

    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = processGet;
    xmlHttp.open( "GET", argUrl, true);
    xmlHttp.send( null );
}

function processGet(){
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
        if ( xmlHttp.responseText == "0" || xmlHttp.responseText == '') {
            console.log("Not Found");
        }
        else{
            var info = JSON.parse(xmlHttp.responseText);
            console.log(info);
            netGameMan = info;
            for (var row = 0; row < 15; ++row) {
                for (var col = 0; col < 21; ++col) {
                    grid[row][col].checked = netGameMan.grid[row][col].checked;
                    grid[row][col].player  = netGameMan.grid[row][col].player;
                    grid[row][col].kind    = netGameMan.grid[row][col].kind;
                    grid[row][col].city    = netGameMan.grid[row][col].city;
                    grid[row][col].rot     = netGameMan.grid[row][col].rot;
                    grid[row][col].ring    = netGameMan.grid[row][col].ring;
                }
            }
            mediaMan.draw = true;
        }                    
    }
}

function httpPost(argUrl, argContent){
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = processPost;
    xmlHttp.open("POST",argUrl,true);
    xmlHttp.setRequestHeader("Content-type","application/json");
    xmlHttp.send(JSON.stringify(argContent));
    //console.log(JSON.stringify(argContent))
}

function processPost(){
    if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
        if ( xmlHttp.responseText == "0" || xmlHttp.responseText == '') {
            console.log("Error");
        }
        else{
            //var info = JSON.parse(xmlHttp.responseText);
            console.log(xmlHttp.responseText);
        }                    
    }
}