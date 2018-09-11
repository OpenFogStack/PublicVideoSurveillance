import face_recognition
import numpy as np
import logging
import math
import json
import io
import time
from queue import Queue
from collections import namedtuple
from threading import Thread
from sklearn import neighbors
from .utils import *
from .video import VideoWorker, VideoMessage

logger = logging.getLogger(__name__)
FaceRecMessage = namedtuple("FaceRecMessage", "matched_class payload_path target_bucket")
FaceRec = namedtuple("FaceRec", "timestamp face_location")


class FaceRecWorker(Thread):

    def __init__(self, model_q, facerec_q):
        Thread.__init__(self)
        self._model_q = model_q
        self._facerec_q = facerec_q
        self._face_tolerance = 0.6
        self._classifier = None
        self.running = False
        self._facerec_bucket = ""

        self._to_video_q = Queue()
        self._from_video_q = Queue()
        self._video_worker = VideoWorker(self._to_video_q, self._from_video_q)
        self._video_worker.start()

    def run(self):
        self._main_loop()

    def _main_loop(self):
        self.running = True
        put_into_queue(self._to_video_q, VideoMessage("GetImage", 0, None))

        while self.running:
            # Check input queue for new models
            new_model = get_from_queue(self._model_q)
            if new_model is not None:
                self._facerec_bucket = new_model["edgeTempBucket"]
                self.update_classifier(new_model["modelData"])

            # Check for new image that is ready to be put through face recognition
            new_message = get_from_queue(self._from_video_q)
            if new_message is not None:
                if new_message.type is "ImageReady":
                    self._predict_faces(new_message.data)
                    put_into_queue(self._to_video_q, VideoMessage("GetImage", 0, None))
                elif new_message.type is "VideoReady":
                    put_into_queue(self._facerec_q, FaceRecMessage(new_message.id, new_message.data, self._facerec_bucket))

            time.sleep(0.1)

    def _predict_faces(self, image_data):
        if self._classifier is not None:
            matches = self._predict(image_data.image, self._classifier, self._face_tolerance)
            for match in matches:
                if match[0] is not "unknown":
                    logger.debug("New face matched: {}".format(match[0]))
                    put_into_queue(self._to_video_q, VideoMessage("SaveVideo", match[0], FaceRec(image_data.timestamp, match[1])))

    def update_classifier(self, model_data):
        # Deserialize model_data
        face_encodings = np.load(io.BytesIO(bytes(model_data["face-encodings"])))
        class_labels = np.load(io.BytesIO(bytes(model_data["class-labels"])))

        logger.info("Installing new model (containing classes: {})".format(str(set(class_labels))))

        # Construct new classifier
        n_neighbors = int(round(math.sqrt(len(face_encodings))))
        knn_algo = "ball_tree"
        knn_clf = neighbors.KNeighborsClassifier(n_neighbors=n_neighbors, algorithm=knn_algo, weights='distance')
        knn_clf.fit(face_encodings, class_labels)
        self._classifier = knn_clf

    def _predict(self, x_img, knn_clf, distance_threshold):
        """
        Recognizes faces in given image using a trained KNN classifier
        :param x_img: image of people to recognize as numpy array (as returned by load_image_file)
        :param knn_clf: a knn classifier object.
        :param distance_threshold: (optional) distance threshold for face classification. the larger it is, the more chance
               of mis-classifying an unknown person as a known one.
        :return: a list of names and face locations for the recognized faces in the image: [(name, bounding box), ...].
            For faces of unrecognized persons, the name 'unknown' will be returned.
        """
        # TODO Add license to method? (it started out as a copy from https://github.com/ageitgey/face_recognition/blob/master/examples/face_recognition_knn.py)

        # Find face locations
        x_face_locations = face_recognition.face_locations(x_img)

        # If no faces are found in the image, return an empty result.
        if len(x_face_locations) == 0:
            return []

        # Find encodings for faces in the test image
        faces_encodings = face_recognition.face_encodings(x_img, known_face_locations=x_face_locations)

        # Use the KNN model to find the best matches for the test face
        closest_distances = knn_clf.kneighbors(faces_encodings, n_neighbors=1)
        are_matches = [closest_distances[0][i][0] <= distance_threshold for i in range(len(x_face_locations))]

        # Predict classes and remove classifications that aren't within the threshold
        return [(pred, loc) if rec else ("unknown", loc) for pred, loc, rec in
                zip(knn_clf.predict(faces_encodings), x_face_locations, are_matches)]
