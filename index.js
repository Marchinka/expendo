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
	  	var cashFlowTypes = [
	        { id: 5, name: "Spesa", color: "warning" },
	        { id: 10, name: "Spese Mediche", color: "success"  },
	    ];

	    var pool =  mysql.createPool(databaseConfiguration);
		pool.getConnection(function(err, connection) {
			if (!connection) {
				throw new Error("Error during connection");
			}
			connection.query('SELECT id, name, colorCode FROM CashFlowType', function(err, result, fields) {
    			console.log(result);
    			res.send(result);
			});
		  	connection.release();
		});
	});

app.route('/CashFlow')
	.put(function(req, res) {
		console.log(req.body);
	    res.send(req.body);
	});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
