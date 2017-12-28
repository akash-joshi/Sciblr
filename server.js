// Requires for Express
const app = require('express')();
const http = require('http').Server(app);
require('dotenv').config()

// crypto to hash passwords and bodyParser to read request parameters
const crypto = require('crypto');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

// updating config with our data
AWS.config.update({
	region : "ap-south-1",
	endpoint : "https://dynamodb.ap-south-1.amazonaws.com",
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// used to access dynamodb
const docClient = new AWS.DynamoDB.DocumentClient();

const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });

// Attach sessions
app.use(session);
app.use(bodyParser.json());

// Route for home-page
app.get('/', (req,res) => {
	res.sendFile(__dirname+"/multiitem.html");
});

// Dynamic route for all files
app.get('/:file1/:file2', (req,res) => {
	res.sendFile(__dirname+"/"+req.params.file1+"/"+req.params.file2);
});

// POST route to create a user
app.post('/create-user', (req, res) => {
	// username, password
	// {"username": "akash", "password": "password"}
	// JSON
	const userid = req.body.userid;
	const password = req.body.password;
	const email = req.body.email;

	const salt = crypto.randomBytes(128).toString('hex');
	const dbString = hash(password, salt);
	const params = {
		TableName : "Users",
		Item : {
			userid : userid,
			password : dbString,
			email : email
		}
	}

	docClient.put(params, (err, data) => {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
			res.status(500).send(err.toString());
		} else {
			console.log("Added item:", JSON.stringify(data, null, 2));
			req.session.auth = {userId: userid};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
			res.status(200).send('User successfully created: ' + userid);
		}
	});	
 });

// POST request to login
 app.post('/login', (req, res) => {
	const username = req.body.userid;
	const password = req.body.password;
	
	const params = {
		TableName: "Users",
		Key:{
			"userid": username
		}
	};

	docClient.get(params, (err, data) => {
	   if (err) {
		   console.log(err);
		   res.status(500).send(err.toString());
	   } else {
		   if (!data.hasOwnProperty('Item')) {
			   res.status(403).send('username/password is invalid');
		   } else {
			   // Match the password
			   const dbString = data.Item.password;
			   const salt = dbString.split('$')[2];
			   const hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
			   if (hashedPassword === dbString) {
				 
				 // Set the session
				 req.session.auth = {userId: username};
				 // set cookie with a session id
				 // internally, on the server side, it maps the session id to an object
				 // { auth: {userId }}
				 
				 res.status(200).send('credentials correct!');
				 console.log(username + " logged in");
				 
			   } else {
				 res.status(403).send('username/password is invalid');
			   }
		   }
	   }
	});
 });

 app.get('/check-login', (req, res) => {
	if (req.session && req.session.auth && req.session.auth.userId) {
		const username = req.session.auth.userId;

		const params = {
			TableName: "Users",
			Key:{
				"userid": username
			}
		};

		// Load the user object
		docClient.get(params, (err, data) => {
			if (err) {
				console.log("if err");
			   res.status(500).send(err.toString());
			} else {
			   res.status(200).send(data.Item.userid);    
			}
		});
	} else {
		res.status(403).send('You are not logged in');
	}
 });

app.get('/logout', (req, res) => {
	delete req.session.auth;
	res.redirect('/');
});

app.get('/myprofile', (req,res)=>{
	res.sendFile(__dirname+'/profile.html');
});

const hash = (input, salt) => {
    // How do we create a hash?
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

const port = process.env.PORT || 8080;

http.listen(port, () => {
	console.log("working on port "+port);
});
