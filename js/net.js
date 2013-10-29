"use strict";
var xmlHttp = null;

function httpGet(argUrl){

    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = processGet;
    xmlHttp.open( "GET", argUrl, true);
    xmlHttp.send( null );
}

function processGet(){
	if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) 
    {
        if ( xmlHttp.responseText == "0" ) 
        {
        	console.log("Not Found")
        }
        else
        {
            var info = eval ( "(" + xmlHttp.responseText + ")" );
            console.log(xmlHttp.responseText)
        }                    
    }
}