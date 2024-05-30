// Description: This file is responsible for handling the background tasks of the extension.

// This event is fired when the extension is installed for the first time.
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({
      url: "onboarding.html",
    });
  }
});

// This event is fired when the extension is updated.
chrome.tabs.onUpdated.addListener(async (tabId) => {
  console.log("Updated");
  // Get the active tab.
  let activeTab = await chrome.tabs.get(tabId);
  let { url, favIconUrl } = activeTab;
  let tabUrl = new URL(url).hostname;
  favIconUrl =
    favIconUrl === ""
      ? "https://www.freeiconspng.com/thumbs/www-icon/www-domain-icon-0.png"
      : favIconUrl;
  // Generate the screen time data for the active tab.
  await generateScreenTime(tabUrl, favIconUrl);
  return;
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  let screenTime = await chrome.storage.sync.get("screenTime");
  screenTime = screenTime.screenTime || [];
  screenTime.map((t) => {
    if (t.accessTime[t.accessTime.length - 1].endTime === null) {
      t.accessTime[t.accessTime.length - 1].endTime = new Date().getTime();
    }
  });
  console.log(screenTime);
  await chrome.storage.sync.set({ screenTime });
  return;
});

//This event is fired when the active tab is changed.
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log("Activated");
  // Get the active tab.
  let activeTab = await chrome.tabs.get(activeInfo.tabId);
  let { url, favIconUrl } = activeTab;
  let tabUrl = new URL(url).hostname;
  favIconUrl =
    favIconUrl === ""
      ? "https://www.freeiconspng.com/thumbs/www-icon/www-domain-icon-0.png"
      : favIconUrl;
  // Generate the screen time data for the active tab.
  await generateScreenTime(tabUrl, favIconUrl);
  return;
});

async function generateScreenTime(tabUrl, favIconUrl) {
  console.log("Generating for ", tabUrl);
  // Get the screen time data from the storage.
  let screenTime = await chrome.storage.sync.get("screenTime");
  screenTime = screenTime.screenTime || [];

  // If the tab is already present in the screen time data, update the access time.
  if (screenTime.filter((t) => t.tabUrl === tabUrl).length > 0) {
    // Find the index of the tab in the screen time data.
    let index = screenTime.findIndex((t) => t.tabUrl === tabUrl);

    // Update the end time of the last access time entry.
    await screenTime.map((t, i) => {
      t.accessTime.map((a) => {
        if (a.endTime === null) {
          a.endTime = new Date().getTime();
        }
      });
    });

    // Add a new access time entry with the start time and only o
    // IMPORTANT: The end time will be updated when the tab is changed and it can be only one tab at a time.
    screenTime[index].accessTime = [
      ...screenTime[index].accessTime,
      { startTime: new Date().getTime(), endTime: null },
    ];
  } else {
    // If the tab is not present in the screen time data, add it.
    screenTime.push({
      tabUrl,
      favIconUrl,
      accessTime: [{ startTime: new Date().getTime(), endTime: null }],
    });
  }
  await chrome.storage.sync.set({ screenTime });
  console.log("Generated for ", tabUrl);
  return;
}
