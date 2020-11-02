from flask import *  
import os
from werkzeug.utils import secure_filename
from preprocess import processData
app = Flask(__name__)

app.secret_key = "secret key"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Get current path
path = os.getcwd()
# file Upload
UPLOAD_FOLDER = os.path.join(path, 'uploads')

# Make directory if uploads is not exists
if not os.path.isdir(UPLOAD_FOLDER):
    os.mkdir(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed extension you can set your own
ALLOWED_EXTENSIONS = set(['pkl'])


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def hello():
    message = "Hello World!"
    return render_template('index.html', message=message)

@app.route('/success', methods = ['GET','POST'])  
def success():  
    if request.method == 'POST':
        filenamesArray=[]
        if 'files[]' not in request.files:
            flash('No file part')
            return redirect(request.url)

        files = request.files.getlist('files[]')

        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # print(filename)
                filenamesArray.append(filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        flash('File(s) successfully uploaded')
        print(app.config['UPLOAD_FOLDER'], filenamesArray)
        testResult = processData(app.config['UPLOAD_FOLDER'], filenamesArray)
        # print(testResult)
        # return redirect('/')
        return jsonify(testResult)
        # return "Hello lulu"
        # return make_response(jsonify(testResult), 200)
    else:
        print("The request method is not POST")
        print(request.method)
        print(request)
        filenamesArray=[]
        if 'files[]' not in request.files:
            flash('No file part')
            return redirect(request.url)

        files = request.files.getlist('files[]')

        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # print(filename)
                filenamesArray.append(filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        flash('File(s) successfully uploaded')
        print(app.config['UPLOAD_FOLDER'], filenamesArray)
        testResult = processData(app.config['UPLOAD_FOLDER'], filenamesArray)
        # print(testResult)
        # return redirect('/')
        @after_this_request
        def cleanup():
            for f in filenamesArray:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], f))
                
        return testResult


if __name__ == '__main__':
    app.run(debug=True)