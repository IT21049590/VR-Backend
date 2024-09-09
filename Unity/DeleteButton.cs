using UnityEngine;
using TMPro;

public class DeleteButton : MonoBehaviour
{
    public TMP_Text outputText; // UI Text where the entered keys will be printed
    private string currentText = "";

    // Call this function when a key is pressed
    public void OnKeyPress(string key)
    {
        if (key == "Backspace")
        {
            // Handle the Backspace key logic
            if (currentText.Length > 0)
            {
                currentText = currentText.Substring(0, currentText.Length - 1);
            }
        }
        else if (key == "Enter")
        {
            // Handle Enter key logic if needed, like submitting the text
        }
        else
        {
            currentText += key;
        }

        UpdateText();
    }

    // Updates the UI Text component with the current text
    private void UpdateText()
    {
        outputText.text = currentText;
    }
}