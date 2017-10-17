//TODO ttl
angular.module('app')
.factory('prService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        get: function(vid) {
            var defer = $q.defer();
            var url= API_URL+"/apiinv/getPr";
            if (vid){
                url +=  "?id="+vid
            }
            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                defer.resolve(response)
            })
            return defer.promise;
        },
        create: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apiinv/createPr', role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        update: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apiinv/updatePr',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
        delete: function(role) {
            var defer = $q.defer();

            $http.post(API_URL+'/apiinv/deletePr',role)
            .success(function (data, status, headers, config) {
                if (status == '200'){
                    defer.resolve(data);
                }
                else {
                    defer.reject(data);
                }
            })
            .error(function (data, status, header, config) {
                defer.reject(data);
            });

            return defer.promise;
        },
    }
}
])
.factory('profileService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        save: function(body) {
            var defer = $q.defer();
            $http.post(API_URL+'/apioth/saveProfile', body)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;
        }
    }
}
])
.factory('uploadBudget', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
	return {
        save: function(body) {
            var defer = $q.defer();
            $http.post('uploadBudget/apioth/uploadBudget', body)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;
        }
    }
}
])
.factory('queryService', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        get: function(sqlstr,sqlparam) {
            var defer = $q.defer();
            var url= API_URL+"/apisql/query?query="+sqlstr;

            //$http.get("http://localhost:3000/getRoles")
            $http.get(url)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;
        },
        post: function(sqlstr,sqlparam) {
            var defer = $q.defer();
            var body = {
                query: sqlstr,
                values: sqlparam
            }

            $http.post(API_URL+'/apisql/query', body)
            .then(function(response){
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;


        },
        generatePo: function(pr,items) {
            var defer = $q.defer();
            //console.log(sqlstr)
            //console.log(sqlparam)
            var body = {
                pr: pr,
                items: items
            }

            $http.post(API_URL+'/apisql/generatepo', body)
            .then(function(response){
                console.log(response)
                if (response.data.err==null) {
                    var rsp = {data:response.data.rows, status:200}
                    defer.resolve(rsp)
                }
                else defer.reject(response.data.err)
            },
            function(response){
                defer.reject(response)
            })
            return defer.promise;


        }
    }
}
])
.factory('globalFunction', ['$q', '$http', '$timeout', '$localStorage', 'API_URL',
function($q, $http, $timeout, $localStorage,API_URL) {
    return {
        currentDate: function() {
            var d = new Date();

            return d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " +
                ("00" + d.getHours()).slice(-2) + ":" +
                ("00" + d.getMinutes()).slice(-2) + ":" +
                ("00" + d.getSeconds()).slice(-2)
        },
        next30Day: function() {
            var d = new Date();
            d.setDate(d.getDate() + 30)
            return d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " +
                ("00" + d.getHours()).slice(-2) + ":" +
                ("00" + d.getMinutes()).slice(-2) + ":" +
                ("00" + d.getSeconds()).slice(-2)
        },
        endOfYear: function() {
            return (new Date().getFullYear()) + '-12-31 23:59:59'
        },
        terbilang: function(val){
            //Source: https://asligresik.wordpress.com/2010/12/03/fungsi-terbilang-dengan-javascript/
            var daftarAngka=new Array("","Satu","Dua","Tiga","Empat","Lima","Enam","Tujuh","Delapan","Sembilan");
            function terbilang(nilai){
                var temp='';
                var hasilBagi,sisaBagi;
                //batas untuk ribuan
                var batas=3;
                //untuk menentukan ukuran array, jumlahnya sesuaikan dengan jumlah anggota dari array gradeNilai[]
                var maxBagian = 5;
                var gradeNilai=new Array("","Ribu","Juta","Milyar","Triliun");
                //cek apakah ada angka 0 didepan ==> 00098, harus diubah menjadi 98
                nilai = hapusNolDiDepan(nilai);
                var nilaiTemp = ubahStringKeArray(batas, maxBagian, nilai);
                //ubah menjadi bentuk terbilang
                var j = nilai.length;
                //menentukan batas array
                var banyakBagian = (j % batas) == 0 ? (j / batas) : Math.round(j / batas + 0.5);
                var h=0;
                for(var i = banyakBagian - 1; i >=0; i-- ){
                    var nilaiSementara = parseInt(nilaiTemp[h]);
                    if (nilaiSementara == 1 && i == 1){
                        temp +="seribu ";
                    }
                    else {
                        temp += ubahRatusanKeHuruf(nilaiTemp[h])+" ";
                        // cek apakah string bernilai 000, maka jangan tambahkan gradeNilai[i]
                        if(nilaiTemp[h] != "000"){
                            temp += gradeNilai[i]+" ";
                        }
                    }
                    h++;
                }
                return temp;
            }
            function ubahStringKeArray(batas, maxBagian,kata){
                // maksimal 999 milyar
                var temp= new Array(maxBagian);
                var j = kata.length;
                //menentukan batas array
                var banyakBagian = (j % batas) == 0 ? (j / batas) : Math.round(j / batas + 0.5);
                for(var i = banyakBagian - 1; i >= 0 ; i--){
                    var k = j - batas;
                    if(k < 0) k = 0;
                    temp[i]=kata.substring(k,j);
                    j = k ;
                    if (j == 0)
                    break;
                }
                return temp;
            }

            function ubahRatusanKeHuruf(nilai){
                //maksimal 3 karakter
                var batas = 2;
                //membagi string menjadi 2 bagian, misal 123 ==> 1 dan 23
                var maxBagian = 2;
                var temp = ubahStringKeArray(batas, maxBagian, nilai);
                var j = nilai.length;
                var hasil="";
                //menentukan batas array
                var banyakBagian = (j % batas) == 0 ? (j / batas) : Math.round(j / batas + 0.5);
                for(var i = 0; i < banyakBagian ;i++){
                    //cek string yang memiliki panjang lebih dari satu ==> belasan atau puluhan
                    if(temp[i].length > 1){
                        //cek untuk yang bernilai belasan ==> angka pertama 1 dan angka kedua 0 - 9, seperti 11,16 dst
                        if(temp[i].charAt(0) == '1'){
                            if(temp[i].charAt(1) == '1') {
                                hasil += "Sebelas";
                            }
                            else if(temp[i].charAt(1) == '0') {
                                hasil += "Sepuluh";
                            }
                            else hasil += daftarAngka[temp[i].charAt(1) - '0']+ " Belas ";
                        }
                        //cek untuk string dengan format angka  pertama 0 ==> 09,05 dst
                        else if(temp[i].charAt(0) == '0'){
                            hasil += daftarAngka[temp[i].charAt(1) - '0'] ;
                        }
                        //cek string dengan format selain angka pertama 0 atau 1
                        else
                        hasil += daftarAngka[temp[i].charAt(0) - '0']+ " Puluh " +daftarAngka[temp[i].charAt(1) - '0'] ;
                    }
                    else {
                        //cek string yang memiliki panjang = 1 dan berada pada posisi ratusan
                        if(i == 0 && banyakBagian !=1){
                            if (temp[i].charAt(0) == '1')
                            hasil+=" Seratus ";
                            else if (temp[i].charAt(0) == '0')
                            hasil+=" ";
                            else hasil+= daftarAngka[parseInt(temp[i])]+" Ratus ";
                        }
                        //string dengan panjang satu dan tidak berada pada posisi ratusan ==> satuan
                        else hasil+= daftarAngka[parseInt(temp[i])];
                    }
                }
                return hasil;
            }
            function hapusNolDiDepan(nilai){
                while(nilai.indexOf("0") == 0){
                    nilai = nilai.substring(1, nilai.length);
                }
                return nilai;
            }
            var x = [];
            var tb = terbilang(val.toString())
            for (var i=0;i<tb.split(' ').length;i++){
                if (tb.split(' ')[i].length>0){
                    x.push(tb.split(' ')[i])
                }
            }
            return x.join(' ')
        }
    }
}
])
