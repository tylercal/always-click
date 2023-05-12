// helpers
function hasData(o) {
    return Object.keys(o).length !== 0
}

function format(filters) {
    return Object.keys(filters).map(filter => {
        if (!filter.endsWith("/")) filter = filter+"/"
        filter = filter+"*"
        if (!filter.match(/^.+:\/\//)) filter = "*://"+filter
        return filter
    })
}

function register(filters) {
    chrome.scripting.registerContentScripts([{
        id: "script",
        js: ["src/script.js"],
        persistAcrossSessions: false,
        matches: format(filters)
    }])
        .then(() => console.log("Registered on: "+format(filters)))
        .catch((err) => console.warn("Could not load filters", err))
}

// on startup
console.log("service launch")
chrome.storage.sync.get().then(result => {
    if (result && result.autos && hasData(result.autos)) {
        console.log("Getting click rules")
        register(result.autos)
    }
})

// on updates
chrome.storage.onChanged.addListener(async (changes, where) => {
    console.log("Storage change")
    const {autos} = await chrome.storage.sync.get()
    if (autos && hasData(autos)) {
        const [script] = await chrome.scripting.getRegisteredContentScripts()
        if (script) {
            chrome.scripting.updateContentScripts([{
                id: "script",
                matches: format(autos)
            }])
                .then(() => console.log("Updated to: "+format(autos)))
                .catch((err) => console.warn("Could not update filters", err))
        } else {
            register(autos)
        }
    } else {
        chrome.scripting
            .unregisterContentScripts({ ids: ["script"] })
            .then(() => console.log("un-registration complete"));
    }
})