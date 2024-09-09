using System.Net.Http; // Add this at the top
using System.Net.Http.Headers;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using UnityEngine.UI;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.IO;
using System.Text;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using NAudio.Wave;
using UnityEngine.Networking;
using Newtonsoft.Json;
using System.Dynamic;
using Newtonsoft.Json.Linq;
using Meta.WitAi.Lib;

public class SceneLoad : MonoBehaviour
{
    public TextMeshProUGUI usernameInput;
    public TextMeshProUGUI passwordInput;
    public TextMeshProUGUI loginMessageText;
    public Button loginButton;
    private IMongoCollection<BsonDocument> credentialsCollection;

    public GameObject toastPanel;
    public TextMeshProUGUI toastText;
    public float displayDuration = 2f;

    private static AudioClip recordingClip;
    private static bool isRecording = false;

    private ClientWebSocket websocket;
    private string websocketUri = "ws://localhost:8765"; // Replace with your Python WebSocket server URI
    public static string mic;

    private void Start()
    {
        toastPanel.SetActive(false);
    }

    public void ShowToast(string message)
    {
        toastText.text = message;
        toastPanel.SetActive(true);
        StartCoroutine(HideToast());
    }

    private IEnumerator HideToast()
    {
        Debug.Log("Toast display duration started.");
        yield return new WaitForSeconds(displayDuration);
        Debug.Log("Toast display duration ended.");
        toastPanel.SetActive(false);
    }

    public void LoadScene1()
    {
        var client = new MongoClient("mongodb+srv://hiruna:abcd1234@cluster0.20vxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        var database = client.GetDatabase("VR");
        credentialsCollection = database.GetCollection<BsonDocument>("webUsers");
        var allDocuments = credentialsCollection.Find(new BsonDocument()).ToList();

        bool isExists = false;
        BsonDocument matchingDocument = null;

        foreach (var doc in allDocuments)
        {
            string username = doc["userName"].AsString.Trim();
            string password = doc["password"].AsString.Trim();

            string inputUsername = usernameInput.text.Trim();
            string inputPassword = passwordInput.text.Trim();

            Debug.Log("Input User Name " + inputUsername);
            Debug.Log("Input Password " + inputPassword);

            Debug.Log("DB User Name " + username);
            Debug.Log("DB Password " + password);

            if (string.Equals(username, inputUsername, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(password, inputPassword, StringComparison.OrdinalIgnoreCase))
            {
                isExists = true;
                matchingDocument = doc;
                break;
            }
        }

        if (isExists)
        {
            ShowToast("Welcome, " + usernameInput.text + "!");
            Debug.Log($"Logging in '{usernameInput.text}'");
            SceneManager.LoadScene("A");
        }
        else
        {
            ShowToast("Incorrect credentials");
            Debug.Log("Incorrect credentials");
            CheckMicrophone();
            //SceneManager.LoadScene("A");
        }
    }

    private IEnumerator HideMessageAndClearInputsAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        loginMessageText.text = "";
        usernameInput.text = "";
        passwordInput.text = "";
    }

    public void LoadScene2()
    {
        SceneManager.LoadScene("B");
    }

    public void LoadScene3()
    {
        SceneManager.LoadScene("C");
    }

    public async void callApi()
    {
        StartRecording();
        await Live();
    }

    void CheckMicrophone()
    {
        if (Microphone.devices.Length == 0)
        {
            Debug.LogError("No microphone detected.");
        }
        else
        {
            Debug.Log("Microphone detected.");
        }
    }

    void StartRecording()
    {
        if (Microphone.devices.Length > 0)
        {
            foreach (var device in Microphone.devices)
            {
                Debug.Log($"Available MICs: {device}");
            }
            mic = Microphone.devices[0]; // Select the first microphone
            if (!isRecording)
            {
                //micDevice, true, 100, 16000
                //mic, true, 100, 48000
                recordingClip = Microphone.Start(mic, true, 100, 48000); // Start recording
                isRecording = true;
                Debug.Log($"Recording started with: {mic}");
            }
            else
            {
                Debug.LogWarning("Already recording.");
            }
        }
        else
        {
            Debug.LogError("No microphone available to start recording.");
        }
    }

    public void StopRecording()
    {
        if (isRecording)
        {
            // Stop the recording
            Microphone.End(mic);
            isRecording = false;
            Debug.Log("Recording stopped.");

            // Save the recording as a WAV file
            // string wavFilePath = SaveAudioClipAsWav(recordingClip);
            string wavFilePath = SaveAudioClip(recordingClip, "recording");


            // Send the WAV file to the REST API
            if (!string.IsNullOrEmpty(wavFilePath))
            {
                StartCoroutine(SendWavFileToApi(wavFilePath));
            }
            else
            {
                Debug.LogError("Failed to save the WAV file.");
            }
        }
        else
        {
            Debug.LogWarning("No active recording to stop.");
        }
    }

    private string SaveAudioClip(AudioClip clip, string filename)
    {
        if (clip == null)
        {
            Debug.LogError("No audio clip to save.");
            return null;
        }

        var samples = new float[clip.samples * clip.channels];
        clip.GetData(samples, 0);

        var wavFile = ConvertToWav(samples, clip.channels, clip.frequency);
        File.WriteAllBytes(Path.Combine(Application.persistentDataPath, filename), wavFile);

        Debug.Log($"Audio saved to {Path.Combine(Application.persistentDataPath, filename)}");
        return Application.persistentDataPath + "/" + filename;
    }

    private byte[] ConvertToWav(float[] samples, int channels, int frequency)
    {
        using (var stream = new MemoryStream())
        using (var writer = new BinaryWriter(stream))
        {
            int sampleCount = samples.Length;
            int byteRate = frequency * channels * 2; // 16-bit audio, hence 2 bytes per sample

            // Write the WAV file header
            writer.Write(Encoding.ASCII.GetBytes("RIFF")); // Chunk ID
            writer.Write(36 + sampleCount * 2); // Chunk Size
            writer.Write(Encoding.ASCII.GetBytes("WAVE")); // Format
            writer.Write(Encoding.ASCII.GetBytes("fmt ")); // Subchunk1 ID
            writer.Write(16); // Subchunk1 Size (16 for PCM)
            writer.Write((short)1); // Audio Format (1 for PCM)
            writer.Write((short)channels); // Number of Channels
            writer.Write(frequency); // Sample Rate
            writer.Write(byteRate); // Byte Rate
            writer.Write((short)(channels * 2)); // Block Align (Number of Channels * Bytes per Sample)
            writer.Write((short)16); // Bits Per Sample (16 bits)

            // Write the data subchunk
            writer.Write(Encoding.ASCII.GetBytes("data")); // Subchunk2 ID
            writer.Write(sampleCount * 2); // Subchunk2 Size (Number of Samples * Bytes per Sample)

            // Write the audio data
            foreach (var sample in samples)
            {
                // Convert the float samples to 16-bit signed integer values
                short intSample = (short)(Mathf.Clamp(sample, -1f, 1f) * short.MaxValue);
                writer.Write(intSample);
            }

            return stream.ToArray();
        }
    }

    // Send the WAV file to the REST API
    private IEnumerator SendWavFileToApi(string filePath)
    {
        byte[] fileData = File.ReadAllBytes(filePath);

        // Create the form to send the file
        WWWForm form = new WWWForm();
        form.AddBinaryData("file", fileData, Path.GetFileName(filePath), "audio/wav");

        using (UnityWebRequest www = UnityWebRequest.Post("http://127.0.0.1:5000/process_audio", form))
        {
            // Send the request and wait for a response
            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("WAV file successfully sent to the API.");
            }
            else
            {
                Debug.LogError($"Failed to send the WAV file. Error: {www.error}");
            }
        }
    }


    async Task Live()
    {
        Debug.Log("Inside the method");
        string url = "https://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&language=en-US&encoding=linear16&channels=1&sample_rate=16000&endpointing=true&filler_words=true";
        string apiKey = "7bbfdcfa715dddc919948c00bc40177f3c9823f3";

        using (HttpClient httpClient = new HttpClient())
        {
            Debug.Log("Inside the method 1");
            httpClient.DefaultRequestHeaders.Add("Authorization", "Token " + apiKey);

            // Check for available microphones
            if (Microphone.devices.Length > 0)
            {
                foreach (var device in Microphone.devices)
                {
                    Debug.Log($"Available MICs: {device}");
                }

                //string micDevice = Microphone.devices[0]; // Select the first microphone

                // Start recording using Unity's Microphone API
                //AudioClip recordingClip = Microphone.Start(micDevice, true, 100, 16000); // Start recording at 16 kHz
                Debug.Log($"Recording started with: {mic}");

                int bufferSize = 8192;
                float[] samples = new float[bufferSize];
                byte[] audioBuffer = new byte[bufferSize * sizeof(short)];
                float silenceThreshold = 0.01f; // Adjust this threshold based on your needs
                bool isSilent = false;
                int totalWords = 0;
                float startTime = Time.realtimeSinceStartup;

                while (Microphone.IsRecording(mic))
                {
                    int micPosition = Microphone.GetPosition(mic) - bufferSize;
                    if (micPosition < 0)
                        continue;

                    recordingClip.GetData(samples, micPosition);

                    // Convert float samples to PCM format (short)
                    for (int i = 0; i < samples.Length; i++)
                    {
                        short intData = (short)(samples[i] * short.MaxValue);
                        BitConverter.GetBytes(intData).CopyTo(audioBuffer, i * sizeof(short));
                    }

                    try
                    {
                        // Prepare audio data to send in chunks
                        using (var content = new ByteArrayContent(audioBuffer))
                        {
                            content.Headers.Add("Content-Type", "application/octet-stream"); // Use 'application/octet-stream' for raw PCM data
                            Debug.Log("Sending audio data to Deepgram...");
                            float sum = 0;
                            for (int i = 0; i < samples.Length; i++)
                            {
                                sum += samples[i] * samples[i];
                            }

                            float rms = Mathf.Sqrt(sum / samples.Length);

                            // Check if the audio level is below the silence threshold
                            if (rms < silenceThreshold)
                            {
                                if (!isSilent)
                                {
                                    isSilent = true;
                                    Debug.Log("Silence detected");
                                    SceneLoad sceneLoader = GameObject.FindObjectOfType<SceneLoad>();
                                    sceneLoader.StartCoroutine(sceneLoader.LoadScenes());
                                }
                            }
                            else
                            {
                                if (isSilent)
                                {
                                    isSilent = false;
                                    Debug.Log("Sound detected");
                                }
                            }
                            HttpResponseMessage response = await httpClient.PostAsync(url, content);

                            if (response.IsSuccessStatusCode)
                            {

                                string transcription = await response.Content.ReadAsStringAsync();
                                Debug.Log(transcription);
                                JObject transcriptionResult = JObject.Parse(transcription);

                                // Access the transcript property dynamically
                                string transcript = transcriptionResult["results"]?["channels"]?[0]?["alternatives"]?[0]?["transcript"]?.ToString();
                                if (!string.IsNullOrEmpty(transcript))
                                {
                                    Debug.Log($"Transcription Text: {transcript}");
                                    int wordCount = transcript.Split(new[] { ' ', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length;
                                    totalWords += wordCount;

                                    float elapsedMinutes = (Time.realtimeSinceStartup - startTime) / 60f;
                                    float wordsPerMinute = totalWords / elapsedMinutes;
                                    Debug.Log($"Current Pace: {wordsPerMinute:F2} WPM");
                                    string[] targetWords = { "uh", "um", "mhmm", "mm-mm", "uh-uh", "uh-huh", "uh-huh", "nuh-uh", "hello" };
                                    transcript = transcript.ToLower();
                                    foreach (string word in targetWords)
                                    {
                                        if (transcript.Contains(word))
                                        {
                                            Debug.Log($"Detected filler word: {word}");
                                            // SceneManager.LoadScene("C"); // Load scene 2
                                            // new WaitForSeconds(8); // Wait for 8 seconds
                                            // SceneManager.LoadScene("A"); // Load scene 1
                                            SceneLoad sceneLoader = GameObject.FindObjectOfType<SceneLoad>();
                                            sceneLoader.StartCoroutine(sceneLoader.LoadScenes());

                                            break;
                                        }
                                    }

                                }
                                else
                                {
                                    Debug.LogWarning("No transcription available in the response.");
                                }

                            }
                            else
                            {
                                Debug.Log($"Request failed with status code: {response.StatusCode}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.Log($"Error: {ex.Message}");
                    }

                    await Task.Delay(300); // Wait for a short period before sending the next chunk
                }

                Microphone.End(mic); // Stop the microphone recording
                Debug.Log("Recording stopped.");
            }
            else
            {
                Debug.LogError("No microphone available to start recording.");
            }
        }
    }
    public IEnumerator LoadScenes()
    {
        Scene currentScene = SceneManager.GetActiveScene();

        // Get the name of the current scene
        string sceneName = currentScene.name;
        if (sceneName != "C")
        {
            AsyncOperation asyncLoadC = SceneManager.LoadSceneAsync("C");
            while (!asyncLoadC.isDone)
            {
                yield return null;
            }
        }

        // Wait until the scene is loaded


        yield return new WaitForSeconds(8); // Wait for 8 seconds

        // Load scene A asynchronously
        AsyncOperation asyncLoadA = SceneManager.LoadSceneAsync("A");
        // Wait until the scene is loaded
        while (!asyncLoadA.isDone)
        {
            yield return null;
        }
    }

}

