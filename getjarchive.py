#!/usr/bin/python

from os import getcwd, walk
import re

def getjarchive(debug=0):
	if debug > 1:
		print "Current directory: {}".format(getcwd())
	candidates = []
# compile pattern to match dbptk-app-2.0.0-beta4.0.jar
	ptn = re.compile('dbptk-app-\d.\d.\d.*.jar')
	for root, dirs, files in walk(getcwd()):
		if debug > 1:
			print "{:100} {:40} {:40}".format(root, dirs, files)
		for file in files:
			if ptn.match(file):
				if debug > 1:
					print "Match: {}/{}".format(root, file)
				candidates.append(root + "/" + file)
	if debug > 0:
		print "JAR Candidates: {}".format(candidates)
	candidates.sort(reverse=True)
	ptn2 = re.compile('dbptk-jar/dbptk-app')
	for cand in candidates:
		if ptn2.search(cand):
			if debug > 0:
				print "Using Java Archive {}".format(cand)
			return cand
			break
	
if __name__ == "__main__":
	getjarchive(debug=1)
