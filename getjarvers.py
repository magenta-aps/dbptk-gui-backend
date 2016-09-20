#!/usr/bin/python

from os import getcwd, listdir

def getjarvers():
	jarvers = listdir(getcwd() + "/dbptk-jar")
	jarvers.sort()
	usevers = getcwd() + "/dbptk-jar/" + jarvers[-1]
	return usevers
	
if __name__ == "__main__":
	print "Current directory: {}".format(getcwd())
	print "Current Java versions: {}".format(listdir(getcwd() + "/dbptk-jar"))
	print "We use: {}".format(getjarvers())
