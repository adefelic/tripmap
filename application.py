from flask import Flask, Response, render_template
import csv, os

# helpful tutorials:
#   http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-flask.html
#   http://exploreflask.com/en/latest/

# reads raw trip CSVs from a directory
# combines alternating rows into a single record
# writes new records to a single large file (not ideal),
# it belongs in a db, or needs to be paginated or broken up with some clever tiling
def transform_trip_data():
	with open('static/data/trips.csv', 'w') as fout:
		writer = csv.writer(fout)
		# write header
		writer.writerow(['Date', 'Time', 'FromLat', 'FromLon', 'ToLat', 'ToLon', 'Base'])
		# iterate over raw files
		for file in os.listdir('static/data/raw'):
			with open('static/data/raw/' + file, 'r') as fin:
				reader = csv.reader((line.replace('\0','') for line in fin))
				next(reader) # skip header
				for row in reader:
					new_row = row[0].split() + row[1:3] # Date, Time, FromLat, FromLon
					row = next(reader, None)
					if row is not None:
						new_row += row[1:4] # append ToLat, ToLon, Base
						writer.writerow(new_row)

application = Flask(__name__)

# data endpoint that we'll GET from with ajax
@application.route('/trips', methods=['GET'])
def send_trip_data():
	with open('static/data/trips.csv', 'r') as file:
		return Response(file.readlines(), mimetype='text/csv')

# index.html
@application.route('/')
def index():
	return render_template('index.html')

# run the server
if __name__ == "__main__":
	transform_trip_data() # transform data once
	application.config.from_object('config')
	application.run()
