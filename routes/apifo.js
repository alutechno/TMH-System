var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        console.log('accessing middleware /apifo')
        console.log('Accessing:'+req.path)
        console.log('Headers:'+JSON.stringify(req.headers))
        if (req.path == '/authenticate'){
            //Handle menu reload by browser
            console.log('re-authenticate')
            console.log(req.body)
            req.username = req.body.username
            next();
        }
        else {
            //Handle button click
            console.log('authorization checking')
            if (req.headers['authorization']){
                try{
                    console.log(req.headers.authorization)
                    var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
                    console.log('authorization:'+JSON.stringify(user))
                    var sqlstr = 'select count(1) '+
                    'from user a, role_user b,role_menu c, menu d '+
                    'where a.id = b.user_id and b.role_id = c.role_id '+
                    'and c.menu_id = d.id '+
                    'and a.name = "'+user.username+'" '+
                    'and a.password = "'+user.password+'" '+
                    'and d.state = "'+req.headers.state+'"';

                    connection.query(sqlstr, function(err, rows, fields) {
                        console.log('middleware res:'+JSON.stringify(rows))
                        if (err){
                            res.status(500).send({error:'unavailable'})
                        }
                        else if(rows.length==0){
                            res.status(404).send({error:'failed authentication'})
                        }
                        else {
                            console.log('Success authenticate')
                            req.username = user.username
                            next();
                        }
                    });
                }
                catch(e){
                    console.log(e)
                    res.status(500).send({status:500,desc:'Invalid Access'})
                }

            }
            else{
                res.status(500).send({status:500,desc:'Forbidden'})
            }

        }
    });

    app.post('/authenticate_old', function (req, res) {
        /*
        Using Token Based authentication,
        https://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
        */
        console.log(req.body)
        //var sqlstr = 'SELECT name,password,token,role_id as roles from user where name="'+req.body.username+'" and password="'+req.body.password+'"';
        var sqlstr = 'select a.name as username, a.password, a.token, c.name as rolename, e.name as menuname, e.module, e.state, f.object, f.custom, a.default_module '+
        'from user a, role_user b, role c, role_menu d, menu e, menu_detail f,group_menu g,module h '+
        'where a.id = b.user_id '+
        'and b.role_id = c.id '+
        'and c.id = d.role_id '+
        'and d.menu_id = e.id '+
        'and d.menu_detail_id = f.id '+
        'and a.default_module = h.id '+
        'and e.group_id = g.id '+
        'and g.module_id = h.id ' +
        'and a.name="'+req.body.username+'" '+
        'and a.password="'+req.body.password+'" ';


        connection.query(sqlstr, function(err, rows, fields) {
            console.log(err)
            var obj = {
                isAuthenticated: false,
                data: {}
            };
            if (err) throw err;
            if (rows.length==0){
                res.send(obj)
            }
            else {
                obj.isAuthenticated = true;
                var arrMenu = [];
                var arrRoles = [];
                var arrObject = {};
                for (var i=0;i<rows.length;i++){
                    arrMenu.push(rows[i].state);
                    arrRoles.push(rows[i].rolename);
                    if (arrObject[rows[i].state]){
                        arrObject[rows[i].state].push(rows[i].object)
                    }
                    else {
                        arrObject[rows[i].state] = [rows[i].object]
                    }

                }

                obj.data = rows[0]
                obj.data['roles'] = arrRoles.filter(onlyUnique);
                obj.data['menu'] = arrMenu.filter(onlyUnique);
                obj.data['object'] = arrObject;
                console.log(obj)
                res.send(obj)
            }

        });

    });

    app.post('/authorize', function (req, res) {
        var where = ''
        console.log(req.body)
        var sqlstr = 'select group_concat(object) as object from menu a, menu_detail b '+
        'where a.id = b.menu_id '+
        'and a.state = "'+req.body.state+'"';
        connection.query(sqlstr, function(err, rows, fields) {
            if (err) throw err;
            if (rows.length>0){
                res.send(rows.length==0?[]:rows[0].object.split(','))
            }
            else{
                res.send([])
            }
        });
    });

    app.post('/authenticate', function (req, res) {
        /*
        Using Token Based authentication,
        https://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
        */
        console.log(req.body)
        //var sqlstr = 'SELECT name,password,token,role_id as roles from user where name="'+req.body.username+'" and password="'+req.body.password+'"';
        var sqlstr = 'select a.name as username, a.password, a.token, g.name as gname, e.l1 as menuname, e.l2 as submenuname, h.name as module, e.l2state, '+
        'group_concat(f.object), f.custom, i.name as default_module, e.l2id,j.name as default_menu, j.state as default_state '+
        'from user a, role_user b, role c, role_menu d, '+
        '(SELECT t1.group_id,t1.name AS l1, t2.name as l2, t1.state as l1state, t2.state as l2state, t2.id as l2id,t2.sequence '+
        'FROM menu AS t1 '+
        'LEFT JOIN menu AS t2 ON t2.parent = t1.id '+
        'where t2.name is not null '+
        'order by t1.group_id, t1.id) e, menu_detail f,group_menu g,module h,module i,menu j '+
        'where a.id = b.user_id  '+
        //'and b.role_id = c.id  '+
        'and b.role_id = d.role_id  '+
        'and d.menu_id = e.l2id  '+
        'and d.menu_detail_id = f.id  '+
        //'and a.default_module = h.id  '+
        'and e.group_id = g.id  '+
        'and g.module_id = h.id  '+
        'and a.default_module = i.id '+
        'and a.default_menu = j.id '+
        'and a.name="'+req.username+'" '+
        'group by submenuname '+
        'order by menuname,e.sequence, submenuname ';

        //'and a.password="'+req.body.password+'" ';
        console.log(sqlstr)


        connection.query(sqlstr, function(err, rows, fields) {
            console.log(err)
            //console.log(rows)
            var obj = {
                isAuthenticated: false,
                data: {}
            };
            if (err) throw err;
            if (rows.length==0){
                res.send(obj)
            }
            else {
                obj.isAuthenticated = true;
                objModule = {}
                obj.data['menu'] = [];
                for (var i=0;i<rows.length;i++){
                    obj.data['menu'].push(rows[i].l2state)
                    if (objModule[rows[i].module]){
                        if (objModule[rows[i].module][rows[i].gname]){
                            if (objModule[rows[i].module][rows[i].gname][rows[i].menuname]){
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                    name: rows[i].submenuname,
                                    state: rows[i].l2state
                                }
                            }
                            else {
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                    name: rows[i].submenuname,
                                    state: rows[i].l2state
                                }
                            }
                        }
                        else {
                            objModule[rows[i].module][rows[i].gname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                name: rows[i].submenuname,
                                state: rows[i].l2state
                            }

                        }

                    }
                    else {
                        objModule[rows[i].module] = {}
                        objModule[rows[i].module][rows[i].gname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                            name: rows[i].submenuname,
                            state: rows[i].l2state
                        }
                    }
                }
                console.log(JSON.stringify(objModule,null,2))
                obj.data['token'] = rows[0].token;
                obj.data['default_module'] = rows[0].default_module;
                obj.data['default_menu'] = {
                    name:rows[0].default_menu,
                    state: rows[0].default_state
                };
                obj.data['module'] = objModule;

                res.send(obj)
            }

        });

    });

    app.get('/getCustomers', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' and a.id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name="'+req.query.customSearch + '" '
        }



        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active'+
            ' from customer where customer_is_customer = 1 '+where

        console.log(sqlstr)

        connection.query('select count(1) as cnt from('+sqlstr+') a', function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection.query(sqlstr + order + limit, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getCustomer', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where customer_id='+req.query.id
        }
        var sqlstr = 'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active,'+
            ' customer_is_customer as isCustomer, customer_is_supplier as isSupplier '+
            ' from customer where customer_is_customer = 1 '+where
        connection.query(sqlstr, function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createCustomer', function(req,res){
        console.log(req.body);
        'select customer_id as code, customer_name as name, customer_type as type, customer_address as address, customer_city as city, '+
            ' customer_postal_code as postal, customer_state as state, customer_country as country, customer_website as website, customer_phone as phone, '+
            ' customer_mobile as mobile, customer_fax as fax, customer_email as email, customer_tax_id as tax, customer_active as active'
        var sqlstr = 'insert into customer SET ?'
        var sqlparam = {
            customer_id:req.body.code,
            customer_name:req.body.name,
            customer_type:req.body.type,
            customer_address: req.body.address,
            customer_city: req.body.city,
            customer_postal_code: req.body.postal,
            customer_state: req.body.state,
            customer_country: req.body.country,
            customer_website: req.body.website,
            customer_phone: req.body.phone,
            customer_mobile: req.body.mobile,
            customer_fax: req.body.fax,
            customer_email: req.body.email,
            customer_tax_id: req.body.tax,
            customer_active: req.body.active,
            customer_is_customer: req.body.isCustomer,
            customer_is_supplier: req.body.isSupplier
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
            console.log(err)
            console.log(result)
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/updateCustomer', function(req,res){
        console.log(req.body);
        var sqlstr = 'update customer SET ? WHERE customer_id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            customer_name:req.body.name,
            customer_type:req.body.type,
            customer_address: req.body.address,
            customer_city: req.body.city,
            customer_postal_code: req.body.postal,
            customer_state: req.body.state,
            customer_country: req.body.country,
            customer_website: req.body.website,
            customer_phone: req.body.phone,
            customer_mobile: req.body.mobile,
            customer_fax: req.body.fax,
            customer_email: req.body.email,
            customer_tax_id: req.body.tax,
            customer_active: req.body.active,
            customer_is_customer: req.body.isCustomer,
            customer_is_supplier: req.body.isSupplier
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteCustomer', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from customer where customer_id="'+req.body.id+'"'
        console.log(sqlstr)

        connection.query(sqlstr,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    return app;

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
