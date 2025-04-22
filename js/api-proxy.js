// api-proxy.js - CORS workaround for Google Apps Script

// The Google Apps Script URL
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxB21t92yFqdBOkQ4DfESpb1hDLQU6yLj_A9SP6QlZGE7oz7uWQ1lp9jSTropvrQvF_ig/exec';

/**
 * JSONP implementation for GET requests
 * This works around CORS by using script tags which aren't subject to same-origin policy
 */
function fetchJSONP(url, data = {}, callback = null) {
    return new Promise((resolve, reject) => {
        // Create a unique callback name
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // Add callback and data to URL
        let urlWithParams = url + '?callback=' + callbackName;
        
        // Add data parameters to URL
        Object.keys(data).forEach(key => {
            urlWithParams += `&${key}=${encodeURIComponent(data[key])}`;
        });
        
        // Create script element
        const script = document.createElement('script');
        script.src = urlWithParams;
        
        // Define the callback function
        window[callbackName] = function(data) {
            // Clean up
            delete window[callbackName];
            document.body.removeChild(script);
            
            // Resolve the promise
            resolve(data);
            
            // Call the original callback if provided
            if (callback) {
                callback(data);
            }
        };
        
        // Handle errors
        script.onerror = function() {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP request failed'));
        };
        
        // Add the script to the page
        document.body.appendChild(script);
    });
}

/**
 * POST request using a hidden form and iframe to bypass CORS
 * This is another approach that works for POST requests
 */
function postViaForm(url, data = {}) {
    return new Promise((resolve, reject) => {
        // Create a unique iframe name
        const iframeName = 'form_iframe_' + Math.round(100000 * Math.random());
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        
        // Create form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = iframeName;
        
        // Add data as hidden fields
        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
            form.appendChild(input);
        });
        
        // Add special field to indicate this is a form submission
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = 'formSubmit';
        methodInput.value = 'true';
        form.appendChild(methodInput);
        
        // Handle response
        iframe.onload = function() {
            try {
                // Try to get response from iframe
                const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                const responseText = iframeContent.body.innerText || iframeContent.body.textContent;
                let response;
                
                try {
                    response = JSON.parse(responseText);
                } catch (e) {
                    response = { success: false, message: 'Invalid response format' };
                }
                
                // Clean up
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                
                // Resolve the promise
                resolve(response);
            } catch (e) {
                // Clean up
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                
                // Reject with error
                reject(new Error('Form submission failed'));
            }
        };
        
        // Handle errors
        iframe.onerror = function() {
            document.body.removeChild(iframe);
            document.body.removeChild(form);
            reject(new Error('Form submission failed'));
        };
        
        // Add elements to the page
        document.body.appendChild(iframe);
        document.body.appendChild(form);
        
        // Submit the form
        form.submit();
    });
}

/**
 * Main API function that handles all requests to the backend
 * This will try different methods to work around CORS issues
 */
async function apiRequest(action, data = {}) {
    // Add action to data
    data.action = action;
    
    // Try different methods in sequence
    try {
        // Method 1: Regular fetch with POST (might fail due to CORS)
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'cors'
            });
            
            return await response.json();
        } catch (error) {
            console.log('Regular fetch failed, trying alternative methods...');
        }
        
        // Method 2: Try POST via form
        try {
            return await postViaForm(BACKEND_URL, data);
        } catch (error) {
            console.log('Form submission failed, trying JSONP...');
        }
        
        // Method 3: Try JSONP as last resort (only works for GET-like operations)
        return await fetchJSONP(BACKEND_URL, data);
    } catch (error) {
        console.error('All API request methods failed:', error);
        throw new Error('API request failed');
    }
}

// Export the API function
window.apiRequest = apiRequest;
