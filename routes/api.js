var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        if (req.path == '/authenticate'){
            req.username = req.body.username
            next();
        }
        else {
            var user = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
            var sqlstr = 'select count(1) '+
            'from user a, role_user b,role_menu c, menu d '+
            'where a.id = b.user_id and b.role_id = c.role_id '+
            'and c.menu_id = d.id '+
            'and a.name = "'+user.username+'" '+
            'and a.password = "'+user.password+'" '+
            'and d.state = "'+req.headers.state+'"';

            connection(sqlstr, undefined,function(err, rows, fields) {
                if (err){
                    res.status(500).send({error:'unavailable'})
                }
                else if(rows.length==0){
                    res.status(404).send({error:'failed authentication'})
                }
                else {
                    req.username = user.username
                    next();
                }
            });
        }
    });

    app.post('/authenticate_old', function (req, res) {
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
        connection(sqlstr, undefined,function(err, rows, fields) {
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
                res.send(obj)
            }
        });
    });

    app.post('/authorize', function (req, res) {
        var where = ''
        var sqlstr = 'select group_concat(object) as object from menu a, menu_detail b '+
        'where a.id = b.menu_id '+
        'and a.state = "'+req.body.state+'"';
		connection(sqlstr,undefined, function(err, rows, fields) {
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
        var sqlstr = 'select a.name as username, a.password, a.token, g.name as gname, e.l1 as menuname, e.l2 as submenuname, h.name as module, e.l2state, '+
        'group_concat(f.object), f.custom, i.name as default_module, e.l2id,j.name as default_menu, j.state as default_state,l2.is_sidebar,l2.sidebar_short,l2.sidebar_icon '+
        'from user a, role_user b, role c, role_menu d, '+
        '(SELECT t1.group_id,t1.name AS l1, t2.name as l2, t1.state as l1state, t2.state as l2state, t2.id as l2id,t2.sequence, t2.is_sidebar,t2.sidebar_short,t2.sidebar_icon '+
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
        'group by menuname,submenuname '+
        'order by menuname,e.sequence, submenuname ';
        //'and a.password="'+req.body.password+'" ';
        connection(sqlstr, undefined,function(err, rows, fields) {
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
                                    state: rows[i].l2state,
                                    is_sidebar: rows[i].is_sidebar,
                                    sidebar_short: rows[i].sidebar_short,
                                    sidebar_icon: rows[i].sidebar_icon
                                }
                            }
                            else {
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                                objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                    name: rows[i].submenuname,
                                    state: rows[i].l2state,
                                    is_sidebar: rows[i].is_sidebar,
                                    sidebar_short: rows[i].sidebar_short,
                                    sidebar_icon: rows[i].sidebar_icon
                                }
                            }
                        }
                        else {
                            objModule[rows[i].module][rows[i].gname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                            objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                                name: rows[i].submenuname,
                                state: rows[i].l2state,
                                is_sidebar: rows[i].is_sidebar,
                                sidebar_short: rows[i].sidebar_short,
                                sidebar_icon: rows[i].sidebar_icon
                            }
                        }
                    }
                    else {
                        objModule[rows[i].module] = {}
                        objModule[rows[i].module][rows[i].gname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname] = {}
                        objModule[rows[i].module][rows[i].gname][rows[i].menuname][rows[i].submenuname] = {
                            name: rows[i].submenuname,
                            state: rows[i].l2state,
                            is_sidebar: rows[i].is_sidebar,
                            sidebar_short: rows[i].sidebar_short,
                            sidebar_icon: rows[i].sidebar_icon
                        }
                    }
                }
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
        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
		var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'SELECT id,name from role'+where

		connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });
    });

    app.get('/getRole', function (req, res) {
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        connection('SELECT id,name from role'+where, undefined,function(err, rows, fields) {
            if (err) throw err;
            console.log('getRole')
            console.log(rows)
            res.send(rows)
        });
    });

    app.post('/createRole', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into role SET ?'
        var sqlparam = {
            name:req.body.name
        }
        connection(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;
        });
        res.send({status:'200'})
    })

    app.post('/updateRole', function(req,res){
        var sqlstr = 'update role SET ? WHERE id=' +req.body.id
        var sqlparam = {
            name:req.body.name
        }

        connection(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;
        });
        res.send({status:'200'})
    })

    app.post('/deleteRole', function(req,res){
        var sqlstr = 'delete from role where id='+req.body.id

        connection(sqlstr,undefined,function(err, result) {
            if (err) throw err;
            console.log('Success Delete with Results:'+JSON.stringify(result));
        });
        res.send({status:'200'})
    });

    app.get('/getUsers', function (req, res) {
        var dtParam = req.query
        var where = '';
		if (req.query.id){
            where += ' and a.id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name like "%'+req.query.customSearch + '%" '
        }

        if (req.query.customRole.length>0){
            where += ' and b.id='+req.query.customRole
        }

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        /*var sqlstr = 'select a.password,a.name as username, full_name as fullname, GROUP_CONCAT(b.name) as roles, a.id , GROUP_CONCAT(b.id) as rolesid '+
        'from user a, role b, role_user c '+
        'where a.id = c.user_id '+
        'and b.id = c.role_id '+ where +
<<<<<<< HEAD
        ' group by a.name ';*/

        var sqlstr = 'select a.password,a.name as username, full_name as fullname, GROUP_CONCAT(b.name) as roles, a.id , GROUP_CONCAT(CONVERT(b.id,char)) as rolesid, '+
                       'a.department_id, d.name department_name, a.status, e.name as status_name '+
                        'from user a '+
                        'join role_user c on a.id = c.user_id '+
                        'join role b on b.id = c.role_id '+
                        'left join mst_department d on a.department_id = d.id '+
                        'left join (select value, name from table_ref where table_name = \'user\' and column_name = \'status\') e '+
                			'on e.value = a.status '+
                        'where a.status <> \'2\' '+ where +
                        'group by a.name '
        console.log(sqlstr);

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
					console.log(rows)
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });
    });

    app.get('/getUser', function (req, res) {

		var dtParam = req.query
		console.log(dtParam)
        var where = '';
        if (req.query.id){
            where += ' and a.id='+req.query.id
        }

        /*var sqlstr = 'select a.password,a.name as username, full_name as fullname, GROUP_CONCAT(CAST(b.name as CHAR)) as roles, a.id , GROUP_CONCAT(CAST(b.id as CHAR)) as rolesid, a.default_module,a.default_menu,a.mobile,a.email '+
        'from user a, role b, role_user c '+
        'where a.id = c.user_id '+
        'and b.id = c.role_id '+ where +
        ' group by a.name ';*/

        var sqlstr = 'select a.default_menu,a.image,f.name menu_name,a.default_module,g.name module_name,a.password,a.name as username, full_name as fullname, GROUP_CONCAT(b.name) as roles, a.id , GROUP_CONCAT(CONVERT(b.id,char)) as rolesid, '+
                       'a.department_id, d.name department_name, a.status, e.name as status_name '+
                        'from user a '+
                        'join role_user c on a.id = c.user_id '+
                        'join role b on b.id = c.role_id '+
                        'left join mst_department d on a.department_id = d.id '+
                        'left join (select value, name from table_ref where table_name = \'user\' and column_name = \'status\') e '+
                			'on e.value = a.status '+
						'left join menu f on a.default_menu=f.id '+
						'left join module g on a.default_module=g.id '+
                        'where a.status <> \'2\' '+ where +
                        ' group by a.name ';
        connection(sqlstr , undefined,function(err2, rows2, fields2) {
			console.log(rows2)
            if (!err2){
                dtParam['data'] = rows2
                res.send(dtParam)
            }
        });
    });

    app.post('/createUser', function(req,res){
		var fs = require('fs');
		if (req.body.image.indexOf('container/img/tmp')>-1){
            var baseDir = req.body.image.split('/')[0]+'/'+req.body.image.split('/')[1]+ '/'
            try{
                fs.renameSync(__dirname+'/../webapp/'+req.body.image,__dirname+'/../webapp/'+baseDir+'profile/'+req.body.username)
            }
            catch(e){
                fs.writeFileSync(__dirname+'/../webapp/'+baseDir+'profile/'+req.body.username, fs.readFileSync(__dirname+'/../webapp/'+baseDir+'profile/_default2x.jpg'));
            }
            req.body.image = baseDir+'profile/'+req.body.username
        }
        var sqlstr = 'insert into user SET ?'
        var tokenuser = {username:req.body.username, password: req.body.password, roleid: req.body.roles};
        var sqlparam = {
            name:req.body.username,
            password: req.body.password,
            token: jwt.sign(tokenuser, 'smrai.inc'),
            full_name: req.body.fullname,
			image: req.body.image,
            default_menu: req.body.default_menu,
            default_module: req.body.default_module,
            mobile: req.body.mobile,
            email: req.body.email,
			department_id:req.body.default_department
        }
		console.log(sqlparam)

        connection(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;

            var sqlstr2 = 'insert into role_user (role_id,user_id) VALUES ?'
            var sqlparam2 = []
            for (var i=0;i<req.body.roles.split(',').length;i++){
                sqlparam2.push([parseInt(req.body.roles.split(',')[i]),result.insertId])
            }
            connection(sqlstr2, [sqlparam2], function(err2) {
                if (err2) throw err2;
            });
        });
        res.send({status:'200'})
    })

    app.post('/updateUser', function(req,res){
		var fs = require('fs');
		if (req.body.image.indexOf('container/img/tmp')>-1){
            var baseDir = req.body.image.split('/')[0]+'/'+req.body.image.split('/')[1]+ '/'
            try{
                fs.renameSync(__dirname+'/../webapp/'+req.body.image,__dirname+'/../webapp/'+baseDir+'profile/'+req.body.username)
            }
            catch(e){
                fs.writeFileSync(__dirname+'/../webapp/'+baseDir+'profile/'+req.body.username, fs.readFileSync(__dirname+'/../webapp/'+baseDir+'profile/_default2x.jpg'));
            }
            req.body.image = baseDir+'profile/'+req.body.username
        }
        var sqlstr = 'update user SET ? WHERE id=' +req.body.id
        var tokenuser = {username:req.body.username, password: req.body.password, roleid: req.body.rolesid};
        var sqlparam = {
            name:req.body.username,
            password: req.body.password,
            token: jwt.sign(tokenuser, 'smrai.inc'),
			image: req.body.image,
            full_name: req.body.fullname,
            default_menu: req.body.default_menu,
            default_module: req.body.default_module,
            mobile: req.body.mobile,
            email: req.body.email,
			department_id:req.body.default_department
        }

        connection(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;
            connection('delete from role_user where user_id='+req.body.id, undefined,function(err2) {
                if (err2) throw err2;
                var sqlstr2 = 'insert into role_user (role_id,user_id) VALUES ?'
                var sqlparam2 = []
                for (var i=0;i<req.body.rolesid.split(',').length;i++){
                    sqlparam2.push([parseInt(req.body.rolesid.split(',')[i]),req.body.id])
                }
				connection(sqlstr2, [sqlparam2], function(err3) {
                    if (err3) throw err3;
                });
            });
        });
        res.send({status:'200'})
    })

    app.post('/deleteUser', function(req,res){
        var sqlstr = 'delete from role_user where user_id='+req.body.id

        connection(sqlstr,undefined,function(err, result) {
            if (err) throw err;

            var sqlstr2 = 'delete from user where id='+req.body.id
            connection(sqlstr2, undefined,function(errs,results) {
                if (errs) throw errs;
            });
        });
        res.send({status:'200'})
    });

    app.get('/getMenus', function (req, res) {
        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select c.name as module,c.description as module_desc,b.name as group_name, a.id, a.parent as parent_id,d.name as parent,a.name, a.state, b.id as group_id,c.id as module_id, a.sequence '+
        'from menu a, group_menu b, module c, menu d '+
        'where a.group_id = b.id '+
        'and b.module_id = c.id '+
        'and a.parent = d.id '+ where ;

		var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit, undefined,function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });
    });

    app.get('/getMenu', function (req, res) {
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        if (req.query.groupId){
            where = ' where group_id='+req.query.groupId
        }
        //where = (req.query.groupId?' where group_id='+req.query.groupId:'');
        //where = (req.query.parentId?' where parent='+req.query.parentId:'');
        connection('SELECT id,name,state,module,parent,url from menu'+where, undefined,function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.post('/createMenu', function(req,res){
        var sqlstr = 'insert into menu SET ?'
        var sqlparam = {
            parent: (req.body.parent?req.body.parent:0),
            name:req.body.menu,
            url: null,
            state: req.body.state,
            group_id: req.body.group,
            sequence: parseInt(req.body.sequence)
        }

        connection(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;
        });

        res.send({status:'200'})
    })

    app.post('/updateMenu', function(req,res){
        var sqlstr = 'update menu SET ? WHERE id=' +req.body.id
        var sqlparam = {
            parent: (req.body.parent_id?req.body.parent_id:0),
            name:req.body.menu,
            url: null,
            state: req.body.state,
            group_id: req.body.group_id,
            sequence: parseInt(req.body.sequence)
        }

        connection(sqlstr, sqlparam,function(err, result) {
            if (err) throw err;
        });
        res.send({status:'200'})
    })

    app.post('/deleteMenu', function(req,res){
        var sqlstr = 'delete from menu where id='+req.body.id

        connection(sqlstr,undefined,function(err, result) {
            if (err) throw err;
            console.log('Success Delete with Results:'+JSON.stringify(result));
        });
        res.send({status:'200'})
    });

    app.get('/getRoleMenus2', function (req, res) {
        //Handle Request From Angular DataTables
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
        connection(sqlstr,undefined, function(err, rows, fields) {
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
        var sqlstr = 'select a.*,b.label,b.menu_detail_id,GROUP_CONCAT(CAST(b.role_id as CHAR)) as roles from ( '+
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
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err) throw err;
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
            var result = []
            for (var key in resObj){
                result.push(resObj[key])
            }
            dtParam['data'] = result
            res.send(dtParam)
        });
    });

    app.get('/getModule', function (req, res) {
        var where = '';
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
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.get('/getMenuModule', function (req, res) {
        var where = '';

        connection('SELECT id,name,description from module', undefined,function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });
    app.get('/getMenuGroup', function (req, res) {
        var where = ' where module_id = '+req.query.id;

        connection('SELECT id,name from group_menu'+where, undefined,function(err, rows, fields) {
            if (err) throw err;
            res.send(rows)
        });
    });

    app.post('/assignMenu', function(req,res){
        var sqlstr = 'select id from menu where group_id in('+req.body.group.toString()+') '
        var listMenu = []
        connection(sqlstr,undefined,function(err, rows,field) {
            if (err) throw err;
            for (var i=0;i<rows.length;i++){
                listMenu.push(rows[i].id)
            }
            var sqlDelete = 'delete from role_menu where role_id = '+req.body.role+' AND menu_id in('+listMenu.toString()+')'
            connection(sqlDelete,undefined,function(err2, result2) {
                if (err2) throw err2;
                var sqlInsert = "INSERT INTO role_menu (role_id, menu_id, menu_detail_id) VALUES ?";

                connection(sqlInsert,[req.body.insert],function(err3, result3) {
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
