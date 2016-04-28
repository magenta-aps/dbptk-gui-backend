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
    
    
    // Commit the form and start importing
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
        
    };
    
    
    // A little navigation scripting
    $scope.states = {
        home: true,
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
