import logging
import ffmpeg
import time
import picamera
import picamera.array
import numpy as np
import os
from uuid import uuid4
from threading import Thread
from collections import namedtuple
from .utils import *

logger = logging.getLogger(__name__)
VideoMessage = namedtuple("VideoMessage", "type id data")
ImageData = namedtuple("ImageData", "timestamp image")


class VideoWorker(Thread):

    FRAME_RATE = 15
    VIDEO_RESOLUTION = (1280, 960)
    IMAGE_RESOLUTION = (320, 240)

    def __init__(self, in_q, out_q):
        super().__init__()
        self._in_q = in_q
        self._out_q = out_q
        self.running = False

        self._init_camera()

    def _init_camera(self):
        self._camera = picamera.PiCamera()
        self._camera.resolution = VideoWorker.VIDEO_RESOLUTION
        self._camera.framerate = VideoWorker.FRAME_RATE
        self._image_buffer = picamera.array.PiRGBArray(self._camera, size=VideoWorker.IMAGE_RESOLUTION)

        # Start recording into ring buffer
        self._circular_buffer = picamera.PiCameraCircularIO(self._camera, seconds=60)
        self._camera.start_recording(self._circular_buffer, format="h264", intra_period=2, inline_headers=True, sps_timing=True)

    def run(self):
        self._main_loop()

    def _main_loop(self):
        self.running = True

        while self.running:
            new_message = get_from_queue(self._in_q)
            if new_message is not None:
                if new_message.type is "GetImage":
                    logger.debug("Got image request.")
                    image = self._get_image()
                    put_into_queue(self._out_q, VideoMessage("ImageReady", new_message.id, ImageData(time.time(), image)))
                elif new_message.type is "SaveVideo":
                    logger.debug("Got request to save video with params. Timestamp: {}, Face location: {}".format(new_message.data.timestamp, new_message.data.face_location))
                    file_path = self._save_video(new_message.data.timestamp, new_message.data.face_location)
                    put_into_queue(self._out_q, VideoMessage("VideoReady", new_message.id, file_path))
            else:
                time.sleep(0.1)

    def _get_image(self):
        logger.debug("Capturing image.")
        self._image_buffer.truncate(0)
        self._camera.capture(self._image_buffer, format="rgb", use_video_port=True, resize=VideoWorker.IMAGE_RESOLUTION)
        return np.copy(self._image_buffer.array)

    def _save_video(self, start_timestamp, face_locations):
        min_clip_length = 5
        border_width = 5

        face_loc = self._translate_face_locs(face_locations, border_width)

        # Figure out how to yield ~10s clip length (depending on when the first image was taken)
        now = time.time()
        start_offset = now - start_timestamp

        if start_offset < min_clip_length:
            time.sleep(min_clip_length - start_offset)
            clip_length = min_clip_length
        else:
            clip_length = start_offset

        logger.debug("Clip length will be {}".format(clip_length))

        file_id = str(uuid4())
        h264_file = os.path.join("/root/face_recognition/data", file_id + ".h264")
        logger.debug("Storing h264 stream into file:{}".format(h264_file))
        self._circular_buffer.copy_to(h264_file, seconds=clip_length)

        mp4_file = os.path.join("/root/face_recognition/data", file_id + ".mp4")
        logger.debug("Rendering face label into video and muxing into mp4: {}".format(mp4_file))
        ffmpeg\
            .input(h264_file)\
            .drawbox(face_loc[0], face_loc[1], face_loc[2], face_loc[3], color="blue", thickness=border_width, enable="lte(t,0)")\
            .filter_("loop", loop=VideoWorker.FRAME_RATE*2, size=1, start=0)\
            .output(mp4_file, **{"c:v": "h264_omx", "b:v": 2000000})\
            .run()

        return mp4_file

    def _translate_face_locs(self, face_locs, border_width):
        scale_x = VideoWorker.VIDEO_RESOLUTION[0] / VideoWorker.IMAGE_RESOLUTION[0]
        scale_y = VideoWorker.VIDEO_RESOLUTION[1] / VideoWorker.IMAGE_RESOLUTION[1]
        top_in, right_in, bottom_in, left_in = face_locs
        left = left_in - border_width
        right = right_in + border_width
        bottom = bottom_in + border_width
        top = top_in - border_width
        width = right - left
        height = bottom - top
        return int(left * scale_x), int(top * scale_y), int(width * scale_x), int(height * scale_y)
