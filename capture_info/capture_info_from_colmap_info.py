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
			"id": -1,
			"width": 0,
			"height": 0,
			"f" : focal,
			"principal_x": 0,
			"principal_y": 0,
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
	jsondata["cameras"][index_name]["name"] = line.rstrip()
	index_name +=1


file1 = open('images.txt', 'r')
is_params_line = True
Lines = file1.readlines()
for line in Lines:
	if not line.startswith("#"):
		if is_params_line:
			linesplit = line.split()
			is_params_line = False
			cam_name =linesplit[9]
			cam_id =linesplit[8]
			
			for cam in jsondata["cameras"]:
				if cam["name"] == cam_name:
					cam["id"] = cam_id
					break
					
		else:
			is_params_line = True 


file1 = open('cameras.txt', 'r')
index_name = 0
Lines = file1.readlines()
for line in Lines:
	if not line.startswith("#"):
		linesplit = line.split()

		for cam in jsondata["cameras"]:
				if cam["id"] == linesplit[0]:
					cam["width"] = linesplit[2]
					cam["height"] = linesplit[3]
					#print(cam["f"])
					#print(linesplit[4])
					cam["f"] = linesplit[4] 
					cam["principal_x"]= linesplit[5]
					cam["principal_y"]= linesplit[6]
					break


index_cam = 0
while index_cam < len(jsondata["cameras"]):
	if jsondata["cameras"][index_cam]["name"].startswith("Scan_"):
		#print(jsondata["cameras"][index_cam]["name"])
		jsondata["cameras"].pop(index_cam)
		index_cam -=1
	index_cam +=1



with open('cameraInfo.json', 'w') as outfile:
    json.dump(jsondata, outfile)
