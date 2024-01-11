const selectors = []
const clicked = {}

let mutationCount = 0;

const loadObserver = new MutationObserver(function (mutations) {
    mutationCount++
    clickSelectors()
    if (mutationCount > 100) { loadObserver.disconnect() }
});

function urlMatches(url, filter) {
    let lastIndex = -1
    for (const part of filter.split("*")) {
        lastIndex = url.indexOf(part, lastIndex)
        if (lastIndex < 0) { return false; }
        lastIndex += part.length
    }
    return true
}

function init() {
    chrome.storage.sync.get(results => {
        const url = document.location.href
        Object.entries(results.autos).forEach(result => {
            let filter = result[0]
            let theseSelectors = result[1]
            if (urlMatches(url, filter)) {
                theseSelectors.forEach(selector => {
                    selectors.push(selector)
                })
            }
        })
        console.log("Looking to auto-click: "+selectors)
        clickSelectors()
        loadObserver.observe(document.body, {childList: true, subtree: true})
    })
}

function clickSelectors() {
    selectors.forEach(selector => {
        let element = document.querySelector(selector);
        if (element && !clicked[element]) {
            clicked[element] = true
            element.click()
        }
    })
}

init()


document.addEventListener('page:load', clickSelectors);
document.addEventListener('ready', clickSelectors);
document.addEventListener('turbolinks:load', clickSelectors);
window.addEventListener('load', clickSelectors);