import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10.2/dist/mermaid.esm.mjs";
let config = {
    // If you have any issues be sure to set log level to at least 3.
    // Lower is more verbose than higher.
    logLevel: 5, // 5 is default.
    flowcharts: {
        useMaxWidth: true,
        htmlLabels: true,
    },
    // Requried for callbacks
    securityLevel: "loose",
};
mermaid.initialize(config);
window.mermaid = mermaid;


export default function draw_diagram(diagram_source, destination_id) {
// Cache bust for local development of the diagram.
const timestamp = new Date().getTime();
const cacheBustingUrl = `${diagram_source}?t=${timestamp}`;

fetch(cacheBustingUrl)
    .then((response) => {
    if (!response.ok) {
        throw new Error(
        `Failed to load file (status code: ${response.status})`
        );
    }
    let diagram_source = response.text();
    return diagram_source;
    })
    .then(async (diagram_source) => {
    let element = document.querySelector(destination_id);
    const { svg, bindFunctions } = await mermaid.render(
        "renderedTree",
        diagram_source
    );
    element.innerHTML = svg;
    if (bindFunctions) {
        bindFunctions(element);
    }
    });
}

// Note: Because of how Mermaid works, callbacks need to be referenced relative to
// window.
window.callbacks = {
    // Callbacks are invoked with the nodeId as the parameter.
    exampleCallback: function (x) {
    alert("called Callback for " + x);
    },
};