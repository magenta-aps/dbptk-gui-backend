# Backend to control the Database Preservation Toolkit (DBPTK)

The backend runs as a RESTful service accepting calls to interact with the [DBPTK](https://github.com/keeps/db-preservation-toolkit).

# Installation

All you need to do to run the backend is to download and run the file rest.py, i.e. everything is collected in a single file. 
There are a few prerequests though (these instructions are for Ubuntu, but installation on a Mac can be done in a similar way):

## Prerequisites

You need the following:

### DBPTK

Download and install as described here [DBPTK](https://github.com/keeps/db-preservation-toolkit).

### Python

The code is written in [Python 2.7](https://www.python.org/). This can be installed on an Ubuntu system by using `apt-get` (as root):
```
$ apt-get install python
```

### Python modules

The code makes use of a few Python modules so these also have to be installed. The easiest thing to do is probably to use `pip` to 
install these, but `apt-get` is also an option. Install `pip`:

```
$ apt-get install python-pip
```

You can now install the needed modules, [Flask](http://flask.pocoo.org) and Enum:
```
$ pip install flask
$ pip install flask-cors
```

# Running the server

All you have to do to run the server is to run the file `rest.py` with Python. Run the following command from the folder where 
`rest.py` is located:

```
$ python rest.py
```

The server should now be running on your local machine listening on port 5000.

# Usage

The following resources are available:

### GET http://localhost:5000/getJar
Return the path to to DBPTK jar file.

Example
```
$  curl http://localhost:5000/getJar
{
  "path": null
}
```

### GET http://localhost:5000/getLog
Return log output from the DBPTK converted to a JSON format. NOTE: this resource must not be called until the started DBPTK process 
has finished. The "level" can be one of INFO, WARN, ERROR and DEBUG.

Example
```
$ curl http://localhost/getLog
{
  "log": [
    {
      "level": "INFO", 
      "message": "Operative system: Linux", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Architecture: amd64", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Version: 3.16.0-70-generic", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Java vendor: Oracle Corporation", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Java version: 1.7.0_80", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Java class version: 51.0", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Translating database: mysql to siard-dk", 
      "timestamp": "13:01:58"
    }, 
    {
      "level": "INFO", 
      "message": "Backed up an already existing archive folder to: /tmp/AVID.MAG.1000.1_backup_2016-04-26T08:29:38Z", 
      "timestamp": "13:01:58"
    }, 
	...
```

### POST http://localhost:5000/listdir
Consumes JSON containing the path to a folder from which we wish to list the contents.

Example
```
$ curl -H "Content-Type: application/json" -X POST -d '{"path": "/"}' http://localhost:5000/listdir
```
returns
```
{
  "bin": "folder", 
  "boot": "folder", 
  "cdrom": "folder", 
  "dev": "folder", 
  "etc": "folder", 
  "home": "folder", 
  "initrd.img": "file", 
  "initrd.img.old": "file",
  ...
}
```

### POST http://localhost:5000/run
Starts the DBPTK process by specifying import module settings and export module settings. Consumes JSON - the posted JSON must follow the format shown in the example below.

Example
```
$ curl -i -X POST -H "Content-Type: application/json" -d @request.json http://localhost:5000/run
```
where `request.json` is the file contained in this project. The server will respond with
```
{
  "status": "RUNNING"
}
```

To see all possible flags to set in the JSON, call
```
$ java -jar /path/to/dbptk-app-<VERSION>.jar
``

### POST http://localhost:5000/setJar
Sets the path to the DBPTK jar file. Consumes JSON containing a "path".

Example
```
$ curl -H "Content-Type: application/json" -X POST -d '{"path": "/path/to/dbptk-core/target/dbptk-app-2.0.0-rc3.2.5.jar"}' http://localhost:5000/setJar
{
  "status": "OK"
}
```
Returns status ok if everything went well.

