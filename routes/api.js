var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        console.log('accessing middleware')
        console.log('Accessing:'+req.path)
        console.log('Headers:'+JSON.stringify(req.headers))
        if (req.path == 'authenticate'){
            //Handle menu reload by browser
            console.log('re-authenticate')
            next();
        }
        else {
            //Handle button click
            console.log('authorization checking')
            var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
            console.log('authorization:'+JSON.stringify(user))
            var sqlstr = 'select count(1) '+
            'from user a, role_user b,role_menu c, menu d '+
            'where a.id = b.user_id and b.role_id = c.role_id '+
            'and c.menu_id = d.id '+
            'and a.name = "'+user.username+'" '+
            'and a.password = "'+user.password+'" '+
            'and d.state = "'+req.headers.state+'"';
            /*var sqlstr = 'select a.name as username, a.password, a.token, c.name as rolename, e.name as menuname, e.module, e.state, f.object, f.custom '+
            'from user a, role_user b, role c, role_menu d, menu e, menu_detail f '+
            'where a.id = b.user_id '+
            'and b.role_id = c.id '+
            'and c.id = d.role_id '+
            'and d.menu_id = e.id '+
            'and d.menu_detail_id = f.id '+
            'and a.name="'+user.username+'" '+
            'and a.password="'+user.password+'" ';*/

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
        console.log(req.query)
        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var order = '';
        var sqlstr = 'select a.password,a.name as username, full_name as fullname, GROUP_CONCAT(b.name) as roles, a.id , GROUP_CONCAT(b.id) as rolesid '+
        'from user a, role b, role_user c '+
        'where a.id = c.user_id '+
        'and b.id = c.role_id '+ where +
        ' group by a.name '+ order
        console.log(sqlstr)
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
        var sqlstr = 'select c.name as module,c.description as module_desc,b.name as group_name, a.id, a.parent as parent_id,d.name as parent,a.name, a.state, b.id as group_id,c.id as module_id, a.sequence '+
        'from menu a, group_menu b, module c, menu d '+
        'where a.group_id = b.id '+
        'and b.module_id = c.id '+
        'and a.parent = d.id '+
        'order by parent,sequence';
        connection.query(sqlstr, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows)
            dtParam['data'] = rows
            res.send(dtParam)
        });
    });

    app.get('/getMenu', function (req, res) {
        //Handle Request For Selected Records
        console.log('get menu coy')
        console.log(req.query)
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        if (req.query.groupId){
            where = ' where group_id='+req.query.groupId
        }
        //where = (req.query.groupId?' where group_id='+req.query.groupId:'');
        //where = (req.query.parentId?' where parent='+req.query.parentId:'');
        console.log(where)
        connection.query('SELECT id,name,state,module,parent,url from menu'+where, function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.post('/createMenu', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into menu SET ?'
        var sqlparam = {
            parent: (req.body.parent?req.body.parent:0),
            name:req.body.menu,
            url: null,
            state: req.body.state,
            group_id: req.body.group,
            sequence: parseInt(req.body.sequence)
        }
        console.log(sqlstr)
        console.log(sqlparam)

        connection.query(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;
            console.log('Success Insert with IDs:'+result.insertId);
        });

        res.send({status:'200'})
    })

    app.post('/updateMenu', function(req,res){
        console.log('updateMenu')
        console.log(req.body);
        var sqlstr = 'update menu SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            parent: (req.body.parent_id?req.body.parent_id:0),
            name:req.body.menu,
            url: null,
            state: req.body.state,
            group_id: req.body.group_id,
            sequence: parseInt(req.body.sequence)
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

    app.get('/getRoleMenus2', function (req, res) {
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

    app.get('/getRoleMenus', function (req, res) {
        //Handle Request From Angular DataTables
        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var whereModule = req.query.module?' and c.id = '+req.query.module:'';
        var sqlstr = 'select a.*,b.label,b.menu_detail_id,GROUP_CONCAT(b.role_id) as roles from ( '+
        'select a.id, a.parent as parent_id,d.name as parent,a.name, a.state, b.id as group_id,b.name as group_name, c.id as module_id,c.name as module , a.sequence '+
        'from menu a, group_menu b, module c, menu d '+
        'where a.group_id = b.id '+
        'and b.module_id = c.id '+
        ' and a.parent = d.id '+whereModule+
        ' order by parent, sequence '+
        ') a LEFT OUTER JOIN  '+
        '( '+
        'select a.*,b.label '+
        'from role_menu a,menu_detail b '+
        'where a.menu_detail_id = b.id) b '+
        'ON a.id = b.menu_id '+
        'group by a.id,b.menu_detail_id'
        console.log(sqlstr)
        connection.query(sqlstr, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows)
            var resObj = {}
            for (var i=0;i<rows.length;i++){
                if (!resObj.hasOwnProperty(rows[i].id)){
                    resObj[rows[i].id] = {
                        id: rows[i].id,
                        parent_id: rows[i].parent_id,
                        parent: rows[i].parent,
                        name: rows[i].name,
                        state: rows[i].state,
                        group_id: rows[i].group_id,
                        group_name: rows[i].group_name,
                        module_id: rows[i].module_id,
                        module: rows[i].module,
                        detail: [{
                            sequence: rows[i].sequence,
                            label: rows[i].label,
                            menu_detail_id: rows[i].menu_detail_id,
                            roles: rows[i].roles
                        }]

                    }
                }
                else {
                    resObj[rows[i].id].detail.push({
                        sequence: rows[i].sequence,
                        label: rows[i].label,
                        menu_detail_id: rows[i].menu_detail_id,
                        roles: rows[i].roles
                    })
                }
            }
            //console.log(resObj)
            //console.log(JSON.stringify(rows))
            var result = []
            for (var key in resObj){
                result.push(resObj[key])
            }
            //console.log(JSON.stringify(result,null,2))
            dtParam['data'] = result
            res.send(dtParam)
        });
    });

    app.get('/getModule', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        console.log('asdasdasd')
        console.log(req.username)
        console.log(req.headers)
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select f.name, f.description '+
        'from user a, role_user b, role_menu c, menu d, group_menu e, module f '+
        'where a.id = b.user_id '+
        'and b.role_id = c.role_id '+
        'and c.menu_id = d.id '+
        'and d.group_id = e.id '+
        'and e.module_id = f.id '+
        'and a.name = "'+req.username+ '" '+
        'group by name, description'
        connection.query(sqlstr, function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.get('/getMenuModule', function (req, res) {
        //Handle Request For Selected Records
        var where = '';

        connection.query('SELECT id,name,description from module', function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });
    app.get('/getMenuGroup', function (req, res) {
        //Handle Request For Selected Records
        var where = ' where module_id = '+req.query.id;

        connection.query('SELECT id,name from group_menu'+where, function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.post('/assignMenu', function(req,res){
        console.log(req.body);
        var sqlstr = 'select id from menu where group_id in('+req.body.group.toString()+') '
        console.log(sqlstr)
        var listMenu = []
        connection.query(sqlstr,function(err, rows,field) {
            if (err) throw err;
            for (var i=0;i<rows.length;i++){
                listMenu.push(rows[i].id)
            }
            console.log('selectData:'+listMenu.toString())
            var sqlDelete = 'delete from role_menu where role_id = '+req.body.role+' AND menu_id in('+listMenu.toString()+')'
            connection.query(sqlDelete,function(err2, result2) {
                if (err2) throw err2;
                console.log('delete:'+JSON.stringify(result2))
                var sqlInsert = "INSERT INTO role_menu (role_id, menu_id, menu_detail_id) VALUES ?";

                connection.query(sqlInsert,[req.body.insert],function(err3, result3) {
                    if (err3) throw err3;
                    console.log('insert:'+JSON.stringify(result3))
                });
            });
        });
        res.send({status:'200'})
    })

    return app;

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
