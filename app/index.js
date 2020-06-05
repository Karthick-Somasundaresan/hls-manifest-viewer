const ipc = require('electron').ipcRenderer
const goBtn = document.getElementById('btnGo');
const axios = require('axios')
const urlParse = require('url-parse')
const path = require('path')
var baseURL = "";
var instance = "";

goBtn.addEventListener('click', function(e){
    var manifestURL = document.getElementById('txtManifest').value;
    var url = new urlParse(manifestURL);
    baseURL = url.origin + path.dirname(url.pathname) +"/";
    instance = axios.create({"baseURL": baseURL});
    requestServer(path.basename(url.pathname))
    
})

function requestServer(path){
    instance.get(path)
    .then(function(response){
        console.log(response.data)
        processResponse(response.data)
    })
    .catch(function(error){
        console.log(error)
    })
}

function processResponse(response){
    responseLines = response.split('\n');
    htmlText = "";
    responseLines.forEach(line => {
        if(line.startsWith("#")){
            if(line.startsWith("#EXT-X-I-FRAME-STREAM-INF:")){
                htmlText = htmlText + "<p>" + processIframeStream(line) + "</p>";
            } else{
                htmlText = htmlText + "<p>" + line + "</p>";
            }
        } else {
            if(line.indexOf("m3u8") != -1){
                // htmlText = htmlText + "<button value = \"" + line + "\">" + line + "</button>";
                htmlText = htmlText + createButtonTag(line);
            } else {
                htmlText = htmlText + "<p>" + line + "</p>";
            }
        }
        playlist = document.getElementById("playlist");
        playlist.innerHTML = htmlText;
   });

}

function createButtonTag (value) {
    return "<button value=\"" + value + "\" onclick=\"linkClick('"+value+"')\">" + value + "</button>";
}   

function processIframeStream(line) {
    uriIndex = line.indexOf("URI=");
    var iFrameHTML = line.substr(0, uriIndex + 5);
    lastQuoteIndex = line.indexOf("\"", uriIndex + 6);
    iframeURI = line.substring(uriIndex + 5, lastQuoteIndex);
    restOfLine = line.substring(lastQuoteIndex);
    // iFrameHTML = iFrameHTML + "<button value=\"" + iframeURI + "\">"+ iframeURI +"</button>"  + restOfLine;
    iFrameHTML = iFrameHTML + createButtonTag(iframeURI);
    return iFrameHTML;
}

function linkClick(target){
    console.log("Button clicked", target)
    requestServer(target);
}
