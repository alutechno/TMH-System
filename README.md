TMH-System
=============
TMH system project
## Diretory Structure
These are directory structure for TMH System. For Serverside artwork, mostly work under root dir and routes dir. and for client-side, will work in container directory.

**Note: assets, pages, and templates will be added to gitignore and uploaded into drive**

webserver.js <br>
routes/ <br>
&nbsp;&nbsp;&nbsp;&nbsp;|-- api.js (express routing for API purposes)<br>
webapp/ (client side with angularjs)<br>
&nbsp;&nbsp;&nbsp;&nbsp;|-- assets/<br>
&nbsp;&nbsp;&nbsp;&nbsp;|-- **container/** (angular work area)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- app.factory.js (factory and service)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- app.js (init module)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- apps/<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- components/ (view and controller)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- config.js (router and state provider)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- config.lazyload.js (lazy load configuration)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- css/<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- directives/<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- main.js (app main controller)<br>
&nbsp;&nbsp;&nbsp;&nbsp;|-- index.ejs (main page)<br>
&nbsp;&nbsp;&nbsp;&nbsp;|-- pages/<br>
&nbsp;&nbsp;&nbsp;&nbsp;|-- template/ (default template)<br>

Insert Menu:
1. Buat menu di modul UM, menu User Management - User - Menu Management:
	- Pilih Modul, Group Menu, dan Parent(kl child dari suatu menu)
	-  Masukan Nama Menu dan sequence menu
	- Masukan nama state yang nantinya akan dibaca oleh (webapp/container/config.js)
	- Setelah diinsert, maka akan ada record baru pada tabel menu
2. Query table menu dan ambil id dari data yang baru diinsert:
	select * from menu order by id desc
3. Masukan menu detail dari menu tersebut. menu detail adalah hak akses button atau hal2 lain yang dibutuhkan oleh state tertentu, misalkan secara umum, form bisa create, update, dan delete maka yang diinsert ke menu_detail adalah sbb:
	- insert into menu_detail(menu_id,object,label) values(:menuId,’buttonCreate','create');
	- insert into menu_detail(menu_id,object,label) values(:menuId,'buttonUpdate','update');
	- insert into menu_detail(menu_id,object,label) values(:menuId,'buttonDelete','delete');
4. Setelah terinsert ke tabel menu_detail, assign menu tersebut ke super user. caranya dengan meng-query terlebih dahulu tabel menu_detail dan ambil semua id yang baru dibuat:
	- select * from menu_detail order by id desc
	- dalam kasus ini ambil 3 teratas
5. masukan ke dalam tabel role_menu:
	- insert into role_menu(role_id,menu_id,menu_detail_id) values(1,:menuId,:menuDetailId);
	- insert into role_menu(role_id,menu_id,menu_detail_id) values(1,:menuId,:menuDetailId);
	- insert into role_menu(role_id,menu_id,menu_detail_id) values(1,:menuId,:menuDetailId);
6. user dengan role = 1, sudah dapat mengakses menu baru tersebut dengan hak akses yang dimiliki
7. masukan state ke webapp/container/config.js dengan state_name yang sudah dimasukan ke dalam menu. masukan juga direktori controller, view, dan element yang akan dipakai.
