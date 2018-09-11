import time
import json
import math
from .utils import *
import logging

from threading import Thread
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

logger = logging.getLogger(__name__)


class MQTTWorker(Thread):

    def __init__(self, config, msg_in_q, msg_out_q):
        Thread.__init__(self)
        self._msg_in_q = msg_in_q
        self._msg_out_q = msg_out_q
        self._conf = config
        self._mqtt_client = self._configure_mqtt_client()
        self.running = False

    def run(self):
        self._mqtt_client.connect()
        self._mqtt_client.subscribe("wyf/face-model", 1, self._handle_message)

        self._main_loop()

    def _main_loop(self):
        self.running = True

        while self.running:
            new_facerec = get_from_queue(self._msg_out_q)
            if new_facerec is not None:
                key, facerec_msg = new_facerec
                logger.info("Sending new facerec notification: {}".format(facerec_msg.matched_class))
                self._mqtt_client.publish("wyf/face-recognition", self._build_message(key, facerec_msg), 1)
            else:
                time.sleep(0.1)

    def _configure_mqtt_client(self):
        edge_identifier = self._conf.get_edge_identifier()
        edge_endpoint = self._conf.get_edge_endpoint()

        # creates MQTT client, use the edge ID as identifier
        mqtt_client = AWSIoTMQTTClient("sender" + str(edge_identifier))

        # set the endpoint for AWS IoT
        mqtt_client.configureEndpoint(edge_endpoint, 8883)

        # configure certificates
        mqtt_client.configureCredentials(self._conf.get_iot_ca_path(),
                                         self._conf.get_device_pkey_path(),
                                         self._conf.get_device_cert_path())

        mqtt_client.configureOfflinePublishQueueing(1)  # We don't care about old message, just give us the newest one
        mqtt_client.configureDrainingFrequency(2)  # Draining: 2 Hz
        mqtt_client.configureConnectDisconnectTimeout(10)  # 10 sec
        mqtt_client.configureMQTTOperationTimeout(5)  # 5 sec

        return mqtt_client

    def _handle_message(self, client, userdata, message):
        json_string = message.payload.decode("utf-8")
        logger.debug("Got MQTT message:\n{}".format(json_string))

        message_obj = json.loads(str(json_string))
        put_into_queue(self._msg_in_q, message_obj)

    # creates a MQTT message
    def _build_message(self, key, facerec_msg):
        message_dict = {}
        message_dict["edgeId"] = self._conf.get_edge_identifier()
        message_dict["poiId"] = facerec_msg.matched_class
        message_dict["timestamp"] = math.ceil(time.time())
        message_dict["imageKey"] = key
        message_dict["imageFormat"] = "mp4"
        message_dict["imageBucket"] = facerec_msg.target_bucket

        output_message = json.dumps(message_dict)
        logger.debug("Created facerec message of length {}".format(len(output_message)))

        return output_message
