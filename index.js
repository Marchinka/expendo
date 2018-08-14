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


app.route('/CashFlowTypes')
	.get(function(req, res) {
	    var pool =  mysql.createPool(databaseConfiguration);
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!');
				return;
			}
			connection.query('SELECT id, name, colorCode FROM CashFlowType', function(err, result, fields) {
    			res.send(result);
			});
		  	connection.release();
		});
	});

app.route('/CashFlow')
	.get(function(req, res) {
	    var pool =  mysql.createPool(databaseConfiguration);
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!');
				return;
			}
			connection.query('SELECT * FROM CashFlowView ORDER BY Id DESC', function(err, result, fields) {
    			res.send(result);
			});
		  	connection.release();
		});
	})
	// .delete(function(req, res) {
	//     var pool =  mysql.createPool(databaseConfiguration);
	// 	pool.getConnection(function(err, connection) {
	// 		if (!connection) {
	// 			throw new Error("Error during connection");
	// 		}
	// 		connection.query('DELETE * FROM CashFlowV WHERE Id = ?', req.params.id, function(err, result, fields) {
 //    			res.send(result);
	// 		});
	// 	  	connection.release();
	// 	});
	// })
	.put(function(req, res) {
	    var pool =  mysql.createPool(databaseConfiguration);
		pool.getConnection(function(err, connection) {
			if (!connection) {
				res.status(500).send('Something broke!');
				return;
			}

			var sqlParameters = [
				req.body.amount || 0,
				req.body.cashFlowTypeId,
				req.body.notes || '',
				req.body.date
			];
			connection.query('CALL InsertCashFlow(?, ?, ?, ?)', sqlParameters, function(err, result, fields) {
    			res.send({
    				isSuccessfull: result.affectedRows == 1
    			});
			});
		  	connection.release();
		});
	});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
