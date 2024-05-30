Date.prototype.getWeek = function () {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export function getAggregateScreenTimeTab(accessTime, type = "today") {
  let totalTime = 0;
  accessTime.map((time) => {
    if (time.endTime !== null) {
      totalTime += time.endTime - time.startTime;
    }
  });
  return new Date(totalTime).toISOString().substr(11, 8);
}

export function aggregateData(screenTime, type) {
  // screenTime = screenTime.filter((screen) => {
  //   if (type === "today") {
  //     return (
  //       new Date(screen.accessTime[0].startTime).toDateString() ===
  //       new Date().toDateString()
  //     );
  //   } else if (type === "weekly") {
  //     return (
  //       new Date(screen.accessTime[0].startTime).getWeek() ===
  //       new Date().getWeek()
  //     );
  //   } else if (type === "monthly") {
  //     return (
  //       new Date(screen.accessTime[0].startTime).getMonth() ===
  //       new Date().getMonth()
  //     );
  //   }
  // });

  screenTime = screenTime.map((screen) => {
    let { tabUrl, accessTime } = screen;
    accessTime = getAggregateScreenTimeTab(accessTime);
    tabUrl = tabUrl.length > 25 ? tabUrl.slice(0, 25) + "..." : tabUrl;
    return { ...screen, tabUrl, accessTime };
  });
  return screenTime;
}

export async function calcTotalTime(screenTime) {
  let totalTime = 0;
  await screenTime.map((app) => {
    let total = 0;
    app.accessTime.map((time) => {
      if (time.endTime !== null) {
        total += time.endTime - time.startTime;
      } else {
        total += new Date().getTime() - time.startTime;
      }
    });
    totalTime += total;
  });

  const hours = Math.floor(totalTime / (1000 * 60 * 60));
  const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
