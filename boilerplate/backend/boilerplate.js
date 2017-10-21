"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const fs = require('fs');
const https = require('https');

const app = express();

app.use((req, res, next) => {
  console.log('Got request', req.path, req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

app.use(express.static('../frontend'))

let options = {
   key  : fs.readFileSync('/boilerplate/certs/testing.key'),
   cert : fs.readFileSync('/boilerplate/certs/testing.crt')
};


var rollItemMap = {};

/*
 * @param{string}streamerId:  
 * @param{res}viewerTwitchId:
 * @param{res}viewerSteamId:
 */
app.get('/enroll', (req, res)=>{
	rollItemMap[req.query.streamerId].enrolled.push({
		twitchId : req.query.viewerTwitchId,
		steamId : req.query.viewerSteamId
	});
	res.send(rollItemMap[req.query.streamerId]);
})

/*
 * @param{string}streamerId (required): the rolling streamer
 * @param{string}itemName (required): the item to roll
 * @param{url}itemImage (required): the image of the item
 * @param{int}delay (optional): Delay of roll event
 */
app.get('/post-roll', (req, res)=>{
	console.log(req.query)
	console.log(req.params)
	rollItemMap[req.query.streamerId] = {
		enrolled: [],
		itemName: req.query.itemName,
		itemImage: req.query.itemImage,
		delay: req.query.delay,
		rolledTime: Date.now()
	};
	setTimeout(()=>{
		console.log('time out, rolling happens!');
		let index = Math.floor(Math.random() * rollItemMap[req.query.streamerId].enrolled.length);
		console.log('Winner: ' + index);
		// console.log(rollItemMap[req.query.streamerId].enrolled[index]);
		let winner = rollItemMap[req.query.streamerId].enrolled[index];

		console.log(winner);

		rollItemMap[req.query.streamerId].winner = winner;
	}, req.query.delay * 1000);
	res.send("Hello World");
})

/*
 * @param{string}streamerId (required): the rolling streamer
 */
app.get('/roll-result', (req, res)=>{
	res.send(rollItemMap[req.query.streamerId].winner);
})

/*
 * @param{string}streamerId (required): the rolling streamer
 */
// app.get('/last-roll-time', (req, res)=>{
// 	res.send(rollItemMap[req.query.streamerId].updatedTime);
// })

app.get('/last-post', (req, res)=>{
	res.send(rollItemMap[req.query.streamerId])
})

/*
 * @param{url}itemImage: updated url of image
 */
app.get('/change-image'), (req, res)=>{
	res.send(req.query.itemImage);
}

const PORT = 8080;
https.createServer(options, app).listen(PORT, function () {
  console.log('Extension Boilerplate service running on https', PORT);
});


