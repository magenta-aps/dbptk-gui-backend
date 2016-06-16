var app = angular.module('dbptkApp', []);

app.controller('DbptkCtrl', function($scope, $http) {
    
    // Default value for path to DPPTK jar file
    $scope.jarPath = "dbptk-jar/dbptk-app-2.0.0-beta4.0.jar"; 
    
    
    // An overview of the model that is populated by the UI form
    $scope.model = {
        importModules: {
            'jdbc': {},
            'microsoft-access': {},
            'microsoft-sql-server': {},
            'mysql': {},
            'oracle': {},
            'postgresql': {},
            'siard-1': {},
            'siard-2': {},
            'siard-dk': {}
        },
        exportModules: {
            'jdbc': {},
            'list-tables': {},
            'microsoft-sql-server': {},
            'mysql': {},
            'oracle': {},
            'postgresql': {},
            'siard-1': {},
            'siard-2': {},
            'siard-dk': {}
        }
    };
    
    
    // First, set the path to a working DBPTK jar file
    $http.post(
        "http://localhost:5000/setJar",
        {
            "path": $scope.jarPath
        }
    )
    .then(function(response) {
        // debugger;
        $scope.logger = response.data;
    });
    
    
    // Commit the form and start exporting
    $scope.startImport = function() {
        
        $scope.importData = {
            'import-module': {
                'name': $scope.model.importChoice,
                'parameters': {}
            }, 'export-module': {
                'name': $scope.model.exportChoice,
                'parameters': {}
            }
        };
        
        for (var param in $scope.model.importModules[$scope.model.importChoice]) {
            $scope.importData['import-module']['parameters'][param] = $scope.model.importModules[$scope.model.importChoice][param];    
        };
        
        for (var param in $scope.model.exportModules[$scope.model.exportChoice]) {
            $scope.importData['export-module']['parameters'][param] = $scope.model.exportModules[$scope.model.exportChoice][param];    
        };
        
        // Send it off via ajax
        $http.post( "http://localhost:5000/run", $scope.importData )
        .then(function(response) {
            // debugger;
            $scope.logger = response.data;
            getStatus();
        });
        
    };
    
    
    getStatus = function() {
        // Get status updates while exporting
        $http.get( "http://localhost:5000/status" )
        .then(function(response) {
            // debugger;
            $scope.logger = response.data;
            $scope.exportStatus = response.data.status;
            if (response.data.status === 'NOT RUNNING') {
                document.querySelector('#export-progress').addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(0);
                });
            } else if (response.data.status === 'RUNNING') {
                // Check for new status every 5 seconds
                setTimeout(getStatus(), 5000);
            } else if (response.data.status === 'DONE') {
                alert('Import/export is DONE. Your exported data should be at the specified destination.');
                document.querySelector('#export-progress').addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(100);
                });
            } else {
                alert('Something unexpected happened. Your import/export was cancelled.');
                $scope.exportStatus = 'Something unexpected happened';
                document.querySelector('#export-progress').addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(0);
                });
            };
            
        });
    };
    
    
    // Cancel ongoing export
    $scope.cancelExport = function() {
        
        // Send termination request
        $http.get( "http://localhost:5000/terminate" )
        .then(
            function(response) {
                // debugger;
                $scope.logger = response.data;
                alert('You cancelled the proces: ' + $scope.logger.message);
            },
            function(response) {
                $scope.logger = response.data;
                alert('You couldn\'t terminate the process. Maybe it wasn\'t running: ' + $scope.logger);
            }
        );
        
        // Reset status
        $scope.exportStatus = '';
        $scope.logger = {};
        $scope.importData = {};
        
        // Navigate to home screen;
        $scope.states.progress = false;
        $scope.states.home = true;
        
    };
    
    // Exit browser UI
    $scope.exitApp = function() {
        $http.get( "http://localhost:5000/terminate" );
        window.close();
    }
    
    
    // Init Folder picker dialog
    var pickFolderDiag = document.querySelector('#pick-folder-dialog');
    var pickFolderDiagBtn = document.querySelector('#siard-dk-import-folder');
    if (! pickFolderDiag.showModal) {
        dialogPolyfill.registerDialog(pickFolderDiag);
    }
    pickFolderDiagBtn.addEventListener('click', function() {
        $scope.pickFldr = Object.create(FldrPckr);
        $scope.pickFldr.listSubFldrs($scope.pickFldr.fldrs[0]);
        pickFolderDiag.showModal();
    });
    pickFolderDiag.querySelector('.close').addEventListener('click', function() {
        pickFolderDiag.close();
    });
    
    
    // Script for picking a folder from the filesystem
    FldrPckr = {
        fldrs: [
            { name: '/', path: '/', fldrs: [] }
        ],
        activeFldr: '/',
        listSubFldrs: function(someFldr) {
            $http.post( "http://localhost:5000/listdir", {'path': someFldr.path} )
            .then(function(response) {
                // debugger;
                for (item in response.data) {
                    if (response.data[item] === 'folder') {
                        var folder = {};
                        folder.path = someFldr.path + item + '/';
                        folder.name = item;
                        folder.fldrs = [];
                        someFldr.fldrs.push(folder);
                    };
                };
            });
        },
        clickFolder: function($event, fldr) {
            $event.stopPropagation();
            $scope.pickFldr.activeFldr = fldr.path;
            $scope.pickFldr.listSubFldrs(fldr);
        },
        updateInput: function(target) {
            $scope.model.importModules['siard-dk']['import-folder'] = $scope.pickFldr.activeFldr;
            target = $scope.pickFldr.activeFldr;
            pickFolderDiag.close();
        }
    };
    
    
    // A little navigation scripting
    $scope.states = {
        home: true, // Default is displaying home
        connect: false,
        output: false,
        progress: false
    };
    
    
});
