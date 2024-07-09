document.addEventListener('paste', (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');
    console.log('Pasted data:', pastedData);

    if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "checkData", text: pastedData }, response => {
            if (response.result === 'error') {
                console.error('Error response from background script:', response);
                alert('Error while checking data');
            } else if (response.result === 'confidential') {
                alert('Pasted data contains confidential info');
            } else {
                alert('Pasted data is not confidential');
            }
        });
    } else {
        console.error('chrome.runtime or chrome.runtime.sendMessage is undefined');
    }
});
