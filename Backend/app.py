from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import traceback
from AudioProcessor import AudioProcessor
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/process_audio', methods=['POST'])
def process_audio():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        if 'userName' in request.form:
            user_name = request.form['userName']
        else:
            user_name = 'hiruna@gmail.com'
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        processor = AudioProcessor(file_path)
        filler_words_count = processor.identify_filler_words()
        #emotion = processor.get_emotion()
        text = processor.get_text()
        #features = processor.extract_features()
        silences = processor.count_silences(file)
        
        wpm = processor.calculate_wpm()
        similar_words = processor.get_similar_words()
        repeat_sentences = processor.get_similar_sentences()
        grammar = processor.check_grammar()
        time_stamp =  datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        combined_data = {
            "User":user_name, 
            "Date": time_stamp,
            "filler_words_count": json.loads(filler_words_count),
            "transcription_text": json.loads(text),
            "silences": json.loads(silences),
            "wpm": json.loads(wpm),
            "similar_words": json.loads(similar_words),
            "repeat_sentences": json.loads(repeat_sentences),
            "grammar": json.loads(grammar)
        }
        processor.save_in_db(combined_data)
        if '_id' in combined_data:
            del combined_data['_id']
        return jsonify(combined_data), 200
    except Exception as e:
        # Print the error details
        print("An error occurred:", str(e))
        print(traceback.format_exc())  
        return jsonify({"message": False, "error": str(e)}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)
