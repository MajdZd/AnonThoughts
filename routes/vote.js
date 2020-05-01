var express = require('express');
var router = express.Router();
var mongo = require('mongodb')
var assert = require('assert')
var mongoose = require('mongoose')
let async = require('async')

let url = 'mongodb://localhost:27017/test'

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

// function for ranking each post by the number of upvotes and downvotes
// and the date of the post's creation
let score = (t, u, d) => {
	let ti = t-1587558183373
	let x = u - d
	let y = 1
	let z = 1
	let ax = Math.abs(x)

	if (x > 0) y = 1
	if (x < 0) y = -1

	if (ax >= 1) z = ax

	return Math.round(Math.log(z) + (y*t)/450000) // the score

}

// handles the voting functionality
router.post('/', (req, res) => {
	let rf = ""
	let rs = ""
	let vote = ""
	let c = false // the action bool
	
	let rip = req.ip // user ip

	rf = req.body.w  // upvote
	rs = req.body.a  // downvote
	

	// checks if the action is an upvote or downvote
	if (rf === undefined) {vote = rs.replace(/['"]+/g, '')}
	else {vote = rf.replace(/['"]+/g, ''); c = true}
	
	mongo.connect(url, (err, client) => {
		assert.equal(null, err)
		
		let db = client.db('test'); 

		// vote query to identify the post that was voted
		let query = {}
		query["thought"] = vote

		// ip query to identify the user ip
		let ipquery = {}
		ipquery["userip"] = rip

		let postquery = {}
		postquery["posts"] = vote

		console.log(ipquery)

		// fetches what posts the user already voted
		let v =	db.collection('userips')
				.find(ipquery).toArray((err, result) => {
					assert.equal(null, err)
					
					arr = result[0].posts // the posts already voted
					console.log(!arr.includes(vote))
					
					// if the post that is voted now matches one in the database
					// don't access the statement
					if (!arr.includes(vote)) {				
						// finds the post from database
						let cursor = db.collection('thoughts').find(query)
						
						cursor.toArray((err, result) => {
							assert.equal(null, err)
			
							// if action is upvote then increase the "with"
							// field by one and update the score
							// else do the same thing but increase the "against"
							// field instead
							if (c) {
								db.collection('thoughts').updateMany(
								query, {$inc: {with: 1}, $set: {rank: score(result[0].time, result[0].with, result[0].against)}})
								console.log("upvote")
								console.log(result[0])
							}
									
							else {
								db.collection('thoughts').updateMany(
								query, {$inc: {against: 1}, $set: {rank: score(result[0].time, result[0].with, result[0].against)}})
								console.log("downvote")
								console.log(result[0])
							}
					})

					// update the posts already voted by this ip
					db.collection('userips')
					.updateMany(ipquery, {$push: {posts: vote}})
				}
				})
	})

	res.redirect('/posts')
})


module.exports = router;