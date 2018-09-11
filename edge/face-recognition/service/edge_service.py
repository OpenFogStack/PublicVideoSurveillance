import logging
import sys
import time
from queue import Queue

from .mqtt import MQTTWorker
from .facerec import FaceRecWorker, FaceRecMessage
from .config import Config
from .remote_storage import RemoteStorage, StorageMessage
from .utils import *

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG, format=LOG_FORMAT)
logger = logging.getLogger(__name__)


class EdgeService:

    def __init__(self):
        self._config = Config("/root/face_recognition/config/config.json")

        # Create queues for inter-thread communication
        self._model_q = Queue()
        self._facerec_q = Queue()
        self._facerec_worker = FaceRecWorker(self._model_q, self._facerec_q)

        self._msg_in_q = Queue()
        self._msg_out_q = Queue()
        self._mqtt_worker = MQTTWorker(self._config, self._msg_in_q, self._msg_out_q)

        self._storage_q = Queue()
        self._storage_done_q = Queue()
        self._remote_storage = RemoteStorage(self._config, self._storage_q, self._storage_done_q)

        self._mqtt_worker.start()
        self._facerec_worker.start()
        self._remote_storage.start()

        self._current_model_id = 0

        self._main_loop()

    def _main_loop(self):
        # Dispatch events
        while True:

            # Receive new model messages -> load model payload from S3
            new_model_msg = get_from_queue(self._msg_in_q)
            if new_model_msg is not None and self._is_new_model(new_model_msg):
                logger.debug("Received new model metadata {}. Scheduling for download... ({})".format(new_model_msg["modelId"], new_model_msg))
                put_into_queue(self._storage_q, StorageMessage("read", new_model_msg, None))

            # Receive new storage messages: successful read -> handle new model, successful write -> send facerec metadata
            new_storage_msg = get_from_queue(self._storage_done_q)
            if new_storage_msg is not None:
                if new_storage_msg.type == "read":
                    self._handle_model_msg(new_storage_msg.retVal)
                elif new_storage_msg.type == "write":
                    put_into_queue(self._msg_out_q, new_storage_msg.retVal)
                    logger.info("Stored payload for {} in backend. Sending metadata.".format(new_storage_msg.retVal))

            # Receive new facerec msg -> write payload to S3
            new_facerec_msg = get_from_queue(self._facerec_q)
            if new_facerec_msg is not None:
                put_into_queue(self._storage_q, StorageMessage("write", new_facerec_msg, None))
                logger.info("Got new match: " + str(new_facerec_msg.matched_class))

            time.sleep(0.5)

    def _handle_model_msg(self, model_msg):
        logger.info("Downloaded new model data (ID: {})! Updating classifier...".format(model_msg["modelId"]))
        self._current_model_id = model_msg["modelId"]
        put_into_queue(self._model_q, model_msg)

    def _is_new_model(self, model_msg):
        return model_msg["modelId"] > self._current_model_id
