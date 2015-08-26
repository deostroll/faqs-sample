var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
var fs = require('fs');
var cache = JSON.parse(fs.readFileSync('data/indexed.json', 'utf-8'));
var faqs = JSON.parse(fs.readFileSync('data/faqs.json', 'utf-8'));
var keywords = Object.keys(cache);
var version = fs.readFileSync('data/version.txt', 'utf-8');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'MCS FAQ Express' });
});

router.get('/faqs', function(req, res) {	
	if(req.query.id) {
		res.end(JSON.stringify(faqs[req.query.id]));
	}		
});

router.get('/gist', function(req, res) {
	//console.log(typeof faqs);
	var gist = {
		version: version,
		faqs: faqs,
		index: cache
	};
	res.end(JSON.stringify(gist));
});

router.post('/search', function(req, res) {
	//console.log(req.body.words);
	var list = '';
	req.body.words.forEach(function(w) {
		var matches = keywords.filter(function(kw){
			return kw.indexOf(w) > -1;
		});
		var results = {};
		matches.forEach(function(match){
			results[match] = cache[match];
		});

		var idx = [];
		for(var x in results) {
			var a = results[x];
			a.forEach(function(b) {
				if(idx.indexOf(b) === -1) {
					idx.push(b);
				}
			})
		}

		var items = idx.map(function(i){
			return { idx: i, faq: faqs[i] };
		});
		list = JSON.stringify(items);
	});

	res.end(list);
});

module.exports = router;
