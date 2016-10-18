var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        console.log('Accessing:'+req.path)
        console.log('Headers:'+JSON.stringify(req.headers))
        if (req.path == 'authenticate'){
            //Handle menu reload by browser
            next();
        }
        else {
            //Handle button click
            var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
            console.log('authorization:'+JSON.stringify(user))
            var sqlstr = 'select a.name as username, a.password, a.token, c.name as rolename, e.name as menuname, e.module, e.state, f.object, f.custom '+
                'from user a, role_user b, role c, role_menu d, menu e, menu_detail f '+
                'where a.id = b.user_id '+
                'and b.role_id = c.id '+
                'and c.id = d.role_id '+
                'and d.menu_id = e.id '+
                'and d.menu_detail_id = f.id '+
                'and a.name="'+user.username+'" '+
                'and a.password="'+user.password+'" ';

            connection.query(sqlstr, function(err, rows, fields) {
                if (err){
                    res.status(500).send({error:'unavailable'})
                }
                else if(rows.length==0){
                    res.status(404).send({error:'failed authentication'})
                }
                else {
                    console.log('Success authenticate')
                    next();
                }
            });
        }
    });

    app.post('/authenticate', function (req, res) {
        /*
        Using Token Based authentication,
        https://code.tutsplus.com/tutorials/token-based-authentication-with-angularjs-nodejs--cms-22543
        */
        console.log(req.body)
        //var sqlstr = 'SELECT name,password,token,role_id as roles from user where name="'+req.body.username+'" and password="'+req.body.password+'"';
        var sqlstr = 'select a.name as username, a.password, a.token, c.name as rolename, e.name as menuname, e.module, e.state, f.object, f.custom '+
            'from user a, role_user b, role c, role_menu d, menu e, menu_detail f '+
            'where a.id = b.user_id '+
            'and b.role_id = c.id '+
            'and c.id = d.role_id '+
            'and d.menu_id = e.id '+
            'and d.menu_detail_id = f.id '+
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

    app.get('/getRoles', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)
        var dtParam = req.query
        var where = '';
        if (req.query.id){
           where = ' where id='+req.query.id
        }
        connection.query('SELECT id,name from role'+where, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows)
            dtParam['data'] = rows
            res.send(dtParam)
        });
    });

    app.get('/getRole', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
           where = ' where id='+req.query.id
        }
        connection.query('SELECT id,name from role'+where, function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.post('/createRole', function(req,res){
    	console.log(req.body);
        var sqlstr = 'insert into role SET ?'
        var sqlparam = {
           name:req.body.name
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
           if (err) throw err;
           console.log('Success Insert with IDs:'+result.insertId);
        });

        res.send({status:'200'})
    })

    app.post('/updateRole', function(req,res){
    	console.log(req.body);
        var sqlstr = 'update role SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
           name:req.body.name
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
           if (err) throw err;
        });
        res.send({status:'200'})
    })

    app.post('/deleteRole', function(req,res){
    	console.log(req.body);
        var sqlstr = 'delete from role where id='+req.body.id
        console.log(sqlstr)

        connection.query(sqlstr,function(err, result) {
           if (err) throw err;
           console.log('Success Delete with Results:'+JSON.stringify(result));
        });
        res.send({status:'200'})
    });

    app.get('/getUsers', function (req, res) {
       //res.send('Hello World!');
       console.log(req.path)
       console.log(req.headers)
       console.log(req.body)
       var dtParam = req.query
       var where = '';
       if (req.query.id){
          where = ' where id='+req.query.id
       }
       var order = '';
       var sqlstr = 'select a.password,a.name as username, full_name as fullname, GROUP_CONCAT(b.name) as roles, a.id , GROUP_CONCAT(b.id) as rolesid '+
           'from user a, role b, role_user c '+
           'where a.id = c.user_id '+
           'and b.id = c.role_id '+ where +
           'group by a.name '+ order
       connection.query(sqlstr, function(err, rows, fields) {
           if (err) throw err;
           console.log(rows)
           dtParam['data'] = rows
           res.send(dtParam)
       });
    });

    app.post('/createUser', function(req,res){
    	console.log(req.body);
       var sqlstr = 'insert into user SET ?'
    	console.log(sqlstr)
       var tokenuser = {username:req.body.username, password: req.body.password, roleid: req.body.roles};
       var sqlparam = {
           name:req.body.username,
           password: req.body.password,
           token: jwt.sign(tokenuser, 'smrai.inc'),
           full_name: req.body.fullname
       }

       connection.query(sqlstr, sqlparam,function(err, result) {
           if (err) throw err;

           console.log('Success Insert with IDs:'+result.insertId);
           var sqlstr2 = 'insert into role_user (role_id,user_id) VALUES ?'
           var sqlparam2 = []
           for (var i=0;i<req.body.roles.split(',').length;i++){
               sqlparam2.push([parseInt(req.body.roles.split(',')[i]),result.insertId])
           }
           console.log(sqlstr2)
           console.log(sqlparam2)
           connection.query(sqlstr2, [sqlparam2], function(err2) {
               console.log(err2)
               if (err2) throw err2;
           });
       });
    	res.send({status:'200'})
    })

    app.post('/updateUser', function(req,res){
    	console.log(req.body);
       var sqlstr = 'update user SET ? WHERE id=' +req.body.id
    	console.log(sqlstr)
       var tokenuser = {username:req.body.username, password: req.body.password, roleid: req.body.roles};
       var sqlparam = {
           name:req.body.username,
           password: req.body.password,
           token: jwt.sign(tokenuser, 'smrai.inc'),
           full_name: req.body.fullname
       }

       connection.query(sqlstr, sqlparam,function(err, result) {
           if (err) throw err;
           connection.query('delete from role_user where user_id='+req.body.id, function(err2) {
               console.log(err2)
               if (err2) throw err2;
               var sqlstr2 = 'insert into role_user (role_id,user_id) VALUES ?'
               var sqlparam2 = []
               for (var i=0;i<req.body.rolesid.split(',').length;i++){
                   sqlparam2.push([parseInt(req.body.rolesid.split(',')[i]),req.body.id])
               }
               console.log(req.body.rolesid)
               console.log(sqlstr2)
               console.log(sqlparam2)
               connection.query(sqlstr2, [sqlparam2], function(err3) {
                   console.log(err3)
                   if (err3) throw err3;
               });
           });
       });
    	res.send({status:'200'})
    })

    app.post('/deleteUser', function(req,res){
    	console.log(req.body);
       var sqlstr = 'delete from role_user where user_id='+req.body.id
    	console.log(sqlstr)

       connection.query(sqlstr,function(err, result) {
           if (err) throw err;

           console.log('Success Delete with Results:'+JSON.stringify(result));
           var sqlstr2 = 'delete from user where id='+req.body.id
           console.log(sqlstr2)
           connection.query(sqlstr2, function(errs,results) {
               console.log(errs)
               console.log('Success Delete2 with Results:'+JSON.stringify(results));
               if (errs) throw errs;
           });
       });
    	res.send({status:'200'})
    });

    app.get('/getMenus', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)
        var dtParam = req.query
        var where = '';
        if (req.query.id){
           where = ' where id='+req.query.id
        }
        connection.query('SELECT id,name,state,module from menu'+where, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows)
            dtParam['data'] = rows
            res.send(dtParam)
        });
    });

    app.get('/getMenu', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
           where = ' where id='+req.query.id
        }
        connection.query('SELECT id,name,state,module,parent,url from menu'+where, function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.post('/createMenu', function(req,res){
    	console.log(req.body);
        var sqlstr = 'insert into menu SET ?'
        var sqlparam = {
            parent: null,
            name:req.body.name,
            url: null,
            state: req.body.state,
            module: req.body.module
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
           if (err) throw err;
           console.log('Success Insert with IDs:'+result.insertId);
        });

        res.send({status:'200'})
    })

    app.post('/updateMenu', function(req,res){
    	console.log(req.body);
        var sqlstr = 'update menu SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            parent: null,
            name:req.body.name,
            url: null,
            state: req.body.state,
            module: req.body.module
        }

        connection.query(sqlstr, sqlparam,function(err, result) {
           if (err) throw err;
        });
        res.send({status:'200'})
    })

    app.post('/deleteMenu', function(req,res){
    	console.log(req.body);
        var sqlstr = 'delete from menu where id='+req.body.id
        console.log(sqlstr)

        connection.query(sqlstr,function(err, result) {
           if (err) throw err;
           console.log('Success Delete with Results:'+JSON.stringify(result));
        });
        res.send({status:'200'})
    });

    app.get('/getRoleMenus', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)
        var dtParam = req.query
        var where = '';
        if (req.query.id){
           where = ' where id='+req.query.id
        }
        var sqlstr = 'select a.id, a.name, a.module, b.menu_id, b.role_id '+
            'from menu a '+
            'LEFT JOIN role_menu b '+
            'ON a.id = b.menu_id '+
            'where a.module= "'+req.query.module + '" '
            'and b.role_id= '+req.query.role + ' '
            'group by a.id,a.name,a.module,b.menu_id,b.role_id'
        console.log(sqlstr)
        connection.query(sqlstr, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows)
            dtParam['data'] = rows
            res.send(dtParam)
        });
    });

    return app;

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
