var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
var fs = require('fs');
var cache = JSON.parse(fs.readFileSync('data/indexed.json', 'utf-8'));
var faqs = JSON.parse(fs.readFileSync('data/faqs.json', 'utf-8'));
var keywords = Object.keys(cache);

router.get('/', function(req, res, next) {
  res.render('index', { title: 'FAQ Express' });
});

router.get('/faqs', function(req, res){
	res.sendFile('/home/deostroll/Documents/faqs.json');
});

router.post('/search', function(req, res) {
	//console.log(req.body.words);
	var list = [];
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
			return faqs[i];
		});

		list.push(items);
	});

	res.end(JSON.stringify(list));
});

module.exports = router;
