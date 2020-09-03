const express = require('express')
const fileUpload = require('express-fileupload')

const app = express()
const port = 3000

app.use(express.static('www'))
app.use(fileUpload())

app.get('/', (req, res) => {
    res.redirect('/index.html')
})

app.post('/upload', (req, res) => {
    req.files.audioUpload.mv('www/samples/uploadedAudio.mp3')
    res.send('Success')
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})