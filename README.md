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

# Running the server

All you have to do to run the server is to run the file `rest.py` with Python. Run the following command from the folder where 
`rest.py` is located:

```
$ python rest.py
```

The server should now be running on your local machine listening on port 5000.

# Usage

The following resources are available:

## GET http://localhost:5000/getJar

Return the path to to DBPTK jar file.

### Example

```
$  curl http://localhost:5000/getJar
{
  "path": null
}
```

