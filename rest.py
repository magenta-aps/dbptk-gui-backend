from flask import Flask, jsonify, request, abort
from subprocess import Popen, PIPE

class STATUS(object):
    DONE = 'DONE'
    NOT_RUNNING = 'NOT RUNNING'
    RUNNING = 'RUNNING'



"""
class Parameters(object):
    
    def __init__(self, parameters):
        self.import_parameters = 
"""

app = Flask(__name__)
status = STATUS.NOT_RUNNING
process = None


def check_json(json):
    pass



@app.route('/run', methods=['POST'])
def start_process():
    if not request.json:
        abort(400)
    
    # Check json
    
    # args = ['java', '-jar', '/home/andreas/eark/db-preservation-toolkit/dbptk-core/target/dbptk-app-2.0.0-rc3.2.5.jar', '-i', 'mysql', '-ih', 'localhost',
    #       '-idb', 'sakila', '-iu', 'andreas', '-ip', 'hemmeligt', '-e', 'siard-dk', '-ef', '/tmp/AVID.MAG.1000.1']
    
    args = ['sleep', '5']
    global process
    process = Popen(args, stdout=PIPE)
        
    return jsonify({'status': STATUS.RUNNING})


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

    
if __name__ == '__main__':
    app.run(debug=True)
