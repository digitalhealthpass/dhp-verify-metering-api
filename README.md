# Digital Healthpass metering service

## Introduction
DHP Metering API provides an api to store and aggregate credential verification usage metrics and provide api to query the counts using a predefined set as grouping attributes.

## Development Setup
It is recommended to use [Node.js](https://nodejs.org/) v12

### General Environment Variables

The following environment variables must be set before starting the application regardless of the deployment environment.

| Environment Variable | Value                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| AUTH_STRATEGY        | DEVELOPMENT or PROD                                                                            |
| PORT                 | Server port, default 9002                                                                      |
| USE_HTTPS            | true or false.  If true, then endpoints must be accessed via https, otherwise http             |
| TLS_FOLDER_PATH      | Default ./config/tls , Path to tls certs for https enabling                                    |

The rest of app configuration is set in config file `config/app/config.json`
### Environment Variables for IBM Cloud deployment

The following environment variables must be set to execute the service in IBM Cloud

| Environment Variable    | Value                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| POSTGRES_HOST      | PgSQL server host                                                                                       |
| POSTGRES_USER      | PgSQL user                                                                                              |
| POSTGRES_USERPWD      | PgSQL user password                                                                                  |
| POSTGRES_DB_NAME      | PgSQL database name                                                                                  |
| POSTGRES_PORT         | PgSQL server port                                                                                    |
| POSTGRES_SSLMODE      | PgSQL ssl mode, e.g. prefer                                                                          |
| POSTGRES_CACERT       | Server CA cert, with newline escaped, for e.g. `"-----BEGIN CERTIFICATE-----\nMIID....nRmk\n-----END CERTIFICATE-----"`                                                             |
| APP_ID_URL              | The App ID URL found in IBM Cloud service credentials oauthServerUrl value                          |
| APP_ID_TENANT_ID        | The App ID URL found in IBM Cloud service credentials tenantId value                                |
| APP_ID_AUTH_SERVER_HOST | The App ID appidServiceEndpoint value, for e.g. `https://us-east.appid.cloud.ibm.com`               |
| APP_ID_CLIENT_ID        | App ID instance ClientID                                                                            |
| APP_ID_SECRET           | App ID instance secret                                                                              |


### Local Postgres setup
- Start pg in docker
```
docker pull postgres:12
docker run --name dev-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres:12

# CREATE db 
docker exec dev-postgres psql -U postgres -c"CREATE DATABASE verifier_metrics" postgres

```

## Build and Run
```
npm install
npm run start
```

## Authorization and Authentication

The API uses App ID for authorization. The api caller must be authorized with scope `meter.reporter` to be able to query,
and the user must be authenticated (with no special scope) to be able to add metrics.

## Library Licenses

This section lists license details of libraries / dependencies.

| Name                        | License type | Link                                                                 |
| :-------------------------- | :----------- | :------------------------------------------------------------------- |
| axios                       | MIT          | git+https://github.com/axios/axios.git                               |
| bcryptjs                    | MIT          | git+https://github.com/dcodeIO/bcrypt.js.git                         |
| body-parser                 | MIT          | git+https://github.com/expressjs/body-parser.git                     |
| cors                        | MIT          | git+https://github.com/expressjs/cors.git                            |
| crypto                      | ISC          | git+https://github.com/npm/deprecate-holder.git                      |
| dotenv                      | BSD-2-Clause | git://github.com/motdotla/dotenv.git                                 |
| express                     | MIT          | git+https://github.com/expressjs/express.git                         |
| express-validator           | MIT          | git://github.com/express-validator/express-validator.git             |
| helmet                      | MIT          | git://github.com/helmetjs/helmet.git                                 |
| ibmcloud-appid              | Apache-2.0   | git+https://github.com/ibm-cloud-security/appid-serversdk-nodejs.git |
| jsonschema                  | MIT          | git://github.com/tdegrunt/jsonschema.git                             |
| jsonwebtoken                | MIT          | git+https://github.com/auth0/node-jsonwebtoken.git                   |
| log4js                      | Apache-2.0   | git+https://github.com/log4js-node/log4js-node.git                   |
| moment                      | MIT          | git+https://github.com/moment/moment.git                             |
| morgan                      | MIT          | git+https://github.com/expressjs/morgan.git                          |
| newrelic                    | Apache-2.0   | git+https://github.com/newrelic/node-newrelic.git                    |
| passport                    | MIT          | git://github.com/jaredhanson/passport.git                            |
| pg                          | MIT          | git://github.com/brianc/node-postgres.git                            |
| qrcode                      | MIT          | git://github.com/soldair/node-qrcode.git                             |
| querystring                 | MIT          | git://github.com/Gozala/querystring.git                              |
| retry-axios                 | Apache-2.0   | git+https://github.com/JustinBeckwith/retry-axios.git                |
| sequelize                   | MIT          | git+https://github.com/sequelize/sequelize.git                       |
| swagger-ui-express          | MIT          | git+ssh://git@github.com/scottie1984/swagger-ui-express.git          |
| uuid                        | MIT          | git+https://github.com/uuidjs/uuid.git                               |
| babel-eslint                | MIT          | git+https://github.com/babel/babel-eslint.git                        |
| chai                        | MIT          | git+https://github.com/chaijs/chai.git                               |
| chai-http                   | MIT          | git+ssh://git@github.com/chaijs/chai-http.git                        |
| eslint                      | MIT          | git+https://github.com/eslint/eslint.git                             |
| eslint-config-airbnb        | MIT          | git+https://github.com/airbnb/javascript.git                         |
| eslint-config-airbnb-base   | MIT          | git+https://github.com/airbnb/javascript.git                         |
| eslint-config-node          | ISC          | git+https://github.com/kunalgolani/eslint-config.git                 |
| eslint-config-prettier      | MIT          | git+https://github.com/prettier/eslint-config-prettier.git           |
| eslint-plugin-chai-friendly | MIT          | git+https://github.com/ihordiachenko/eslint-plugin-chai-friendly.git |
| eslint-plugin-import        | MIT          | git+https://github.com/import-js/eslint-plugin-import.git            |
| eslint-plugin-jsx-a11y      | MIT          | git+https://github.com/jsx-eslint/eslint-plugin-jsx-a11y.git         |
| eslint-plugin-node          | MIT          | git+https://github.com/mysticatea/eslint-plugin-node.git             |
| eslint-plugin-prettier      | MIT          | git+https://github.com/prettier/eslint-plugin-prettier.git           |
| eslint-plugin-react         | MIT          | git+https://github.com/jsx-eslint/eslint-plugin-react.git            |
| eslint-plugin-react-hooks   | MIT          | git+https://github.com/facebook/react.git                            |
| husky                       | MIT          | git+https://github.com/typicode/husky.git                            |
| mocha                       | MIT          | git+https://github.com/mochajs/mocha.git                             |
| moxios                      | MIT          | git+https://github.com/mzabriskie/moxios.git                         |
| nodemon                     | MIT          | git+https://github.com/remy/nodemon.git                              |
| nyc                         | ISC          | git+ssh://git@github.com/istanbuljs/nyc.git                          |
| prettier                    | MIT          | git+https://github.com/prettier/prettier.git                         |
| rewire                      | MIT          | git://github.com/jhnns/rewire.git                                    |
| sinon                       | BSD-3-Clause | git+ssh://git@github.com/sinonjs/sinon.git                           |
| sqlite3                     | BSD-3-Clause | git+https://github.com/TryGhost/node-sqlite3.git                     |