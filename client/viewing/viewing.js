const url = 'http://localhost:3000/entry';
const HISTORY_LIMIT = 10;
const DEFAULT_FREQUENCY = 10;
const WORD_TRANSITION_SPEED = 200;
const SIDEBAR_ANIMATION_SPEED = 400;
const FLASHCARD_MOVE_DISTANCE = screen.width - 700;
const HISTORY_WIDTH = "40";

let started = false;
let dict, history, index;
let frequencies;

//local memory setup for frequencies
localStorage = window.localStorage;

//welcome page stuff
welcomeText = document.querySelector("#welcome");
startButton = document.querySelector("#random-word");
startButton.addEventListener('click', initialize);

//set up data
axios.get(url)
    .then(function (response) {
        setDictionary(response.data);

        console.log("length of word list: " + Object.keys(dict).length);

        setup();
    })
    .catch(function (error) {
        // handle error
        console.log(error);
        displayError();
    });

//wire buttons and display interface
function setup() {
    //show welcome screen
    welcomeText.classList.remove("hidden");
    startButton.classList.remove("hidden");

    //create history queue for recent words
    history = new Queue();
    //index of 0 in the history queue is the most recent word
    index = 0;

    //content
    word = document.querySelector("#word");
    pronunciation = document.querySelector("#pronunciation");
    partOfSpeech = document.querySelector("#part-of-speech");
    definition = document.querySelector("#definition");
    frequency = document.querySelector("#frequency");

    //buttons
    wordButton = document.querySelector("#new-word");
    upFrequency = document.querySelector("#increase-frequency");
    downFrequency = document.querySelector("#decrease-frequency");
    leftButton = document.querySelector("#left-button");
    rightButton = document.querySelector("#right-button");

    wordButton.addEventListener('click', function () {
        newWord();
    });
    leftButton.addEventListener('click', backHistory);
    rightButton.addEventListener('click', forwardHistory);
    upFrequency.addEventListener('click', increaseFrequency);
    downFrequency.addEventListener('click', decreaseFrequency);

    //recent word history list
    {
        recent_new = document.querySelector("#recent-new");
        recent_0 = document.querySelector("#recent-0");
        recent_1 = document.querySelector("#recent-1");
        recent_2 = document.querySelector("#recent-2");
        recent_3 = document.querySelector("#recent-3");
        recent_4 = document.querySelector("#recent-4");
        recent_5 = document.querySelector("#recent-5");
        recent_6 = document.querySelector("#recent-6");
        recent_7 = document.querySelector("#recent-7");
        recent_8 = document.querySelector("#recent-8");
        recent_9 = document.querySelector("#recent-9");
    }

    //wire recent history list 
    {
        recent_0.onclick = function () {
            changeWord(0);
        }
        recent_1.onclick = function () {
            changeWord(1);
        }
        recent_2.onclick = function () {
            changeWord(2);
        }
        recent_3.onclick = function () {
            changeWord(3);
        }
        recent_4.onclick = function () {
            changeWord(4);
        }
        recent_5.onclick = function () {
            changeWord(5);
        }
        recent_6.onclick = function () {
            changeWord(6);
        }
        recent_7.onclick = function () {
            changeWord(7);
        }
        recent_8.onclick = function () {
            changeWord(8);
        }
        recent_9.onclick = function () {
            changeWord(9);
        }
    }

    //full history list modal
    fullHistory = document.querySelector("#full-history-list");

    //initiate the autocomplete function on the searchbar element
    autocomplete(document.querySelector("#searchbar"));

    //hotkeys
    window.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 37:
                //left arrow
                if (index < history.getLength() - 1) {
                    backHistory();
                }
                break;
            case 39:
                //right arrow
                if (index != 0) {
                    forwardHistory();
                }
                break;
            case 38:
                //up arrow
                break;
            case 40:
                //down arrow
                break;
            case 13:
                //enter
                break;
            case 32:
                //spacebar
                break;
        }
    });
}

//update page visuals to account for error
function displayError() {

    var oldError = document.querySelector("#error");
    if (oldError != null) {
        oldError.parentNode.removeChild(oldError);
    }

    var error = document.createElement("h2");
    error.id = "error";
    var e = document.createTextNode("No Data Found");
    error.appendChild(e);
    document.querySelector("main").appendChild(error);
}


function initialize() {
    //hide welcome screen
    welcomeText.classList.add("hidden");
    startButton.classList.add("hidden");

    //show content
    document.querySelector("#main-content").classList.remove("hidden");
    document.querySelector("#main-content").style.display = "flex";
    document.querySelector("#controls").classList.remove("hidden");

    //initialize with random word
    if (!started) {
        newWord();
    }
}

function setDictionary(data) {
    //get saved frequency states
    frequencies = JSON.parse(localStorage.getItem("frequencies"));
    dict = {}

    for (let i = 0; i < data.length; i++) {
        dict[data[i].Id] = data[i]  
    }

    //check to see if frequencies exists
    if (frequencies != null) {
        Object.keys(dict).forEach(key => {
            if(frequencies[key] == null) {
                frequencies[key] = DEFAULT_FREQUENCY
            }
        });

        //save frequency states
        localStorage.setItem("frequencies", JSON.stringify(frequencies));
    }
    else {
        //create new frequency list
        frequencies = {};

        Object.keys(dict).length.forEach(key => {
            frequencies[key] = DEFAULT_FREQUENCY
        });

        //save frequency states
        localStorage.setItem("frequencies", JSON.stringify(frequencies));
    }
}

function weightedRandom() {
    //sums all weights
    var sumWeights = 0;
    Object.keys(dict).forEach(key => {
        sumWeights += frequencies[key]
    });

    //Returns number between 1 and sum of all weights
    var r = Math.floor(Math.random() * sumWeights) + 1;

    //iterate through and subtract each weight from the sum until 0 is reached and then return the element with the weight that was last subtracted
    temp = Object.keys(dict)
    for (let i = 0; i < temp.length; i++) {
        r -= frequencies[temp[i]];
        if (r <= 0) {
            return temp[i]
        }
    }
    return 0;
}

function increaseFrequency() {
    var current = history.getQueue()[(history.getLength() - 1) - index];
    if (frequencies[current] < DEFAULT_FREQUENCY * 3) {
        frequencies[current] += 1;
        frequency.innerHTML = frequencies[current];

        //save frequency states
        localStorage.setItem("frequencies", JSON.stringify(frequencies));
    }
}

function decreaseFrequency() {
    var current = history.getQueue()[(history.getLength() - 1) - index];
    if (frequencies[current] > 0) {
        frequencies[current] -= 1;
        frequency.innerHTML = frequencies[current];

        //save frequency states
        localStorage.setItem("frequencies", JSON.stringify(frequencies));
    }
}

function newWord(id = -1) {
    //disable button to prevent spam
    wordButton.disabled = true;

    //if a parameter is passed then use it, else use random values
    if (id == -1) {
        id = weightedRandom();
    }

    //Hide forward button due to index being 0
    rightButton.classList.add("hidden");

    //save word in history queue
    if (history.enqueue(id) == 1) {
        //if word is in full history remove word from full history list
        for (let index = 0; index < fullHistory.childElementCount; index++) {
            if (fullHistory.childNodes[index].getAttribute('data-id') == id) {
                fullHistory.childNodes[index].parentNode.removeChild(fullHistory.childNodes[index]);
            }
        }
        //exit out of modal
        document.querySelector("#history-modal").checked = false;
    }
    //if history queue exceeds history limit then cut off the oldest word
    if (history.getLength() > HISTORY_LIMIT) {
        history.dequeue();

        //fade out last element
        $("#recent-" + (history.getLength() - 1)).fadeTo(SIDEBAR_ANIMATION_SPEED, 0, function () {
            this.style.opacity = "1";
        });
    }

    //show back button if there is more than current word in history
    if (history.getLength() > 1) {
        leftButton.classList.remove("hidden");
    }

    //remove highlight while transitioning
    if (document.querySelectorAll(".current").length > 0) {
        document.querySelectorAll(".current")[0].classList.remove("current");
    }

    //fade new word in
    $("#recent-new").toggle();
    document.querySelector("#recent-new").style.opacity = "0";
    document.querySelector("#recent-new").innerHTML = idLookUp(id).Word;
    $("#recent-new").fadeTo(SIDEBAR_ANIMATION_SPEED, 1, function () {
        $("#recent-new").toggle();
        this.style.opacity = "0";
        document.querySelector("#recent-0").innerHTML = document.querySelector("#recent-new").innerHTML;
    });

    //slide new word down
    recent_0.classList.remove("top-border");
    recent_0.style.paddingTop = "2.4px";
    $("#recent-new").animate({
        top: "+=" + HISTORY_WIDTH
    }, {
            duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                this.style.top = "214px";
                recent_0.classList.add("top-border");
                recent_0.style.paddingTop = "0px";
                updateHistory();
            }
        });

    //slide each shown element down after new word is inserted
    for (var w = 0; w < history.getLength(); w++) {
        $("#recent-" + w).animate({
            top: "+=" + HISTORY_WIDTH
        }, {
                duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                    this.style.top = "0";
                }
            });
    }

    if (!started) {
        //slide word content down
        $(".move").animate({
            top: "+=" + FLASHCARD_MOVE_DISTANCE
        }, {
                duration: 0, queue: false, complete: function () {
                    //move content to top of screen
                    this.style.top = -FLASHCARD_MOVE_DISTANCE + "px";

                    //change content when off screen
                    changeContent(id);

                    //slide word into focus from top
                    $(".move").animate({
                        top: "0"
                    }, {
                            duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                                index = 0;
                                updateHighlight();
                                wordButton.disabled = false;
                                started = true;
                            }
                        });
                }
            });
    }
    else {
        //slide word content down
        $(".move").animate({
            top: "+=" + FLASHCARD_MOVE_DISTANCE
        }, {
                duration: SIDEBAR_ANIMATION_SPEED / 2, queue: false, complete: function () {
                    //move content to top of screen
                    this.style.top = -FLASHCARD_MOVE_DISTANCE + "px";

                    //change content when off screen
                    changeContent(id);

                    //slide word into focus from top
                    $(".move").animate({
                        top: "0"
                    }, {
                            duration: SIDEBAR_ANIMATION_SPEED / 2, queue: false, complete: function () {
                                index = 0;
                                updateHighlight();
                                wordButton.disabled = false;
                            }
                        });
                }
            });
    }
}

function backHistory() {
    changeWord(index + 1);
}

function forwardHistory() {
    changeWord(index - 1);
}

//Change word displayed in history
function changeWord(x) {
    //negative value means back in history(right), positive value means forward in history(left)
    var direction = index - x;

    index = x;

    //show/hide forward and back buttons accordingly
    if (index == 0) {
        rightButton.classList.add("hidden");
    }
    else {
        rightButton.classList.remove("hidden");
    }

    if (index >= history.getLength() - 1) {
        leftButton.classList.add("hidden");
    }
    else {
        leftButton.classList.remove("hidden");
    }

    //remove highlight while transitioning
    if (document.querySelectorAll(".current").length > 0) {
        document.querySelectorAll(".current")[0].classList.remove("current");
    }

    //convert index into id
    var id = history.getQueue()[(history.getLength() - 1) - x];

    //transition and change cases
    if (direction < 0) {
        //slide word content right
        $(".move").animate({
            left: "+=" + FLASHCARD_MOVE_DISTANCE
        }, {
                duration: WORD_TRANSITION_SPEED, queue: false, complete: function () {
                    //move content to left of screen
                    this.style.left = -FLASHCARD_MOVE_DISTANCE + "px";

                    //change content when off screen
                    changeContent(id);

                    //slide word into focus from left
                    $(".move").animate({
                        left: "0"
                    }, {
                            duration: WORD_TRANSITION_SPEED, queue: false, complete: function () {
                                updateHighlight();
                            }
                        });
                }
            });
    }
    else if (direction > 0) {
        //slide word content left
        $(".move").animate({
            left: "-=" + FLASHCARD_MOVE_DISTANCE
        }, {
                duration: WORD_TRANSITION_SPEED, queue: false, complete: function () {
                    //move content to right of screen
                    this.style.left = FLASHCARD_MOVE_DISTANCE + "px";

                    //change content when off screen
                    changeContent(id);

                    //slide word into focus from right
                    $(".move").animate({
                        left: "0"
                    }, {
                            duration: WORD_TRANSITION_SPEED, queue: false, complete: function () {
                                updateHighlight();
                            }
                        });
                }
            });
    }
    else {
        updateHighlight();
    }
}

//change word display content
function changeContent(id) {
    word.innerHTML = dict[id].Word;
    pronunciation.innerHTML = "(" + dict[id].Pronunciation + ")";
    partOfSpeech.innerHTML = partOfSpeechTranslate(dict[id].PartOfSpeech);
    definition.innerHTML = dict[id].Definition;
    frequency.innerHTML = frequencies[id];
}

//changes highlight to current word
function updateHighlight(x = index) {
    //remove highlight
    if (document.querySelectorAll(".current").length > 0) {
        document.querySelectorAll(".current")[0].classList.remove("current");
    }

    //highlight current word
    switch (x) {
        case 0:
            recent_0.classList.add("current");
            break;
        case 1:
            recent_1.classList.add("current");
            break;
        case 2:
            recent_2.classList.add("current");
            break;
        case 3:
            recent_3.classList.add("current");
            break;
        case 4:
            recent_4.classList.add("current");
            break;
        case 5:
            recent_5.classList.add("current");
            break;
        case 6:
            recent_6.classList.add("current");
            break;
        case 7:
            recent_7.classList.add("current");
            break;
        case 8:
            recent_8.classList.add("current");
            break;
        case 9:
            recent_9.classList.add("current");
            break;
    }
}

//updates history
function updateHistory() {
    //update recent history words
    if (history.getLength() > 0) {
        recent_0.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 0]).Word;
    }
    if (history.getLength() > 1) {
        recent_1.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 1]).Word;
    }
    if (history.getLength() > 2) {
        recent_2.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 2]).Word;
    }
    if (history.getLength() > 3) {
        recent_3.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 3]).Word;
    }
    if (history.getLength() > 4) {
        recent_4.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 4]).Word;
    }
    if (history.getLength() > 5) {
        recent_5.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 5]).Word;
    }
    if (history.getLength() > 6) {
        recent_6.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 6]).Word;
    }
    if (history.getLength() > 7) {
        recent_7.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 7]).Word;
    }
    if (history.getLength() > 8) {
        recent_8.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 8]).Word;
    }
    if (history.getLength() > 9) {
        recent_9.innerHTML = idLookUp(history.getQueue()[(history.getLength() - 1) - 9]).Word;
    }

    //show recent history list elements as they are needed
    if (recent_0.classList.contains("hidden") && history.getLength() == 1) {
        recent_0.classList.remove("hidden");
    }
    if (recent_1.classList.contains("hidden") && history.getLength() == 2) {
        recent_1.classList.remove("hidden");
    }
    if (recent_2.classList.contains("hidden") && history.getLength() == 3) {
        recent_2.classList.remove("hidden");
    }
    if (recent_3.classList.contains("hidden") && history.getLength() == 4) {
        recent_3.classList.remove("hidden");
    }
    if (recent_4.classList.contains("hidden") && history.getLength() == 5) {
        recent_4.classList.remove("hidden");
    }
    if (recent_5.classList.contains("hidden") && history.getLength() == 6) {
        recent_5.classList.remove("hidden");
    }
    if (recent_6.classList.contains("hidden") && history.getLength() == 7) {
        recent_6.classList.remove("hidden");
    }
    if (recent_7.classList.contains("hidden") && history.getLength() == 8) {
        recent_7.classList.remove("hidden");
    }
    if (recent_8.classList.contains("hidden") && history.getLength() == 9) {
        recent_8.classList.remove("hidden");
    }
    if (recent_9.classList.contains("hidden") && history.getLength() == 10) {
        recent_9.classList.remove("hidden");
    }

    //remove no history msg if there is history
    if (!history.isEmpty()) {
        document.querySelector("#history-msg").classList.add("hidden");
    }

    //update full history list modal
    var hist = history.getHistory();
    var num = fullHistory.childElementCount;
    for (var i = num; i < hist.length; i++) {
        var innerLabel = document.createElement("label");
        innerLabel.innerHTML = idLookUp(hist[i]).Word;
        innerLabel.setAttribute('data-id', hist[i]);
        innerLabel.addEventListener('click', function () {
            changeWordById(this.getAttribute('data-id'));
        });
        innerLabel.htmlFor = 'history-modal';

        var item = document.createElement("li");
        item.setAttribute('data-id', hist[i]);
        item.appendChild(innerLabel);
        fullHistory.insertAdjacentElement('afterbegin', item);
    }
}

//changes displayed word to new word with Id: {id}
function changeWordById(id) {
    id = Number(id);

    //check to see if this word is already in recent history
    var exists = false;
    for (var n = 0; n < history.getLength(); n++) {
        if (history.getQueue()[n] == id) {
            exists = true;
            changeWord((history.getLength() - 1) - n);
        }
    }

    //if this word is not in recent history
    if (!exists) {
        //set the selected word to be the new word
        newWord(id);
    }
}

//return name of word for id
function idLookUp(id) {
    if(dict[id] != null){
        return dict[id]
    }
    return "id not in dictionary";
}

//formats part of speech values from JSON into a more easily legible format
function partOfSpeechTranslate(letters) {
    switch (letters) {
        case "v":
            return "verb";
            break;
        case "n":
            return "noun";
            break;
        case "adj":
            return "adjective";
            break;
        case "adv":
            return "adverb";
            break;
        case "prep":
            return "preposition";
            break;
        case "sfx":
            return "suffix";
            break;
        case "pfx":
            return "prefix";
            break;
        case "int":
            return "interjection";
            break;
        case "brev":
            return "abbreviation";
            break;
        default:
            return letters;
    }
}

//autocompleting searchbar
function autocomplete(inp) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        Object.keys(dict).forEach(key => {
            /*check if the item starts with the same letters as the text field value:*/
            if (dict[key].Word.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + dict[key].Word.substr(0, val.length) + "</strong>";
                b.innerHTML += dict[key].Word.substr(val.length);

                //display the part of speech after the word
                b.innerHTML += (" (" + dict[key].PartOfSpeech + ")");

                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + dict[key].Word + "'>";

                //create a data attribute to hold the index of the word so it can be referenced later when selected
                b.setAttribute('data-id', key);

                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    //clear the input field
                    inp.value = "";

                    changeWordById(this.getAttribute('data-id'));

                    //if this is the first word then initialize the content screen
                    if (!started) {
                        started = true;
                        initialize();
                    }

                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        })
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}