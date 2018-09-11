import boto3
import botocore
import logging
import requests
import isodate
import io
import time
import json
from .utils import *
from uuid import uuid4
from datetime import datetime, timezone
from collections import namedtuple
from requests.exceptions import RequestException
from threading import Thread

logger = logging.getLogger(__name__)
StorageMessage = namedtuple("StorageMessage", "type value retVal")


class RemoteStorage(Thread):

    def __init__(self, config, storage_q, storage_done_q):
        super().__init__()
        self._config = config
        self._storage_q = storage_q
        self._storage_done_q = storage_done_q
        self._retrieve_credentials()

    def run(self):
        self._main_loop()

    def _main_loop(self):
        while True:
            new_message = get_from_queue(self._storage_q)
            if new_message is not None:
                if new_message.type == "write":
                    logger.debug("Got request to write item (path: {})".format(len(new_message.value.payload_path)))
                    key = self._write_file(new_message.value.target_bucket, new_message.value.payload_path)
                    if key is not None:
                        logger.debug("Successfully stored item.")
                        put_into_queue(self._storage_done_q, StorageMessage("write", None, (key, new_message.value)))
                elif new_message.type == "read":
                    model_msg = new_message.value
                    logger.debug("Got request to read key {} from bucket {}".format(model_msg["modelKey"],
                                                                                    model_msg["modelBucket"]))
                    data = self._read_file(model_msg["modelKey"], model_msg["modelBucket"])
                    if data is not None:
                        model_msg["modelData"] = data
                        put_into_queue(self._storage_done_q, StorageMessage("read", None, model_msg))

            time.sleep(0.5)

    def _write_file(self, bucket, payload_path):
        if self._check_credentials():
            s3 = boto3.client("s3",
                              aws_access_key_id=self._credentials["accessKeyId"],
                              aws_secret_access_key=self._credentials["secretAccessKey"],
                              aws_session_token=self._credentials["sessionToken"])

            key = str(uuid4())

            try:
                with open(payload_path, "rb") as payload_file:
                    s3.upload_fileobj(payload_file, bucket, key)
            except botocore.exceptions.ClientError:
                return None

            return key

    def _read_file(self, key, bucket):
        if self._check_credentials():
            s3 = boto3.client("s3",
                              aws_access_key_id=self._credentials["accessKeyId"],
                              aws_secret_access_key=self._credentials["secretAccessKey"],
                              aws_session_token=self._credentials["sessionToken"])

            logger.debug("Attemtping S3 download")

            with io.BytesIO() as stream:
                s3.download_fileobj(bucket, key, stream)
                data = stream.getvalue().decode("ascii")

            logger.debug("Downloaded key {} from bucket {}".format(key, bucket))

            if len(data) == 0:
                return None
            else:
                return json.loads(data)

    def _check_credentials(self):
        logger.debug("Checking s3 credentials...")
        if self._credentials is None:
            # try to obtain new credentials if there are none
            success = self._retrieve_credentials()
            return success
        else:
            # check if existing credentials are still valid by expiration timestamp
            now = datetime.now(timezone.utc)
            creds_expiration = isodate.parse_datetime(self._credentials["expiration"])
            expired = creds_expiration < now
            if expired:
                logger.debug("Cached credentials expired at: {}", creds_expiration.isoformat())
                success = self._retrieve_credentials()
                return success
            else:
                logger.debug("Credentials still valid. Using cache.")
                return True

    def _retrieve_credentials(self):
        logger.debug("Trying to retrieve new credentials...")
        try:
            credential_response = requests.get(self._config.get_credential_provider_endpoint(),
                                               cert=(self._config.get_device_cert_path(),
                                                     self._config.get_device_pkey_path()),
                                               verify=self._config.get_amazon_ca_path())
        except RequestException as e:
            logger.error("Request for S3 credentials failed: {}".format(e.strerror))
            self._credentials = None
            return False

        if credential_response.status_code is 200:
            logger.debug("Successfully received credentials for S3 access: {}".format(credential_response.json()))
            self._credentials = credential_response.json()["credentials"]
            return True
        else:
            logger.debug("Something went wrong retrieving S3 credentials! Response Status: {}, Content: {}".format(
                credential_response.status_code, credential_response.content))
            self._credentials = None
            return True
