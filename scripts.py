import json
import requests
import time

def update_geolocation(infile, outfile):		
	with open(infile) as raw_data:
		data = json.loads(raw_data.read())

	for i, school in enumerate(data):
		if i%5 ==0:
			time.sleep(0.25) # the google api allows 5 requests/second
		address = "%s, %s" % (school["School Name"], school["State"])
		print("Making request %s" % i, ". . .", end="")
		response = requests.get("https://maps.googleapis.com/maps/api/geocode/json?address=%s" % address)
		print("OK")
		response = json.loads(response.text)
		school["Geolocation"] = response["results"][0]["geometry"]["location"]
	
	print("Done, writing file")
	with open(outfile, "w") as f:
		print(json.dumps(data), file=f)

def get_geolocation_list(filename, n):
	with open(filename) as raw_data:
		school_list = json.loads(raw_data.read())
		for i in range(n):
			school = school_list[i]
			print("%s, %s" % (school["Geolocation"]["lat"], school["Geolocation"]["lng"]))

if __name__ == "__main__":
	get_geolocation_list("data.json", 10)
