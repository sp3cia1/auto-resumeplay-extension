// background.js
console.log("background script working")

let videoTabs = [];
let receivedTab;
let resumeTab = -1;
let resumeTabPlaying = false;

function pauseVideo(tabId) {
    //used to inject a script or function in a given tab.
    chrome.scripting.executeScript({
    
      target: {tabId: tabId},

      function: function() {

        var video = document.querySelector('video');
        
        if (!video.paused) {
          video.pause();
        } 

      }
    });
}

function playVideo(tabId) {
    chrome.scripting.executeScript({

        target: {tabId: tabId}, 

        function: function() {

            var video = document.querySelector('video');

            if (video.paused) {
                video.play();
            }

        }
    });
}

 
let intT;

//All received messages are handled here
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    
    //When a video is found in a tab
    if (request.videoFound) {
        //If the tab isnt already in videoTabs array then append it.
        if (!videoTabs.includes(sender.tab.id)) {
            videoTabs.push(sender.tab.id)
        }
    }


    //When a video is played in a tab.
    if (request.videoPlaying){
        let currentVideoTab = sender.tab.id; //flag for the current tab so we pause everything except it.
            for (let t in videoTabs){
                intT = parseInt(videoTabs[t]);
                if (intT !== currentVideoTab){
                    if(intT === resumeTab){
                        resumeTabPlaying = false;
                    }
                    pauseVideo(intT);
                } 
            }
    } 


    //When a video is paused in the currnt tab.
    if (request.videoPaused && !resumeTabPlaying) {
        let currentVideoTab = sender.tab.id;//So that we dont play resume tab if the paused video was resumed tab itself.

        //Didnt have a single currentVideoTab because when we played a non resume tab it paused the resume tab but now sender tabId was the non resume tab so  it wasnt equal to resume tab and hence it passed the checkmark below and played the resumeTab again instead of pausing it.

        if (resumeTab !== -1 && resumeTab !== currentVideoTab ) { 
            console.log('Play resume tab from: ' + currentVideoTab)
            resumeTabPlaying = true;
            playVideo(resumeTab);
        }
    }


    // When a message is received with the content 'getVideoTabs'
    if(request.message === 'getVideoTabs') {
        try {
            // Query all open tabs.This is done to get the full details of the tabs in the videoTabs array, such as the tab's title, which is not stored in the videoTabs array.
            chrome.tabs.query({}, function(allTabs) {
                // Filter out the tabs that are in the videoTabs array
                var videoTabDetails = allTabs.filter(function(tab) {
                    return videoTabs.includes(tab.id);
                }).map(function(tab) {
                    // For each of the filtered tabs, return an object with the tab's id and title
                    return {id: tab.id, title: tab.title};
                });
                // Send a response with the filtered tab details
                sendResponse({tabs: videoTabDetails});
            });
        } catch (error) {
            // If an error occurs, log it to the console
            console.error('Error handling getVideoTabs message:', error);
        }
        
        // Return true to indicate that the response will be sent asynchronously.
        return true;
    }

 
    //When the user chooses a resume tab.
    if (request.message === 'resumeTab'){

        receivedTab = parseInt(request.tabId);

        //If the user clicks on the resume tab again, remove it as the resume tab.
        if (receivedTab === resumeTab) {
            resumeTab = -1;
        } else {
            resumeTab = receivedTab;
        }
        
    }
})

//listening for tabs removal and if that tab was in our array then removing it.
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    var index = videoTabs.indexOf(tabId);

    if (index !== -1){
        videoTabs.splice(index, 1);
    }
})
