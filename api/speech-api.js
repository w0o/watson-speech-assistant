/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const vcapServices = require('vcap_services');
const AuthorizationV1 = require('watson-developer-cloud/authorization/v1');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');


// token endpoints
// **Warning**: these endpoints should probably be guarded with additional authentication & authorization for production use

// speech to text token endpoint
var sttAuthService = new AuthorizationV1(
  Object.assign(
    {
      iam_apikey: process.env.SPEECH_TO_TEXT_APIKEY
    },
    vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
  )
);
const getSTTToken = function (req, res) {
  sttAuthService.getToken(
    {
      url: SpeechToTextV1.URL
    },
    function (err, token) {
      if (err) {
        console.log('Error retrieving token: ', err);
        res.status(500).send('Error retrieving token');
        return;
      }
      res.send(token);
    }
  );
};

// text to speech token endpoint
var ttsAuthService = new AuthorizationV1(
  Object.assign(
    {
      iam_apikey: process.env.TEXT_TO_SPEECH_APIKEY
    },
    vcapServices.getCredentials('text_to_speech') // pulls credentials from environment in bluemix, otherwise returns {}
  )
);
const getTTSToken = function(req, res) {
  ttsAuthService.getToken(
    {
      url: TextToSpeechV1.URL
    },
    function(err, token) {
      if (err) {
        console.log('Error retrieving token: ', err);
        res.status(500).send('Error retrieving token');
        return;
      }
      res.send(token);
    }
  );
};

module.exports = {
  getTTSToken,
  getSTTToken
};