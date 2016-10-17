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
