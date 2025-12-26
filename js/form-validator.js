// Form Validation System for SIMBA.RP
class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.options = {
            showErrors: options.showErrors !== false,
            focusFirstError: options.focusFirstError !== false,
            validateOnChange: options.validateOnChange !== false,
            validateOnBlur: options.validateOnBlur !== false,
            ...options
        };

        this.errors = new Map();
        this.validators = {
            required: this.validateRequired.bind(this),
            email: this.validateEmail.bind(this),
            discord: this.validateDiscord.bind(this),
            age: this.validateAge.bind(this),
            minLength: this.validateMinLength.bind(this),
            maxLength: this.validateMaxLength.bind(this),
            pattern: this.validatePattern.bind(this),
            match: this.validateMatch.bind(this),
            number: this.validateNumber.bind(this),
            url: this.validateURL.bind(this),
            phone: this.validatePhone.bind(this)
        };

        this.init();
    }

    init() {
        // Add submit event listener
        this.form.addEventListener('submit', this.handleSubmit.bind(this));

        // Add change/blur listeners if enabled
        if (this.options.validateOnChange) {
            this.form.addEventListener('input', this.handleInput.bind(this));
        }

        if (this.options.validateOnBlur) {
            this.form.addEventListener('focusout', this.handleBlur.bind(this));
        }

        // Initialize all fields
        this.initializeFields();
    }

    initialize }