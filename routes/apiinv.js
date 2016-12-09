var express = require('express');
module.exports = function(connection,jwt){
    var app = express.Router();

    app.use(function (req, res, next) {
        if (req.headers['authorization']){
            req.username = jwt.verify(req.headers['authorization'].split(' ')[1], 'smrai.inc');
        }
        next();
    });

    app.get('/test', function (req, res) {
        res.send('API Inventory, access user is:'+JSON.stringify(req.username))
    });

    app.get('/getProductCategories', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' where name="'+req.query.customSearch + '" '
        }




        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_category '+where

        console.log(sqlstr)
        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length
                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getProductCategory', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_category '+where

        connection(sqlstr,undefined, function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createProductCategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_product_category SET ?'
        var sqlparam = {
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }

        connection(sqlstr,sqlparam, function(err, result) {
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

    app.post('/updateProductCategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_product_category SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteProductCategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_product_category where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getProductSubcategories', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' and a.name="'+req.query.customSearch + '" '
        }




        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id,a.name,a.description,a.status,a.category_id,b.name '+
            'from ref_product_subcategory a, ref_product_category b '+
            'where a.category_id = b.id '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
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

    app.get('/getProductSubcategory', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select a.id,a.name,a.description,a.status,a.category_id,b.name '+
            'from ref_product_subcategory a, ref_product_category b '+
            'where a.category_id = b.id '+where
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createProductSubcategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_product_subcategory SET ?'
        var sqlparam = {
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            category_id: req.body.category_id
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateProductSubcategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_product_subcategory SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            category_id: req.body.category_id
        }

        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteProductSubcategory', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_product_subcategory where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getProductUnits', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        if (req.query.id){
            where += ' where id='+req.query.id
        }
        if (req.query.customSearch.length>0){
            where += ' where name="'+req.query.customSearch + '" '
        }




        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_unit '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
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

    app.get('/getProductUnit', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where id='+req.query.id
        }
        var sqlstr = 'select id,name,description,status '+
            ' from ref_product_unit '+where
        connection(sqlstr, undefined, function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createProductUnit', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into ref_product_unit SET ?'
        var sqlparam = {
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateProductUnit', function(req,res){
        console.log(req.body);
        var sqlstr = 'update ref_product_unit SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            name:req.body.name,
            description:req.body.description,
            status: req.body.status
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteProductUnit', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from ref_product_unit where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getSuppliers', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        var whereArr = []
        if (req.query.id){
            //where += ' where id='+req.query.id
            whereArr.push('id='+req.query.id)
        }
        if (req.query.customSearch.length>0){
            whereArr.push('a.name="'+req.query.customSearch + '" ')
            //where += ' where a.name="'+req.query.customSearch + '" '
        }
        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id,a.code,a.name,a.short_name,a.description,a.status,a.address, '+
            	'a.country_id, b.name as country_name, '+
                'a.prov_id, c.name as prov_name,  '+
                'a.kab_id, d.name as kab_name, '+
                'a.kec_id, e.name as kec_name, '+
                'a.kel_id, f.name as kel_name '+
            'from mst_supplier a '+
            'LEFT JOIN ref_country b '+
            'on a.country_id = b.id '+
            'LEFT JOIN ref_province c '+
            'on a.prov_id = c.id '+
            'LEFT JOIN ref_kabupaten d '+
            'on a.kab_id = d.id '+
            'LEFT JOIN ref_kecamatan e '+
            'on a.kec_id = e.id '+
            'LEFT JOIN ref_kelurahan f '+
            'on a.kel_id = f.id '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a',undefined, function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getSupplier', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' where a.id='+req.query.id
        }
        var sqlstr = 'select a.id,a.code,a.name,a.short_name,a.description,a.status,a.address, '+
            	'a.country_id, b.name as country_name, '+
                'a.prov_id, c.name as prov_name,  '+
                'a.kab_id, d.name as kab_name, '+
                'a.kec_id, e.name as kec_name, '+
                'a.kel_id, f.name as kel_name '+
            'from mst_supplier a '+
            'LEFT JOIN ref_country b '+
            'on a.country_id = b.id '+
            'LEFT JOIN ref_province c '+
            'on a.prov_id = c.id '+
            'LEFT JOIN ref_kabupaten d '+
            'on a.kab_id = d.id '+
            'LEFT JOIN ref_kecamatan e '+
            'on a.kec_id = e.id '+
            'LEFT JOIN ref_kelurahan f '+
            'on a.kel_id = f.id '+where
        connection(sqlstr, undefined,function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createSupplier', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_supplier SET ?'
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status,
            address: req.body.address,
            country_id: req.body.country_id,
            prov_id: req.body.prov_id,
            kab_id: req.body.kab_id,
            kec_id: req.body.kec_id,
            kel_id: req.body.kel_id
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateSupplier', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_supplier SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            name:req.body.name,
            short_name:req.body.short_name,
            description:req.body.description,
            status: req.body.status,
            address: req.body.address,
            country_id: req.body.country_id,
            prov_id: req.body.prov_id,
            kab_id: req.body.kab_id,
            kec_id: req.body.kec_id,
            kel_id: req.body.kel_id
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteSupplier', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_supplier where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getProducts', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        var whereArr = []
        if (req.query.id){
            //where += ' where id='+req.query.id
            whereArr.push('id='+req.query.id)
        }
        if (req.query.customSearch.length>0){
            whereArr.push('a.name="'+req.query.customSearch + '" ')
            //where += ' where a.name="'+req.query.customSearch + '" '
        }
        if (whereArr.length>0) where = 'and '+whereArr.join(' and ')

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id, a.code, a.barcode, a.name, a.description, a.status, a.is_pr, a.is_ml, '+
              'a.category_id, b.name as category_name, a.unit_type_id, c.name as unit_name, a.available_stock '+
            'from mst_product a, ref_product_category b, ref_product_unit c '+
            'where a.category_id = b.id '+
            'and a.unit_type_id = c.id '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
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

    app.get('/getProduct', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select a.id, a.code, a.barcode, a.name, a.description, a.status, a.is_pr, a.is_ml, '+
              'a.category_id, b.name as category_name, a.unit_type_id, c.name as unit_name, a.available_stock '+
            'from mst_product a, ref_product_category b, ref_product_unit c '+
            'where a.category_id = b.id '+
            'and a.unit_type_id = c.id '+where
        connection(sqlstr, undefined, function(err, rows, fields) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createProduct', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into mst_product SET ?'
        var sqlparam = {
            code:req.body.code,
            barcode:req.body.barcode,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            is_pr: req.body.is_pr,
            is_ml: req.body.is_ml,
            category_id: req.body.category_id,
            unit_type_id: req.body.unit_type_id,
            available_stock: req.body.available_stock
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateProduct', function(req,res){
        console.log(req.body);
        var sqlstr = 'update mst_product SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            barcode:req.body.barcode,
            name:req.body.name,
            description:req.body.description,
            status: req.body.status,
            is_pr: req.body.is_pr,
            is_ml: req.body.is_ml,
            category_id: req.body.category_id,
            unit_type_id: req.body.unit_type_id,
            available_stock: req.body.available_stock
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteProduct', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from mst_product where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,undefined,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    });

    app.get('/getContracts', function (req, res) {
        //Handle Request From Angular DataTables
        console.log(req.query)
        console.log(req.headers)

        var dtParam = req.query
        var where = '';
        var whereArr = []
        if (req.query.id){
            //where += ' where id='+req.query.id
            whereArr.push('id='+req.query.id)
        }
        if (req.query.customSearch.length>0){
            whereArr.push('a.name="'+req.query.customSearch + '" ')
            //where += ' where a.name="'+req.query.customSearch + '" '
        }
        if (whereArr.length>0) where = 'and '+whereArr.join(' and ')

        var limit = ' limit '+req.query.start+','+req.query.length
        var order = '';
        order = ' order by ' +req.query.columns[req.query.order[0].column].data +' '+ req.query.order[0].dir

        var sqlstr = 'select a.id,a.code, '+
              'a.supplier_id, c.code as supplier_code, c.name as supplier_name, '+
              'a.product_id, b.name as product_name, '+
              'a.description,  '+
              'a.contract_status, d.name as contract_status_name, '+
             'a.contract_start_date, a.contract_end_date, a.price, a.previous_price,  '+
             'a.default_supplier_flag, e.name as contract_supp_flag '+
            'from inv_prod_price_contract a, mst_product b, mst_supplier c, '+
             '(select value,name,description from table_ref where table_name=\'inv_prod_price_contract\' and column_name=\'contract_status\') d, '+
             '(select value,name,description from table_ref where table_name=\'inv_prod_price_contract\' and column_name=\'default_supplier_flag\') e '+
            'where a.product_id = b.id '+
            'and a.supplier_id = c.id '+
            'and a.contract_status = d.value '+
            'and a.default_supplier_flag = e.value '+where

        console.log(sqlstr)

        connection('select count(1) as cnt from('+sqlstr+') a', undefined,function(err, rows, fields) {
            if (!err){
                console.log('rowsCnt')
                console.log(rows)
                dtParam['recordsFiltered'] = rows[0].cnt
                connection(sqlstr + order + limit,undefined, function(err2, rows2, fields2) {
                    if (!err2){
                        dtParam['recordsTotal'] = rows2.length

                        dtParam['data'] = rows2
                        res.send(dtParam)
                    }
                });
            }
        });


    });

    app.get('/getContract', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        if (req.query.id){
            where = ' and a.id='+req.query.id
        }
        var sqlstr = 'select a.id,a.code, '+
              'a.supplier_id, c.code as supplier_code, c.name as supplier_name, '+
              'a.product_id, b.name as product_name, '+
              'a.description,  '+
              'a.contract_status, d.name as contract_status_name, '+
             'a.contract_start_date, a.contract_end_date, a.price, a.previous_price,  '+
             'a.default_supplier_flag, e.name as contract_supp_flag '+
            'from inv_prod_price_contract a, mst_product b, mst_supplier c, '+
             '(select value,name,description from table_ref where table_name=\'inv_prod_price_contract\' and column_name=\'contract_status\') d, '+
             '(select value,name,description from table_ref where table_name=\'inv_prod_price_contract\' and column_name=\'default_supplier_flag\') e '+
            'where a.product_id = b.id '+
            'and a.supplier_id = c.id '+
            'and a.contract_status = d.value '+
            'and a.default_supplier_flag = e.value '+where
        connection(sqlstr,undefined, function(err, rows, fields) {

            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(rows)
        });
    });

    app.post('/createContract', function(req,res){
        console.log(req.body);
        var sqlstr = 'insert into inv_prod_price_contract SET ?'
        var sqlparam = {
            code:req.body.code,
            supplier_id:req.body.supplier_id,
            product_id:req.body.product_id,
            description:req.body.description,
            contract_status: req.body.contract_status,
            contract_start_date: req.body.contract_start_date,
            contract_end_date: req.body.contract_end_date,
            price: req.body.price,
            previous_price: req.body.previous_price,
            default_supplier_flag: req.body.default_supplier_flag
        }

        connection(sqlstr, sqlparam,function(err, result) {
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

    app.post('/updateContract', function(req,res){
        console.log(req.body);
        var sqlstr = 'update inv_prod_price_contract SET ? WHERE id=' +req.body.id
        console.log(sqlstr)
        var sqlparam = {
            code:req.body.code,
            supplier_id:req.body.supplier_id,
            product_id:req.body.product_id,
            description:req.body.description,
            contract_status: req.body.contract_status,
            contract_start_date: req.body.contract_start_date,
            contract_end_date: req.body.contract_end_date,
            price: req.body.price,
            previous_price: req.body.previous_price,
            default_supplier_flag: req.body.default_supplier_flag
        }


        connection(sqlstr, sqlparam,function(err, result) {
            if (err){
                res.status('404').send({
                    status: '404',
                    desc: err
                });
            }
            else res.status(200).send(result)
        });
    })

    app.post('/deleteContract', function(req,res){
        console.log(req.body);
        var sqlstr = 'delete from inv_prod_price_contract where id='+req.body.id
        console.log(sqlstr)

        connection(sqlstr,function(err, result) {
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
