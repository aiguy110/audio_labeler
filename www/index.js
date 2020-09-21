const labelBar = document.getElementById('label-bar')
const ctx = labelBar.getContext("2d")

const audioSlider = document.getElementById('audio-slider')
const dataBox = document.getElementById('data-box')

const audioElement = document.getElementById('audio')



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
        JSON.parse(dataBox.value)
    } catch{
        return
    }
    
    drawLabelBar()
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

    return seconds
}

function secondsToRatio(seconds){
    return seconds / audioElement.duration
}

function ratioToSeconds(ratio){
    return ratio * audioElement.duration
}

function drawLabelBar(){
    // Draw grey background
    ctx.fillStyle = "#aaaaaa"
    ctx.fillRect(0, 0, labelBar.width, 50)

    // Load labels
    labelData = JSON.parse(dataBox.value)
    
    for (let i in labelData) {
        label = labelData[i]
        startX = secondsToRatio(timeStrToSeconds(label["time"])) * labelBar.width
        console.log(startX)
        ctx.fillStyle = label["color"]
        ctx.fillRect(startX, 0, labelBar.width-startX, 50)
    }
} 