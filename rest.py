from enum import Enum
from flask import Flask, jsonify, request, abort
from flask.ext.cors import CORS
from os import listdir
from os.path import isfile, isdir, isabs, islink, join
from subprocess import Popen, PIPE

class STATUS(Enum):
    DONE = 'DONE'
    ERROR = 'ERROR'
    NOT_RUNNING = 'NOT RUNNING'
    OK = 'OK'
    RUNNING = 'RUNNING'
    TERMINATED = 'TERMINATED'


class MESSAGES(Enum):
    COULD_NOT_LIST_FOLDER_CONTENT = 'Could not list folder content'
    EMPTY_VALUE = 'Empty value'
    INVALID_JSON = 'The structure of the JSON is invalid'
    INVALID_PARAMETER = 'Invalid parameter'
    REQUIRED_PARAMETER_MISSING = 'Required parameter missing'
    PARAMETER_LIST_EMPTY = 'Parameter list empty'
    PATH_IS_NOT_A_FOLDER = 'Path is not a folder'
    PATH_IS_NOT_A_FILE = 'Path is not a file'
    PATH_NOT_FOUND = '\'path\' not found in JSON request'
    PATH_TO_JAR_NOT_SET = 'Path to DBPTK jar is not set'
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
                return {'status': STATUS.ERROR, 'message': MESSAGES.INVALID_PARAMETER, 'parameter': key}
        for key in self.parameters:
            if self.parameters[key] == PARAMETER.REQUIRED and key not in parameters:
                return {'status': STATUS.ERROR, 'message': MESSAGES.REQUIRED_PARAMETER_MISSING, 'parameter': key}
        return {'status': STATUS.OK}
    def check_parameter_values(self, parameters):
        # TODO: check parameter values
#         for key in parameters:
#             if JSONChecker.import_modules
#             if value.strip() == '' and :
#                 return {'status': STATUS.ERROR, 'message': MESSAGES.EMPTY_VALUE}
#         return {'status': STATUS.OK}
        pass
    def is_parameter_value_mandatory(self, name):
        return self.parameters[name][1]
    

class JSONChecker(object):
    import_modules = {'jdbc': Module({'import-driver': (PARAMETER.REQUIRED, True), 'import-connection': (PARAMETER.REQUIRED, True)}),
                      'microsoft-access': Module({'microsoft-access': (PARAMETER.REQUIRED, True)}),
                      'microsoft-sql-server': Module({'import-server-name': (PARAMETER.REQUIRED, True), 'import-database': (PARAMETER.REQUIRED, True),
                                                     'import-username': (PARAMETER.REQUIRED, True), 'import-password': (PARAMETER.REQUIRED, True),
                                                     'import-use-integrated-login': (PARAMETER.OPTIONAL, False),
                                                     'import-disable-encryption': (PARAMETER.OPTIONAL, False),
                                                     'import-instance-name': (PARAMETER.OPTIONAL, True), 'import-port-number': (PARAMETER.OPTIONAL, True)}),
                      'mysql': Module({'import-hostname': (PARAMETER.REQUIRED, True), 'import-database': (PARAMETER.REQUIRED, True),
                                       'import-username': (PARAMETER.REQUIRED, True), 'import-password': (PARAMETER.REQUIRED, True),
                                       'import-port-number': (PARAMETER.OPTIONAL, True)}),
                      'oracle': Module({'import-server-name': (PARAMETER.REQUIRED, True), 'import-database': (PARAMETER.REQUIRED, True),
                                        'import-username': (PARAMETER.REQUIRED, True), 'import-password': (PARAMETER.REQUIRED, True),
                                        'import-port-number': (PARAMETER.REQUIRED, True), 'import-accept-license': (PARAMETER.OPTIONAL, False)}),
                      'postgresql': Module({'import-hostname': (PARAMETER.REQUIRED, True), 'import-database': (PARAMETER.REQUIRED, True),
                                            'import-username': (PARAMETER.REQUIRED, True), 'import-password': (PARAMETER.REQUIRED, True),
                                            'import-disable-encryption': (PARAMETER.OPTIONAL, False), 'import-port-number': (PARAMETER.OPTIONAL, True)}),
                      'siard-1': Module({'import-file': (PARAMETER.REQUIRED, True)}),
                      'siard-2': Module({'import-file': (PARAMETER.REQUIRED, True)}),
                      'siard-dk': Module({'import-folder': (PARAMETER.REQUIRED, True), 'import-as-schema': (PARAMETER.REQUIRED, True)})
                      }
    export_modules = {'jdbc': Module({'export-driver': (PARAMETER.REQUIRED, True), 'export-connection': (PARAMETER.REQUIRED, True)}),
                      'list-tables': Module({'export-file': (PARAMETER.REQUIRED, True)}),
                      'microsoft-sql-server': Module({'export-server-name': (PARAMETER.REQUIRED, True), 'export-database': (PARAMETER.REQUIRED, True),
                                                      'export-username': (PARAMETER.REQUIRED, True), 'export-password': (PARAMETER.REQUIRED, True),
                                                      'export-use-integrated-login': (PARAMETER.OPTIONAL, False),
                                                      'export-disable-encryption': (PARAMETER.OPTIONAL, False),
                                                      'export-instance-name': (PARAMETER.OPTIONAL, True), 'export-port-number': (PARAMETER.OPTIONAL, True)}),
                      'mysql': Module({'export-hostname': (PARAMETER.REQUIRED, True), 'export-database': (PARAMETER.REQUIRED, True),
                                       'export-username': (PARAMETER.REQUIRED, True),
                                        'export-password': (PARAMETER.REQUIRED, True), 'export-port-number': (PARAMETER.OPTIONAL, True)}),
                      'oracle': Module({'export-server-name': (PARAMETER.REQUIRED, True), 'export-database': (PARAMETER.REQUIRED, True),
                                        'export-username': (PARAMETER.REQUIRED, True), 'export-password': (PARAMETER.REQUIRED, True),
                                        'export-port-number': (PARAMETER.REQUIRED, True), 'export-accept-license': (PARAMETER.OPTIONAL, False),
                                        'export-source-schema': (PARAMETER.OPTIONAL, True)}),
                      'postgresql': Module({'export-hostname': (PARAMETER.REQUIRED, True), 'export-database': (PARAMETER.REQUIRED, True),
                                            'export-username': (PARAMETER.REQUIRED, True), 'export-password': (PARAMETER.REQUIRED, True),
                                            'export-disable-encryption': (PARAMETER.OPTIONAL, False), 'export-port-number': (PARAMETER.OPTIONAL, True)}),
                      'siard-1': Module({'export-file': (PARAMETER.REQUIRED, True), 'export-compress': (PARAMETER.OPTIONAL, False),
                                         'export-pretty-xml': (PARAMETER.OPTIONAL, False), 'export-table-filter': (PARAMETER.OPTIONAL, True)}),
                      'siard-2': Module({'export-file': (PARAMETER.REQUIRED, True), 'export-compress': (PARAMETER.OPTIONAL, False),
                                         'export-pretty-xml': (PARAMETER.OPTIONAL, False), 'export-table-filter': (PARAMETER.OPTIONAL, True)}),
                      'siard-dk': Module({'export-folder': (PARAMETER.REQUIRED, True), 'export-archiveIndex': (PARAMETER.OPTIONAL, True),
                                          'export-contextDocumentationIndex': (PARAMETER.OPTIONAL, True),
                                          'export-contextDocumentationFolder': (PARAMETER.OPTIONAL, True)})}
    
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
        
        # def check_parameters(module): 
        name = import_module['name']
        parameters = import_module['parameters']
        module = JSONChecker.import_modules[name]
        resp = module.check_parameter_keys(parameters)
        
        if resp['status'] == STATUS.ERROR:
            return resp

        name = export_module['name']
        parameters = export_module['parameters']
        module = JSONChecker.export_modules[name]
        resp = module.check_parameter_keys(parameters)
        
        if resp['status'] == STATUS.ERROR:
            return resp

        return {'status': message}
    
    @staticmethod
    def is_parameter_value_mandatory(module_type, name, parameter):  
        if module_type == 'import':
            return JSONChecker.import_modules[name].is_parameter_value_mandatory(parameter)
        elif module_type == 'export':
            return JSONChecker.export_modules[name].is_parameter_value_mandatory(parameter)
        else:
            raise 'module_type must be either "import" or "export"'

app = Flask(__name__)
CORS(app)

status = STATUS.NOT_RUNNING
# path_to_jar = None
path_to_jar = '/home/andreas/eark/db-preservation-toolkit/dbptk-core/target/dbptk-app-2.0.0-rc3.2.5.jar'
process = None


@app.route('/getJar', methods = ['GET'])
def get_jar():
    return jsonify({'path': path_to_jar})


@app.route('/listdir', methods = ['POST'])
def list_dir():
    if not request.json:
        about(400)
    if not 'path' in request.json:
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.PATH_NOT_FOUND})
    path = request.json['path']
    if not isabs(path):
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.PATH_IS_NOT_A_FOLDER})
    content = {}
    try:
        for f in listdir(path):
            full_path = join(path, f)
            if isdir(full_path):
                content[f] = 'folder'
            elif isfile(full_path):
                content[f] = 'file'
            # elif islink(full_path):
            #     content[f] = 'link'
            else:
                content[f] = 'other'
    except OSError:
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.COULD_NOT_LIST_FOLDER_CONTENT})
    return jsonify(content)


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
        else:
            resp = {'status': returncode}
    except AttributeError:
        resp = {'status': STATUS.NOT_RUNNING}
    return jsonify(resp)


@app.route('/run', methods=['POST'])
def start_process():
    if not request.json:
        abort(400)
    
    if path_to_jar == None:
        return jsonify({'status': STATUS.ERROR, 'message': MESSAGES.PATH_TO_JAR_NOT_SET})
    
    # Check json
    check = JSONChecker.checkJson(request.json)
    if not check['status'] == STATUS.OK:
        return jsonify(check)

    def add_parameter_args(args, module_type, module):
        args.append(module['name'])
        for p in module['parameters']:
            parameter_str = '--' + p
            if JSONChecker.is_parameter_value_mandatory(module_type, module['name'], p):
                parameter_str += '=' + module['parameters'][p]
            args.append(parameter_str)
            
    import_module = request.json["import-module"]
    export_module = request.json["export-module"]
    args = [u'java', u'-jar', path_to_jar, u'-i']
    add_parameter_args(args, 'import', import_module)
    args.append('-e')   
    add_parameter_args(args, 'export', export_module)
    
    # args = ['sleep', '5']
    
    global process
    process = Popen(args, stdout=PIPE)
        
    return jsonify({'status': STATUS.RUNNING})

    
@app.route('/terminate', methods = ['GET'])
def terminate_process():
    error_json = {'status': STATUS.ERROR, 'message': 'The process could not be terminated!'}
    global process
    if not process == None:
        process.terminate()
        returncode = process.poll()
        process = None
        if returncode == None:
            return jsonify({'status': STATUS.TERMINATED})
        else:
            return jsonify(error_json)
    else:
        return jsonify(error_json)

if __name__ == '__main__':
    app.run(debug=True)
