/* Consists of all the js required for the admin page. */
window.addEventListener('load', function () {
    // When the window has loaded...
    // Loads the header
    initHeader();

    // Loads the questions
    loadQuestions();
});

// Function used to initialize and load the required elements of the header
let initHeader = function() {
    // Back button
    let backBtn = document.createElement("A");
    backBtn.className = "btn btn-primary";
    backBtn.setAttribute("href", "/");
    backBtn.innerHTML = "Back";

    // title
    let title = document.createElement("H1");
    title.innerHTML = "Administrator View";
    
    // get the header div
    let headerDiv = document.getElementById("header");

    // appending
    headerDiv.appendChild(backBtn);
    headerDiv.appendChild(title);
}

// Function used to load teh questions 
let loadQuestions = function () {
    // XMLHttpRequest, GET to obtain the questions
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://brian-li-asn1.herokuapp.com/getQuestions", true);
    xhttp.send();
    // Waiting for state change
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // If successful, parse the results 
            let jsonRes = JSON.parse(this.responseText);
            // If results are empty
            if (jsonRes.length === 0) {
                // Create a H1 stating there are no questions
                let noQuestionText = document.createElement("H1");
                noQuestionText.innerHTML = "There are currently no questions in the quiz, create one.";
                let questionsContainer = document.getElementById("questionsContainer");
                questionsContainer.appendChild(noQuestionText);

                // Call the newQuestion function to create the new question input fields
                newQuestion();
            } else {
                // If results are not empty (there are questions)
                // Get the questionsContainer
                let questionsContainer = document.getElementById("questionsContainer");
                // Loop through each element returned by the GET call
                jsonRes.forEach(element => {
                    // In here we will be making each question
                    // Container for the question
                    let questionContainer = document.createElement("DIV");
                    questionContainer.className = "question";
                    questionContainer.id = `question${element.id}`

                    // Input field containing the question
                    let questionText = document.createElement("INPUT");
                    questionText.setAttribute("type", "text");
                    questionText.setAttribute("placeholder", "Question Name");
                    questionText.className = "question form-control";
                    questionText.value = element.text;
                    questionText.disabled = "true";

                    // Options for the question
                    let optionsContainer = document.createElement("DIV");
                    optionsContainer.className = "optionsContainer";

                    // Loop through all the options for the question
                    for (let i = 0; i < element.options.length; i++) {
                        // shorthand to the options
                        let option = element.options;

                        // create a container for this option
                        let optionContainer = document.createElement("DIV");
                        optionContainer.className = `optionContainer`

                        // Input field for the option's text
                        let optionInput = document.createElement("INPUT");
                        optionInput.type = "text";
                        optionInput.className = `option`;
                        optionInput.id = `option-${element.options[i].id}`
                        optionInput.disabled = "true";
                        optionInput.value = option[i].optionText;

                        // Radio for answer
                        let radio = document.createElement("INPUT");
                        radio.setAttribute("type", "radio");
                        radio.setAttribute("name", `question${element.id}-radio`);
                        radio.setAttribute("disabled", "true");
                        // if this option is correct, make this radio checked
                        if (element.options[i].isCorrect) {
                            radio.checked = true;
                        }
                        radio.className = `option-radio form-check-input`;

                        // Appending
                        optionContainer.appendChild(optionInput);
                        optionContainer.appendChild(radio);
                        optionsContainer.appendChild(optionContainer);
                    }

                    // Edit button
                    let editBtn = document.createElement("BUTTON");
                    editBtn.className = "btn btn-primary"
                    editBtn.innerHTML = "Edit";
                    // onclick edit btn
                    editBtn.onclick = function () {
                        // create a save button
                        let saveBtn = document.createElement("BUTTON");
                        saveBtn.id = "saveBtn";
                        saveBtn.innerHTML = "Save";
                        saveBtn.className = "btn btn-primary"
                        // onclick function for the saveBtn, will send a POST request to server
                        saveBtn.onclick = function () {
                            // xmlhttprequest to update database with the edit
                            let wholeQuestion = {};
                            wholeQuestion.id = element.id;
                            wholeQuestion.questionText = questionText.value;

                            // obtaining the options
                            let optionsArr = [];
                            optionsContainer.childNodes.forEach(element => {
                                // option text
                                let optionText = element.childNodes[0].value;

                                // if the text is empty
                                if (!optionText || optionText.length === 0) {
                                    alert(`You are missing an option`);
                                }

                                // obtaining the id
                                let optionElementID = element.childNodes[0].id;
                                let temp = optionElementID.split(/([0-9]+)/);
                                let id = temp[1];
                                
                                // if it is the answer
                                let isAnswer = element.childNodes[1].checked;

                                // whole option
                                let option = {};
                                option.text = optionText;
                                option.isAnswer = isAnswer;
                                option.id = id;
                                
                                // adding this option into the options array
                                optionsArr.push(option);
                            });

                            // Adding the updated options to the wholeQuestion 
                            wholeQuestion.options = optionsArr;

                            // XMLHttpRequest
                            xhttp.open("POST", "https://brian-li-asn1.herokuapp.com/editQuestion", true);
                            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            xhttp.onreadystatechange = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    console.log(this.responseText);
                                    alert(this.responseText);
                                }
                            }
                            xhttp.send(JSON.stringify(wholeQuestion));

                            // when the request has been sent, go through and disable every input
                            questionText.disabled = true;
                            optionsContainer.childNodes.forEach(element => {
                                let option = element.childNodes[0];
                                let radio = element.childNodes[1];
                                option.disabled = true;
                                radio.disabled = true;
                                // remove the save Btn
                                saveBtn.remove();
                            });
                        }

                        // go through and enable every input to be able to be edited
                        questionText.disabled = false;
                        optionsContainer.childNodes.forEach(element => {
                            let option = element.childNodes[0];
                            let radio = element.childNodes[1];
                            option.disabled = false;
                            radio.disabled = false;
                        });

                        // append a saveBtn if not already there
                        if (!document.getElementById("saveBtn")) {
                            questionContainer.appendChild(saveBtn);
                        }
                    }

                    // delete btn
                    let dltBtn = document.createElement("BUTTON");
                    dltBtn.innerHTML = "Delete";
                    dltBtn.className = "btn btn-primary"
                    // onclick function for the delete btn
                    dltBtn.onclick = function() {
                        // send a POST request to delete the question
                        xhttp.open("POST", "https://brian-li-asn1.herokuapp.com/deleteQuestion", true);
                        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhttp.onreadystatechange = function () {
                            if (this.readyState == 4 && this.status == 200) {
                                console.log(this.responseText);
                                alert(this.responseText);
                                questionsContainer.innerHTML = "";
                                loadQuestions();
                            }
                        }
                        let req = {};
                        req.id = element.id;
                        xhttp.send(JSON.stringify(req));
                    }
                    // Appending
                    questionContainer.appendChild(questionText);
                    questionContainer.appendChild(optionsContainer);
                    questionContainer.appendChild(editBtn);
                    questionContainer.appendChild(dltBtn);
                    questionsContainer.appendChild(questionContainer);
                    
                });
                // Calls a function that appends a new question button
                newQuestionBtn();
            }
        }
    }
}

// Function used to create the new question button
let newQuestionBtn = function() {
    let questionsContainer = document.getElementById("questionsContainer");
    let newBtn = document.createElement("BUTTON");
    newBtn.className = "btn btn-primary"
    newBtn.innerHTML = "New";
    newBtn.onclick = function() {
        newQuestion();
        questionsContainer.removeChild(newBtn);
        questionsContainer.appendChild(newBtn);
    }
    questionsContainer.appendChild(newBtn);
}

// Function used to create all the input fields required for the user to make a new question
let newQuestion = function () {
    // QuestionContainer
    let questionContainer = document.createElement("DIV");
    questionContainer.className = "question";
    questionContainer.id = "newQuestionContainer"

    // Options Container
    let optionsContainer = document.createElement("DIV");
    optionsContainer.className = "optionsContainer";

    // Creating options
    for (let i = 1; i <= 4; i++) {
        let optionContainer = document.createElement("DIV");
        optionContainer.className = `optionContainer`

        // Input field
        let optionInput = document.createElement("INPUT");
        optionInput.className = `option`;
        optionInput.setAttribute("placeholder", `Option ${i}`);

        // Radio for correct answer
        let radio = document.createElement("INPUT");
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", `questionRadio`)
        radio.className = `option${i}-radio form-check-input`;

        // Appending
        optionContainer.appendChild(optionInput);
        optionContainer.appendChild(radio);
        optionsContainer.appendChild(optionContainer);
    }

    // Question Text/Name Field
    let questionText = document.createElement("INPUT");
    questionText.setAttribute("type", "text");
    questionText.setAttribute("placeholder", "Question Name");
    questionText.className = "question form-control";

    // Indicator for range
    let rangeIndicator = document.createElement("P");
    rangeIndicator.innerHTML = "4 Options"

    // Range for asking number of questions
    let range = document.createElement("INPUT");
    range.setAttribute("type", "range");
    range.className = "form-range";
    range.id = "rangeSlider";
    range.setAttribute("min", "2");
    range.setAttribute("max", "4");
    range.addEventListener('input', function (event) {
        // Change value of indicator
        let value = range.value;
        rangeIndicator.innerHTML = `${value} Options`

        // Add or remove options accordingly
        let count = optionsContainer.childElementCount;

        let difference = count - value;

        if (difference > 0) {
            for (let i = 0; i < difference; i++) {
                optionsContainer.removeChild(optionsContainer.lastChild);
            }
        } else if (difference < 0) {
            for (let i = 1; i < Math.abs(difference) + 1; i++) {
                // option container
                let optionContainer = document.createElement("DIV");
                optionContainer.className = `optionContainer${count + i}`;

                // input field
                let optionInput = document.createElement("INPUT");
                optionInput.className = "option";
                optionInput.setAttribute("placeholder", `Option ${count + i}`);

                // radio for correct answer
                let radio = document.createElement("INPUT");
                radio.setAttribute("type", "radio");
                radio.setAttribute("name", "questionRadio");
                radio.className = `option${count + i}-radio form-check-input`;

                // 

                // Appending
                optionContainer.appendChild(optionInput);
                optionContainer.appendChild(radio);
                optionsContainer.appendChild(optionContainer);
            }
        }
    });

    // Label for range
    let rangeLabel = document.createElement("LABEL");
    rangeLabel.setAttribute("for", "customRange1")
    rangeLabel.innerHTML = "How Many Options?"

    // Save button
    let save = document.createElement("BUTTON");
    save.innerHTML = "Save";
    save.className = "btn btn-primary";
    save.onclick = parseNewQuestion;

    // Appending
    questionContainer.appendChild(questionText);
    questionContainer.appendChild(rangeLabel);
    questionContainer.appendChild(rangeIndicator);
    questionContainer.appendChild(range);
    questionContainer.appendChild(optionsContainer);
    questionContainer.appendChild(save);
    let questionsContainer = document.getElementById("questionsContainer");
    questionsContainer.appendChild(questionContainer);
}

// Function used to parse all the information from the new question
let parseNewQuestion = function () {
    let questions = document.getElementById("questionsContainer");
    let fields = document.getElementById("newQuestionContainer").childNodes;

    /* The question itself */
    let questionText = fields[0].value;
    if (!questionText || questionText.length === 0) {
        alert(`You are missing the question!`);
        return;
    }

    /* The options */
    let optionsArr = [];
    let optionsContainers = fields[4].childNodes;

    // Loop through all options
    for (let i = 0; i < optionsContainers.length; i++) {
        let optionContainer = optionsContainers[i];

        // Option
        let optionText = optionContainer.childNodes[0].value;
        if (!optionText || optionText.length === 0) {
            alert(`Need to fill out option #${i + 1}`);
            return;
        }

        // If this option is an answer
        let isAnswer = optionContainer.childNodes[1].checked;
        let option = {};
        option.text = optionText;
        option.isAnswer = isAnswer;
        optionsArr.push(option);
    }

    // Ensuring that there is an answer being sent
    let count = 0;
    for (let i = 0; i < optionsArr.length; i++) {
        if (optionsArr[i].isAnswer) {
            count++;
        }
    }

    // If there is an answer
    if (count == 1) {
        // build question into json object
        let wholeQuestion = {};
        wholeQuestion.questionText = questionText;
        wholeQuestion.options = optionsArr;
        postNewQuestion(wholeQuestion);
    } else {
        // if no answer,
        alert("You must select a correct answer!");
        return;
    }


}

// Function used to send a POST request to the server for the New question
let postNewQuestion = function (question) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://brian-li-asn1.herokuapp.com/newQuestion", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            alert(this.responseText);
            
            let questionsContainer = document.getElementById("questionsContainer");
            questionsContainer.innerHTML = "";
            loadQuestions();
        }
    }
    xhttp.send(JSON.stringify(question));
}