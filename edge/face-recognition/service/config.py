import os
import json


class Config:
    def __init__(self, config_file_path):
        self._dir, self._fname = os.path.split(config_file_path)
        self._config = self._load_config()

    def _load_config(self):
        with open(os.path.join(self._dir, self._fname), 'r') as f:
            conf = json.load(f)

        return conf

    def get_edge_identifier(self):
        return self._config["edge-identifier"]

    def get_edge_endpoint(self):
        return self._config["edge-endpoint"]

    def get_iot_ca_path(self):
        return self._get_absolute_path(self._config["iot-ca-path"])

    def get_device_cert_path(self):
        return self._get_absolute_path(self._config["device-cert-path"])

    def get_device_pkey_path(self):
        return self._get_absolute_path(self._config["device-pkey-path"])

    def get_amazon_ca_path(self):
        return self._get_absolute_path(self._config["amazon-ca-path"])

    def get_credential_provider_endpoint(self):
        return self._config["credential-provider-endpoint"]

    def _get_absolute_path(self, relative_path):
        return os.path.join(self._dir, relative_path)
