chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension successfully installed');
});

async function checkConfidentialData(text) {
    console.log('Checking data:', text);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Does the following text contain confidential information, such as personal identifiers, financial details, health records, or sensitive company data? Respond with "confidential" if it does and "not confidential" if it does not. Text: "${text}"` }],
                max_tokens: 50
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);

        if (!data || !data.choices || data.choices.length === 0) {
            console.error('Unexpected API response structure', data);
            throw new Error('Unexpected API response structure');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error checking confidential data:', error.message, error.stack);
        return 'error';
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkData") {
        checkConfidentialData(request.text).then(result => {
            sendResponse({ result: result });
        }).catch(error => {
            console.error('Error in checkConfidentialData:', error.message, error.stack);
            sendResponse({ result: 'error' });
        });
        return true;
    }
});
