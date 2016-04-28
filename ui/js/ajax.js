$(".database-connect").click(function() {
	var dbms = $("#dbms").val();
	var hostname = $("#hostname").val();
	var port = $("#port").val();
	var username = $("#username").val();
	var userpassword = $("#userpassword").val();
	
	
	$.ajax({
		type: "POST",
	  url: "http://localhost:5000/run",
		
		data: {
			"import-module": {
				"name": "mysql",
				"parameters": {
					"import-hostname": "localhost",
					"import-database": "world",
					"import-username": "andreas",
					"import-password": "hemmeligt"
				}
			},
			"export-module": {
				"name": "siard-dk",
				"parameters": {
					"export-folder": "/tmp/AVID.MAG.1000.1"
				}
			}
		}
	}).done(function(response) {
		console.log("OK", arguments);
	}).fail(function(response) {	
		console.log("FAIL", arguments);	
	});	
});
