# Edge Management

## AWS Config
The following settings must be defined in AWS IOT and in the corresponding [constant file](https://github.com/pwillmann/watch-your-face/blob/master/lib/constants.js) in this project:
- THING_TYPE_NAME
- THING_GROUP_NAME
- THING_POLICY_NAME

For more information see this [link](https://docs.aws.amazon.com/iot/latest/developerguide/iot-gs.html).

## Endpoints

1.  POST: /api/edge
  - id
  - description

This POST function will create an approval item. If the item will be approved, the new edge will be created via AWS IOT


2.  DELETE /api/edge/{id}

This DELETE function will create an approval item. If the item will be approved, the edge will be removed via AWS IOT


3. GET /api/edge

Get the id and the description of each edge


4. GET /api/edge/{id}

Get all information from the edge (incl. keys)

5. PUT /api/edge/{id}

This endpoint ensures the following constraints:
- Credentials can only be viewed once
- Log credential download


For more information see the corresponding [Postman collection](https://github.com/pwillmann/watch-your-face/blob/master/WatchYourFace.postman_collection.json).
