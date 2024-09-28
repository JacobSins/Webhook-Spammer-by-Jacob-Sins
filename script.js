// Webhook URLs
const visitorWebhookUrl = 'https://discord.com/api/webhooks/1289469281762934834/hqU2Im--tHw-CDqzVRqVUC9lIzua-ewbg60zi927vbyIJmwZ9jYAQZdNKaWw6adG1ARc'; // Replace with your Visitor Notifier webhook URL
const verificationWebhookUrl = 'https://discord.com/api/webhooks/1289472453508337674/-BE305lm5pUMQOVJdpHth3-sFfW7psGTjk3u5WC216eWAq8iuaZOgQ9TIwGFcjI3NS_T'; // Replace with your Verification Code webhook URL

// Function to notify about the website access
function notifyAccess() {
    const payload = {
        username: "Visitor Notifier",
        content: "A user has accessed the website!"
    };

    fetch(visitorWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            console.log('Access notification sent successfully.');
        } else {
            console.log('Failed to send access notification.');
        }
    })
    .catch(error => {
        console.log('Error sending access notification: ' + error);
    });
}

// Call the notifyAccess function when the page loads
window.onload = function() {
    notifyAccess();
    
    // Visitor Notification
    let visitorCount = localStorage.getItem('visitorCount');

    if (!visitorCount) {
        // First-time visitor
        visitorCount = 1;
        localStorage.setItem('visitorCount', visitorCount);
    } else {
        // Returning visitor
        visitorCount = parseInt(visitorCount) + 1;
        localStorage.setItem('visitorCount', visitorCount);
    }

    // Display the visitor notification
    document.getElementById('visitor-count').textContent = visitorCount;
    document.getElementById('visitor-notification').style.display = 'block';
};

// Log container
const logsContainer = document.getElementById('logs');

// Function to append log messages
function logMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    logsContainer.textContent += `[${timestamp}] ${message}\n`;
    logsContainer.scrollTop = logsContainer.scrollHeight; // Scroll to the bottom
}

// Disable the spammer form initially
const spammerForm = document.getElementById('webhook-form');
spammerForm.style.pointerEvents = 'none';
spammerForm.style.opacity = '0.5';

// Global variable to hold the verification code
let generatedCode = null;

// Function to generate a random verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Function to send the verification code to Discord
function sendVerificationCode(discordId, code) {
    const payload = {
        username: "Verification Bot",
        content: `Hello <@${discordId}>, your verification code is: ${code}`
    };

    fetch(verificationWebhookUrl, { // Use the verification webhook
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            logMessage('Verification code sent successfully.');
        } else {
            logMessage('Failed to send verification code.');
        }
    })
    .catch(error => {
        logMessage('Error sending verification code: ' + error);
    });
}

// Function to update the profile preview based on the avatar URL
function updateProfilePreview() {
    const avatarUrl = document.getElementById('avatar-url').value;
    const profilePreview = document.getElementById('profile-preview');

    if (avatarUrl) {
        profilePreview.src = avatarUrl;
        profilePreview.style.display = 'block'; // Show the image
    } else {
        profilePreview.src = '';
        profilePreview.style.display = 'none'; // Hide the image if no URL is provided
    }
}

// Event listener for the avatar URL input to update the profile preview
document.getElementById('avatar-url').addEventListener('input', updateProfilePreview);

// Event listener for sending the verification code
document.getElementById('send-verification').addEventListener('click', function() {
    const discordId = document.getElementById('discord-id').value;

    if (!discordId) {
        alert('Please enter your Discord ID.');
        return;
    }

    // Generate and store the verification code
    generatedCode = generateVerificationCode();

    // Send the verification code to the user's Discord
    sendVerificationCode(discordId, generatedCode);

    // Show the verification code input
    document.getElementById('verification-code').style.display = 'block';
    document.getElementById('verify-code').style.display = 'block';
});

// Event listener for verifying the code
document.getElementById('verify-code').addEventListener('click', function() {
    const enteredCode = document.getElementById('verification-code').value;

    if (enteredCode === generatedCode) {
        logMessage('Verification successful.');
        alert('You are successfully verified!');

        // Enable the spammer form after verification
        spammerForm.style.pointerEvents = 'auto';
        spammerForm.style.opacity = '1';

        // Hide verification form
        document.getElementById('verification-form').style.display = 'none';
    } else {
        logMessage('Verification failed. Incorrect code.');
        alert('Incorrect verification code. Please try again.');
    }
});

// Webhook Spammer Form submission handler
document.getElementById('webhook-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const webhookUrl = document.getElementById('webhook-url').value;
    const username = document.getElementById('username').value || "Webhook Spammer";
    const avatarUrl = document.getElementById('avatar-url').value;  // Avatar URL from the form
    const message = document.getElementById('message').value;
    const numMessages = parseInt(document.getElementById('num-messages').value);  // Number of messages to send (user-defined)

    if (!webhookUrl) {
        alert("Please provide a webhook URL.");
        return;
    }

    if (numMessages <= 0) {
        alert("Please provide a valid number of messages.");
        return;
    }

    logMessage(`Starting to send ${numMessages} messages to ${webhookUrl} with username "${username}".`);

    // Function to send the message
    const sendMessage = () => {
        const payload = {
            username: username,  // Username for the bot
            content: message,  // The message content
            avatar_url: avatarUrl || null  // Use avatar URL if provided
        };

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (response.ok) {
                logMessage('Message sent successfully!');
            } else {
                logMessage('Error sending message. Status: ' + response.status);
            }
        }).catch(error => {
            logMessage('Error sending message: ' + error);
        });
    };

    // Loop to send the number of messages specified by the user
    for (let i = 0; i < numMessages; i++) {
        setTimeout(sendMessage, i * 100);  // Delay between messages (100ms)
    }

    alert('Messages are being sent.');
});
