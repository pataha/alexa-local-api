var request = require('request')
var Nightmare = require('nightmare')
var nightmare = Nightmare({ show: false })
var dateFormat = require('dateformat')

var login = function(userName, password, callback) {
  var devicesArray = []
  var cookiesArray = []
  var deviceSerialNumber
  var deviceType
  var deviceOwnerCustomerId
  var strCookies  = ''
  var csrf = ''
  var config = {}

  nightmare
    .goto('https://www.amazon.com/ap/signin?showRmrMe=1&openid.return_to=https%3A%2F%2Falexa.amazon.com%2Fspa%2Findex.html&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=amzn_dp_project_dee&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&')
    .type('#ap_email', userName)
    .type('#ap_password', password)
    .click('#signInSubmit')
    .wait(1000)
    .goto('https://alexa.amazon.com/api/devices-v2/device')
    .wait()
    .evaluate(function() {
      return JSON.parse(document.body.innerText)
    })
    .then(function(result) {
      devicesArray = result
    })
    .then(function() {
    return nightmare
      .cookies.get({
        url: null
      })
      .end()
      .then(cookies => {
        cookiesArray = cookies
      })
    })
    .then(function() {
      cookiesArray.forEach(function(cookie) {
        strCookies += cookie.name + '=' + cookie.value + '; '
        if (cookie.name === 'csrf'){
          csrf = cookie.value
        }
      })
      config.devicesArray = devicesArray
      config.cookies = strCookies
      config.csrf = csrf
      config.deviceSerialNumber = deviceSerialNumber
      config.deviceType = deviceType
      config.deviceOwnerCustomerId = deviceOwnerCustomerId
      callback(null, 'Logged in', config)
    })
    .catch(function(error) {
      callback(error, 'There was an error', null)
    })
}

var setReminder = function(message, datetime, deviceSerialNumber, config, callback) {
    var now = new Date()
    var createdDate = now.getTime()
    var addSeconds = new Date(createdDate + 1*60000) // one minute afer the current time
    var alarmTime = addSeconds.getTime()
    if (datetime) {
      var datetimeDate = new Date(dateFormat(datetime))
      alarmTime = datetimeDate.getTime()
    }
    var originalTime = dateFormat(alarmTime, 'HH:MM:00.000')
    var originalDate = dateFormat(alarmTime, 'yyyy-mm-dd')
    var device = {}
    config.devicesArray.devices.forEach(function(dev) {
        if (dev.serialNumber === deviceSerialNumber){
          device.deviceSerialNumber = dev.serialNumber
          device.deviceType = dev.deviceType
          device.deviceOwnerCustomerId = dev.deviceOwnerCustomerId
        }
    })

    request({
      method: 'PUT',
      url: 'https://alexa.amazon.com/api/notifications/createReminder',
      headers: {
        'Cookie': config.cookies,
        'csrf': config.csrf
      },
      json: {
        type: 'Reminder',
        status: 'ON',
        alarmTime: alarmTime,
        originalTime: originalTime,
        originalDate: originalDate,
        timeZoneId: null,
        reminderIndex: null,
        sound: null,
        deviceSerialNumber: device.deviceSerialNumber,
        deviceType: device.deviceType,
        recurringPattern: '',
        reminderLabel: message,
        isSaveInFlight: true,
        id: 'createReminder',
        isRecurring: false,
        createdDate: createdDate
      }
    }, function(error, response, body) {
      if(!error && response.statusCode === 200) {
        callback(null, {"status": "success"})
      } else {
        callback(error, {"status": "failure"})
      }
    })
}

var setTTS = function(message, deviceSerialNumber, config, callback) {
    var device = {}
    config.devicesArray.devices.forEach(function(dev) {
        if (dev.serialNumber === deviceSerialNumber){
          device.deviceSerialNumber = dev.serialNumber
          device.deviceType = dev.deviceType
          device.deviceOwnerCustomerId = dev.deviceOwnerCustomerId
        }
    })
    request({
      method: 'POST',
      url: 'https://pitangui.amazon.com/api/behaviors/preview',
      headers: {
        'Cookie': config.cookies,
        'csrf': config.csrf
      },
      json:
      {
        "behaviorId":"PREVIEW",
        "sequenceJson":"{\"@type\":\"com.amazon.alexa.behaviors.model.Sequence\", \
        \"startNode\":{\"@type\":\"com.amazon.alexa.behaviors.model.OpaquePayloadOperationNode\", \
        \"type\":\"Alexa.Speak\",\"operationPayload\":{\"deviceType\":\"" + device.deviceType + "\", \
        \"deviceSerialNumber\":\"" + device.deviceSerialNumber + "\",\"locale\":\"en-US\", \
        \"customerId\":\"" + device.deviceOwnerCustomerId + "\", \"textToSpeak\": \"" + message + "\"}}}",
        "status":"ENABLED"
      }
    }, function(error, response, body) {
      if(!error && response.statusCode === 200) {
        callback(null, {"status": "success"})
      } else {
        callback(error, {"status": "failure"})
      }
    })
}

var setMedia = function(command, deviceSerialNumber, config, callback) {
    var device = {}
    config.devicesArray.devices.forEach(function(dev) {
        if (dev.serialNumber === deviceSerialNumber){
          device.deviceSerialNumber = dev.serialNumber
          device.deviceType = dev.deviceType
          device.deviceOwnerCustomerId = dev.deviceOwnerCustomerId
        }
    })
    request({
      method: 'POST',
      url: 'https://pitangui.amazon.com/api/np/command?deviceSerialNumber=' +
            device.deviceSerialNumber + '&deviceType=' + device.deviceType,
      headers: {
        'Cookie': config.cookies,
        'csrf': config.csrf
      },
      json: command
    }, function(error, response, body) {
      if(!error && response.statusCode === 200) {
        callback(null, {"status": "success"})
      } else {
        callback(error, response)
      }
    })
}

var getDevices = function(config, callback) {
      request({
      method: 'GET',
      url: 'https://alexa.amazon.com/api/devices-v2/device',
      headers: {
        'Cookie': config.cookies,
        'csrf': config.csrf
      }
    }, function(error, response, body) {
      if(!error && response.statusCode === 200) {
        config.devicesArray = JSON.parse(body)
        callback(null, config.devicesArray)
      } else {
        callback(error, response)
      }
    })
}

var getState = function(deviceSerialNumber, config, callback) {
    var device = {}
    config.devicesArray.devices.forEach(function(dev) {
        if (dev.serialNumber === deviceSerialNumber){
          device.deviceSerialNumber = dev.serialNumber
          device.deviceType = dev.deviceType
          device.deviceOwnerCustomerId = dev.deviceOwnerCustomerId
        }
    })
    request({
      method: 'GET',
      url: 'https://pitangui.amazon.com/api/media/state?deviceSerialNumber=' + device.deviceSerialNumber + '&deviceType=' + device.deviceType,
      headers: {
        'Cookie': config.cookies,
        'csrf': config.csrf
      }
    }, function(error, response, body) {
      if(!error && response.statusCode === 200) {
        callback(null, JSON.parse(body))
      } else {
        callback(error, response)
      }
    })
}


exports.login = login
exports.setReminder = setReminder
exports.setTTS = setTTS
exports.setMedia = setMedia
exports.getDevices = getDevices
exports.getState = getState
