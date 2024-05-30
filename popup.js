import { aggregateData, calcTotalTime } from "./utils.js";

let rankingButtons = document.querySelectorAll(".ranking-btns");
let totalTimeDiv = document.getElementById("total-time");
let resetScreenTimeButton = document.getElementById("resetScreenTimeButton");

async function setScreenTimeData(type = "today") {
  let screenTime = await generateTempScreenTime();

  console.log("Pop.js : Screen Time Data ", screenTime);

  totalTimeDiv.innerHTML = await calcTotalTime(screenTime);

  screenTime = await aggregateData(screenTime, type);

  let rankingContent = document.getElementById("ranking-content");
  screenTime = screenTime
    .map((screen, i) => {
      let { tabUrl, favIconUrl, accessTime } = screen;
      return `
        <div class="ranking-item">
        <div class="rank">${i + 1}</div>
        <img class="logo" src="${
          favIconUrl ||
          "https://www.freeiconspng.com/thumbs/www-icon/www-domain-icon-0.png"
        }" alt="Logo 1">
        <div class="name">${tabUrl}</div>
        <div class="points">${accessTime}</div>
        </div>
`;
    })
    .join("");
  rankingContent.innerHTML = screenTime;
}

resetScreenTimeButton.addEventListener("click", () => {
  chrome.storage.sync.set({ screenTime: [] });
  setScreenTimeData();
});

// Get Today Screen Time Data
let rankingToday = document.getElementById("rankingToday");
rankingToday.addEventListener("click", () => {
  rankingButtons.forEach((btn) =>
    btn.classList.remove("ranking-button-active")
  );
  rankingToday.classList.add("ranking-button-active");
  setScreenTimeData("today");
});

// Get Weekly Screen Time Data
let rankingWeekly = document.getElementById("rankingWeekly");
rankingWeekly.addEventListener("click", () => {
  rankingButtons.forEach((btn) =>
    btn.classList.remove("ranking-button-active")
  );
  rankingWeekly.classList.add("ranking-button-active");
  setScreenTimeData("weekly");
});

// Get Monthly Screen Time Data
let rankingMonthly = document.getElementById("rankingMonthly");
rankingMonthly.addEventListener("click", () => {
  rankingButtons.forEach((btn) =>
    btn.classList.remove("ranking-button-active")
  );
  rankingMonthly.classList.add("ranking-button-active");
  setScreenTimeData("monthly");
});

setScreenTimeData();

async function generateTempScreenTime() {
  // Get the screen time data from the storage.
  let screenTime = await chrome.storage.sync.get("screenTime");
  screenTime = screenTime.screenTime || [];

  await screenTime.map((t, i) => {
    t.accessTime.map((a) => {
      if (a.endTime === null) {
        a.endTime = new Date().getTime();
      }
    });
  });

  // Sort the screen time data based on the total time spent on each tab for the ranking.
  screenTime.sort((a, b) => {
    let aTotalTime = 0;
    let bTotalTime = 0;
    a.accessTime.map((time) => {
      if (time.endTime !== null) {
        aTotalTime += time.endTime - time.startTime;
      }
    });
    b.accessTime.map((time) => {
      if (time.endTime !== null) {
        bTotalTime += time.endTime - time.startTime;
      }
    });
    return bTotalTime - aTotalTime;
  });

  return screenTime;
}
