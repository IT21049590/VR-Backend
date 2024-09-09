import string
import torch
import numpy as np
import librosa
from pydub import AudioSegment
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForSequenceClassification
from deepgram import DeepgramClient, PrerecordedOptions, FileSource
import re
from pydub.silence import split_on_silence
import language_tool_python
from pymongo import MongoClient
import numpy as np
import torch
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import Counter
import re
import json

class AudioProcessor:
    def __init__(self, audio_file_path):
            self.audio_file_path = audio_file_path
            self.transcription_text = ''
            self.deepgram = DeepgramClient("7bbfdcfa715dddc919948c00bc40177f3c9823f3")
            self.filler_words = ["uh", "um", "mhmm", "mm-mm", "uh-uh", "uh-huh", "uh-huh", "nuh-uh"]
            self.PARAMS = {"punctuate": True,
            "numerals": True,
            "model": "general",
            "language": "en-US",
            "tier": "nova" }
            self.db_name = "VR"
            self.collection_name = "user"
            self.mongo_url = "mongodb+srv://hiruna:abcd1234@cluster0.20vxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
            self.client = MongoClient(self.mongo_url)
            self.db = self.client[self.db_name]
            self.collection = self.db[self.collection_name]
            self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        
    def identify_filler_words(self):
        try:
            with open(self.audio_file_path, "rb") as file:
                buffer_data = file.read()

            payload: FileSource = {"buffer": buffer_data}
            options = PrerecordedOptions(model="nova-2", smart_format=True, filler_words=True)

            try:
                response = self.deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)
            except Exception as e:
                # Handle any exceptions that occur during the transcription process
                print(f"An error occurred while transcribing the audio file: {str(e)}")
                return json.dumps({"error": str(e)})  # Return the error in JSON format

            self.transcription_text = response.results.channels[0].alternatives[0].transcript
            normalized_text = self.transcription_text.lower()
            normalized_text = normalized_text.translate(str.maketrans('', '', string.punctuation))
            
            words = normalized_text.split()
            filler_count = {filler: 0 for filler in self.filler_words}
            
            for word in words:
                if word in filler_count:
                    filler_count[word] += 1
            
            # Convert filler count dictionary to JSON format
            json_output = json.dumps(filler_count, indent=2)

            return json_output
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})
    
    # def get_text(self):
    #     return self.transcription_text

    def get_text(self):
        # Prepare the result dictionary
        try:
            result = {
                "transcription_text": self.transcription_text
            }

            # Convert the result to JSON format
            json_output = json.dumps(result, indent=2)

            # Return the JSON formatted output
            return json_output
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})

    def extract_features(self):
        try:
            y, sr = librosa.load(self.audio_file_path, sr=None)
            rms = librosa.feature.rms(y=y).flatten()
            zcr = librosa.feature.zero_crossing_rate(y).flatten()
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr).flatten()

            pitches, magnitudes = librosa.core.piptrack(y=y, sr=sr)
            pitch = [pitches[:, i].max() for i in range(pitches.shape[1])]

            return {
                'rms': np.mean(rms),
                'zcr': np.mean(zcr),
                'spectral_centroid': np.mean(spectral_centroid),
                'pitch': np.mean(pitch)
            }
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})

    def get_emotion(self):
        try:
            feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
                "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
            )
            model = Wav2Vec2ForSequenceClassification.from_pretrained(
                "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
            )

            audio, sr = librosa.load(self.audio_file_path, sr=16000)
            inputs = feature_extractor(audio, sampling_rate=sr, return_tensors="pt", padding=True)
            
            with torch.no_grad():
                logits = model(**inputs).logits
            
            predicted_ids = torch.argmax(logits, dim=-1).item()
            emotion = model.config.id2label[predicted_ids]

            return emotion
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})

    def get_audio_duration(self):
        try:
            y, sr = librosa.load(self.audio_file_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            return duration
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})

    def calculate_wpm(self):
    # Get the duration of the audio in seconds
        try:
            duration = self.get_audio_duration()
            
            # Calculate the word count from the transcription text
            word_count = len(self.transcription_text.split())
            
            # Convert duration to minutes
            duration_minutes = duration / 60
            
            # Calculate words per minute (WPM)
            wpm = word_count / duration_minutes if duration_minutes > 0 else 0  # Ensure no division by zero
            
            # Prepare the result dictionary
            result = {
                "duration_seconds": duration,
                "word_count": word_count,
                "wpm": round(wpm, 2)  # Round to two decimal places for readability
            }

            # Convert the result to JSON format
            json_output = json.dumps(result, indent=2)

            # Return the JSON formatted output
            return json_output
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})
   
    def count_silences(self, file):
        try:
            sound = AudioSegment.from_wav(file)
            chunks = split_on_silence(
                sound, 
                min_silence_len=500, 
                silence_thresh=sound.dBFS - 16, 
                keep_silence=150
            )

            # Count the number of silences
            silence_count = len(chunks) - 1

            # Create the result dictionary
            result = {
                "message": f"{silence_count} : Silence/s found"
            }

            # Convert the result to JSON format
            json_output = json.dumps(result, indent=2)

            # Print the result
            print(json_output)

            # Return the JSON formatted output
            return json_output
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})
    
    def get_repeat_words(self):
        pattern = r'\b(\w+)\b\s+\b\1\b'
        matches = re.findall(pattern, self.transcription_text, re.IGNORECASE)
        return matches

    def check_grammar(self):
        # Initialize the LanguageTool object for English (US)
        try:
            tool = language_tool_python.LanguageTool('en-US')
            
            # Check the text for grammar issues
            matches = tool.check(self.transcription_text)        
            # Prepare a report of the issues found
            issues_report = []
            
            for match in matches:
                issue = {
                    "Issue": match.ruleId,
                    "Message": match.message,
                    "Suggested Correction": ', '.join(match.replacements),
                    "Context": self.transcription_text[match.offset: match.offset + match.errorLength],
                    "Context in Text": self.transcription_text[match.offset - 10: match.offset + match.errorLength + 10]
                }
                issues_report.append(issue)
            
            # Convert the issues report to JSON format
            json_report = json.dumps(issues_report, indent=2)

            # Print the report
            if issues_report:
                print(f"Found {len(issues_report)} issues in the text:")
                print(json_report)
            else:
                print("No issues found!")
            
            # Return the JSON formatted report
            return json_report
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})


    def save_in_db(self, data):
        """
        Saves the provided data in the specified MongoDB collection.

        :param data: A dictionary containing the details to store in MongoDB.
        """
        try:
            # Insert the data into the collection
            result = self.collection.insert_one(data)
            
            print(f"Data inserted with ID: {result.inserted_id}")
        except Exception as e:
            print(f"An error occurred while saving to the database: {e}")

    def get_similar_sentences(self):
        # Tokenize the transcription text into sentences
        try:
            sentences = ''
            print('Transcript: ', self.transcription_text)
            sentences = sent_tokenize(self.transcription_text)
            sentence_embeddings = self.model.encode(sentences)

            # Compute the similarity matrix
            similarity_matrix = util.pytorch_cos_sim(sentence_embeddings, sentence_embeddings)
            similarity_matrix_np = similarity_matrix.numpy()

            # Define the threshold
            threshold = 0.8

            # Find indices where similarity score is above the threshold
            indices = np.where(similarity_matrix_np > threshold)

            # Store sentence pairs with similarity scores
            sentence_pairs = []

            for i, j in zip(*indices):
                if i != j:  # Avoid self-similarity
                    sentence_pairs.append({
                        "sentence1": sentences[i],
                        "sentence2": sentences[j],
                        "similarity_score": similarity_matrix_np[i, j]  # Keep as is for now
                    })

            # Sort the sentence pairs by similarity score in descending order
            sorted_sentence_pairs = sorted(sentence_pairs, key=lambda x: x['similarity_score'], reverse=True)

            # Get the top N elements, e.g., top 5 elements
            top_elements = sorted_sentence_pairs[:5]

            # Convert similarity scores to strings
            for element in top_elements:
                element['similarity_score'] = str(element['similarity_score'])  # Convert to string

            # Convert to JSON format
            result = json.dumps(top_elements, indent=2)

            return result
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})

    
    def get_similar_words(self):
        try:
            words = word_tokenize(self.transcription_text.lower())  # Convert to lower case for uniformity
            words = [re.sub(r'[^\w\s]', '', word) for word in words]  # Remove punctuation

            # Filter out empty strings
            words = [word for word in words if word.strip()]  # Exclude empty spaces or blank words

            # Count word frequencies
            word_counts = Counter(words)

            # Extract repeated words and sort them by count in descending order
            repeated_words = {word: count for word, count in word_counts.items() if count > 1}
            sorted_repeated_words = sorted(repeated_words.items(), key=lambda x: x[1], reverse=True)

            # Convert to JSON format
            top_repeated_words = sorted_repeated_words[:5]

            # Convert to JSON format
            result = [{"word": word, "count": count} for word, count in top_repeated_words]

            # Return the result in JSON format
            return json.dumps(result, indent=2)
        except Exception as e:
            print("An error occurred:", str(e))
            return json.dumps({"error": str(e)})
