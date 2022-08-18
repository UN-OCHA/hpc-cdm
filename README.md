# UN-OCHA HPC Monorepo

This project was generated using [Nx](https://nx.dev).

## Building & Running CDM and FTS Admin

### Autoloading dev server with in-browser dummy model

To run the **CDM** app using the in-browser dummy model, run the following command:

```
npm run start hpc-cdm
```

To run the **FTS Admin** app using the in-browser dummy model, run the following command:

```
npm run start hpc-ftsadmin
```

Then navigate to to <http://localhost:4200/>

### Autoloading dev server with live API

To run the app and connect to an API server
(either the local dev server or a real live server):

- Configure the file `.env.json` with appropriate values for the API you will be
  interacting with
- Run one of the following commands:
  - CDM
  ```bash
  npm run start hpc-cdm -- --configuration=dev-live
  ```
  - FTS Admin
  ```bash
  npm run start hpc-ftsadmin -- --configuration=dev-live
  ```

Then navigate to to <http://localhost:4200/>

### Production server within docker

- Build the image:
  ```bash
  docker build -t hpc-cdm .
  ```
  (building FTS Admin is not supported yet)
- Configure the file `.env.json` with appropriate values for the API you will be
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
you need to have a client ID that matches `hpcAuthClientId` in your `.env.json`
file stored in the HID database. It doesn't matter what the secret is as we use
the [OAuth Implicit Flow / Simple Authentication Process](https://github.com/UN-OCHA/hid_api/wiki/Integrating-with-HID-via-OAuth#simple-authentication-process).
You can insert an entry into the database by running the following:

```bash
# launch the MongoDB Shell
docker exec -it hid_api_db_1 mongo
# Run these in the shell
> use local;
> db.client.insert({"id": "cdm-local", "name": "CDM", "url": "http://localhost:3000", "redirectUri": "http://localhost:3000/", "loginUri": "http://localhost:3000", "secret": "<something>"})
> exit;
```

## License

Copyright 2020 United Nations Office for the Coordination of Humanitarian Affairs

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
