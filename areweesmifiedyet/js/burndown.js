"use strict";

const searchfoxURL = `https://searchfox.org/mozilla-central/source/`;
const hgmoURL = `https://hg.mozilla.org/mozilla-central/`;

const dataURL = "https://mozilla-spidermonkey.github.io/areweesmifiedyet/log.json";

function drawChart(dates, jsmCount, esmCount) {
  c3.generate({
    data: {
      xs: {
        "jsmCount": "dates",
        "esmCount": "dates",
      },
      columns: [
        ["dates", ...dates],
        ["esmCount", ...esmCount],
        ["jsmCount", ...jsmCount],
      ],
      names: {
        "jsmCount": "JSM files",
        "esmCount": "ESM files",
      },
      types: {
        "jsmCount": "area",
        "esmCount": "area",
      },
      colors: {
        // --orange-50 and --blue-50 in common.css
        "jsmCount": "#ff9400",
        "esmCount": "#0a84ff",
      },
      groups: [["jsmCount", "esmCount"]],
      order: null,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {format: "%Y-%m-%d"},
      }
    },
  });
}

function getNodeForPath(pathComponents, node) {
  if (pathComponents.length === 0) {
    return node;
  }

  if (!("subdir" in node)) {
    return null;
  }

  let next = pathComponents[0];
  if (!(next in node.subdir)) {
    return null;
  }

  return getNodeForPath(pathComponents.slice(1), node.subdir[next]);
}

function getDataForPath(pathComponents, tree, prop) {
  const node = getNodeForPath(pathComponents, tree);
  if (!node) {
    return 0;
  }
  if (!(prop in node)) {
    return 0;
  }
  return node[prop];
}

function getSubdirForPath(pathComponents, tree) {
  const node = getNodeForPath(pathComponents, tree);
  if (!node) {
    return [];
  }
  if (!("subdir" in node)) {
    return [];
  }
  return node.subdir;
}

function drawChartForPath(logData, pathComponents) {
  const dates = [];
  const jsmCount = [];
  const esmCount = [];
  for (const item of logData) {
    dates.push(item.date);
    jsmCount.push(getDataForPath(pathComponents, item, "jsm"));
    esmCount.push(getDataForPath(pathComponents, item, "esm"));
  }
  drawChart(dates, jsmCount, esmCount);
}

function drawTable(data) {
  const history = document.getElementById("history");

  const table = document.createElement("table");
  table.className = "history-table";

  const thead = document.createElement("thead");
  table.append(thead);

  const tbody = document.createElement("tbody");
  table.append(tbody);

  let tr, th, td, sourceLink, label, link;

  tr = document.createElement("tr");

  th = document.createElement("th");
  th.className = "date-column";
  th.append("Date");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("Pushlog");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("JSM files");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("ESM files");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("ESMified");
  tr.append(th);

  thead.append(tr);

  let prev = null;
  for (const item of data) {
    tr = document.createElement("tr");

    td = document.createElement("td");
    link = document.createElement("a");
    link.append(item.date);
    link.append(externalLinkIcon());
    link.target = "_blank";
    link.href = `${hgmoURL}file/${item.hash}`;
    td.append(link);
    tr.append(td);

    td = document.createElement("td");
    td.className = "external-link";
    if (prev) {
      link = document.createElement("a");
      link.append(externalLinkIcon());
      link.target = "_blank";
      link.href = `${hgmoURL}pushloghtml?fromchange=${prev}&tochange=${item.hash}`;
      td.append(link);
    }
    tr.append(td);

    td = document.createElement("td");
    td.className = "number";
    td.append(item.jsm);
    tr.append(td);

    td = document.createElement("td");
    td.className = "number";
    td.append(item.esm);
    tr.append(td);

    td = document.createElement("td");
    td.className = "number";
    td.append(item.ratio);
    tr.append(td);

    prev = item.hash;

    tbody.prepend(tr);
  }

  history.replaceChildren(table);
}

function drawTableForPath(logData, pathComponents) {
  const data = [];

  for (const item of logData) {
    const jsm = getDataForPath(pathComponents, item, "jsm");
    const esm = getDataForPath(pathComponents, item, "esm");

    data.push({
      date: item.date,
      hash: item.hash,
      jsm,
      esm,
      ratio: ratio(esm, jsm)
    });
  }

  drawTable(data);
}

function ratio(esm, jsm) {
  return `${Math.round((esm / (esm + jsm)) * 10000) / 100}%`;
}

function externalLinkIcon() {
  const icon = document.getElementById("external-link-icon").cloneNode(true);
  icon.id = "";
  return icon;
}

function showHeader(pathComponents) {
  const header = document.getElementById("chart-header");
  header.replaceChildren("ESMification Chart for ");

  header.append(document.createTextNode("/"));

  const link = document.createElement("a");
  link.append("mozilla-central");
  link.href = "#" + "/";
  header.append(link);

  const currentPath = [];
  for (const component of pathComponents) {
    header.append(document.createTextNode("/"));

    currentPath.push(component);

    const link = document.createElement("a");
    link.append(component);
    link.href = "#" + "/" + currentPath.join("/");
    header.append(link);
  }
}

function showTree(logData, pathComponents) {
  const current = logData[logData.length - 1];

  const subdir = getSubdirForPath(pathComponents, current);
  const jsm = getDataForPath(pathComponents, current, "jsm");
  const esm = getDataForPath(pathComponents, current, "esm");

  const treeBox = document.getElementById("tree");
  treeBox.append("");

  const table = document.createElement("table");
  table.className = "tree-table";

  const thead = document.createElement("thead");
  table.append(thead);

  const tbody = document.createElement("tbody");
  table.append(tbody);

  let tr, th, td, sourceLink, label, link;

  tr = document.createElement("tr");

  th = document.createElement("th");
  th.className = "name-column";
  th.append("Name");
  tr.append(th);

  th = document.createElement("th");
  th.className = "source-link-column";
  th.append("Searchfox");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("JSM files");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("ESM files");
  tr.append(th);

  th = document.createElement("th");
  th.className = "number-column";
  th.append("ESMified");
  tr.append(th);

  thead.append(tr);

  tr = document.createElement("tr");

  td = document.createElement("td");
  td.append(`.`);
  tr.append(td);

  td = document.createElement("td");
  td.className = "external-link";
  link = document.createElement("a");
  link.append(externalLinkIcon());
  link.target = "_blank";
  link.href = searchfoxURL + pathComponents.join("/");
  td.append(link);
  tr.append(td);

  td = document.createElement("td");
  td.className = "number";
  td.append(jsm);
  tr.append(td);

  td = document.createElement("td");
  td.className = "number";
  td.append(esm);
  tr.append(td);

  td = document.createElement("td");
  td.className = "number";
  td.append(ratio(esm, jsm));
  tr.append(td);

  tbody.append(tr);

  if (pathComponents.length > 0) {
    tr = document.createElement("tr");

    td = document.createElement("td");
    link = document.createElement("a");
    link.append(`..`);
    link.href = "#" + "/" + pathComponents.slice(0, pathComponents.length - 1).join("/");
    td.append(link);
    tr.append(td);

    td = document.createElement("td");
    tr.append(td);

    td = document.createElement("td");
    tr.append(td);

    td = document.createElement("td");
    tr.append(td);

    td = document.createElement("td");
    tr.append(td);

    tbody.append(tr);
  }

  for (const name of Object.keys(subdir).sort()) {
    tr = document.createElement("tr");

    td = document.createElement("td");
    link = document.createElement("a");
    link.append(`${name}/`);
    link.href = "#" + "/" + [...pathComponents, name].join("/");
    td.append(link);
    tr.append(td);

    td = document.createElement("td");
    td.className = "external-link";
    link = document.createElement("a");
    link.append(externalLinkIcon());
    link.target = "_blank";
    link.href = searchfoxURL + [...pathComponents, name].join("/");
    td.append(link);
    tr.append(td);

    const { jsm, esm } = subdir[name];

    td = document.createElement("td");
    td.className = "number";
    td.append(jsm);
    tr.append(td);

    td = document.createElement("td");
    td.className = "number";
    td.append(esm);
    tr.append(td);

    td = document.createElement("td");
    td.className = "number";
    td.append(ratio(esm, jsm));
    tr.append(td);

    tbody.append(tr);
  }
  treeBox.replaceChildren(table);
}

async function updateBurndownChart() {
  const hash = window.location.hash.slice(1);
  const pathComponents = hash.split("/").filter(p => p);
  const useTable = document.getElementById("table-view").checked;

  const response = await fetch(dataURL);
  const logData = await response.json();

  showHeader(pathComponents);
  if (useTable) {
    document.getElementById("chart").style.display = "none";
    document.getElementById("history").style.display = "";
    drawTableForPath(logData, pathComponents, useTable);
  } else {
    document.getElementById("chart").style.display = "";
    document.getElementById("history").style.display = "none";
    drawChartForPath(logData, pathComponents, useTable);
  }
  showTree(logData, pathComponents);
}

updateBurndownChart();
window.addEventListener("hashchange", event => {
  updateBurndownChart();
});
document.getElementById("table-view").addEventListener("click", () => {
  updateBurndownChart();
});
