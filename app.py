from flask import Flask, render_template, jsonify
import polyomino as _mino

app = Flask(__name__)
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = False
app.config["TEMPLATES_AUTO_RELOAD"]=True

@app.route('/allpieces/<n>')
def getAllpieces(n):
    minos = []
    for i in range(1, int(n)+1):
        minos.extend(_mino.one_sided(_mino.generate(int(i))))
    return jsonify(minos)

@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True)