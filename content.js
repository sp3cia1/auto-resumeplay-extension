let videoDetected  = false;
let autoVideoMsgSent = false;
let isPlaying = false;

detectVideo();

//Many sites like youtube dynamically load its content. So we will use a MutationObserver which will watch for any DOM change and fire our detectVideo function to find a video elemnet.

var observer = new MutationObserver(function(mutations){
    if(!videoDetected){
        detectVideo();
    }
})

//Mutation observer will observe for any change in childList and subtree of the document.
observer.observe(document, {childList: true, subtree: true});

function detectVideo() {
//Select the video from the dom
const video = document.querySelector('video');


//the isPlaying flag is used to ensure that message is sent only once when a video is played and paused.
//The check for chrome.runtime.sendMessage is done to ensure that the Chrome runtime environment is available and the sendMessage function is accessible. 
function onPlay() {
    if (!isPlaying && chrome.runtime.sendMessage) {
        console.log('sent request to play at: ' + Date.now());
        chrome.runtime.sendMessage({videoPlaying : true});
        isPlaying = true;
    }
}

function onPause() {
    if (isPlaying && chrome.runtime.sendMessage) {
        console.log('sent request to pause at: ' + Date.now());
        chrome.runtime.sendMessage({videoPaused : true});
        isPlaying = false;
    }
}

if(video){

    chrome.runtime.sendMessage({videoFound: true});//this is sent to background js to register this tab containing video.

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    //this is for pages like youtube where video automatically plays on page load.
    if (!video.paused && !autoVideoMsgSent) { 
        if (chrome.runtime.sendMessage){
            chrome.runtime.sendMessage({videoPlaying : true});
            autoVideoMsgSent = true;
        }
    } 
}}