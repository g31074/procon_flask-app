from flask import *
import requests

app = Flask(__name__)
home_url = 'http://localhost:3000/'


def get(url: str, token: str):
    header = {
        'procon-token': token
    }
    res = requests.get(home_url + url, headers=header)
    print(res.status_code)
    return res

@app.route("/")
def get_page():
    return render_template('index.html')

@app.route("/matches")
def get_match_list():
    token = request.args.get('procon-token')
    print(token)
    res = get('matches', token)
    return res.text

@app.route("/match")
def get_match_info():
    token = request.args.get('procon-token')
    match_id = request.args.get('match_id')
    res = get(f'matches/{match_id}', token)
    return res.text