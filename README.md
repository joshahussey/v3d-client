###DO NOT ALTER FILES IN web 
##IN FACT, DO NOT ALTER ANYTHING IF YOU DONT KNOW WHAT YOU ARE DOING
#web is the hosted directory
##MAKE CHANGES IN src and static
##STATIC FILES SHOULD NOT BE ADDED TO web
ADD STATIC FILES TO static AND COPY THROUGH WEBPACK CONFIG

Backend lang: go
WebServer: Caddy 
Client: Typescript/SolidJS

#To install deps:
'npm install'

#To lint:
'npm run lint'

#To lint & fix errors:
'npm run fix'

#To build dev client:
'npm run build-client'

#To build production client:
'npm run build-client-release'

#To build backend:
'npm run build-backend'

#To build client and backend dev:
'npm run full-build'

#To build client and backend production:
'npm run full-build-release'

#To host dev:
'npm run app'
