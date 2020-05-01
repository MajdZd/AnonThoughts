let express = require('express')
let router = express.Router()
var mongo = require('mongodb')
var assert = require('assert')
let mongoose = require('mongoose')

let score = (t, u, d) => {
	let ti = t-1587558183373
	let x = u - d
	let y = 1
	let z = 1
	let ax = Math.abs(x)

	if (x > 0) y = 1
	if (x < 0) y = -1

	if (ax >= 1) z = ax

	return Math.round(Math.log(z) + ((y*t)/450)) 

}

let url = 'mongodb://localhost:27017/test'

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

// render the input html form
router.get('/', (req, res, next) => {
	res.render('input')
})

// handle the data gathered
router.post('/', (req, res) => {
	
	// object structure for each database post element
	let item = {
		title: req.body.title,
		thought: req.body.thought,
		with: 1,
		against: 1,
		time: Date.now(),
		date: Date(Date.now()),
		rank: score(Date.now(), 1, 1)
	}

	mongo.connect(url, (err, client) => {
		assert.equal(null, err)

		let db = client.db('test');

		// inseart new element into the database
		db.collection('thoughts').insertOne(item, (err, result) => {
			assert.equal(null, err)
			console.log("new post made")
			client.close()
		})
	})

	res.redirect('/')

})

module.exports = router