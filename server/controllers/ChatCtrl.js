var url = require('url');
var fs = require('fs');
var chance = require('chance');
var mysql = require('mysql');
var pool = mysql.createPool({
      connectionLimit   :   100,
      host              :   'aa1rcnh0aalweks.cvvfzwlsz1zy.us-west-2.rds.amazonaws.com',
      user              :   'rsbensaid',
      password          :   'password',
      database          :   'ebdb',
      port				:   '3306',
      debug             :   true
});

exports.signup = function (req, res){
	console.log('req', req.body);
	var check_username = "SELECT * FROM `users` WHERE `username` = '"+req.body.username+"'";
	pool.getConnection(function (err, connection){
		if(err)
		{
			console.log('error');
			connection.release();
			return;
		}
		connection.query(check_username, function(err, rows){
			connection.release();
			if(rows.length > 0){
				console.log('Functioning', rows);
				res.render('taken', {username: req.body.username});
			}
			else{
				var insert_query = "INSERT INTO `users` (`username`, `password`, `avatar`, `color`, `admin`, `blocked`, `created_at`, `updated_at`) VALUES('"+req.body.username+"', '"+req.body.password+"' , '"+req.body.avatar+"', '"+req.body.color+"', 0, 0, NOW(), NOW())";
				pool.getConnection(function (err, connection){
					if(err)
					{
						console.log('error');
						connection.release();
						return;
					}
					connection.query(insert_query, function(err, rows){
						connection.release();
						if(!err){
							console.log('Functioning');
							res.render('chat', {current_user: req.body.username})

						}
						else{
							console.log(err);
						}
					});
				});
			}
		});
	});
}

exports.getUser = function(req, res){
	console.log('hellluuuuu', req.params.current_user);
	var select_query = "SELECT * FROM `users` WHERE username = '"+req.params.current_user+"'";
	pool.getConnection(function(err, connection){
		if(err)
		{
			console.log('Error', err);
			connection.release();
			return;
		}
		connection.query(select_query, function(err, rows){
			connection.release();
			if(!err){
				console.log('ROWS', rows)
				res.render('profile', {user_profile: rows});
			}
		})
	})
}

exports.updateUser = function(req, res){
	console.log('hai', req.body);
	var update_query = "UPDATE `users` SET `username`='"+req.body.username+"', `password`='"+req.body.password+"', `color`='"+req.body.color+"', `avatar`='"+req.body.avatar+"' WHERE `id` ='"+req.body.id+"'";
	pool.getConnection(function(err, connection){
		if(err)
		{
			console.log('Error', err);
			connection.release();
			return;
		}
		connection.query(update_query, function(err, rows){
			connection.release();
			if(!err){
				res.render('chat', {current_user: req.body.username})
			}
		})
	})
}

exports.sendDM = function(req, res){
	console.log('we ouchea');
	console.log(req.params);
	var users_query = "SELECT * FROM `users` WHERE `username` = '"+req.params.current_user+"' OR `username` = '"+req.params.other_user+"'" ;
	if(req.params.other_user == req.params.current_user){
		res.render('login')
	}
	else{
		var sender = null;
		var dms_query = null;
		pool.getConnection(function(err, connection){
			if(err)
			{
				console.log('Error', err);
				connection.release();
				return;
			}
			connection.query(users_query, function(err, rows){
				// connection.release();
				var users = null;
				if(!err){
					sender = rows;
					console.log('here are my users', rows);
					var current_user = null;
					var other_user = null;
					if(rows[0].username == req.params.current_user){
						console.log('gettin in the if')
						current_user = rows[0];
						other_user = rows[1];
					}
					else{
						current_user = rows[1];
						other_user = rows[0];
					}
					users = [current_user, other_user];
					console.log('luuuuuk', users);
					// res.render('msgUser', {users: users});
					// dms_query = "SELECT * FROM `dms` WHERE `sender_id` = "+users[0].id+" OR "+users[1].id+" AND `rec_id` = "+users[0].id+" OR "+users[1].id+"";
					joined_query = 'SELECT dms.sender_id, dms.id, dms.rec_id, dms.dm_text, dms.created_at, users.username, users.id FROM dms INNER JOIN users on dms.sender_id = users.id WHERE dms.sender_id IN ('+rows[0].id+','+rows[1].id+') AND dms.rec_id IN ('+rows[0].id+','+rows[1].id+') ORDER BY dms.created_at ASC';
					console.log('here is the dms query', dms_query);
					connection.query(joined_query, function(err, rows){
						if(!err){
							console.log('here are the dms', rows);
							// console.log('look here', dm_sender);
							// console.log('now ere', rows);
							// console.log('messages', messages);
							console.log('users', users);
							res.render('msgUser', {users: users, mensajes: rows});
						}
					})
				}
			});
		})
	}
};

exports.log_dm = function(dm){
	console.log('loggin dis dm', dm);
	var select_query = "SELECT * FROM `users` WHERE `username` = '"+dm.sender+"' OR `username` = '"+dm.rec+"'";
	pool.getConnection(function(err, connection){
		if(err)
		{
			console.log('Error', err);
			connection.release();
			return;
		}
		connection.query(select_query, function(err, rows){
			if(!err){
				console.log('getting users', rows);
				if(rows[0].username == dm.sender){
					var sender_id = rows[0].id;
					var rec_id = rows[1].id;
					}
				else{
					var sender_id = rows[1].id;
					var rec_id = rows[0].id;
				}
				var insert_query = 'INSERT INTO `dms` (`sender_id`, `rec_id`, `dm_text`, `created_at`, `updated_at`) VALUES ('+sender_id+', '+rec_id+', "'+dm.dm_text+'", NOW(), NOW())';
				console.log('insert_query', insert_query);
				connection.query(insert_query, function(err, rows){
					if(!err){
						console.log('added dm', rows)
					}
					else{
						console.log('could not add dm', err)
					}
				})
			}
			else{
				console.log('something went wrong', err);
			}
		});
	});
}

exports.randos = function(req, res){
	var words = [];
	for(i=0; i < 20000; i++){
		var censor = new chance();
		var word = censor.word();
		// console.log('the word is', word)
		var queries = [];
		var insert_query = "INSERT INTO `c_words` (`word`) VALUES ('"+word+"')";
		console.log(insert_query);
		pool.getConnection(function(err, connection){
			if(err)
			{
				console.log('Error', err);
				connection.release();
				return;
			}
			connection.query(insert_query, function(err, rows){
				// connection.release();
				if(!err){
					// console.log('Functioning');
					// res.json('added');
				}
				else{
					console.log(err);
				}
			});
		})
	}
	// console.log(words);
	// for(i=0; i < words.length; i++){
	// 	console.log('the new word is ', words[i]);
	// 	console.log('query this', insert_query);
		
	// }
}

exports.login = function(req, res){
	// console.log('req', req);
	// console.log('res', res);
	var select_query = "SELECT * FROM `users` WHERE username = '"+req.body.username+"' AND password = '"+req.body.password+"'";
	pool.getConnection(function(err, connection){
		if(err)
		{
			console.log('Error:', err);
			connection.release();
			return;
		}
		connection.query(select_query, function(err, rows){
			connection.release();
			if(rows[0]){
				console.log('ROWS', rows)
				// res.json(rows);
				if(rows[0].blocked != 0)
				{
					res.render('timeout', {current_user:rows[0].username})
				}
				else
				{
					res.render('chat', {current_user:rows[0].username})
				}
				
			}
			else{
				console.log('no match');
				res.render('login_error');
			}
		})
	});
}

exports.check_block = function(req,res){
	console.log('checking if this guys blocked', req.body);
	var blocked_query = "SELECT * FROM `users` WHERE username = '"+req.body.username+"'";
	pool.getConnection(function(err, connection){
		if(err)
		{
			console.log('Error', err);
			connection.release();
			return;
		}
		connection.query(blocked_query, function(err, rows){
			console.log('rows', rows)
			if(rows[0].blocked != 0){
				res.render('timeout', {current_user:rows[0].username});
			}
			else{
				res.render('chat', {current_user:rows[0].username});
			}
		})
	})
}

exports.check_admin = function(req, res){
	console.log('aqui', req.params);
	var admin_query = "SELECT * FROM `users` WHERE username = '"+req.params.current_user+"'";
	pool.getConnection(function(err, connection){
		if(err)
		{
			console.log('Error', err);
			connection.release();
			return;
		}
		connection.query(admin_query, function(err, rows){
			if(rows[0].admin != 1){
				res.render('chat', {current_user: req.params.current_user})
			}
			if(rows[0].admin == 1){
				var users_query = "SELECT * FROM `users` WHERE admin != 1";
				connection.query(users_query, function(err, rows){
					console.log('rows', rows);
					// res.send(rows);
					// res.send({users:rows});
					res.render('admin', {users:rows});
				})
			}
		})
	})
}

exports.block = function(req, res){
	console.log('blocking', req.body)
	console.log('HEEEEERE', req.body.user.length);
	if(typeof(req.body.user)=='object'){
		for(var i = 0; i < req.body.user.length; i++){
			if(req.body.forever)
				{
					console.log('they are gone forever');
					var delete_query = "DELETE FROM `users` WHERE `username` = '"+req.body.user[i]+"'"
					pool.getConnection(function(err, connection){
					if(err)
					{
						console.log('Error', err);
						connection.release();
						return;
					}
					connection.query(delete_query, function(err, rows){
						if(err)
						{
							console.log('Error', err);
							connection.release();
						}
						else
						{
							console.log('Delete successful');
							connection.release();
							res.render('index')

						}
					})
				})
				}
			else
			{
				var ms_to_block = req.body.hours*3600000 + req.body.mins*60000;
				console.log('they are getting blocked for', ms_to_block);
				var block_query = "UPDATE `users` SET `blocked`= 1 WHERE `username` ='"+req.body.user[i]+"'";
				pool.getConnection(function(err, connection){
					if(err)
					{
						console.log('Error', err);
						connection.release();
						return;
					}
					connection.query(block_query, function(err, rows){
						if(err)
						{
							console.log('Error', err);
							connection.release();
						}
						else
						{
							console.log('Blocking successful');
							connection.release();
							res.render('index')
						}
					})
				})
				var to_be_blocked = req.body.user[i];
				setInterval(function (to_be_blocked)
					{
						console.log('someone is getting unblocked');
						var unblock_query = "UPDATE `users` SET `blocked` = 0 WHERE `username` = '"+to_be_blocked+"'";
						pool.getConnection(function(err, connection){
							if(err)
							{
								console.log('Error', err);
								connection.release();
								return;
							}
							connection.query(unblock_query, function(err, rows){
								if(err)
								{
									console.log('Error', err);
									connection.release();
								}
								else
								{
									console.log('Unblocking successful');
									connection.release();
									return;

								}
							})
						})
					}
				,ms_to_block)
			}
		}
	}
	else{
		if(req.body.forever)
			{
				console.log('someone is gone forever');
				var delete_query = "DELETE FROM `users` WHERE `username` = '"+req.body.user+"'"
				pool.getConnection(function(err, connection){
				if(err)
				{
					console.log('Error', err);
					connection.release();
					return;
				}
				connection.query(delete_query, function(err, rows){
					if(err)
					{
						console.log('Error', err);
						connection.release();
					}
					else
					{
						console.log('Delete successful');
						connection.release();
						res.render('index')
					}
				})
			})
			}
		else
		{
			var ms_to_block = req.body.hours*3600000 + req.body.mins*60000;
			console.log('someone is getting blocked for', ms_to_block);
			var block_query = "UPDATE `users` SET `blocked`= 1 WHERE `username` ='"+req.body.user+"'";
			pool.getConnection(function(err, connection){
				if(err)
				{
					console.log('Error', err);
					connection.release();
					return;
				}
				connection.query(block_query, function(err, rows){
					if(err)
					{
						console.log('Error', err);
						connection.release();
					}
					else
					{
						console.log('Blocking successful');
						connection.release();
						res.render('index')
					}
				})
			})
			var to_be_blocked = req.body.user;
			setInterval(function (to_be_blocked)
				{
					console.log('someone is getting unblocked');
					var unblock_query = "UPDATE `users` SET `blocked` = 0 WHERE `username` = '"+to_be_blocked+"'";
					pool.getConnection(function(err, connection){
						if(err)
						{
							console.log('Error', err);
							connection.release();
							return;
						}
						connection.query(unblock_query, function(err, rows){
							if(err)
							{
								console.log('Error', err);
								connection.release();
							}
							else
							{
								console.log('Unblocking successful');
								connection.release();
								return;
							}
						})
					})
				}
			,ms_to_block)
		}
	}
}



