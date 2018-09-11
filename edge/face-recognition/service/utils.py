import logging
from queue import Full, Empty

logger = logging.getLogger(__name__)


def get_from_queue(queue):
    try:
        new_item = queue.get(block=False)
        return new_item
    except Empty:
        return None


def put_into_queue(queue, item):
    try:
        queue.put(item, block=False)
    except Full:
        logger.error("Queue is full! Throwing away item: {}".format(item))
