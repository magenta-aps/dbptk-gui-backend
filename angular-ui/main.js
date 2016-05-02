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
    
    
    // Script for picking a folder from the filesystem
    var pfdialog = document.querySelector('#pick-folder-dialog');
    var showDialogButton = document.querySelector('#siard-dk-import-folder');
    $scope.currentFolder = '/';
    
    if (! pfdialog.showModal) {
        dialogPolyfill.registerDialog(pfdialog);
    };
    
    showDialogButton.addEventListener('click', function() {
        pfdialog.showModal();
        $scope.traverseDown($scope.currentFolder);
    });
    
    pfdialog.querySelector('.close').addEventListener('click', function() {
        $scope.model.importModules['siard-dk']['import-folder'] = $scope.currentFolder;
        $scope.currentFolder = '/';
        pfdialog.close();
    });
    
    $scope.traverseUp = function() {
        
    };
    
    $scope.traverseDown = function(currentPath) {
        if (currentPath !== '/') {
            $scope.currentFolder = $scope.currentFolder + '/' + currentPath;
        };
        $http.post( "http://localhost:5000/listdir", {'path': $scope.currentFolder} )
        .then(function(response) {
            // debugger;
            $scope.folders = [];
            for (item in response.data) {
                if (response.data[item] === 'folder') {
                    $scope.folders.push(item);
                };
            };
        });
    };
    
    $http.post( "http://localhost:5000/listdir", {'path': $scope.currentFolder} )
    .then(function(response) {
        // debugger;
        $scope.folders = [];
        for (item in response.data) {
            if (response.data[item] === 'folder') {
                console.log(item);
                $scope.folders.push(item);
            };
        };
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
        
        $scope.displayCallToggle(); // For debugging -- REMOVE
        
        // Send it off via ajax
        $http.post( "http://localhost:5000/run", $scope.importData )
        .then(function(response) {
            // debugger;
            $scope.logger = response.data;
        });
        
        // Get status updates while exporting
        $http.get( "http://localhost:5000/status" )
        .then(function(response) {
            // debugger;
            $scope.logger = response.data;
            if (response.data.status === 'NOT RUNNING') {
                $scope.exportStatus = response.data.status;
                document.querySelector('#export-progress').addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(0);
                });
            } else if (response.data.status === 'RUNNING') {
                $scope.exportStatus = response.data.status;
            } else if (response.data.status === 'DONE') {
                $scope.exportStatus = response.data.status;
                document.querySelector('#export-progress').addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(100);
                });
            } else {
                $scope.exportStatus = 'Error ' + response.data.status;
                document.querySelector('#export-progress').addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(0);
                });
            }
            
        });
        
    };
    
    
    // Cancel ongoing export
    $scope.cancelExport = function() {
        
        // Send termination request
        $http.get( "http://localhost:5000/terminate" )
        .then(function(response) {
            // debugger;
            $scope.logger = response.data;
        });
        
        // Navigate to home screen;
        $scope.states.progress = false;
        $scope.states.home = true;
        
    };
    
    
    // A little navigation scripting
    $scope.states = {
        home: true, // Default is displaying home
        connect: false,
        output: false,
        progress: false
    };
    
    
    // For debugging -- REMOVE
    $scope.dcOpen = false;
    $scope.displayCallToggle = function() {
        $scope.dcOpen = !$scope.dcOpen;
    };
    
    
});
