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
    };
    
    
    // Method for picking a folder from the filesystem
    $scope.fldrPckr = {
    
        inputElement: '',
        pickFolderDiag: '',
        fldrs: [
            { name: '/', path: '/', fldrs: [] }
        ],
        activeFldr: '/',
        
        listSubFldrs: function(someFldr) {
            $http.post( "http://localhost:5000/listdir", {'path': someFldr.path} )
            .then(function(response) {
                // debugger;
                for (item in response.data) {
                    if ( response.data[item] === 'folder' && item.substring(0,1) !== '.' ) {
                        var folder = {};
                        folder.path = someFldr.path + item + '/';
                        folder.name = item;
                        folder.fldrs = [];
                        someFldr.fldrs.push(folder);
                    };
                };
            });
        },
        
        pick: function(inputEl) {
            $scope.fldrPckr.inputElement = document.getElementById(inputEl);
            $scope.fldrPckr.pickFolderDiag = document.querySelector('#pick-folder-dialog');
            $scope.fldrPckr.pickFolderDiag.showModal();
            if (! $scope.fldrPckr.pickFolderDiag.showModal) {
                dialogPolyfill.registerDialog($scope.fldrPckr.pickFolderDiag);
            };
            $scope.fldrPckr.pickFolderDiag.querySelector('.close').addEventListener('click', function() {
                $scope.fldrPckr.pickFolderDiag.close();
            });
            $scope.fldrPckr.listSubFldrs($scope.fldrPckr.fldrs[0]);
        },
        
        clickFolder: function($event, fldr) {
            $event.stopPropagation();
            $scope.fldrPckr.activeFldr = fldr.path;
            $scope.fldrPckr.listSubFldrs(fldr);
        },
        
        updateInput: function() {
            $scope.fldrPckr.inputElement.value = $scope.fldrPckr.activeFldr;
            $scope.fldrPckr.pickFolderDiag.close();
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
