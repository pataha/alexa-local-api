var alexa_api = require('./alexa-api')
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
const serverPort = 8091
var savedConfig = {}
var urlencodedParser = bodyParser.urlencoded({ extended: false })

alexa_api.login(process.env.USER, process.env.PASS, process.env.URL, function(error, response, config){
  savedConfig = config
  console.log(response)
  app.listen(serverPort, function () {
    console.log('Internal endpoint:')
    console.log('curl -X POST -d "tts=Ask Alexa team for a proper TTS API" -d "deviceSerialNumber=deviceSerialNumber" ' + 'http://localhost:' + serverPort + '/alexa-tts')
  })
})

app.post('/alexa-tts', urlencodedParser, function (req, res) {
  var tts = req.body.tts;
  var deviceSerialNumber = req.body.deviceSerialNumber;
  console.log('got request for tts for device: ' + deviceSerialNumber + ' and message: ' + tts)
  alexa_api.setTTS(tts, deviceSerialNumber, savedConfig, function(error, response){
    res.send(response)
  })
})

app.post('/alexa-getDevices', urlencodedParser, function (req, res) {
  console.log('got request for getDevices')
  alexa_api.getDevices(savedConfig, function(error, response){
    res.send(response)
  })
})

app.post('/alexa-getState', urlencodedParser, function (req, res) {
  var deviceSerialNumber = req.body.deviceSerialNumber;
  console.log('got getState for  device: ' + deviceSerialNumber)
  alexa_api.getState(deviceSerialNumber, savedConfig, function(error, response){
    res.send(response)
  })
})

app.post('/alexa-getActivities', urlencodedParser, function (req, res) {
  console.log('got request for getActivities')
  alexa_api.getActivities(savedConfig, function(error, response){
    res.send(response)
  })
})

app.post('/alexa-setMedia', urlencodedParser, function (req, res) {
  var volume = req.body.volume;
  var deviceSerialNumber = req.body.deviceSerialNumber;
  if (volume) {
    command = {type:'VolumeLevelCommand', volumeLevel: parseInt(volume)}
  }
  else {
    command = {type: req.body.command}
  }
  console.log('got set media message with command: ' + command + ' for device: ' + deviceSerialNumber)
  alexa_api.setMedia(command, deviceSerialNumber, savedConfig, function(error, response){
    res.send(response)
  })
})



