/**
 * CompareIt API Tester - Error Testing Controller
 * Handles functionality specific to the Error Testing tab
 */

const ErrorTestingController = (function() {
    // DOM elements
    let DOM = {};

    // Current state
    let state = {
        selectedEndpoint: '',
        selectedErrorCase: '',
        testResults: []
    };

    // Error test cases and their implementations
    const errorTestCases = {
        missingAPIKey: function(endpoint, params) {
            // Create request with missing API key
            return {
                type: endpoint,
                key: '', // Empty key
                parameters: params || {}
            };
        },

        invalidAPIKey: function(endpoint, params) {
            // Create request with invalid API key
            return {
                type: endpoint,
                key: 'invalid_key_123456789',
                parameters: params || {}
            };
        },

        missingRequiredParams: function(endpoint, params) {
            // Create request with missing required parameters
            return {
                type: endpoint,
                key: UIController.getDefaultApiKey(),
                parameters: {} // Empty parameters
            };
        },

        invalidParamType: function(endpoint) {
            // Create request with invalid parameter types
            const invalidParams = {};

            // Set invalid types based on endpoint
            switch(endpoint) {
                case 'login':
                    invalidParams.username = 123; // Should be string
                    invalidParams.password = true; // Should be string
                    break;
                case 'getProduct':
                    invalidParams.productID = "abc"; // Should be number
                    break;
                case 'getReviews':
                    invalidParams.productID = "not-a-number";
                    invalidParams.page = "string-page";
                    break;
                case 'addReview':
                    invalidParams.productID = "invalid";
                    invalidParams.reviewRating = "high"; // Should be number
                    break;
                case 'editReview':
                    invalidParams.reviewID = "not-numeric";
                    invalidParams.reviewRating = "excellent"; // Should be number
                    break;
                default:
                    invalidParams.someParam = {}; // Object where string/number expected
            }

            return {
                type: endpoint,
                key: UIController.getDefaultApiKey(),
                parameters: invalidParams
            };
        },

        invalidParamValue: function(endpoint) {
            // Create request with valid types but invalid values
            const invalidParams = {};

            switch(endpoint) {
                case 'getProductPage':
                    invalidParams.page = -1; // Negative page
                    invalidParams.limit = 1000; // Too large
                    break;
                case 'getReviews':
                    invalidParams.productID = 9999999; // Non-existent product
                    invalidParams.sort = "nonExistentField"; // Invalid sort field
                    break;
                case 'addReview':
                    invalidParams.productID = 1;
                    invalidParams.reviewTitle = "Test";
                    invalidParams.reviewDescription = "Test";
                    invalidParams.reviewRating = 10; // Out of range (1-5)
                    break;
                case 'editReview':
                    invalidParams.reviewID = 9999999; // Non-existent review
                    invalidParams.reviewRating = 0; // Out of range
                    break;
                default:
                    invalidParams.someValue = "invalid-value";
            }

            return {
                type: endpoint,
                key: UIController.getDefaultApiKey(),
                parameters: invalidParams
            };
        },

        exceedLimits: function(endpoint) {
            // Create request that exceeds size/range limits
            const params = {};

            // Generate a very long string (2KB)
            const longString = new Array(2049).join('X');

            switch(endpoint) {
                case 'login':
                    params.username = longString;
                    params.password = longString;
                    break;
                case 'register':
                    params.username = longString;
                    params.email = longString + '@example.com';
                    params.password = longString;
                    break;
                case 'getProductPage':
                    params.limit = 1000; // Request too many items
                    break;
                case 'addReview':
                    params.productID = 1;
                    params.reviewTitle = longString;
                    params.reviewDescription = longString;
                    break;
                default:
                    params.someParam = longString;
            }

            return {
                type: endpoint,
                key: UIController.getDefaultApiKey(),
                parameters: params
            };
        },

        malformedJSON: function(endpoint) {
            // This case is special - we'll return a placeholder
            // The actual malformed JSON is handled in runErrorTest
            return {
                type: endpoint,
                key: UIController.getDefaultApiKey(),
                parameters: {}
            };
        }
    };

    // Expected error descriptions for documentation
    const expectedErrors = {
        missingAPIKey: "API key is required",
        invalidAPIKey: "Invalid API key",
        missingRequiredParams: "Missing required parameters",
        invalidParamType: "Invalid parameter type(s)",
        invalidParamValue: "Invalid parameter value(s)",
        exceedLimits: "Exceeds size or range limits",
        malformedJSON: "Malformed JSON request"
    };

    // Initialize DOM references
    const initializeDOMReferences = function() {
        DOM = {
            endpointSelect: document.getElementById('errorTestEndpoint'),
            errorCaseSelect: document.getElementById('errorTestCase'),
            runButton: document.getElementById('runErrorTest'),
            requestBody: document.getElementById('errorRequestBody'),
            responseBody: document.getElementById('errorResponseBody'),
            resultsTable: document.getElementById('errorTestResults')
        };
    };

    // Update endpoint selection
    const handleEndpointChange = function() {
        state.selectedEndpoint = DOM.endpointSelect.value;
    };

    // Update error case selection
    const handleErrorCaseChange = function() {
        state.selectedErrorCase = DOM.errorCaseSelect.value;
    };

    // Generate an error test request
    const generateErrorRequest = function() {
        if (!state.selectedEndpoint || !state.selectedErrorCase) {
            return null;
        }

        // Get the error test function for this case
        const errorTestFn = errorTestCases[state.selectedErrorCase];
        if (!errorTestFn) {
            return null;
        }

        // Generate request object
        return errorTestFn(state.selectedEndpoint);
    };

    // Run the selected error test
    const runErrorTest = function() {
        if (!state.selectedEndpoint) {
            alert('Please select an endpoint to test');
            return;
        }

        if (!state.selectedErrorCase) {
            alert('Please select an error test case');
            return;
        }

        // Generate request based on selected error test
        const requestData = generateErrorRequest();
        if (!requestData) {
            alert('Could not generate error test request');
            return;
        }

        // Display request JSON
        DOM.requestBody.value = JSON.stringify(requestData, null, 2);

        // Special case for malformed JSON test
        if (state.selectedErrorCase === 'malformedJSON') {
            // Corrupt the JSON by removing a closing brace
            const malformedJSON = DOM.requestBody.value.substring(0, DOM.requestBody.value.length - 2);
            DOM.requestBody.value = malformedJSON;
        }

        // Disable run button while test is running
        DOM.runButton.disabled = true;

        // Send the request
        let requestBody;
        try {
            // For malformed JSON, we need to send the raw value
            requestBody = state.selectedErrorCase === 'malformedJSON'
                ? DOM.requestBody.value
                : JSON.stringify(requestData);
        } catch (e) {
            alert('Error preparing request: ' + e.message);
            DOM.runButton.disabled = false;
            return;
        }

        fetch(UIController.getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        })
            .then(response => {
                // For malformed JSON, the response might not be valid JSON
                if (state.selectedErrorCase === 'malformedJSON' && !response.ok) {
                    return {
                        status: 'error',
                        message: 'Malformed JSON detected by server'
                    };
                }
                return response.json();
            })
            .then(data => {
                // Display response
                DOM.responseBody.textContent = JSON.stringify(data, null, 2);

                // Add to test results
                addTestResult(data);
            })
            .catch(error => {
                console.error('Error:', error);
                const errorResponse = {
                    status: 'error',
                    message: 'Failed to connect to API: ' + error.message
                };

                // Display error response
                DOM.responseBody.textContent = JSON.stringify(errorResponse, null, 2);

                // Add to test results
                addTestResult(errorResponse);
            })
            .finally(() => {
                // Re-enable run button
                DOM.runButton.disabled = false;
            });
    };

    // Add a test result to the results table
    const addTestResult = function(responseData) {
        // Create a new result object
        const result = {
            timestamp: new Date(),
            endpoint: state.selectedEndpoint,
            errorCase: state.selectedErrorCase,
            expectedError: expectedErrors[state.selectedErrorCase],
            actualError: responseData.message || 'No error message',
            status: responseData.status === 'error' ? 'Pass' : 'Fail'
        };

        // Add to state
        state.testResults.unshift(result);

        // Update UI
        updateResultsTable();
    };

    // Update the results table with current state
    const updateResultsTable = function() {
        // Clear current results
        DOM.resultsTable.innerHTML = '';

        if (state.testResults.length === 0) {
            DOM.resultsTable.innerHTML = '<tr><td colspan="5" class="text-center">No error tests run yet</td></tr>';
            return;
        }

        // Add each result to the table
        state.testResults.forEach(result => {
            const row = document.createElement('tr');

            // Style based on pass/fail
            if (result.status === 'Fail') {
                row.className = 'table-danger';
            } else {
                row.className = 'table-success';
            }

            row.innerHTML = `
                <td>${result.errorCase}</td>
                <td>${result.endpoint}</td>
                <td>${result.expectedError}</td>
                <td>${result.actualError}</td>
                <td>${result.status}</td>
            `;

            DOM.resultsTable.appendChild(row);
        });
    };

    // Initialize event listeners
    const initializeEventListeners = function() {
        DOM.endpointSelect.addEventListener('change', handleEndpointChange);
        DOM.errorCaseSelect.addEventListener('change', handleErrorCaseChange);
        DOM.runButton.addEventListener('click', runErrorTest);
    };

    // Public interface
    return {
        init: function() {
            initializeDOMReferences();
            initializeEventListeners();
            updateResultsTable(); // Initialize empty table
            console.log('Error Testing Controller initialized');
        }
    };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    ErrorTestingController.init();
});