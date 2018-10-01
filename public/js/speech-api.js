/* eslint no-unused-vars: "off" */
/* global ConversationApi: true, Common: true, WatsonSpeech: true, ConversationPanel: true */

var SpeechApi = (function () {
  var state = {
    isRecording: false,
    stream: null
  };

  return {
    toggleMicRecording: toggleMicRecording,
    speak: synthesize
  };

  function onIncomingData(data) {
    if (data.results[0] && data.results[0].final) {
      console.log('Final result: ' + JSON.stringify(data));
      ConversationPanel.sendMessage(data.results[0].alternatives[0].transcript);
      stopRecording();
    } else {
      console.dir(data);
    }
  }

  function onError(err) {
    stopRecording();
    console.log(err);
  }

  function startRecording(token) {
    state.stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
      token: token,
      objectMode: true,
      format: false
    });
    state.stream.on('data', onIncomingData);
    state.stream.on('error', onError);
  }

  function stopRecording() {
    state.isRecording = false;
    if (state.stream) {
      state.stream.stop();
    }
    ConversationPanel.onRecordingStopped();
    console.log('stopped listening.');
  }

  function onSTTTokenReceived(token) {
    startRecording(token);

    state.isRecording = true;
    ConversationPanel.onRecordingStarted();
  }

  function onTTSTokenReceived(token, inputText, autoPlay) {
    var audioResult = WatsonSpeech.TextToSpeech.synthesize({
      text: inputText,
      token: token,
      autoPlay: autoPlay,
      preload: true
    });

    if (audioResult) {
      audioResult.addEventListener('error', onError);
    }
    return audioResult;
  }

  function synthesize(text) {
    return new Promise(function (resolve, reject) {
      fetch('/api/text-to-speech/token')
        .then(function (response) {
          return response.text();
        })
        .then(function (token) {
          resolve(onTTSTokenReceived(token, text));
        })
        .catch(function (err) {
          onError(err);
          reject(err);
        });
    });
  }

  function toggleMicRecording() {
    if (state.isRecording) {
      stopRecording();
      return;
    }

    fetch('/api/speech-to-text/token')
      .then(function (response) {
        return response.text();
      })
      .then(onSTTTokenReceived)
      .catch(onError);
  }


}());