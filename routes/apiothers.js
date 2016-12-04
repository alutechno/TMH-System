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
        res.send('API POS, access user is:'+JSON.stringify(req.username))
    });

    app.get('/getCountry', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        var whereArr = []
        if (req.query.id){
            //where += ' where id='+req.query.id
            whereArr.push('id='+req.query.id)
        }
        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var sqlstr = 'select id,code,name,status '+
            ' from ref_country '+where
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

    app.get('/getProvince', function (req, res) {
        //Handle Request For Selected Records
        var where = '';
        var whereArr = []
        if (req.query.id) whereArr.push('id='+req.query.id)
        if (req.query.country_id) whereArr.push('country_id='+req.query.country_id)

        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var sqlstr = 'select id,code,name,country_id '+
            ' from ref_province '+where

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

    app.get('/getKabupaten', function (req, res) {
        var where = '';
        var whereArr = []
        if (req.query.id) whereArr.push('id='+req.query.id)
        if (req.query.prov_id) whereArr.push('prov_id='+req.query.prov_id)

        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var sqlstr = 'select id,code,name,prov_id,status '+
            ' from ref_kabupaten '+where
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

    app.get('/getKecamatan', function (req, res) {
        var where = '';
        var whereArr = []
        if (req.query.id) whereArr.push('id='+req.query.id)
        if (req.query.kab_id) whereArr.push('kab_id='+req.query.kab_id)

        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var sqlstr = 'select id,code,name,kab_id,status '+
            ' from ref_kecamatan '+where
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

    app.get('/getKelurahan', function (req, res) {
        var where = '';
        var whereArr = []
        if (req.query.id) whereArr.push('id='+req.query.id)
        if (req.query.kec_id) whereArr.push('kec_id='+req.query.kec_id)

        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var sqlstr = 'select id,code,name,kec_id,status '+
            ' from ref_kelurahan '+where
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

    app.get('/getTableRef', function (req, res) {
        var where = '';
        var whereArr = []
        if (req.query.table) whereArr.push('table_name="'+req.query.table+'"')
        if (req.query.column) whereArr.push('column_name="'+req.query.column+'"')

        if (whereArr.length>0) where = 'where '+whereArr.join(' and ')

        var sqlstr = 'select value,name,description '+
            ' from table_ref '+where
            console.log(sqlstr)
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


    return app;

}
