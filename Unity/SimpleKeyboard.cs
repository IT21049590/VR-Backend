using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class SimpleKeyboard : MonoBehaviour
{
    public TMP_InputField inputField; // TextMeshPro InputField where the entered keys will be printed

    // Call this function when a key is pressed
    public void OnKeyPress(string key)
    {
        if (key == "Backspace")
        {
            if (inputField.text.Length > 0)
            {
                inputField.text = inputField.text.Substring(0, inputField.text.Length - 1);
            }
        }
        else if (key == "Enter")
        {
            // Handle Enter key logic if needed, like submitting the text
        }
        else
        {
            // Append the new key to the current text in the InputField
            inputField.text += key;
        }
        
        // Ensure the TMP_InputField remains active and updates correctly
        inputField.ActivateInputField(); 
        inputField.ForceLabelUpdate(); 
    }
    
    // Method to be called by the Backspace button
    public void OnBackspaceButtonPressed()
    {
        OnKeyPress("Backspace");
    }
}