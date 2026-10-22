from flask import Flask, request, jsonify
import util

app = Flask(__name__)

@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/predict_home_price', methods=['GET', 'POST'])
def predict_home_price():
    if request.method == 'POST':
        total_sqft = float(request.form.get('total_sqft', 0))
        location = request.form.get('location', '')
        bhk = int(request.form.get('bhk', 0))
        bath = int(request.form.get('bath', 0))
    else:
        total_sqft = float(request.args.get('total_sqft', 0))
        location = request.args.get('location', '')
        bhk = int(request.args.get('bhk', 0))
        bath = int(request.args.get('bath', 0))

    estimated_price = util.get_estimated_price(location, total_sqft, bhk, bath)

    response = jsonify({
        'estimated_price': estimated_price
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Home Price Prediction...")
    util.load_saved_artifacts()
    app.run(port=5000, debug=True)