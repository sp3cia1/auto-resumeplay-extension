document.addEventListener('DOMContentLoaded', function (){
    
    var tabList = document.querySelector('.tabList');

    //sending a message to retrieve the video tabs id and title then handling the response.
    chrome.runtime.sendMessage({message: 'getVideoTabs'}, function(response){
        for (var i = 0; i < response.tabs.length; i++) {//response contains a map named tabs.

            var listItem = document.createElement('li');

            listItem.textContent = response.tabs[i].title;
            listItem.dataset.tabId = response.tabs[i].id;

            listItem.addEventListener('click', function() {

                var clickedItem = this;
                var listItems = document.querySelectorAll('.tabList li');

                listItems.forEach(function(item) { //remove selected class from anyother class other then the clicked item.
                    if (item === clickedItem) {
                        return;
                    }
                    item.classList.remove('selected');
                });

                this.classList.toggle('selected');//toggle selected that is if the same tab is selected again remove selected class from it as its no longer the resume tab.

                chrome.runtime.sendMessage({message: 'resumeTab', tabId: this.dataset.tabId});

                if(this.classList.contains('selected')) {
                    // If the tab is selected update local storage.
                    chrome.storage.local.set({selectedTabId: this.dataset.tabId});//seting which tab has the 'selected' class.
                } else {
                    // If the tab is not selected, remove the selectedTabId from local storage
                    chrome.storage.local.remove('selectedTabId');
                }
                

            })

            tabList.appendChild(listItem);

        }


        //POPUP of a chrome extension is essentialy a webpage which get unloaded when its closed and reloaded when its opened. So any JS state like the 'selected' class is lost when popup is closed. To persist this state we are using the chrome.storage API


        chrome.storage.local.get(['selectedTabId'], function(result){

            if (result.selectedTabId) {

                var selectedTab = document.querySelector(`[data-tab-id="${result.selectedTabId}"]`)
                if (selectedTab){
                    selectedTab.classList.add('selected');
                }

            }

        });
    })
})

