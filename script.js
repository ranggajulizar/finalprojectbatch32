const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Helper function to append a message to the chat box
function appendMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.textContent = text;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageElement;
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // 1. Add the user's message to the chat box
  appendMessage('user', userMessage);
  userInput.value = '';

  // 2. Show a temporary "Thinking..." bot message
  const botMessageElement = appendMessage('bot', 'Thinking...');

  // Disable submit button and input while waiting for response
  const submitBtn = chatForm.querySelector('button');
  if (submitBtn) submitBtn.disabled = true;
  userInput.disabled = true;

  try {
    // 3. Send the user's message as a POST request to /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // 4. When response arrives, replace "Thinking..." with AI's reply or handle empty message
    if (data && data.message) {
      botMessageElement.textContent = data.message;
    } else {
      botMessageElement.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    // 5. If an error occurs
    botMessageElement.textContent = 'Failed to get response from server.';
  } finally {
    // Re-enable form controls and refocus input
    if (submitBtn) submitBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
