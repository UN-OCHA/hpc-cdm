# UN-OCHA HPC Monorepo

This project was generated using [Nx](https://nx.dev).

## Building & Running CDM

### Autoloading dev server with in-browser dummy model

To run the app using the in-browser dummy model, run the following command:

```
npm run start hpc-cdm
```

Then navigate to to <http://localhost:4200/>

### Autoloading dev server with live API

To run the app and connect to an API server
(either the local dev server or a real live server):

- Configure the file `.env` with appropriate values for the API you will be
  interacting with
- Run the following commands at the same time in 2 different terminals:
  ```bash
  # Frontend
  npm run start hpc-cdm -- --configuration=dev-live
  # Server (loads .env file)
  npm run start hpc-cdm-serve
  ```

Then navigate to to <http://localhost:4200/>

### Production server with live API

- Build the hpc-cdm and hpc-cdm-serve apps:
  ```bash
  npm run build-cdm-prod # (this is what's used in the docker image)
  ```
- Configure the file `.env` with appropriate values for the API you will be
  interacting with
- Run the server
  ```bash
  npm run start-cdm-prod
  ```

Then navigate to to <http://localhost:3333/>

### Production server within docker

- Build the image:
  ```bash
  docker build -t hpc-cdm .
  ```
- Configure the file `.env` with appropriate values for the API you will be
  interacting with
- Run the docker container:
  ```
  docker-compose up -d
  ```

Docker-compose will run the image and map port `80` of the image to `4200` of
the host, to match the ports when running using the other methods above.

So visit to <http://localhost:4200/> test the image is running correctly.

### Adding a client to HID

To be able to test login locally,
you need to have a client ID that matches `HPC_AUTH_CLIENT_ID` in your `.env`
file stored in the HID database. It doesn't matter what the secret is as we use
the [OAuth Implicit Flow / Simple Authentication Process](https://github.com/UN-OCHA/hid_api/wiki/Integrating-with-HID-via-OAuth#simple-authentication-process).
You can insert an entry into the database by running the following:

```bash
# launch the MongoDB Shell
docker exec -it hid_api_db_1 mongo
# Run these in the shell
> use local;
> db.client.insert({"id": "cdm-local", "name": "CDM", "url": "http://localhost:4200", "redirectUri": "http://localhost:4200/", "loginUri": "http://localhost:4200", "secret": "<something>"})
> exit;
```
