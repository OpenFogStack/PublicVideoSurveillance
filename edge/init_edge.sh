#!/bin/sh

#$1 = REDIS: respberry pi path for persistency
name=$1

if [[ -n "$name" ]]; then
  #Kill all running docker containers
  docker kill $(docker ps -q)

  #Init database
  cd database
  docker build -f dockerfile_database_redis -t redis_edge .
  docker run -d -p 0.0.0.0:6380:6379 -v $name:/data redis_edge redis-server --appendonly yes
  cd ..

  #Open OpenFace App - e.g. via Dockerfile
  #TODO

else
    echo "argument error"
    exit
fi
