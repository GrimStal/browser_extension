/**
 * Created by grimstal on 21.01.17.
 */
var express = require('express');
var request = require('request');
var router = express.Router();
var GCMAddress = 'https://fcm.googleapis.com/fcm/send';
var GCMKey = 'AAAA0MM4twQ:APA91bFxrSBuBa3heTHrTEqQiDo76P5Q_5UjPzhzePsDekGQaVbmHLBhECzxEGcmOW03Lf5NWR3W4KjreRUvMF03tYXR1iZOA0X4PR4ILRHBLoNpV8gzQBwEJF_Z_SjRlTasaeqtgruj';
var subscribers = [];
var counter = 0;

router.post('/', function(req, res) {
  var allParams = req.allParams();

  request(
      {
        url: GCMAddress,
        method: 'POST',
        headers: {
          Authorization: 'key=' + GCMKey,
          'Content-Type': 'application/json'
        },
        json: true,
        encoding: 'utf8',
        body: {
          registration_ids: subscribers,
          collapse_key: allParams.collapse || String(counter++),
          priority: 'normal',
          time_to_live: (allParams.ttl ? 60 * 60 * allParams.ttl : 60000),
          // restricted_package_name: 'pijphjkghaloeeggcafkfajmkaegjfnk',
          // dry_run: true,
          data: {
            title: allParams.title,
            body: allParams.message,
            link: allParams.link || null
          },
          notification: {
            title: allParams.title,
            body: allParams.message
          }
        }
      },
      function(err, response, body) {
        if (body.results && Array.isArray(body.results)) {
          body.results.forEach(function(result, index) {
            if ('registration_id' in result) {
              subscribers.splice(index, 1);
              result.rewritten = true
            } else if ('error' in result && (result.error === 'InvalidRegistration' || result.error === 'NotRegistered')) {
              subscribers.splice(index, 1);
              result.rewritten = true
            }
          });
        }
        res.status(200).send(body);
      }
  );
});

router.get('/', function(req, res) {
  res.render('message');
});

router.post('/subscribe', function(req, res) {
  var allParams = req.allParams();
  if (allParams.id) {
    if (!~subscribers.indexOf(allParams.id)) {
      subscribers.push(allParams.id);
    }
    return res.send('Subscribed');
  }
  return res.send({error: 'ID not set'}).status(400).end();
});

router.get('/subscribers', function(req, res) {
  return res.send(subscribers).status(200);
});

router.post('/to', function(req, res) {
  var allParams = req.allParams();

  request(
      {
        url: GCMAddress,
        method: 'POST',
        headers: {
          Authorization: 'key=' + GCMKey,
          'Content-Type': 'application/json'
        },
        json: true,
        encoding: 'utf8',
        body: {
          to: allParams.to,
          collapse_key: allParams.collapse || String(counter++),
          priority: 'normal',
          time_to_live: (allParams.ttl ? 60 * 60 * allParams.ttl : 60000),
          // restricted_package_name: 'pijphjkghaloeeggcafkfajmkaegjfnk',
          // dry_run: true,
          data: {
            title: allParams.title,
            body: allParams.message,
            link: allParams.link || null
          },
          notification: {
            title: allParams.title,
            body: allParams.message
          }
        }
      },
      function(err, response, body) {
        if (body.results && Array.isArray(body.results)) {
          body.results.forEach(function(result, index) {
            if ('registration_id' in result) {
              subscribers.splice(index, 1);
              result.rewritten = true
            } else if ('error' in result && (result.error === 'InvalidRegistration' || result.error === 'NotRegistered')) {
              subscribers.splice(index, 1);
              result.rewritten = true
            }
          });
        }

        res.status(200).send(body);
      }
  );
});

module.exports = router;