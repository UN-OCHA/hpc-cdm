# UN-OCHA HPC Monorepo

This project was generated using [Nx](https://nx.dev).

## Building & Running CDM

### Autoloading dev server with in-browser dummy model

To run the app using the in-browser dummy model, run the following command:

```
npm run start hpc-cdm
```

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
