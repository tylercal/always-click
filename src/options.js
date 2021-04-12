const form = document.getElementById("items")
const example = document.getElementById("example")

function error(message) {
    feedback("error", message)
}

function warn(message) {
    feedback("warn", message)
}

function message(message) {
    feedback("message", message)
}

function feedback(show, message) {
    ["error", "warn", "message"].forEach(value => {
        if (show !== value) document.getElementById(value).classList.add('d-none')
    })
    let box = document.getElementById(show);
    box.classList.remove('d-none')
    box.innerText = message
}

function deleteItem(e) {
    this.parentElement.parentElement.remove()
    saveOptions()
    e.preventDefault()
}

function saveOptions() {
    const autos = {}
    let blankCount = 0

    document.querySelectorAll('.option').forEach(option => {
        let url = option.querySelector('.url').value
        let selector = option.querySelector('.selector').value

        if (url.length > 0 && selector.length > 0) {
            if (autos[url] === undefined) autos[url] = []
            autos[url].push(selector)
        } else {
            blankCount++
        }
    })

    chrome.storage.sync.set({autos: autos}, () => {
        if (chrome.runtime.lastError) {
            error("Couldn't save, "+chrome.runtime.lastError.message)
        } else {
            message("Options saved")
            if (blankCount < 2) cloneExample() // the hidden example is always blank
        }

    })
}


function hydrateForm(result) {
    if (result.autos) {
        Object.entries(result.autos).forEach(value => {
            let url = value[0]
            let selectors = value[1]
            selectors.forEach(selector => {
                cloneExample(url, selector)
            })
        })
    }
    cloneExample()
    initExport(result)
}

function restoreOptions() {
    chrome.storage.sync.get(function(result) {
        hydrateForm(result);
    });
}

function cloneExample(url=null, selector=null) {
    let row = example.cloneNode(true)
    row.classList.remove('d-none')
    row.removeAttribute('id')
    row.querySelector(".url").value = url
    row.querySelector(".selector").value = selector
    let deleteBtn = row.querySelector(".remove-always-click");
    deleteBtn.dataset.url = url
    deleteBtn.addEventListener('click', deleteItem)
    form.append(row)
}

function initExport(settings) {
    e = document.getElementById("export")
    e.href = 'data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(settings))
    e.download = 'always-click-export.json'
}

function importSettings() {
    const fileReader = new FileReader()
    fileReader.onload = function (e) {
        const settings = JSON.parse(e.target.result)
        document.querySelectorAll('.option:not(#example)').forEach(option => option.remove())
        hydrateForm(settings)
        warn("Click Save to complete the import.")
    }
    fileReader.readAsText(this.files[0], "UTF-8")
}

document.getElementById('save').addEventListener('click', saveOptions)
document.getElementById('upload').addEventListener('change', importSettings)
document.addEventListener('DOMContentLoaded', restoreOptions);