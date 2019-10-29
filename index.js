const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var mysql =  require('mysql');
var databaseConfiguration = {
	host: 'hngomrlb3vfq3jcr.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
	port:  3306,
	user: 'cngf7tvxf2nfnmhl',
	password: 'gxz6kp3y1m6dp6pz',
	database: 'e7kypndzmgmdmvxt'
};

var app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
app.get('/cashflowlist', (req, res) => res.render('pages/cashflowlist'));

var pool =  mysql.createPool(databaseConfiguration);

var getUserId = function(connection, username, callback) {
	var noUserId = -10;
	if (!username) {
		callback(noUserId);
	}
	connection.query('SELECT id FROM User WHERE Username = ?', username, function(err, result, fields) {
		if(err) {
			console.error("No userid for " + username);
			console.error(err);
		} else {
			console.log(JSON.stringify(result));
			if(result) {
				if (result.length > 0) {
					var userId = result[0].id;
					callback(userId);
				} else {
					console.error("No userid for " + username);
					callback(noUserId);
				}
			} else {
				console.error("No userid for " + username);
				callback(noUserId);
			}
		}
	});
};

app.route('/CashFlowTypes')
	.get(function(req, res) {
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!: ' + err);
				return;
			}
			var username = req.query.username;
			getUserId(connection, username, function(userId) {
				connection.query('SELECT id, name, colorCode FROM CashFlowTypeView WHERE UserId = ?', [userId], function(err, result, fields) {
					if(err) {
						console.error(err);
					}
					connection.release();
					res.send(result);
				});
			});
		});
	});

app.route('/CashFlow')
	.get(function(req, res) {
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!: ' + err);
				return;
			}

			var year = parseFloat(req.query.year);
			var month = parseFloat(req.query.month);
			var username = req.query.username;
			getUserId(connection, username, function (userId) {
				connection.query('SELECT * FROM CashFlowView WHERE UserId = ? AND Month = ? AND Year = ? ORDER BY Id DESC', [userId, month, year], function(err, result, fields) {
					connection.release();
					res.send({
						cashFlows: result
					});
				});
			});
		});
	})
	.put(function(req, res) {
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!: ' + err);
				return;
			}

			var username = req.body.username;
			getUserId(connection, username, function(userId) {
				var sqlParameters = [
					req.body.amount || 0,
					req.body.cashFlowTypeId,
					req.body.notes || '',
					req.body.date,
					userId
				];

				connection.query('CALL InsertCashFlow(?, ?, ?, ?, ?)', sqlParameters, function(err, result, fields) {
					console.log(err);
					connection.release();
					res.send({
						isSuccessfull: true //result.affectedRows == 1
					});
				});
			});
		});
	});

app.route('/CashFlowSum')
	.get(function(req, res) {
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!: ' + err);
				return;
			}

			var year = parseFloat(req.query.year);
			var month = parseFloat(req.query.month);
			
			var username = req.query.username;
			getUserId(connection, username, function(userId) {
				connection.query('SELECT * FROM CashFlowSumView WHERE UserId = ? AND Month = ? AND Year = ? ORDER BY Amount DESC', [userId, month, year], function(err, result, fields) {
					connection.release();
					res.send({
						cashFlows: result
					});
				});
			});
		});
	});

app.route('/CashFlowHistory')
	.get(function(req, res) {
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!: ' + err);
				return;
			}

			var year = parseFloat(req.query.year);
			var username = req.query.username;
			getUserId(connection, username, function(userId) {
				connection.query('SELECT * FROM CashFlowSumView WHERE UserId = ? and Year = ? order by Month, CashFlowType', [userId, year], function(err, result, fields) {
					connection.release();
					res.send({
						cashFlows: result
					});
				});
			});
		});
	});
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
