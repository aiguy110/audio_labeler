const labelBar = document.getElementById('label-bar')
const ctx = labelBar.getContext("2d")

const dataBox = document.getElementById('data-box')
var labelData = [{"time": "0:00.0", "label": "none", "color": "#aaaaaa"}]
const errorText = document.getElementById('error-text')

const audioSlider = document.getElementById('audio-slider')
const audioElement = document.getElementById('audio')

const labelSelector = document.getElementById('label-selector')



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

dataBox.oninput = () => {
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
        formatLabelData()
        drawLabelBar()
    } catch(err) {
        dataBox.classList.add("warning")
        errorText.innerHTML = err.message
        return
    }
    dataBox.classList.remove("warning")
    errorText.innerHTML = ""
}



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

    console.log('returning seconds value', seconds)
    return seconds
}

function secondsToRatio(seconds){
    console.log(seconds, audioElement.duration, seconds / audioElement.duration)
    return seconds / audioElement.duration
}

function ratioToSeconds(ratio){
    return ratio * audioElement.duration
}

function formatLabelData() {
    dataBox.value = JSON.stringify(labelData, null, 4)
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
            console.log('seconds', seconds)
            if (seconds.isNaN())
            {
                console.log('throwing up')
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