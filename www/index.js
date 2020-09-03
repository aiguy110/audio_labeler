function uploadClicked() {
    let file = document.getElementById('file-selector').files[0]
    return false;
    // let xhr = new XMLHttpRequest();
    // xhr.open('POST', '/upload', true)
    // xhr.send(file)
    // console.log('File upload clicked.', file)
}

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