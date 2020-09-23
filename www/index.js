const labelBar = document.getElementById('label-bar')
const ctx = labelBar.getContext("2d")

const dataBox = document.getElementById('data-box')
var labelData = [{"time": "0:00.0", "label": "none", "color": "#aaaaaa"}]
const errorText = document.getElementById('error-text')

const audioSlider = document.getElementById('audio-slider')
const audioElement = document.getElementById('audio')

const labelSelector = document.getElementById('label-selector')
const markButton = document.getElementById('mark-button')



document.getElementById('file-selector').onchange = (e) => {
    let fileSelector = document.getElementById('file-selector')
    if (fileSelector.files.length > 0) {
        document.getElementById('upload-button').disabled = false;
    } else {
        document.getElementById('upload-button').disabled = true;
    }
}

document.getElementById('upload-button').onsubmit = (e) => {
    e.preventDefault()
    return false;
}

audioElement.ontimeupdate = (e) => {
    completeRatio = secondsToRatio(audioElement.currentTime)
    audioSlider.value = completeRatio * audioSlider.max
}

audioSlider.onchange = () => { // Only triggers on user induced change
    audioElement.currentTime = ratioToSeconds( audioSlider.value / audioSlider.max )
}

markButton.onclick = () => {
    labelData.push({
        "time": secondsToTimeStr(audioElement.currentTime),
        "label": labelSelector.value
    })

    formatLabelData()
    processLabelUpdate()
}

function processLabelUpdate(){
    try {
        labelData = JSON.parse(dataBox.value)
    } catch(err) {
        dataBox.classList.remove("warning")
        dataBox.classList.add("danger")
        errorText.innerHTML = err.message
        return
    }
    dataBox.classList.remove("danger")

    try {
        cleanLabelData()
        formatLabelData()
        drawLabelBar()
        updatePickList()
    } catch(err) {
        dataBox.classList.add("warning")
        errorText.innerHTML = err.message
        return
    }
    dataBox.classList.remove("warning")
    errorText.innerHTML = ""

    cleanLabelData()
}

dataBox.oninput = processLabelUpdate


document.onkeydown = (e) => {
    if (document.activeElement == dataBox){
        return
    }
    
    if (e.code == "Space") {
        if (audioElement.paused) {
            audioElement.play()
        }else{
            audioElement.pause()
        }
    }
}

function uploadClicked() {
    let file = document.getElementById('file-selector').files[0]
    return false;
    // let xhr = new XMLHttpRequest();
    // xhr.open('POST', '/upload', true)
    // xhr.send(file)
    // console.log('File upload clicked.', file)
}

function timeStrToSeconds(timeStr){
    secMinHours = timeStr.split(':').reverse().map(parseFloat)
    seconds = secMinHours[0]
    if (secMinHours.length > 1){
        seconds += 60 * secMinHours[1]
    }
    if (secMinHours.length > 2){
        seconds += 3600 * secMinHours[2]
    }

    return seconds
}

function secondsToTimeStr(seconds){
    h = Math.floor(seconds/3600)
    m = Math.floor((seconds - h*3600)/60)
    s = seconds - h*3600 - m*60

    function pad(num, size) {
        var s = num+"";
        while (s.split('.')[0].length < size) s = "0" + s;
        return s;
    }

    return (h > 0) ? `${h}:${pad(m,2)}:${pad(s,2)}` : `${m}:${pad(s,2)}` 
}

function secondsToRatio(seconds){
    return seconds / audioElement.duration
}

function ratioToSeconds(ratio){
    return ratio * audioElement.duration
}

function formatLabelData() {
    dataBox.value = JSON.stringify(labelData, null, 4)
}

function cleanLabelData(){
    // Make sure times are in order
    labelData = labelData.sort( (labelObj1, labelObj2) => {
        return timeStrToSeconds(labelObj1["time"]) - timeStrToSeconds(labelObj2["time"])
    })

    // If there is a labelObj with a label string but no color, try to populate the color
    for (let i in labelData) {
        labelObj = labelData[i]
        if (!labelObj.hasOwnProperty("color")){
            for (let j in labelData) {
                maybeColorProvider = labelData[j]
                if (maybeColorProvider.hasOwnProperty("color") && maybeColorProvider["label"]==labelObj["label"]){
                    labelObj["color"] = maybeColorProvider["color"]
                    break
                }
            }
        }
    }

    // Remove repeates
    indsToRemove = []
    lastLabel = ''
    for (let i in labelData) {
        if (labelData[i]["label"] == lastLabel){
            indsToRemove.push(i)
        }
        lastLabel = labelData[i]["label"]
    }

    indsToRemove = indsToRemove.reverse()
    for (let j in indsToRemove){
        i = indsToRemove[j]
        labelData.splice(i, 1)
    }
}

function updatePickList(){
    labels = []
    optionsStr = ''
    for (let i in labelData){
        if (labels.indexOf(labelData[i]["label"]) == -1){
            labelStr = labelData[i]["label"]
            labels.push(labelStr)
            optionsStr += `<option value="${labelStr}">${labelStr}</option>`
        }
    }
    
    labelSelector.innerHTML = optionsStr
}

function drawLabelBar(){
    // Draw grey background
    ctx.fillStyle = "#aaaaaa"
    ctx.fillRect(0, 0, labelBar.width, 50)

    // Load labels
    labelData = JSON.parse(dataBox.value)
    
    for (let i in labelData) {
        label = labelData[i]
        // Validate
        if (!label.hasOwnProperty("time")){
            throw {message: 'No "time" attribute in label object'}
        }
        if (!label.hasOwnProperty("label")){
            throw {message: 'No "label" attribute in label object'}
        }
        if (!label.hasOwnProperty("color")){
            throw {message: 'No "color" attribute in label object'}
        }

        try{
            seconds = timeStrToSeconds(label["time"])
            if (isNaN(seconds))
            {
                throw "Fuck no"
            }
            startX = secondsToRatio(seconds) * labelBar.width
        } catch {
            throw {message: 'Error parsing "time" attribute'}
        }

        ctx.fillStyle = label["color"]
        ctx.fillRect(startX, 0, labelBar.width-startX, 50)
    }
} 

formatLabelData()
drawLabelBar()
processLabelUpdate()