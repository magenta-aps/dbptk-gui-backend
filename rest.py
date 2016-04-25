from enum import Enum
from flask import Flask, jsonify, request, abort
from flask.ext.cors import CORS
from os.path import isfile
from subprocess import Popen, PIPE

class STATUS(Enum):
    DONE = 'DONE'
    ERROR = 'ERROR'
    NOT_RUNNING = 'NOT RUNNING'
    OK = 'OK'
    RUNNING = 'RUNNING'


class MESSAGES(Enum):
    INVALID_JSON = 'The structure of the JSON is invalid'
    INVALID_PARAMETER = 'Invalid parameter'
    REQUIRED_PARAMETER_MISSING = 'Required parameter missing'
    PARAMETER_LIST_EMPTY = 'Parameter list empty'
    PATH_NOT_FOUND = '\'path\' not found in JSON request'
    PATH_IS_NOT_A_FILE = 'Path is not a file'
    WRONG_FILENAME = 'Wrong file name'


class PARAMETER(Enum):
    OPTIONAL = 'OPTINONAL'
    REQUIRED = 'REQUIRED'


class Module(object):
    def __init__(self, parameters):
        self.parameters = parameters
    def check_parameter_keys(self, parameters):
        if len(parameters) == 0:
            return {'status': STATUS.ERROR, 'message': MESSAGES.PARAMETER_LIST_EMPTY}
        for key in parameters:
            if not key in self.parameters:
                return {'status': STATUS.ERROR, 'message': MESSAGES.INVALID_PARAMETER}
        for key in self.parameters:
            if self.parameters[key] == PARAMETER.REQUIRED and key not in parameters:
                return {'status': STATUS.ERROR, 'message': MESSAGES.REQUIRED_PARAMETER_MISSING, 'parameter': key}
        return {'status': STATUS.OK}
    def check_parameter_values(self, parameters):
        # TODO: check parameter values
        pass


class JSONChecker(object):
    import_modules = {'jdbc': None, 'microsoft-access': None, 'microsoft-sql-server': None, 'mysql': Module({'import-hostname': PARAMETER.REQUIRED, 'import-database': PARAMETER.REQUIRED, 'import-username': PARAMETER.REQUIRED, 
                              'import-password': PARAMETER.REQUIRED, 'import-port-number': PARAMETER.OPTIONAL}), 'oracle': None, 'postgresql': None, 'siard-1': None, 'siard-2': None, 'siard-dk': None}
    export_modules = {'jdbc': None, 'list-tables': None, 'microsoft-sql-server': None, 'mysql': None, 'oracle': None, 'postgresql': None, 'siard-1': None, 'siard-2': None, 'siard-dk':Module({'export-folder': PARAMETER.REQUIRED, 'export-archiveIndex': PARAMETER.OPTIONAL, 'export-contextDocumentationIndex': PARAMETER.OPTIONAL, 'export-contextDocumentationFolder': PARAMETER.OPTIONAL})}
    
    @staticmethod
    def checkJson(json):
        message = 'OK'
        if 'import-module' in json and 'export-module' in json:
            import_module = json['import-module']
            export_module = json['export-module']
            if 'name' in import_module and 'parameters' in import_module and 'name' in export_module and 'parameters' in export_module:
                if not import_module['name'] in JSONChecker.import_modules or not export_module['name'] in JSONChecker.export_modules:
                    message = 'Invalid name for module'
            else:
                message = 'name or parameters missing in module'
        else:
            message = 'import-module or export-module missing'            
        if not message == 'OK':
            return {'status': STATUS.ERROR, 'message': message} 
                
        name = import_module['name']
        parameters = import_module['parameters']
        module = JSONChecker.import_modules[name]
        resp = module.check_parameter_keys(parameters)
        
        if resp['status'] == STATUS.ERROR:
            return resp
        
        return {'status': message}
        
# MySQL_import_module = Module({'import-hostname': PARAMETER.REQUIRED, 'import-database': PARAMETER.REQUIRED, 'import-username': PARAMETER.REQUIRED, 
#                               'import-password': PARAMETER.REQUIRED, 'import-port-number': PARAMETER.OPTIONAL})
    


app = Flask(__name__)
CORS(app)

status = STATUS.NOT_RUNNING
path_to_jar = None
process = None


@app.route('/getJar', methods = ['GET'])
def get_jar():
    return jsonify({'path': path_to_jar})


@app.route('/setJar', methods = ['POST'])
def set_jar():
    if not request.json:
        about(400)
    if not 'path' in request.json:
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.PATH_NOT_FOUND})
    path = request.json['path']
    if not isfile(path):
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.PATH_IS_NOT_A_FILE})
    if not 'jar' in path or not 'dbptk' in path:
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.WRONG_FILENAME})
    global path_to_jar
    path_to_jar = path

    return jsonify({'status': STATUS.OK})


@app.route('/status', methods = ['GET'])
def get_status():
    try:
        returncode = process.poll()
        if returncode == None:
            resp = {'status': STATUS.RUNNING}
        elif returncode == 0:
            resp = {'status': STATUS.DONE}
    except AttributeError:
        resp = {'status': STATUS.NOT_RUNNING}
    return jsonify(resp)


@app.route('/run', methods=['POST'])
def start_process():
    if not request.json:
        abort(400)
    
    # Check json
    check = JSONChecker.checkJson(request.json)
    if not check['status'] == STATUS.OK:
        return jsonify(check)
    
    # args = ['java', '-jar', '/home/andreas/eark/db-preservation-toolkit/dbptk-core/target/dbptk-app-2.0.0-rc3.2.5.jar', '-i', 'mysql', '-ih', 'localhost',
    #       '-idb', 'sakila', '-iu', 'andreas', '-ip', 'hemmeligt', '-e', 'siard-dk', '-ef', '/tmp/AVID.MAG.1000.1']
    
    args = ['sleep', '5']
    global process
    process = Popen(args, stdout=PIPE)
        
    return jsonify({'status': STATUS.RUNNING})

    
if __name__ == '__main__':
    app.run(debug=True)
