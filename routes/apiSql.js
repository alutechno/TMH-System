var express = require('express');
module.exports = function(connection,connection2,jwt,log){
    var app = express.Router();

    app.use(function (req, res, next) {
        if (req.headers['authorization']){
            req.username = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
        }
        next();
    });

    app.get('/query', function (req, res) {
        log(req.headers,req.path,'query-request',JSON.stringify(req.query),JSON.stringify(req.body),'GET - Prepare query')
		connection(req.query.query, req.query.values,function(err, rows, fields) {
            log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify({err:err,rows:rows,fields:fields}))
            //res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
            res.send({err:err,rows:rows,fields:fields})
        });
    });
    app.post('/query', function (req, res) {
		//console.log(req.body)
        log(req.headers,req.path,'query-request',JSON.stringify(req.query),JSON.stringify(req.body),'POST - Prepare query')
		connection(req.body.query, req.body.values,function(err, rows, fields) {
            log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify({err:err,rows:rows,fields:fields}))
            res.send(JSON.stringify({err:err,rows:rows,fields:fields}))
        });
    });
    app.get('/datatable', function (req, res) {
        //Handle Request From Angular DataTables
        log(req.headers,req.path,'datatable-request',JSON.stringify(req.query),JSON.stringify(req.body),'GET - Prepare query')
        //console.log(req.headers)

        var dtParam = req.query
        var where = '';
        /*if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' where name="'+req.query.customSearch + '" '
        }*/

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr =req.query.query

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        log(req.headers,req.path,'query-response',JSON.stringify(req.query),JSON.stringify(req.body),JSON.stringify(dtParam))
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.post('/generatepo', function (req, res) {
		//console.log(req.body)
        console.log(req.body);
        generatePo(req.body.pr,req.body.items, function(err){
            console.log(err)
            if(err) res.send(err)
            else res.send()
        })
        //log(req.headers,req.path,'query-request',JSON.stringify(req.query),JSON.stringify(req.body),'POST - Prepare query')

    });

    function generatePo(pr,line_item,cb){
    	var sup={};
    	for(var i=0;i<line_item.length;i++){
    		if(sup[line_item[i].supplier_id]==undefined){
    			sup[line_item[i].supplier_id]=[line_item[i]]
    		}else{
    			sup[line_item[i].supplier_id].push(line_item[i])
    		}
    	}

    	var sql=''
    	var values=[]
    	var date=new Date();
    	date=date.getFullYear()+'-'+((date.getMonth() + 1)>9?(date.getMonth() + 1):'0'+(date.getMonth() + 1) )+ '-' + (date.getDate()>9?date.getDate():'0'+date.getDate())+'T'+(date.getHours()>9?date.getHours():'0'+date.getHours())+':'+(date.getMinutes()>9?date.getMinutes():'0'+date.getMinutes())+':'+(date.getSeconds()>9?date.getSeconds():'0'+date.getSeconds())
    	var sup_array=[]
    	var id,data,item;
    	for(var key in sup){
    		sup_array.push(sup[key]);
    	}
        connection2(function(err,connection){
            var _items=function(err, result) {
        		if (err) {
        			connection.rollback(function() {
        			  cb(err);
        			});
        		}else{
        			item=data.pop();
        			if(item!=undefined){
        				connection('INSERT INTO inv_po_line_item SET ?', {
        					po_id:id,
        					product_id:item.product_id,
        					order_qty:item.qty,
        					price:item.price,
        					amount:item.amount,
        					created_by:pr.user_id
        				}, _items);
        			}else{
        				data=sup_array.pop();
        				if(data!=undefined){
        					connection('INSERT INTO inv_purchase_order set ?',{
        						code:'PO-'+date+'-'+data[0].supplier_id,
        						pr_id:pr.id,
        						created_by:pr.user_id,
        						warehouse_id:pr.warehouse_id,
        						cost_center_id:pr.cost_center_id,
        						notes:pr.purchase_notes,
        						supplier_id:data[0].supplier_id/*,
        						payment_type:
        						due_days:*/
        						}, _sup)
        				}else{
        					connection.commit(function(err) {
        						if (err) {
        							connection.rollback(function() {
        								throw err;
        							});
        						}
        						console.log('Transaction Complete.');
        						connection.end();
        						cb()
        					});
        				}
        			}
        		}
        	}
        	var _sup= function(err, result) {
        		if (err) {
        		  connection.rollback(function() {
        			cb( err);
        		  });
        		}
        		else{
        			id = result.insertId;
        			item=data.pop();
        			if(item!=undefined){
        				connection.query('INSERT INTO inv_po_line_item SET ?', {
        					po_id:id,
        					product_id:item.product_id,
        					order_qty:item.qty,
        					price:item.price,
        					amount:item.amount,
        					created_by:pr.user_id
        				}, _items);
        			}else{
        				data=sup_array.pop();
        				if(data!=undefined){
        					connection.query('INSERT INTO inv_purchase_order set ?',{
        						code:'PO-'+date+'-'+key,
        						pr_id:pr.id,
        						created_by:pr.user_id,
        						warehouse_id:pr.warehouse_id,
        						cost_center_id:pr.cost_center_id,
        						notes:pr.purchase_notes,
        						supplier_id:pr.supplier_id/*,
        						payment_type:
        						due_days:*/
        						}, _sup)
        				}else{
        					connection.commit(function(err) {
        						if (err) {
        							connection.rollback(function() {
        								throw err;
        							});
        						}
        						console.log('Transaction Complete.');
        						connection.end();
        						cb()
        					});
        				}
        			}
        		}
        	};
        	connection.beginTransaction(function(err) {
        		if (err) { throw err; }
        		data=sup_array.pop();
        		console.log(data)
        		connection.query('INSERT INTO inv_purchase_order set ?',{
        			code:'PO-'+date+'-'+data[0].supplier_id,
        			pr_id:pr.id,
        			created_by:pr.user_id,
        			warehouse_id:pr.warehouse_id,
        			cost_center_id:pr.cost_center_id,
        			notes:pr.purchase_notes,
        			supplier_id:data[0].supplier_id/*,
        			payment_type:
        			due_days:*/
        			}, _sup)
        	});
        });
    }
    return app;
}
