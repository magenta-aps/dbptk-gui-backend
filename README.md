# GUI for the Database Preservation Toolkit (DBPTK)

The frontend for this GUI is written in AngularJS and you can use the GUI in a standard webbrowser. 
The backend runs as a RESTful service accepting calls to interact with the [DBPTK](https://github.com/keeps/db-preservation-toolkit).

# Installation of the backend (Ubuntu and OS X)

All you need to do to run the backend is to download and run the file rest.py, i.e. everything is collected in a single file. 
There are a few prerequests though. The following instructions are for Ubuntu and OS X (El Capitan):

## Prerequisites

You need the following:

### DBPTK

Download and install as described here [DBPTK](https://github.com/keeps/db-preservation-toolkit).

### Python

The code is written in [Python 2.7](https://www.python.org/).

**Ubuntu:**
Python can be installed on an Ubuntu system by using `apt-get` (as root):
```
$ apt-get install python
```

**OS X:**
Python 2.7 comes preinstalled with OS X El Capitan.

### Python modules

The code makes use of a few Python modules so these also have to be installed. The easiest thing to do is probably to use `pip` to 
install these (but `apt-get` is also an option on Ubuntu Linux). Install `pip`:

**Ubuntu:**
```
$ apt-get install python-pip
```

**OS X:**
```
$ easy_install pip
```

You can now install the needed modules, [Flask](http://flask.pocoo.org) and Enum:

**Ubuntu and OS X:**
```
$ (sudo) pip install flask
$ (sudo) pip install flask-cors
$ (sudo) pip install enum
```
# Installation of the backend in Docker

A Docker image of the DBPTK can be found at the official Docker repository http://cloud.docker.com.

To locate and install the image execute

$ docker run --name dbptk -p 80:80 -p 5000:5000 iamimm/dbptk

For the full documentation see the page https://cloud.docker.com/app/iamimm/repository/docker/iamimm/dbptk/general


# Running the server and GUI

All you have to do is to run a python command that starts the server and opens a browser window for the GUI, 
but before you do that, you must specify the path to the DBPTK jar file. This is done in 
[line 159](https://github.com/magenta-aps/dbptk-gui-backend/blob/master/rest.py#L159) of the file `rest.py`.

Run the following command from the folder where `rest.py` is located:

**For Ubuntu:**
```
$ python rest.py
```

**For OS X El Capitan:**
```
$ python rest-OS_X_El_Capitan.py
```

The server should now be running on your local machine listening on port 5000, and a tab 
containing the GUI should have opened in your browser.


# Backend usage (only relevant for developers)  

The following resources are available:

### GET http://localhost:5000/getJar
Return the path to to DBPTK jar file.

Example
```
$  curl http://localhost:5000/getJar
{
  "path": "/path/to/db-preservation-toolkit/dbptk-core/target/dbptk-app-2.0.0-rc3.2.5.jar"
}
```

### GET http://localhost:5000/getLog
Return log output from the DBPTK converted to a JSON format. NOTE: this resource must not be called until the started DBPTK process 
has finished. The "level" can be one of INFO, WARN, ERROR and DEBUG.

Example
```
$ curl http://localhost:5000/getLog
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

### POST http://localhost:5000/getTableList
Consumes JSON containing the path to the file containing the generated list of tables (this file can be generated with 
the DBPTK export module "list-tables"). An example of the content for table list file could be (in this case for the standard 
[world](https://dev.mysql.com/doc/index-other.html) database) the following:

Example for the standard world database
```
world.City
world.Country
world.CountryLanguage
```

To get these tables as JSON call something like this:

```
$ curl -X POST -H "Content-Type: application/json" -d '{"path":"/tmp/tables.txt"}' http://localhost:5000/getTableList
{
  "status": "OK", 
  "tables": [
    "world.City", 
    "world.Country", 
    "world.CountryLanguage"
  ]
}
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

### POST http://localhost:5000/mkdir
Consumes JSON containing the absolute path to the folder(s) that should be created.

Example
```
$ curl -H "Content-Type: application/json" -X POST -d '{"path": "/tmp/test"}' http://localhost:5000/mkdir
{
  "status": "OK"
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
```

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

### GET http://localhost:5000/status
Returns the status of running processes. Return JSON where "status" is set to one of RUNNING, NOT RUNNING or DONE. If something unexpected happens, it may also 
return an integer (the return code of the process).

Example
```
{
  "status": "DONE"
}
```

### GET http://localhost:5000/terminate
Extracting data from a large database may be time consuming. The user may wish to abort such a process, which can be accomplished by making a call to 
the URL above. If the process is terminated successfully, the following JSON is returned:
```
{
  "status": "TERMINATED"
}
```

## Contact

[Magenta Aps](https://www.magenta.dk)
