let express = require('express')
let router = express.Router()
var mongo = require('mongodb')
var assert = require('assert')
let mongoose = require('mongoose')

let url = 'mongodb://localhost:27017/test'

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

// render the index page with the form
router.get('/', (req, res) => {
	res.render('index')
})

// handle form input
router.post('/', (req, res) => {
	
	// object structure for userip database element
	let item = {
		userip: JSON.stringify(req.ip),
		posts: []
	}
	
	rqip = req.ip // user ip

	mongo.connect(url, (err, client) => {
		assert.equal(null, err)

		let db = client.db('test');

		// query for user ip
		let query = {}
		query["userip"] = rqip

		let arr = new Array()

		// searches for user ip
		db.collection('userips').find(query, (result) => {
					assert.equal(null, err)
					arr.push(result)
					console.log(arr[0])
				}, () => {
					// if the ip is already inserted then don't insert
					if (arr[0] !== null){
						client.close()
						console.log("already registered")
						console.log(rqip)
					}
					
					// inseart ip into database
					else {
						db.collection('userips').insertOne(item, (err, result) => {
						assert.equal(null, err)
		
						console.log("new ip inserted")
						})
					}
				})

		// send the user to the posts page
		res.redirect('/posts')
	})
})


module.exports = router