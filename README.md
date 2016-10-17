# TMH-System

## Diretory Structure
These are directory structure for TMH System. For Serverside artwork, mostly work under root dir and routes dir. and for client-side, will work in container directory.
***Notes: assets, pages, and templates will be added to gitignore and uploaded into drive**

webserver.js
routes/
&nbsp;&nbsp;&nbsp;&nbsp;|-- api.js (express routing for API purposes)
webapp/ (client side with angularjs)
&nbsp;&nbsp;&nbsp;&nbsp;|-- assets/
&nbsp;&nbsp;&nbsp;&nbsp;|-- **container/** (angular work area)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- app.factory.js (factory and service)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- app.js (init module)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- apps/
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- components/ (view and controller)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- config.js (router and state provider)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- config.lazyload.js (lazy load configuration)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- css/
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- directives/
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- main.js (app main controller)
&nbsp;&nbsp;&nbsp;&nbsp;|-- index.ejs (main page)
&nbsp;&nbsp;&nbsp;&nbsp;|-- pages/
&nbsp;&nbsp;&nbsp;&nbsp;|-- template/ (default template)
