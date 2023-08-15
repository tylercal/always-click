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

// lifecycle detection
console.log("service launch")

chrome.runtime.onInstalled.addListener(() => console.log("installed"))
chrome.runtime.onStartup.addListener(() => console.log("startup"))
chrome.runtime.onConnect.addListener(() => console.log("connected"))
chrome.runtime.onConnectExternal.addListener(() => console.log("connected"))
chrome.runtime.onMessage.addListener(() => console.log("message"))
chrome.runtime.onRestartRequired.addListener(() => console.log("restart req"))
chrome.runtime.onSuspend.addListener(() => console.log("suspend"))
chrome.runtime.onSuspendCanceled.addListener(() => console.log("suspend cancel"))
chrome.runtime.onUpdateAvailable.addListener(() => console.log("update available"))