var chat = require('./../server/controllers/ChatCtrl.js');

module.exports = function(app, io){

	app.get('/', function (req, res){
		res.render('index');
	})

	app.get('/logout', function (req, res){
		res.render('index');
	})

	app.get('/login', function (req, res){
		res.render('login', {title: 'Login'});
	})

	app.get('/signup', function (req, res){
		console.log(req.body);
		res.render('signup', {title: 'Sign Up'});
	})

	app.get('/prof/:current_user', function (req, res){
		console.log('going to prof', req.params);
		chat.getUser(req, res);
		// res.render('profile');
	})

	app.get('/admin/:current_user', function (req, res){
		console.log('wreck', req.params)
		chat.check_admin(req, res);
		// res.render('prof', {current_user:req.params.current_user});
	})

	app.get('/server/:current_user', function (req, res){
		console.log('back to chat', req.params);
		res.render('chat', {current_user: req.params.current_user});
	})

	app.post('/server/signup', function (req, res){
		console.log('here we are 1', req.files);
		chat.signup(req, res);
		console.log('look here', req.body.username);
	})

	app.post('/server/login', function (req, res){
		console.log('here we are 2', req.body);
		chat.login(req, res);
		// chat.check_block(req, res);
		console.log('current_user', req.body.username);
		// res.render('chat', {current_user: req.body.username});
	})

	app.post('/server/controllers/updateUser', function (req, res){
		console.log('updating a user', req.body);
		chat.updateUser(req, res);
	})

	app.get('/msgUser/:current_user/:other_user', function (req, res){
		console.log('going to 1v1', req.params);
		chat.sendDM(req, res);
	})

	app.get('/randos', function (req, res){
		console.log('adding censored words to the DB');
		chat.randos(req, res);
	})

	app.get('check_avail/:username', function (req, res){
		chat.check_name(req, res);
	})

	app.post('/server/block', function (req, res){
		console.log('bout to block these fools')
		chat.block(req, res)
		console.log('wreck', req.params);
		// res.render('chat');
	})

	app.get('/backtochat/:current_user', function (req, res){
		console.log('peep these params', req.params)
		res.render('chat', {current_user: req.params.current_user})
	})

	var messages = [];
	var dms = [];

	io.sockets.on('connection', function (socket){
		socket.on('get_chat', function (){
			console.log('socket getting chat');
			socket.emit('chat_history', messages)
		});
		
		socket.on('form_submit', function (message){
			console.log('trying to post message', message);
			messages.push(message);
			io.emit('new_message', message);
		})

		socket.on('get_dms', function (users){
			console.log('I will get the DMs between these two', users.sender, users.rec);
			chat.get_dms(users);
		})

		socket.on('dm_submit', function (dm){
			console.log('diem', dm);
			chat.log_dm(dm);
			io.emit('new_dm', dm);
		})
	})
}
