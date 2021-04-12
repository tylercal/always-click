let filters = []

function updateConfig() {
    filters = []
    chrome.storage.sync.get(results => {
        if (results.autos) {
            Object.entries(results.autos).forEach(value => {
                filters = filters.concat(value[0])
            })
        }
    })
}

updateConfig();

// Storage was updated by another browser instance or the options page
chrome.storage.onChanged.addListener((changes, where) => {
    chrome.storage.sync.get(updateConfig)
})

chrome.webNavigation.onCompleted.addListener(details => {
    if (details.frameId === 0) {
        const url = details.url
        let inject = false
        filters.forEach(filter => inject ||= (url.includes(filter)))
        if (inject) {
            chrome.tabs.executeScript(details.tabId, {file: 'src/script.js'})
        }
    }
})