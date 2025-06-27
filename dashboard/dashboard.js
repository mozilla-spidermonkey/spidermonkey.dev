// SpiderMonkey Dashboard - Bugzilla API Integration

const BUGZILLA_API_BASE = 'https://bugzilla.mozilla.org/rest';

// Test API connectivity
async function testAPIConnection() {
    try {
        const response = await fetch(`${BUGZILLA_API_BASE}/version`);
        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Failed to connect to Bugzilla API:', error);
        return false;
    }
}

// Define the SpiderMonkey components
const SPIDERMONKEY_COMPONENTS = [
    'JavaScript Engine',
    'JavaScript Engine: JIT',
    'JavaScript Engine: GC',
    'JavaScript Engine: Internationalization API',
    'JavaScript Engine: Standard Library',
    'Javascript: Web Assembly',
    'js-ctypes'
];

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper function to create bug link
function createBugLink(bugId) {
    return `<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=${bugId}" target="_blank">${bugId}</a>`;
}

// Helper function to format assignee
function formatAssignee(email) {
    if (!email || email === 'nobody@mozilla.org') {
        return 'Unassigned';
    }
    // Extract username from email
    return email.split('@')[0];
}

// Sort state tracking
const sortState = {
    'recently-opened': { column: 'severity', direction: 'asc' },
    'recently-resolved': { column: 'severity', direction: 'asc' },
    'high-severity': { column: 'severity', direction: 'asc' },
    'assigned-open': { column: 'severity', direction: 'asc' }
};

// View state tracking (expanded or collapsed)
const viewState = {
    'recently-opened': { expanded: false, limit: 10 },
    'recently-resolved': { expanded: false, limit: 10 },
    'high-severity': { expanded: false, limit: null }, // no limit
    'assigned-open': { expanded: false, limit: 30 }  // limit to 30
};

// Helper function to compare values for sorting
function compareValues(a, b, column, direction) {
    const severityOrder = { 'S1': 1, 'S2': 2, 'S3': 3, 'S4': 4, '--': 5, 'N/A': 5 };
    const priorityOrder = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4, 'P5': 5, '--': 6 };
    
    let valA, valB;
    
    switch(column) {
        case 'id':
            valA = parseInt(a.id);
            valB = parseInt(b.id);
            break;
        case 'summary':
            valA = a.summary.toLowerCase();
            valB = b.summary.toLowerCase();
            break;
        case 'assignee':
            valA = formatAssignee(a.assigned_to).toLowerCase();
            valB = formatAssignee(b.assigned_to).toLowerCase();
            break;
        case 'priority':
            valA = priorityOrder[a.priority] || 999;
            valB = priorityOrder[b.priority] || 999;
            break;
        case 'severity':
            valA = severityOrder[a.severity] || 999;
            valB = severityOrder[b.severity] || 999;
            break;
    }
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
}

// Helper function to sort bugs by severity, priority, then assignee (default sort)
function sortBugs(bugs, tableId = null, column = null, direction = null) {
    if (tableId && column) {
        // Custom sort based on clicked column
        return bugs.sort((a, b) => compareValues(a, b, column, direction));
    } else {
        // Default sort
        const severityOrder = { 'S1': 1, 'S2': 2, 'S3': 3, 'S4': 4, '--': 5, 'N/A': 5 };
        const priorityOrder = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4, 'P5': 5, '--': 6 };
        
        return bugs.sort((a, b) => {
            // First sort by severity
            const severityA = severityOrder[a.severity] || 999;
            const severityB = severityOrder[b.severity] || 999;
            if (severityA !== severityB) {
                return severityA - severityB;
            }
            
            // Then by priority
            const priorityA = priorityOrder[a.priority] || 999;
            const priorityB = priorityOrder[b.priority] || 999;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // Finally by assignee
            const assigneeA = formatAssignee(a.assigned_to);
            const assigneeB = formatAssignee(b.assigned_to);
            return assigneeA.localeCompare(assigneeB);
        });
    }
}

// Function to handle column header click
function sortTable(tableId, column) {
    const state = sortState[tableId];
    
    // Toggle direction if same column, otherwise default to ascending
    if (state.column === column) {
        state.direction = state.direction === 'asc' ? 'desc' : 'asc';
    } else {
        state.column = column;
        state.direction = 'asc';
    }
    
    // Re-fetch and display the data with new sort
    const container = document.getElementById(tableId);
    const bugs = window[`${tableId}Data`];
    if (bugs) {
        const sortedBugs = sortBugs([...bugs], tableId, column, state.direction);
        container.innerHTML = createBugTable(sortedBugs, tableId);
    }
}

// Function to toggle view more/less
function toggleViewMore(tableId) {
    const state = viewState[tableId];
    state.expanded = !state.expanded;
    
    // Get the container
    const container = document.getElementById(tableId);
    
    // Re-display the data with new view state
    const bugs = window[`${tableId}Data`];
    if (bugs) {
        const sortStateForTable = sortState[tableId];
        const sortedBugs = sortBugs([...bugs], tableId, sortStateForTable.column, sortStateForTable.direction);
        container.innerHTML = createBugTable(sortedBugs, tableId);
        
        // Scroll to the heading anchor (the h2 link above the table)
        const anchor = document.getElementById(`${tableId}-link`);
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        console.error(`No data found for table: ${tableId}`);
    }
}

// Helper function to create table HTML
function createBugTable(bugs, tableId = null) {
    if (!bugs || bugs.length === 0) {
        // Random celebration emojis
        const celebrations = ['🎉', '🎊', '🥳', '🎈', '✨', '🌟', '🎆', '🎇', '🙌', '🤩'];
        const randomEmoji = celebrations[Math.floor(Math.random() * celebrations.length)];
        return `<p>No bugs found ${randomEmoji}</p>`;
    }

    // Get current sort state if tableId provided
    const state = tableId ? sortState[tableId] : null;
    
    // Sort bugs
    const sortedBugs = tableId && state 
        ? sortBugs([...bugs], tableId, state.column, state.direction)
        : sortBugs(bugs);

    let html = `
        <table class="bug-table">
            <thead>
                <tr>
    `;
    
    // Add sortable headers if tableId is provided
    if (tableId) {
        const arrow = (col) => {
            if (state.column === col) {
                return state.direction === 'asc' ? ' ↑' : ' ↓';
            }
            return '';
        };
        
        html += `
                    <th class="sortable" onclick="sortTable('${tableId}', 'id')">Bug${arrow('id')}</th>
                    <th class="sortable" onclick="sortTable('${tableId}', 'summary')">Summary${arrow('summary')}</th>
                    <th class="sortable" onclick="sortTable('${tableId}', 'assignee')">Assignee${arrow('assignee')}</th>
                    <th class="sortable" onclick="sortTable('${tableId}', 'priority')">Priority${arrow('priority')}</th>
                    <th class="sortable" onclick="sortTable('${tableId}', 'severity')">Severity${arrow('severity')}</th>
        `;
    } else {
        html += `
                    <th>Bug</th>
                    <th>Summary</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Severity</th>
        `;
    }
    
    html += `
                </tr>
            </thead>
            <tbody>
    `;

    // Check if we need to limit the display
    const vState = tableId ? viewState[tableId] : null;
    const hasLimit = vState && vState.limit && sortedBugs.length > vState.limit;
    const displayBugs = (hasLimit && !vState.expanded) 
        ? sortedBugs.slice(0, vState.limit) 
        : sortedBugs;

    displayBugs.forEach(bug => {
        html += `
            <tr onclick="window.open('https://bugzilla.mozilla.org/show_bug.cgi?id=${bug.id}', '_blank')">
                <td>${createBugLink(bug.id)}</td>
                <td class="summary">${bug.summary}</td>
                <td>${formatAssignee(bug.assigned_to)}</td>
                <td class="priority-${bug.priority.toLowerCase()}">${bug.priority}</td>
                <td class="severity-${bug.severity.toLowerCase()}">${bug.severity}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    // Add view more/less button if needed
    if (hasLimit) {
        const buttonText = vState.expanded 
            ? 'View Less' 
            : `View More (${sortedBugs.length - vState.limit} more)`;
        html += `
            <div class="view-more-container">
                <button class="view-more-button" onclick="toggleViewMore('${tableId}')">
                    ${buttonText}
                </button>
            </div>
        `;
    }

    return html;
}

// Helper function to build Bugzilla query URL
function buildBugzillaQueryURL(params) {
    const baseURL = 'https://bugzilla.mozilla.org/buglist.cgi';
    return `${baseURL}?${params}`;
}

// Function to fetch recently opened bugs
async function fetchRecentlyOpenedBugs() {
    // Build component parameter manually to handle multiple components
    const componentParams = SPIDERMONKEY_COMPONENTS.map(c => `component=${encodeURIComponent(c)}`).join('&');
    
    const params = new URLSearchParams({
        product: 'Core',
        chfield: '[Bug creation]',
        chfieldfrom: '-30d',
        chfieldto: 'Now',
        order: 'opendate DESC',
        include_fields: 'id,summary,assigned_to,priority,severity,creation_time'
    });

    // Set the query link
    const queryParams = new URLSearchParams({
        product: 'Core',
        chfield: '[Bug creation]',
        chfieldfrom: '-30d',
        chfieldto: 'Now',
        order: 'opendate DESC'
    });
    const queryURL = buildBugzillaQueryURL(`${queryParams}&${componentParams}`);
    document.getElementById('recently-opened-link').href = queryURL;

    const url = `${BUGZILLA_API_BASE}/bug?${params}&${componentParams}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store data for re-sorting
        window['recently-openedData'] = data.bugs;
        
        const container = document.getElementById('recently-opened');
        container.innerHTML = createBugTable(data.bugs, 'recently-opened');
    } catch (error) {
        console.error('Error fetching recently opened bugs:', error);
        document.getElementById('recently-opened').innerHTML = `<p class="error">Error loading recently opened bugs: ${error.message}</p>`;
    }
}

// Function to fetch recently resolved bugs
async function fetchRecentlyResolvedBugs() {
    // Build component parameter manually to handle multiple components
    const componentParams = SPIDERMONKEY_COMPONENTS.map(c => `component=${encodeURIComponent(c)}`).join('&');
    
    const params = new URLSearchParams({
        product: 'Core',
        chfield: 'resolution',
        chfieldfrom: '-30d',
        chfieldto: 'Now',
        order: 'changeddate DESC',
        include_fields: 'id,summary,assigned_to,priority,severity,cf_last_resolved'
    });
    
    // Add resolutions manually
    const resolutions = ['FIXED', 'INVALID', 'WONTFIX', 'DUPLICATE', 'WORKSFORME'];
    const resolutionParams = resolutions.map(r => `resolution=${r}`).join('&');

    // Set the query link
    const queryParams = new URLSearchParams({
        product: 'Core',
        chfield: 'resolution',
        chfieldfrom: '-30d',
        chfieldto: 'Now',
        order: 'changeddate DESC'
    });
    const queryURL = buildBugzillaQueryURL(`${queryParams}&${componentParams}&${resolutionParams}`);
    document.getElementById('recently-resolved-link').href = queryURL;

    const url = `${BUGZILLA_API_BASE}/bug?${params}&${componentParams}&${resolutionParams}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store data for re-sorting
        window['recently-resolvedData'] = data.bugs;
        
        const container = document.getElementById('recently-resolved');
        container.innerHTML = createBugTable(data.bugs, 'recently-resolved');
    } catch (error) {
        console.error('Error fetching recently resolved bugs:', error);
        document.getElementById('recently-resolved').innerHTML = `<p class="error">Error loading recently resolved bugs: ${error.message}</p>`;
    }
}

// Function to fetch high severity bugs
async function fetchHighSeverityBugs() {
    // Build component parameter manually to handle multiple components
    const componentParams = SPIDERMONKEY_COMPONENTS.map(c => `component=${encodeURIComponent(c)}`).join('&');
    
    const params = new URLSearchParams({
        product: 'Core',
        resolution: '---',
        include_fields: 'id,summary,assigned_to,priority,severity'
    });
    
    // Add severities manually
    const severityParams = 'bug_severity=S1&bug_severity=S2';

    // Set the query link
    const queryParams = new URLSearchParams({
        product: 'Core',
        resolution: '---'
    });
    const queryURL = buildBugzillaQueryURL(`${queryParams}&${componentParams}&${severityParams}`);
    document.getElementById('high-severity-link').href = queryURL;

    const url = `${BUGZILLA_API_BASE}/bug?${params}&${componentParams}&${severityParams}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store data for re-sorting
        window['high-severityData'] = data.bugs;
        
        const container = document.getElementById('high-severity');
        container.innerHTML = createBugTable(data.bugs, 'high-severity');
    } catch (error) {
        console.error('Error fetching high severity bugs:', error);
        document.getElementById('high-severity').innerHTML = `<p class="error">Error loading high severity bugs: ${error.message}</p>`;
    }
}

// Function to fetch assigned open bugs
async function fetchAssignedOpenBugs() {
    // Build component parameter manually to handle multiple components
    const componentParams = SPIDERMONKEY_COMPONENTS.map(c => `component=${encodeURIComponent(c)}`).join('&');
    
    const params = new URLSearchParams({
        product: 'Core',
        resolution: '---',
        emailtype1: 'notequals',
        email1: 'nobody@mozilla.org',
        emailassigned_to1: '1',
        include_fields: 'id,summary,assigned_to,priority,severity'
    });

    // Set the query link
    const queryParams = new URLSearchParams({
        product: 'Core',
        resolution: '---',
        emailtype1: 'notequals',
        email1: 'nobody@mozilla.org',
        emailassigned_to1: '1'
    });
    const queryURL = buildBugzillaQueryURL(`${queryParams}&${componentParams}`);
    document.getElementById('assigned-open-link').href = queryURL;

    const url = `${BUGZILLA_API_BASE}/bug?${params}&${componentParams}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store data for re-sorting
        window['assigned-openData'] = data.bugs;
        
        const container = document.getElementById('assigned-open');
        container.innerHTML = createBugTable(data.bugs, 'assigned-open');
    } catch (error) {
        console.error('Error fetching assigned open bugs:', error);
        document.getElementById('assigned-open').innerHTML = `<p class="error">Error loading assigned open bugs: ${error.message}</p>`;
    }
}

// Make functions available globally for onclick handlers
window.sortTable = sortTable;
window.toggleViewMore = toggleViewMore;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're running locally (file://) which might have CORS issues
    if (window.location.protocol === 'file:') {
        console.warn('Running from file:// protocol. You may experience CORS issues. Consider running a local web server.');
    }
    
    // Test API connection first
    const apiWorking = await testAPIConnection();
    if (!apiWorking) {
        console.error('Cannot connect to Bugzilla API. This might be a CORS issue if running locally.');
    }
    
    fetchRecentlyOpenedBugs();
    fetchRecentlyResolvedBugs();
    fetchHighSeverityBugs();
    fetchAssignedOpenBugs();
    
    // Add last updated timestamp
    const now = new Date();
    const footer = document.createElement('div');
    footer.className = 'last-updated';
    footer.textContent = `Last updated: ${now.toLocaleString()}`;
    document.querySelector('.bug-table-container:last-of-type').after(footer);
});