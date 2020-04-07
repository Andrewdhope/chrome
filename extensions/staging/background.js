/*
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "id": "sampleContextMenu",
        "title": "Sample Context Menu",
        "contexts": ["selection"]
    });
});
*/

/* for some reason the icon isn't recognized by the manifest */
chrome.browserAction.setIcon({path:"images/money_bag16.png"});