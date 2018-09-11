# Edge

## Edge Device Setup

1.  Create new edge (using your deployed instance of watchyourfac.es), download auth files and take note of endpoint URL
2.  Setup Raspberry Pi with Raspbian Lite (flash image to sd card)
    1.  Enable ssh for convenience
3.  Install docker
4.  Clone project / Copy `edge/face-recognition` subfolder 
    (all following instructions will be relative to `edge/face-recognition`)
5.  Put auth files into `config/certs` folder
6.  Update config in `config/config.json`
    1.  Adjust paths accordingly
    2.  Configure endpoint
6.  Build and run docker image from `Dockerfile`

## Configuration

The folder `configurations` contains configurations for all our edges (two). It is structured as follows:

```
edge X
│   config.json
│
└───certs
│   │   cloud.pem.crt
│   │   cloud.pem.key
│   │   cloud.pem.key.public
│   │   root-ca.pem
```

The `certs` folder contains all necessary certificates to communicate with AWS IoT. Currently all certificates of all edges have the same name although they are different files. In the future, it might be good to change those names.  
The `config.json` file contains the edge configuration:  

```json
{
  "edgeIdentifier": 1,
  "edgeEndpoint": "arn:aws:iot:eu-central-1:693188760610:thing/wyf_edge1"
}
```

The `edgeIdentifier` is a numerical value that identifies the edge (e.g. 1 for edge 1).  
The `edgeEndpoint` is the AWS IoT endpoint for the edge.  

The content of this folder should be placed into the `/etc` folder of the Raspberry Pi as `wyf`:

```
etc
└──wyf
│   │   config.json
│   │
│   └───certs
│   │   │   cloud.pem.crt
│   │   │   cloud.pem.key
│   │   │   cloud.pem.key.public
│   │   │   root-ca.pem
│   
│   ...

```


## MQTT Message Formats

MQTT can send messages in any format but we will use JSON to integrate everything nicely later. There are three topics:

* wyf/face-recognition
* wyf/face-model (in staging, this topic is called '{stage}-wyf/face-model' for testing)

### Face Recognition

This many-to-one topic is used to publish images/video clips to AWS. The edge nodes are the publishers and a single lambda function is the subscriber. Once an edge has recognized a face it uploads the image/video to S3 and published the metadata so it can be consumed by the image handlers.

Message format:

```json
{
  "timestamp": 1527068972,
  "edgeId": 123,
  "poiId": "abc",
  "imageKey": "xyz",
  "imageFormat": "jpg",
  "imageBucket": "dev.watchyourfac.es-edge-temp"
}
```

The `timestamp` attribute is the current UNIX timestamp when the message is sent.  
The `edgeId` is an identifier of the edge node sending this message. It must always be constant for one edge.  
The `poiId` is the identifier of the POI that is identified in the attached file. It can be possible for two POIs to be recognized in the same photo but two messages will be sent in this case.  
The `imageKey` identifies the image in the image S3 bucket where the edge has uploaded it. It should be in uuid/v1 format.
The `imageFormat` identifies the file format that the uploaded file is in (e.g. `jpg` or `mp4`).
The `imageBucket` specifies where the edge device has uploaded the file so it can be retrieved by the message handler.

### Face Model

This is a one-to-many topic that is used to push face model updates to the edges. The publisher is a lambda function that periodically sends the file location of the newest model or sends an update as soon as a new model is available.

Message format:

```json
{
  "modelId": 1527000000,
  "timestamp" : 1527068972,
  "modelKey": "abc",
  "modelBucket": "dev.watchyourfac.es-models",
  "edgeTempBucket": "dev.watchyourfac.es-edge-temp"
}
```

The `modelId` is an artificial identifier that identifies every configuration. It is a UNIX timestamp of when the model was created (pulled from S3). The edge stores the timestamp of each model and only updates its model when the timestamp increases.  
The `timestamp` is the timestamp of when the message was sent.  
The `modelKey` is the S3 key (alas the filename) of the model.  
The `modelBucket` is the bucket that contains the aforementioned model file.  
The `edgeTempBucket` specifies where the edge should upload the images.  

## MQTT Setup

Following this tutorial: https://cloudncode.blog/2017/11/07/make-your-first-iot-device-via-aws-iot-service-and-raspberry-pi/

### Prerequisites
- Install cmake (`sudo apt-get install cmake`)
- Install OpenSSL (`sudo apt-get install libssl-dev`)
- Install pip (`sudo apt-get install python-pip`)
- Install AWS IOT SDK (`sudo pip install AWSIoTPythonSDK`)

### Execution
- Run `python service.py`
- Use the tester in AWS IoT to publish messages to the wyf/update channel

## Basic Docker Setup Script

### Prerequisites
- Install docker

### Execution
- Start docker
- Run `sudo bash init_edge.sh persistency` (instead of "persistency", any path name can be used)

### Test Connection to Database
```python
import redis

try:
    conn = redis.StrictRedis(
        host='0.0.0.0',
        port=6380
        )
    print conn
    conn.ping()
    print 'Connected!'
except Exception as ex:
    print 'Error:', ex
    exit('Failed to connect, terminating.')
```
