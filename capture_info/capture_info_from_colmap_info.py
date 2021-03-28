import json
jsondata = {
	"cameras" : []
}
with open('bundle.out') as f:
	next(f)
	numcams, numpoints = [int(x) for x in next(f).split()] # read first line
	array = []
	for iteration in range(numcams): # read rest of lines
		#next(f)
		focal, d1, d2 = [float(x) for x in next(f).split()]
		m1, m2, m3 = [float(x) for x in next(f).split()]
		m4, m5, m6 = [float(x) for x in next(f).split()]
		m7, m8, m9 = [float(x) for x in next(f).split()]
		t1, t2, t3 = [float(x) for x in next(f).split()]
		#print("cam "+str(iteration))
		#print(t1)
		camera = {
			"name": "noname",
			"width": 0,
			"height": 0,
			"f" : focal,
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

file1 = open('name_list.txt', 'r')
index_name = 0
Lines = file1.readlines()
for line in Lines:
	jsondata["cameras"][index_name]["name"] = line
	index_name +=1


file1 = open('cameras.txt', 'r')
index_name = 0
Lines = file1.readlines()
for line in Lines:
	if not line.startswith("#"):
		linesplit = line.split()
		jsondata["cameras"][index_name]["width"] = linesplit[2]
		jsondata["cameras"][index_name]["height"] = linesplit[3]
		index_name +=1


index_cam = 0
while index_cam < len(jsondata["cameras"]):
	if jsondata["cameras"][index_cam]["name"].startswith("Scan_"):
		print(jsondata["cameras"][index_cam]["name"])
		jsondata["cameras"].pop(index_cam)
		index_cam -=1
	index_cam +=1



with open('cameraInfo.json', 'w') as outfile:
    json.dump(jsondata, outfile)
