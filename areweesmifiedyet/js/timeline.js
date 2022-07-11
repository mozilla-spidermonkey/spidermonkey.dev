"use strict";

function getUser(bug) {
  if (!bug.assigned_to_detail) {
    return null;
  }

  if (bug.assigned_to_detail.nick) {
    return bug.assigned_to_detail.nick;
  }

  return bug.assigned_to_detail.email.replace(/@.*/, "");
}

function getDate(bug) {
  if (bug.cf_last_resolved) {
    return bug.cf_last_resolved;
  }
  return bug.last_change_time;
}

async function showTimeline() {
  const response = await fetch("https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,assigned_to,cf_last_resolved,last_change_time&status_whiteboard=[esmification-timeline]&status_whiteboard_type=allwordssubstr");

  const bugs = (await response.json()).bugs;

  bugs.sort((a, b) => {
    const da = getDate(a);
    const db = getDate(b);
    if (da < db) {
      return 1;
    }
    if (da > db) {
      return -1;
    }
    return 0;
  });

  const timeline = document.getElementById("timeline");
  timeline.textContent = "";

  for (const bug of bugs) {
    const summary = bug.summary;
    const user = getUser(bug);
    const date = getDate(bug).replace(/T.*/, "");
    const number = bug.id;
    const status = bug.status == "RESOLVED" ? "FIXED" : "WIP";

    const block = document.createElement("div");
    block.className = "timeline-block";

    const main = document.createElement("div");
    main.className = "timeline-main";
    block.appendChild(main);

    const statusBox = document.createElement("span");
    statusBox.className = `timeline-status timeline-status-${status.toLowerCase()}`;
    statusBox.textContent = status;
    main.appendChild(statusBox);

    const dateBox = document.createElement("span");
    dateBox.className = "timeline-date";
    dateBox.textContent = date;
    main.appendChild(dateBox);

    const summaryBox = document.createElement("span");
    summaryBox.className = "timeline-summary";
    summaryBox.textContent = summary;
    main.appendChild(summaryBox);

    const tagBox = document.createElement("span");
    block.appendChild(tagBox);

    if (user) {
      const userBox = document.createElement("span");
      userBox.className = "timeline-tag";
      userBox.textContent = user;
      tagBox.appendChild(userBox);
    }

    const bugBox = document.createElement("span");
    bugBox.className = "timeline-tag";
    const link = document.createElement("a");
    link.href = `https://bugzilla.mozilla.org/show_bug.cgi?id=${number}`;
    link.textContent = `bug ${number}`;
    bugBox.appendChild(link);
    tagBox.appendChild(bugBox);

    timeline.appendChild(block);
  }
}

showTimeline();
