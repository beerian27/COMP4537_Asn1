/* Contains all the js required for the student page */

// When the window has loaded,
window.addEventListener('load', function() {
    // Initialize the header
    initHeader();
    // Load the questions
    loadQuestions();
});

// Function used to initialize the header and all its required elements
let initHeader = function() {
    // Create a back button
    let backBtn = document.createElement("A");
    backBtn.className = "btn btn-primary";
    backBtn.setAttribute("href", "/");
    backBtn.innerHTML = "Back";

    // Create the title
    let title = document.createElement("H1");
    title.innerHTML = "Quiz Time!";
    
    // Get the header DIV
    let headerDiv = document.getElementById("header");

    // Appending
    headerDiv.appendChild(backBtn);
    headerDiv.appendChild(title);

}

// Function used to GET the questions using an XMLHttpRequest
let loadQuestions = function() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://brian-li-asn1.herokuapp.com/getQuestions", true);
    xhttp.send();
    // Awaiting state change
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Success case
            let jsonRes = JSON.parse(this.responseText);
            // If the response is empty / 0
            if (jsonRes.length === 0) {
                // Call the function to display the case in which there are no questions
                noQuestions();
            } else {
                // If response is not empty, show the questions
                showQuestions(jsonRes);
            }
        }
    }
}

// Function used to create the elements required to tell the student there are no questions
let noQuestions = function() {
    // No Questions prompt to user
    let noQuestionsPrompt = document.createElement("H1");
    noQuestionsPrompt.innerHTML = "There are no questions, take the day off.";

    // Appending
    let headerDiv = document.getElementById("header");
    headerDiv.appendChild(noQuestionsPrompt);
}

// Function used to show the questions obtained from the GET request
let showQuestions = function(data) {
    // find questions div
    let questionsContainer = document.getElementById("questionsContainer");
    
    // ordered list containing the questions
    let orderedList = document.createElement("OL");
    orderedList.id = "questionsList";

    // incrementing a count for question #ing purposes
    let count = 1;

    // loop through data/each question
    data.forEach(element => {
        // new list item from each question
        let listItem = document.createElement("LI");
        listItem.id = count;

        // create container for each question
        let questionContainer = document.createElement("DIV");
        questionContainer.className = "question";
        questionContainer.id = `question-${element.id}`;

        // h3 containig the question text
        let questionText = document.createElement("H3");
        questionText.className = "questionText";
        questionText.innerHTML = element.text;

        // Options:
        let optionsContainer = document.createElement("DIV");
        optionsContainer.className = "optionsContainer";
        let options = element.options
        // Creating the x options
        for (let i = 0; i < options.length; i++) {
            // Container for this option
            let optionContainer = document.createElement("DIV");
            optionContainer.className="optionContainer"

            // optionText
            let optionText = document.createElement("P");
            optionText.innerHTML = options[i].optionText;

            // Radio for selecting answer
            let radio = document.createElement("INPUT");
            radio.type = "radio";
            radio.id = `option-${options[i].id}`
            radio.name = `question-${element.id}`;
            radio.className = 'option-radio form-check-input';

            // appending
            optionContainer.appendChild(radio);
            optionContainer.appendChild(optionText);
            optionsContainer.appendChild(optionContainer);
        }
        // appending
        questionContainer.appendChild(questionText);
        questionContainer.appendChild(optionsContainer);
        listItem.appendChild(questionContainer);
        orderedList.appendChild(listItem);
        // increment the count
        count++;
    });
    
    // appending
    questionsContainer.appendChild(orderedList);

    // create a submit button
    initSubmitBtn();
}

// Function used to create a submit button to be used by the student to submit their quiz
let initSubmitBtn = function() {
    // create button
    let submitBtn = document.createElement("BUTTON");
    submitBtn.className = "btn-primary"
    submitBtn.innerHTML = "Submit"
    submitBtn.onclick = onClickSubmit;
    submitBtn.id = "submitBtn";

    // append button
    let questionsContainer = document.getElementById("questionsContainer");
    questionsContainer.appendChild(submitBtn);
}

// onclick function for the submit button
let onClickSubmit = function() {
    calculateScore();
}

// parses the selections made by the student
let parseSelections = function() {
    // obtaining all radios
    let radios = document.getElementsByTagName("input");
    // array that will hold all the answers selected by the student
    let selectedAnswers = [];
    
    // returns true if there is answer for each question
    if (checkAllSelected()) {
        // if all questions have a selection, loop through the radios
        for (let i = 0; i < radios.length; i++) {
            // If the radio is checked
            if (radios[i].checked) {
                // obtain the optionID
                let radioID = radios[i].id;
                let temp1 = radioID.split(/([0-9]+)/);
                let optionID = temp1[1];
                
                // obtain the questionID
                let radioName = radios[i].name;
                let temp2 = radioName.split(/([0-9]+)/);
                let questionID = temp2[1];

                // put selection into an object, add it into the selectedAnswers array
                let selection = {};
                selection.optionID = parseInt(optionID);
                selection.questionID = parseInt(questionID);
                selectedAnswers.push(selection);
            }
        }
        // return the selectedAnswers array
        return selectedAnswers;
    } else {
        console.log("Not all selected");
        return;
    }
}

// Ensures all questions have an answer selected after hitting the submit button
let checkAllSelected = function() {
    // obtain the question containers
    let questionContainers = document.getElementsByClassName("question");

    // array that will hold all the unanswered questions 
    let unansweredQuestions = [];

    // loop through each question
    for (let i = 0; i < questionContainers.length; i++) {
        // get question-id
        let id = questionContainers[i].id;

        // get all radios for this question
        let radios = document.getElementsByName(id);

        // loop through radios and ensure one is checked
        let count = 0;
        for (let j = 0; j < radios.length; j++) {
            
            if (radios[j].checked) {
                count++;
            }
        }

        // If there is not a selection in this question, push it into the unanswered questions
        if (count != 1) {
            console.log(count);
            unansweredQuestions.push(questionContainers[i].parentNode.id);
        }
    }

    // If there is at least 1 unanswered question
    if (unansweredQuestions.length != 0) {
        // String building the prompt
        let prompt = `You are missing answers for question(s) ${unansweredQuestions[0]}`;
        for (let i = 1; i < unansweredQuestions.length; i++) {
            if (i == unansweredQuestions.length - 1) {
                prompt += `, ${unansweredQuestions[i]}!`
            } else {
                prompt += `, ${unansweredQuestions[i]}`;
            }
        }
        // alert the prompt and return false
        alert(prompt);
        return false;
    } else {
        // If there is 0 unanswered questions, return true
        return true;
    }
}

// Function used to calculate the score
let calculateScore = function() {
    // Create an XMLHttpRequest to do a GET Request for the answers
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://brian-li-asn1.herokuapp.com/getAnswers", true);
    xhttp.send();
    // awaiting readystatechange
    xhttp.onreadystatechange = function() {
        // success
        if (this.readyState == 4 && this.status == 200) {
            // parse response
            let jsonRes = JSON.parse(this.responseText);
            // if response is empty
            if (jsonRes.length === 0) {
                // no rows returned
                console.log("No rows returned");
            } else {
                // if response is not empty, obtain the user's selections
                let selections = parseSelections();
                
                // variable that will be used to count the score
                let score = 0;

                // loop through all the student's selections
                selections.forEach(selection => {
                    // find the answer for the current question
                    let answerForQuestion = jsonRes.find(element => {
                        return element.questionID === selection.questionID;
                    });

                    // If the student got it correct
                    if (selection.optionID === answerForQuestion.optionID) {
                        // Change background color of it to green, increment the score
                        let selectedOption = document.getElementById(`option-${selection.optionID}`);
                        let selectedOptionDiv = selectedOption.parentElement;
                        selectedOptionDiv.style.backgroundColor = "#91FF89";
                        score++;
                    } else {
                        // If student got it wrong

                        // Change background color of the student's wrong answer to red
                        let selectedOption = document.getElementById(`option-${selection.optionID}`);
                        let selectedOptionDiv = selectedOption.parentElement;
                        selectedOptionDiv.style.backgroundColor = "#FF8989";

                        // Change background color of the correct option to yellow
                        let correctOption = document.getElementById(`option-${answerForQuestion.optionID}`);
                        let correctOptionDiv = correctOption.parentElement;
                        correctOptionDiv.style.backgroundColor = "#FFF78E";
                    }

                    // If this is the last question,
                    if (selection === selections[selections.length-1]) {
                        // Get rid of the submit button
                        let questionsContainer = document.getElementById("questionsContainer");
                        questionsContainer.removeChild(questionsContainer.lastChild);

                        // Send an alert of the score
                        alert(`Your score is ${Math.floor((score / jsonRes.length) * 100)}%! Click OK to view your results`);
                        
                        // Create a try again button
                        let tryAgainBtn = document.createElement("BUTTON");
                        tryAgainBtn.innerHTML = "Try Again";
                        tryAgainBtn.className = "btn-primary";
                        tryAgainBtn.id = "tryAgainBtn";
                        // onclick for the button, will just reload the page basically
                        tryAgainBtn.onclick = function() {
                            questionsContainer.innerHTML = "";
                            loadQuestions();
                        }

                        // The following elements created are used as a key/legend for the student to understand the marking
                        // explanation for the red background meaning
                        let redExplanation = document.createElement("P");
                        redExplanation.innerHTML = "Red = Wrong selection.";
                        // explanation for the yellow background meaning
                        let yellowExplanation = document.createElement("P");
                        yellowExplanation.innerHTML = "Yellow = Correct answer for incorrectly answered question.";
                        // explanation for the green background meaning
                        let greenExplanation = document.createElement("P");
                        greenExplanation.innerHTML = "Green = Correct selection";

                        // text consisting of the user's score
                        let scoreText = document.createElement("P");
                        scoreText.innerHTML = `Your score is ${Math.floor((score / jsonRes.length) * 100)}%!`

                        // appending
                        questionsContainer.appendChild(redExplanation);
                        questionsContainer.appendChild(yellowExplanation);
                        questionsContainer.appendChild(greenExplanation);
                        questionsContainer.appendChild(scoreText);
                        questionsContainer.appendChild(tryAgainBtn);
                    }
                });
            }
        }
    }
}