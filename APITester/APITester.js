// Initialize DOM element references when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Element Selections
    const apiEndpointSelect = document.getElementById('apiEndpoint');
    const apiKeyInput = document.getElementById('apiKey');
    const requestBodyTextarea = document.getElementById('requestBody');
    const responseBodyPre = document.getElementById('responseBody');
    const generateRequestBtn = document.getElementById('generateRequest');
    const sendRequestBtn = document.getElementById('sendRequest');
    const spinner = document.getElementById('spinner');
    const parameterFieldsContainer = document.getElementById('parameterFields');
    let currentEndpoint = '';

    // Function to create parameter input fields based on endpoint
    function createParameterFields(endpoint) {
        if (endpoint === currentEndpoint) return; // Don't regenerate if endpoint hasn't changed
        currentEndpoint = endpoint;

        parameterFieldsContainer.innerHTML = ''; // Clear existing fields

        // Define field sets for each endpoint
        const fieldSets = {
            'login': [
                {name: 'username', type: 'text', label: 'Username', value: 'username'},
                {name: 'password', type: 'password', label: 'Password', value: 'password'}
            ],
            'register': [
                {name: 'username', type: 'text', label: 'Username', value: 'username'},
                {name: 'password', type: 'password', label: 'Password', value: 'password'},
                {name: 'email', type: 'email', label: 'Email', value: 'user@example.com'}
            ],
            'getUserID': [],
            'validatePassword': [
                {name: 'username', type: 'text', label: 'Username', value: 'username'},
                {name: 'password', type: 'password', label: 'Password', value: 'password'}
            ],
            'verifyPassword': [
                {name: 'password', type: 'password', label: 'Password', value: 'password'},
                {name: 'hash', type: 'text', label: 'Password Hash', value: 'hash_value'}
            ],
            'hashPassword': [
                {name: 'password', type: 'password', label: 'Password', value: 'password'}
            ],
            'getProductPage': [
                {name: 'page', type: 'number', label: 'Page', value: 1},
                {name: 'limit', type: 'number', label: 'Limit', value: 10},
                {name: 'search', type: 'text', label: 'Search Term', value: ''},
                {name: 'sort', type: 'text', label: 'Sort Field', value: 'name'},
                {name: 'order', type: 'select', label: 'Sort Order', options: [
                        {value: 'asc', text: 'Ascending'},
                        {value: 'desc', text: 'Descending'}
                    ]}
            ],
            'getProduct': [
                {name: 'productID', type: 'number', label: 'Product ID', value: 1}
            ],
            'getProductComparisons': [
                {name: 'productID', type: 'number', label: 'Product ID', value: 1}
            ],
            'addReview': [
                {name: 'userID', type: 'number', label: 'User ID', value: 1},
                {name: 'productID', type: 'number', label: 'Product ID', value: 1},
                {name: 'reviewTitle', type: 'text', label: 'Review Title', value: 'Great product'},
                {name: 'reviewDescription', type: 'textarea', label: 'Review Description', value: 'This product exceeded my expectations'},
                {name: 'reviewRating', type: 'number', label: 'Rating (1-5)', value: 5, min: 1, max: 5}
            ],
            'removeReview': [
                {name: 'reviewID', type: 'number', label: 'Review ID', value: 1},
                {name: 'userID', type: 'number', label: 'User ID', value: 1}
            ],
            'editReview': [
                {name: 'reviewID', type: 'number', label: 'Review ID', value: 1},
                {name: 'userID', type: 'number', label: 'User ID', value: 1},
                {name: 'reviewTitle', type: 'text', label: 'Review Title', value: 'Updated review'},
                {name: 'reviewDescription', type: 'textarea', label: 'Review Description', value: 'This is my updated review'},
                {name: 'reviewRating', type: 'number', label: 'Rating (1-5)', value: 4, min: 1, max: 5}
            ],
            'getReviews': [
                {name: 'productID', type: 'number', label: 'Product ID', value: 1},
                {name: 'page', type: 'number', label: 'Page', value: 1},
                {name: 'limit', type: 'number', label: 'Limit', value: 10}
            ],
            'getCategories': [
                {name: 'parent', type: 'number', label: 'Parent Category ID (Optional)', value: ''}
            ],
            'getBrands': [
                {name: 'categoryID', type: 'number', label: 'Category ID (Optional)', value: ''}
            ]
        };

        const fields = fieldSets[endpoint] || [];

        if (fields.length === 0) {
            parameterFieldsContainer.innerHTML = '<p class="text-muted">No parameters required for this endpoint</p>';
            return;
        }

        // Create form fields
        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'mb-2';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.htmlFor = `param_${field.name}`;
            label.textContent = field.label;

            let input;
// Modify the field creation part in createParameterFields function
// Improved password field styling
            if (field.type === 'password') {
                const inputGroup = document.createElement('div');
                inputGroup.className = 'input-group';

                input = document.createElement('input');
                input.className = 'form-control';
                input.type = 'password';
                input.value = field.value;
                input.id = `param_${field.name}`;
                input.name = field.name;

                // Create toggle button
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'btn btn-outline-secondary';
                toggleBtn.type = 'button';
                toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
                toggleBtn.title = 'Show/Hide Password';
                toggleBtn.style.transition = 'all 0.2s';

                toggleBtn.onclick = function() {
                    if (input.type === 'password') {
                        input.type = 'text';
                        toggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
                    } else {
                        input.type = 'password';
                        toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
                    }
                    input.focus();
                };

                // Append elements in the correct order
                inputGroup.appendChild(input);
                inputGroup.appendChild(toggleBtn);

                formGroup.appendChild(label);
                formGroup.appendChild(inputGroup);
                parameterFieldsContainer.appendChild(formGroup);
                return; // Skip the default appending at the end of the function
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.className = 'form-control';
                input.rows = 3;
                input.value = field.value;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                input.className = 'form-control';
                field.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    input.appendChild(optionElement);
                });
            } else {
                input = document.createElement('input');
                input.className = 'form-control';
                input.type = field.type;
                input.value = field.value;

                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
            }

            input.id = `param_${field.name}`;
            input.name = field.name;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            parameterFieldsContainer.appendChild(formGroup);
        });
    }

    // Update the generate request function to use parameter field values
    function generateRequestFromFields() {
        const selectedEndpoint = apiEndpointSelect.value;
        const apiKey = apiKeyInput.value || 'YOUR_API_KEY';

        let requestTemplate = {
            type: selectedEndpoint,
            apiKey: apiKey,
            parameters: {}
        };

        // Get all parameter inputs
        const paramInputs = parameterFieldsContainer.querySelectorAll('input, textarea, select');
        paramInputs.forEach(input => {
            let value = input.value;

            // Convert number fields to actual numbers
            if (input.type === 'number' && value !== '') {
                value = Number(value);
            }

            // Skip empty optional fields
            if (value !== '') {
                requestTemplate.parameters[input.name] = value;
            }
        });

        // Special handling for complex parameters
        if (selectedEndpoint === 'getProductPage') {
            // Add empty filter arrays
            requestTemplate.parameters.filters = {
                categories: [],
                brands: []
            };
        }

        requestBodyTextarea.value = JSON.stringify(requestTemplate, null, 2);
        return requestTemplate;
    }

    // Update event listeners
    apiEndpointSelect.addEventListener('change', function() {
        const selectedEndpoint = apiEndpointSelect.value;
        createParameterFields(selectedEndpoint);
    });

    generateRequestBtn.addEventListener('click', function() {
        generateRequestFromFields();
    });

    sendRequestBtn.addEventListener('click', function() {
        // Generate request first if needed
        const requestData = generateRequestFromFields();

        spinner.style.display = 'inline-block';
        responseBodyPre.textContent = 'Sending request...';

        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                spinner.style.display = 'none';
                responseBodyPre.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                spinner.style.display = 'none';
                responseBodyPre.textContent = 'Error: ' + error.message;
            });
    });

    // Initialize with the first endpoint
    createParameterFields(apiEndpointSelect.value);
    generateRequestBtn.click();
});