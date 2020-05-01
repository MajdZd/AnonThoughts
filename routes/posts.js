var express = require('express');
var router = express.Router();
var mongo = require('mongodb')
var assert = require('assert')
var mongoose = require('mongoose')

let url = 'mongodb://localhost:27017/test'

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});


// posts route for getting the posts from database

router.get('/', (req, res) => {
	if (req.ip === null) res.redirect('/')

	mongo.connect(url, (err, client) => {
		assert.equal(null, err)
		let db = client.db('test');
		
		// arrays for storing each value from posts
		let titles = new Array()
		let descriptions = new Array()
		let time = new Array()
		let wid = new Array()
		let agnst = new Array()
		let score = new Array()

		// sorts posts by their rank and points to cursor
		let cursor = db.collection('thoughts').find().sort({rank: -1})
		
		// pushes elements into the arrays and renders them to the page
		cursor.forEach((doc) => {
			titles.push(JSON.stringify(doc.title))
			descriptions.push(JSON.stringify(doc.thought))
			time.push(JSON.stringify(doc.date))
			wid.push(JSON.stringify(doc.with))
			agnst.push(JSON.stringify(doc.against))
			score.push(JSON.stringify(doc.rank))
		}, () => {
			client.close()
			res.render('posts', {
				title: titles,
				description: descriptions, 
				date: time,
				wi: wid,
				ag: agnst,
				rank: score
			})
		})
	})
})




module.exports = router;
