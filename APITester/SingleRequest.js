/**
 * CompareIt API Tester - Single Request Controller
 * Handles functionality specific to the Single Request tab
 */

const SingleRequestController = (function() {
    // DOM elements
    let DOM = {};

    // Current state of the request
    let state = {
        endpoint: '',
        apiKey: '',
        parameters: {}
    };

    // Endpoint parameter definitions for dynamic UI generation
    const endpointParameters = {
        // User Management
        login: [
            { name: 'username', type: 'text', required: true },
            { name: 'password', type: 'password', required: true }
        ],
        register: [
            { name: 'username', type: 'text', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'password', type: 'password', required: true },
            { name: 'confirmPassword', type: 'password', required: true }
        ],
        getUserID: [
            { name: 'username', type: 'text', required: true }
        ],
        validatePassword: [
            { name: 'username', type: 'text', required: true },
            { name: 'password', type: 'password', required: true }
        ],

        // Product Management
        getProductPage: [
            { name: 'page', type: 'number', required: false, default: 1 },
            { name: 'limit', type: 'number', required: false, default: 20 },
            { name: 'category', type: 'number', required: false },
            { name: 'brand', type: 'number', required: false },
            { name: 'minPrice', type: 'number', required: false },
            { name: 'maxPrice', type: 'number', required: false },
            { name: 'sort', type: 'select', required: false, options: ['price', 'name', 'customerReviewAverage'], default: 'name' },
            { name: 'order', type: 'select', required: false, options: ['asc', 'desc'], default: 'asc' }
        ],
        getProduct: [
            { name: 'product_id', type: 'number', required: true }
        ],
        getProductComparisons: [
            { name: 'product_id', type: 'number', required: true }
        ],

        // Review Management
        addReview: [
            { name: 'product_id', type: 'number', required: true },
            { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
            { name: 'review_text', type: 'textarea', required: true }
        ],
        removeReview: [
            { name: 'review_id', type: 'number', required: true }
        ],
        editReview: [
            { name: 'review_id', type: 'number', required: true },
            { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
            { name: 'review_text', type: 'textarea', required: true }
        ],
        getReviews: [
            { name: 'product_id', type: 'number', required: true }
        ],

        // Filter Management
        getCategories: [
            { name: 'parent', type: 'number', required: false }
        ],
        getBrands: [
            { name: 'categoryID', type: 'number', required: false }
        ]
    };

    // Initialize DOM references
    const initializeDOMReferences = function() {
        DOM = {
            apiEndpoint: document.getElementById('apiEndpoint'),
            apiKey: document.getElementById('apiKey'),
            parameterFields: document.getElementById('parameterFields'),
            requestBody: document.getElementById('requestBody'),
            generateRequestBtn: document.getElementById('generateRequest'),
            sendRequestBtn: document.getElementById('sendRequest'),
            saveToTestSuiteBtn: document.getElementById('saveToTestSuite'),
            responseBody: document.getElementById('responseBody'),
            spinner: document.getElementById('spinner')
        };
    };

    // Generate parameter input fields based on selected endpoint
    const generateParameterFields = function() {
        DOM.parameterFields.innerHTML = '';

        if (!state.endpoint || !endpointParameters[state.endpoint]) {
            DOM.parameterFields.innerHTML = '<p class="text-muted">Select an API endpoint to see parameters</p>';
            return;
        }

        const params = endpointParameters[state.endpoint];

        params.forEach(param => {
            const formGroup = document.createElement('div');
            formGroup.className = 'mb-3';

            // Create label
            const label = document.createElement('label');
            label.className = 'form-label';
            label.setAttribute('for', `param-${param.name}`);
            label.textContent = param.name + (param.required ? ' *' : '');

            // Create input element based on type
            let input;

            if (param.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else if (param.type === 'select' && param.options) {
                input = document.createElement('select');
                param.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option;
                    if (param.default && param.default === option) {
                        optionEl.selected = true;
                    }
                    input.appendChild(optionEl);
                });
            } else {
                input = document.createElement('input');
                input.type = param.type;

                if (param.min !== undefined) input.min = param.min;
                if (param.max !== undefined) input.max = param.max;

                if (param.default !== undefined) {
                    input.value = param.default;
                }
            }

            input.className = 'form-control';
            input.id = `param-${param.name}`;
            input.name = param.name;

            if (param.required) {
                input.required = true;
            }

            formGroup.appendChild(label);
            formGroup.appendChild(input);

            DOM.parameterFields.appendChild(formGroup);
        });
    };

    // Handle endpoint change
    const handleEndpointChange = function() {
        state.endpoint = DOM.apiEndpoint.value;
        generateParameterFields();
    };

    // Generate request JSON based on form inputs
    const generateRequest = function() {
        const parameters = {};
        const apiKey = DOM.apiKey.value || UIController.getDefaultApiKey();

        // Gather parameter values
        const paramInputs = DOM.parameterFields.querySelectorAll('input, select, textarea');
        paramInputs.forEach(input => {
            if (input.value) {
                parameters[input.name] = input.value;
            }
        });

        // Create proper request structure matching API expectations
        const requestData = {
            type: state.endpoint,
            api_key: apiKey,  // Changed from key to api_key
            ...parameters    // Flatten parameters directly into request
        };

        // Update state
        state.apiKey = apiKey;
        state.parameters = parameters;

        // Display in request body textarea
        DOM.requestBody.value = JSON.stringify(requestData, null, 2);

        return requestData;
    };

    // Send API request
    const sendRequest = function() {
        // Generate request data if not already done
        let requestData;
        try {
            requestData = DOM.requestBody.value ? JSON.parse(DOM.requestBody.value) : generateRequest();
        } catch (e) {
            alert('Invalid JSON in request body');
            return;
        }

        // Show loading spinner
        DOM.spinner.style.display = 'inline-block';
        DOM.sendRequestBtn.disabled = true;

        // Make API request
        fetch(UIController.getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                // Display response
                UIController.displayResponse(data);
                DOM.responseBody.textContent = JSON.stringify(data, null, 2);

                // Add to history
                UIController.addToHistory(requestData, data);
            })
            .catch(error => {
                console.error('Error:', error);
                const errorResponse = {
                    status: 'error',
                    message: 'Failed to connect to API: ' + error.message,
                    data: null
                };

                UIController.displayResponse(errorResponse);
                DOM.responseBody.textContent = JSON.stringify(errorResponse, null, 2);
            })
            .finally(() => {
                // Hide loading spinner
                DOM.spinner.style.display = 'none';
                DOM.sendRequestBtn.disabled = false;
            });
    };

    // Save current request to a test suite
    const saveToTestSuite = function() {
        if (!DOM.requestBody.value) {
            alert('Please generate a request first');
            return;
        }

        // Show test suite modal
        const testSuiteModal = new bootstrap.Modal(document.getElementById('testSuiteModal'));
        testSuiteModal.show();

        // Setup save button handler
        const saveToSuiteBtn = document.getElementById('saveToSuite');
        const requestData = JSON.parse(DOM.requestBody.value);

        // Pre-fill test case name
        document.getElementById('testCaseName').value = `${requestData.type} Test`;

        saveToSuiteBtn.onclick = function() {
            const selectedSuiteId = parseInt(document.getElementById('selectTestSuite').value);
            const testCaseName = document.getElementById('testCaseName').value;
            const expectedOutcome = document.getElementById('expectedOutcome').value;

            let matchCriteria = null;
            if (expectedOutcome === 'specific') {
                matchCriteria = [];
                const fieldPaths = document.getElementsByName('fieldPath[]');
                const fieldValues = document.getElementsByName('fieldValue[]');

                for (let i = 0; i < fieldPaths.length; i++) {
                    if (fieldPaths[i].value) {
                        matchCriteria.push({
                            path: fieldPaths[i].value,
                            value: fieldValues[i].value
                        });
                    }
                }
            }

            const testCase = {
                name: testCaseName,
                request: requestData,
                expectedOutcome: expectedOutcome,
                matchCriteria: matchCriteria
            };

            TestSuitesController.addTestCase(selectedSuiteId, testCase);
            testSuiteModal.hide();
        };
    };

// Replay a request from history
    const replayRequest = function(requestData) {
        // Set the endpoint
        DOM.apiEndpoint.value = requestData.type;
        state.endpoint = requestData.type;

        // Set API key (handle both old and new format)
        DOM.apiKey.value = requestData.api_key || requestData.key || '';

        // Generate parameter fields
        generateParameterFields();

        // Wait for fields to be generated
        setTimeout(() => {
            // Fill in parameter values (handle both formats)
            const parameters = requestData.parameters || requestData;

            // Loop through all potential parameter fields
            const paramInputs = DOM.parameterFields.querySelectorAll('input, select, textarea');
            paramInputs.forEach(input => {
                const paramName = input.name;
                // Check if parameter exists in the request
                if (parameters[paramName] !== undefined) {
                    input.value = parameters[paramName];
                }
            });

            // Generate request JSON
            DOM.requestBody.value = JSON.stringify(requestData, null, 2);
        }, 100);
    };

    // Initialize event listeners
    const initializeEventListeners = function() {
        DOM.apiEndpoint.addEventListener('change', handleEndpointChange);
        DOM.generateRequestBtn.addEventListener('click', generateRequest);
        DOM.sendRequestBtn.addEventListener('click', sendRequest);
        DOM.saveToTestSuiteBtn.addEventListener('click', saveToTestSuite);

        // Listen for replay request events
        document.addEventListener('replayRequest', function(e) {
            replayRequest(e.detail);
        });
    };

    // Public interface
    return {
        init: function() {
            initializeDOMReferences();
            initializeEventListeners();

            // Set default API key from settings if available
            if (DOM.apiKey && UIController.getDefaultApiKey) {
                DOM.apiKey.value = UIController.getDefaultApiKey();
            }

            console.log('Single Request Controller initialized');
        }
    };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    SingleRequestController.init();
});