import json
with open('bundle.out') as f:
	next(f)
	numcams, numpoints = [int(x) for x in next(f).split()] # read first line
	array = []
	jsondata = {
		"cameras" : []
	}
	for iteration in range(numcams): # read rest of lines
		next(f)
		m1, m2, m3 = [float(x) for x in next(f).split()]
		m4, m5, m6 = [float(x) for x in next(f).split()]
		m7, m8, m9 = [float(x) for x in next(f).split()]
		t1, t2, t3 = [float(x) for x in next(f).split()]
		print("cam "+str(iteration))
		print(t1)
		camera = {
			"m1" : m1,
			"m2" : m2,
			"m3" : m3,
			"m4" : m4,
			"m5" : m5,
			"m6" : m6,
			"m7" : m7,
			"m8" : m8,
			"m9" : m9,
			"tx" : t1,
			"ty" : t2,
			"tz" : t3
		}
		jsondata["cameras"].append(camera)

with open('cameras.json', 'w') as outfile:
    json.dump(jsondata, outfile)
