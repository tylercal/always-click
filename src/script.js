const selectors = []
const clicked = {}

let mutationCount = 0;

const loadObserver = new MutationObserver(function (mutations) {
    mutationCount++
    clickSelectors()
    if (mutationCount > 100) { loadObserver.disconnect() }
});

function init() {
    chrome.storage.sync.get(results => {
        const url = document.location.href
        Object.entries(results.autos).forEach(result => {
            let filter = result[0]
            let theseSelectors = result[1]
            if (url.includes(filter)) {
                theseSelectors.forEach(selector => {
                    selectors.push(selector)
                })
            }
        })
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