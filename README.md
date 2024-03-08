###DO NOT ALTER FILES IN web 
##IN FACT, DO NOT ALTER ANYTHING IF YOU DONT KNOW WHAT YOU ARE DOING!
#IF YOU ADD NON RUNTIME DEPENDENCIES, ADD THEM TO THE DOCKERFILES, THEN CLEAN THEM UP!
#BRING .envrc INTO ROOT DIR, CHANGE ENVIRONMENTS FOR YOU SYSTEM, INSTALL DIRENV
#DIRENV ALLOW AFTER SETTING .ENVRC
Hosted: web
Source: src, static

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

#To build Docker image:
'docker build -t cslt3d .'

#To run Docker image:
'docker run -p 2015:2015 -p 2016:2016 -p 8080:8080 cslt3d'
