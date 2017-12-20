# bongger-cordova


Bongger wallet software built using the cordova framework


To build or debug, you will need to install the cordova command line tools: 

npm install -g cordova


## To Build

On the command line in the app-src folder, run 'cordova platform prepare browser'

## To Debug

On the command line in the app-src folder, run 'cordova serve'


# Index Server

This app requires a backend service to operate.   The backend source is included in the 'index' folder.   You will need a local instance of bonggerd, or bongger-qt running in server mode, for the backend to function.   

## Index server setup

Open /index/index.js and configure your bongger RPC username and password in the places labeled for them near the top of the file (in angle brackets <>) not forgetting to remove the surrounding angle brackets.

Also, you will need to furnish an ssl certificate file & its private key file in a place accessible to the index process.   The paths to these files will need to be configured as well in the top of the /index/index.js file (placeholders also in angle brackets <>)

## Running the index server

Once configured, first run 'npm install' in the /index directory, then run 'node index.js' in the index directory in admin/sudo mode.

 