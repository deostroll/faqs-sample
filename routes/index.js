var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
var fs = require('fs');
var cache = JSON.parse(fs.readFileSync('data/mined.json', 'utf-8'));
var faqs = JSON.parse(fs.readFileSync('data/faqs.json', 'utf-8'));
var app = express();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'FAQ Express' });
});

router.get('/appcache', function(req, res){
	res.set('Content-Type', 'text/cache-manifest');
	res.sendFile('./manifest.appcache', {root: path.resolve(__dirname + '/../')});

});

router.get('/faqs', function(req, res){
	res.sendFile('/home/deostroll/Documents/faqs.json');
});

router.post('/search', function(req, res) {
	//console.log(req.body.words);
	var indexes = {};
	req.body.words.forEach(function(w) {
		var a = cache[w];
		if(a) {
			for(var i =0; i < a.length; i++) {
				if(!indexes[a[i]]) {
					indexes[a[i]] = true;
				}
			}
		}

		var hits = Object.keys(indexes).map(function(idx){
			return faq[idx];
		});

		res.send(hits);
	});

	res.end();
});
module.exports = router;
