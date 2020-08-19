const url = 'http://localhost:3000/entry';
const HISTORY_LIMIT = 10;
const SIDEBAR_ANIMATION_SPEED = 400;
const HISTORY_WIDTH = "40";

let dict, history, index;
var table, tbody;

//initial request of dictionary data
refreshData(true, function () {

    //deleteEntries();
    populateTable();
});

//refresh dictionary data
function refreshData(temp, callback) {
    if (temp) {
        axios.get(url + "/preload/10")
            .then(function (response) {
                dict = response.data;
                //create table and wire elements
                setup();
                callback();
                axios.get(url)
                    .then(function (response) {
                        dict = response.data;
                        callback();
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                        displayError();
                    });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                displayError();
            });
    }
    else{
        axios.get(url)
        .then(function (response) {
            dict = response.data;
            callback();
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            displayError();
        });
    }
}

function deleteEntries(num) {
    //delete
    for (var i = 1; i <= num; i++) {
        //the id of the deleted word
        var deletedId = dict[dict.length - i].Id;
        console.log(idLookUp(deletedId));
        axios.delete(url, {
            data: {
                Id: deletedId,
                Word: idLookUp(deletedId).Word,
            }
        })
            .then(function (response) {
                //refresh table
                populateTable();

                //delete word from history if it is there
                history.remove(deletedId);
            })
    }
}

//create table and wire elements
function setup() {
    //wire add new word buttons and show
    $(".add-button").each(function () {
        this.addEventListener('click', addWord);
        this.classList.remove("hidden");
    });

    document.querySelector("#top-view-dictionary").classList.remove("hidden");

    //recently added word history list
    {
        recent_new = document.querySelector("#recent-new-edit");
        recent_0 = document.querySelector("#recent-0");
        recent_1 = document.querySelector("#recent-1");
        recent_1.style.paddingTop = "4.8px";
        recent_2 = document.querySelector("#recent-2");
        recent_2.style.paddingTop = "4.8px";
        recent_3 = document.querySelector("#recent-3");
        recent_3.style.paddingTop = "4.8px";
        recent_4 = document.querySelector("#recent-4");
        recent_4.style.paddingTop = "4.8px";
        recent_5 = document.querySelector("#recent-5");
        recent_5.style.paddingTop = "4.8px";
        recent_6 = document.querySelector("#recent-6");
        recent_6.style.paddingTop = "4.8px";
        recent_7 = document.querySelector("#recent-7");
        recent_7.style.paddingTop = "4.8px";
        recent_8 = document.querySelector("#recent-8");
        recent_8.style.paddingTop = "4.8px";
        recent_9 = document.querySelector("#recent-9");
        recent_9.style.paddingTop = "4.8px";
        recent_old = document.querySelector("#recent-old-edit");
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

    //create history queue for recent words
    history = new Queue();
    //index of 0 in the history queue is the most recent word
    index = 0;

    //initiate the autocomplete function on the searchbar element
    autocomplete(document.querySelector("#searchbar"));

    //delete word confirmed
    document.querySelector("#del-confirm").onclick = delWordConfirm;
    //add word confirmed
    document.querySelector("#add-confirm").onclick = addWordConfirm;
    //edit word confirmed
    document.querySelector("#edit-confirm").onclick = editWordConfirm;

    //create table for data display
    table = document.createElement("table");
    table.id = "entry";
    table.classList.add("table-hover");
    var thead = document.createElement("thead");
    var toprow = document.createElement("tr");
    var col1 = document.createElement("th");
    var col1t = document.createTextNode("Word");
    col1.appendChild(col1t);
    toprow.appendChild(col1);
    var col2 = document.createElement("th");
    var col2t = document.createTextNode("Pronunciation");
    col2.appendChild(col2t);
    toprow.appendChild(col2);
    var col3 = document.createElement("th");
    var col3t = document.createTextNode("Part of Speech");
    col3.appendChild(col3t);
    toprow.appendChild(col3);
    var col4 = document.createElement("th");
    var col4t = document.createTextNode("Definition");
    col4.appendChild(col4t);
    toprow.appendChild(col4);
    var col5 = document.createElement("th");
    var col5t = document.createTextNode("Edit");
    col5.appendChild(col5t);
    toprow.appendChild(col5);
    thead.appendChild(toprow);
    table.appendChild(thead);
    document.querySelector("#table-content").appendChild(table);
}

//refresh values from database
function populateTable() {

    //detach old table
    var oldtable = document.querySelector("tbody");
    if (oldtable != null) {
        oldtable.parentNode.removeChild(oldtable);
    }

    tbody = document.createElement("tbody");

    //for each word
    for (var i = 0; i < dict.length; i++) {
        addRow(dict[i].Id, false);
    }

    table.appendChild(tbody);
}

//addes new row to table at bottom
function addRow(id, transition) {
    var row = document.createElement("tr")
    row.id = "row_" + id;
    row.addEventListener("mouseover", removeFocus);
    var col1 = document.createElement("td");
    var col1t = document.createTextNode(idLookUp(id).Word);
    col1.appendChild(col1t);
    row.appendChild(col1);
    var col2 = document.createElement("td");
    var col2t = document.createTextNode(idLookUp(id).Pronunciation);
    col2.appendChild(col2t);
    row.appendChild(col2);
    var col3 = document.createElement("td");
    var col3t = document.createTextNode(idLookUp(id).PartOfSpeech);
    col3.appendChild(col3t);
    row.appendChild(col3);
    var col4 = document.createElement("td");
    var col4t = document.createTextNode(idLookUp(id).Definition);
    col4.appendChild(col4t);
    row.appendChild(col4);
    var col5 = document.createElement("td");
    var edit = document.createElement("label");
    edit.textContent = "Edit";
    edit.classList.add("paper-btn");
    edit.addEventListener('click', editWord);
    edit.setAttribute('data-id', id);
    edit.htmlFor = 'modal-3';
    var del = document.createElement("label");
    del.textContent = "Delete";
    del.classList.add("paper-btn");
    del.addEventListener('click', delWord);
    del.setAttribute('data-id', id);
    del.htmlFor = 'modal-2';
    col5.appendChild(edit);
    col5.appendChild(del);
    row.appendChild(col5);
    tbody.appendChild(row);

    if (transition) {
        //fade in new row
        row.style.opacity = "0";
        $("#row_" + id).fadeTo(SIDEBAR_ANIMATION_SPEED, 1);
    }
}

//update page visuals to account for error
function displayError() {
    $(".add-button").each(function () {
        this.classList.add("hidden");
    });

    var oldError = document.querySelector("#error");
    if (oldError != null) {
        oldError.parentNode.removeChild(oldError);
    }

    var error = document.createElement("h2");
    error.id = "error";
    var e = document.createTextNode("No Data Found");
    error.appendChild(e);
    document.querySelector("#table-content").appendChild(error);
    document.querySelector("#top-view-dictionary").classList.add("hidden");
}

//display modal for deletion of existing words
function delWord() {
    var id = this.getAttribute('data-id');
    //set data key for modal
    document.querySelector("#del-confirm").setAttribute('data-id', id);
    document.querySelector("#del-text").innerHTML = "Are you sure you want to delete the word '" + idLookUp(id).Word + "'?";
}

//delete word from database
function delWordConfirm() {
    //the id of the deleted word
    var deletedId = parseInt(this.getAttribute('data-id'), 10);

    axios.delete(url, {
        data: {
            Id: deletedId,
            Word: idLookUp(deletedId).Word,
        }
    })
        .then(function () {
            //remove row
            var row = document.querySelector("#row_" + deletedId);

            //fade out deleted row
            $("#row_" + deletedId).fadeTo(SIDEBAR_ANIMATION_SPEED, 0, function () {
                row.parentNode.removeChild(row);
            });

            var x = history.getQueue().indexOf(deletedId)
            x = (history.getLength() - x) - 1;

            //delete word from history if it is there
            if (history.remove(deletedId)) {

                if (history.getLength() - x > 0 && x != 9) {
                    //add top border to element directly below
                    document.querySelector("#recent-" + (x + 1)).classList.add("top-border");
                    document.querySelector("#recent-" + (x + 1)).style.paddingTop = "2.4px";

                    //move words in history below it up
                    for (var w = (x + 1); w <= history.getLength(); w++) {
                        document.querySelector("recent-")
                        $("#recent-" + w).animate({
                            top: "-=" + HISTORY_WIDTH
                        }, {
                                duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                                    this.style.top = "0";
                                    this.classList.remove("top-border");
                                    this.style.paddingTop = "4.8px";
                                }
                            });
                    }
                }

                //fade out deleted word
                $("#recent-" + x).fadeTo(SIDEBAR_ANIMATION_SPEED, 0, function () {
                    this.style.opacity = "1";
                    updateHistory();
                });

                if (history.getLength() >= HISTORY_LIMIT) {
                    //fade in new word from bottom if history > history_limit
                    $("#recent-old-edit").toggle();
                    document.querySelector("#recent-old-edit").innerHTML = idLookUp(history.getQueue()[0]).Word;
                    $("#recent-old-edit").fadeTo(SIDEBAR_ANIMATION_SPEED, 1, function () {
                        $("#recent-old-edit").toggle();
                        this.style.opacity = "0";
                    });

                    //slide old word up
                    $("#recent-old-edit").animate({
                        top: "-=" + HISTORY_WIDTH
                    }, {
                            duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                                this.style.top = "681.6px";
                                updateHistory();
                            }
                        });
                }
            }
        })
}

//display modal for adding new word
function addWord() {
    document.getElementsByName("word-add")[0].value = "Word";
    document.getElementsByName("pronunciation-add")[0].value = "Pronunciation";
    document.getElementsByName("part-of-speech-add")[0].value = "Part of Speech";
    document.getElementsByName("definition-add")[0].value = "Definition";
}

//upload new word
function addWordConfirm() {
    var newWord = document.getElementsByName("word-add")[0].value;
    axios.post(url, {
        Word: newWord,
        Pronunciation: document.getElementsByName("pronunciation-add")[0].value,
        PartOfSpeech: partOfSpeechTranslate(document.getElementsByName("part-of-speech-add")[0].value),
        Definition: document.getElementsByName("definition-add")[0].value
    })
        .then(function (response) {
            //retrieve id for newly added word
            axios.get(url + "/id")
                .then(function (response) {
                    refreshData(false, function () {
                        //get id of new word
                        var addedId = response.data[0]["LAST_INSERT_ID()"];

                        addRow(addedId, true);

                        //add word to history list with new id
                        history.enqueue(addedId);

                        //remove last element from history list
                        if (history.getLength() > HISTORY_LIMIT) {
                            history.dequeue();

                            //fade out last element
                            $("#recent-" + (history.getLength() - 1)).fadeTo(SIDEBAR_ANIMATION_SPEED, 0, function () {
                                this.style.opacity = "1";
                            });
                        }

                        //fade new word in
                        $("#recent-new-edit").toggle();
                        document.querySelector("#recent-new-edit").style.opacity = "0";
                        document.querySelector("#recent-new-edit").innerHTML = newWord;
                        $("#recent-new-edit").fadeTo(SIDEBAR_ANIMATION_SPEED, 1, function () {
                            $("#recent-new-edit").toggle();
                            this.style.opacity = "0";
                        });

                        //slide new word down
                        recent_0.classList.remove("top-border");
                        recent_0.style.paddingTop = "4.8px";
                        $("#recent-new-edit").animate({
                            top: "+=" + HISTORY_WIDTH
                        }, {
                                duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                                    this.style.top = "243.6px";
                                    recent_0.classList.add("top-border");
                                    recent_0.style.paddingTop = "2.4px";
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
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });
}

//display modal for editing existing words
function editWord() {
    var entry = idLookUp(parseInt(this.getAttribute('data-id'), 10));

    //set data key for modal
    document.querySelector("#edit-confirm").setAttribute('data-id', entry.Id);

    //edit row
    var row = document.querySelector("#row_" + entry.Id);

    //set default text in input fields to word values
    document.querySelector("#edit-text").innerHTML = "Edit the word " + row.childNodes[0].innerHTML;
    document.getElementsByName("word-edit")[0].value = row.childNodes[0].innerHTML;
    document.getElementsByName("pronunciation-edit")[0].value = row.childNodes[1].innerHTML;
    document.getElementsByName("part-of-speech-edit")[0].value = row.childNodes[2].innerHTML;
    document.getElementsByName("definition-edit")[0].value = row.childNodes[3].innerHTML;
}

//upload edited word
function editWordConfirm() {
    var entry = idLookUp(parseInt(this.getAttribute('data-id'), 10));
    var newWord = document.getElementsByName("word-edit")[0].value;
    var newPronunciation = document.getElementsByName("pronunciation-edit")[0].value;
    var newPartOfSpeech = partOfSpeechTranslate(document.getElementsByName("part-of-speech-edit")[0].value);
    var newDefinition = document.getElementsByName("definition-edit")[0].value;

    axios.patch(url, {
        newWord: newWord,
        newPronunciation: newPronunciation,
        newPartOfSpeech: newPartOfSpeech,
        newDefinition: newDefinition,
        Id: entry.Id,
        oldWord: entry.Word,
        oldPronunciation: entry.Pronunciation,
        oldPartOfSpeech: entry.PartOfSpeech,
        oldDefinition: entry.Definition,
    })
        .then(function () {
            //add word to history list with new Id
            var x = history.getQueue().indexOf(entry.Id);
            x = (history.getLength() - x) - 1;

            if (history.enqueue(entry.Id) == 2) {
                //if word is already in history
                if (x > -1) {
                    //fade word out
                    $("#recent-" + x).fadeTo(SIDEBAR_ANIMATION_SPEED, 0, function () {
                        this.style.opacity = "1";
                    });
                }
            }

            //remove last element from history list if it is full
            if (history.getLength() > HISTORY_LIMIT) {
                history.dequeue();

                //fade out last element
                $("#recent-" + (history.getLength() - 1)).fadeTo(SIDEBAR_ANIMATION_SPEED, 0, function () {
                    this.style.opacity = "1";
                });
            }

            //edit row
            var row = document.querySelector("#row_" + entry.Id);
            row.childNodes[0].innerHTML = newWord;
            row.childNodes[1].innerHTML = newPronunciation;
            row.childNodes[2].innerHTML = newPartOfSpeech;
            row.childNodes[3].innerHTML = newDefinition;

            //fade new word in
            $("#recent-new-edit").toggle();
            document.querySelector("#recent-new-edit").innerHTML = newWord;
            $("#recent-new-edit").fadeTo(SIDEBAR_ANIMATION_SPEED, 1, function () {
                $("#recent-new-edit").toggle();
                this.style.opacity = "0";
            });

            //slide new word down
            recent_0.classList.remove("top-border");
            recent_0.style.paddingTop = "4.8px";
            $("#recent-new-edit").animate({
                top: "+=" + HISTORY_WIDTH
            }, {
                    duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                        this.style.top = "243.6px";
                        recent_0.classList.add("top-border");
                        recent_0.style.paddingTop = "2.4px";
                        updateHistory();
                    }
                });

            //slide each shown element down after new word is inserted
            for (var w = 0; w < x; w++) {
                $("#recent-" + w).animate({
                    top: "+=" + HISTORY_WIDTH
                }, {
                        duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                            this.style.top = "0";
                        }
                    });
            }
            if (x == history.getLength() - 1) {
                //if old word was last in history
                $("#recent-" + x).animate({
                    top: "+=" + HISTORY_WIDTH
                }, {
                        duration: SIDEBAR_ANIMATION_SPEED, queue: false, complete: function () {
                            this.style.top = "0";
                        }
                    });
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

//Change word displayed in history
function changeWord(x) {
    //get id from history value
    var id = history.getQueue()[(history.getLength() - 1) - x];

    addFocus(id);
}

//return name of word for id
function idLookUp(id) {
    for (var i = 0; i < dict.length; i++) {
        if (dict[i].Id == id)
            return dict[i];
    }
    return "id not in dictionary";
}

//updates history
function updateHistory() {
    //update recent history words
    if (history.getLength() > 0) {
        var id = history.getQueue()[(history.getLength() - 1) - 0];
        var row = document.querySelector("#row_" + id);
        recent_0.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 1) {
        var id = history.getQueue()[(history.getLength() - 1) - 1];
        var row = document.querySelector("#row_" + id);
        recent_1.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 2) {
        var id = history.getQueue()[(history.getLength() - 1) - 2];
        var row = document.querySelector("#row_" + id);
        recent_2.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 3) {
        var id = history.getQueue()[(history.getLength() - 1) - 3];
        var row = document.querySelector("#row_" + id);
        recent_3.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 4) {
        var id = history.getQueue()[(history.getLength() - 1) - 4];
        var row = document.querySelector("#row_" + id);
        recent_4.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 5) {
        var id = history.getQueue()[(history.getLength() - 1) - 5];
        var row = document.querySelector("#row_" + id);
        recent_5.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 6) {
        var id = history.getQueue()[(history.getLength() - 1) - 6];
        var row = document.querySelector("#row_" + id);
        recent_6.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 7) {
        var id = history.getQueue()[(history.getLength() - 1) - 7];
        var row = document.querySelector("#row_" + id);
        recent_7.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 8) {
        var id = history.getQueue()[(history.getLength() - 1) - 8];
        var row = document.querySelector("#row_" + id);
        recent_8.innerHTML = row.childNodes[0].innerHTML;
    }
    if (history.getLength() > 9) {
        var id = history.getQueue()[(history.getLength() - 1) - 9];
        var row = document.querySelector("#row_" + id);
        recent_9.innerHTML = row.childNodes[0].innerHTML;
    }

    //show recent history list elements as they are needed
    recent_0.classList.add("hidden");
    if (recent_0.classList.contains("hidden") && history.getLength() >= 1) {
        recent_0.classList.remove("hidden");
    }
    recent_1.classList.add("hidden");
    if (recent_1.classList.contains("hidden") && history.getLength() >= 2) {
        recent_1.classList.remove("hidden");
    }
    recent_2.classList.add("hidden");
    if (recent_2.classList.contains("hidden") && history.getLength() >= 3) {
        recent_2.classList.remove("hidden");
    }
    recent_3.classList.add("hidden");
    if (recent_3.classList.contains("hidden") && history.getLength() >= 4) {
        recent_3.classList.remove("hidden");
    }
    recent_4.classList.add("hidden");
    if (recent_4.classList.contains("hidden") && history.getLength() >= 5) {
        recent_4.classList.remove("hidden");
    }
    recent_5.classList.add("hidden");
    if (recent_5.classList.contains("hidden") && history.getLength() >= 6) {
        recent_5.classList.remove("hidden");
    }
    recent_6.classList.add("hidden");
    if (recent_6.classList.contains("hidden") && history.getLength() >= 7) {
        recent_6.classList.remove("hidden");
    }
    recent_7.classList.add("hidden");
    if (recent_7.classList.contains("hidden") && history.getLength() >= 8) {
        recent_7.classList.remove("hidden");
    }
    recent_8.classList.add("hidden");
    if (recent_8.classList.contains("hidden") && history.getLength() >= 9) {
        recent_8.classList.remove("hidden");
    }
    recent_9.classList.add("hidden");
    if (recent_9.classList.contains("hidden") && history.getLength() >= 10) {
        recent_9.classList.remove("hidden");
    }
}

//formats part of speech input into words
function partOfSpeechTranslate(letters) {
    var lowerLetters = letters.toLowerCase();
    switch (lowerLetters) {
        case "verb":
            return "v";
            break;
        case "noun":
            return "n";
            break;
        case "adjective":
            return "adj";
            break;
        case "adverb":
            return "adv";
            break;
        case "preposition":
            return "prep";
            break;
        case "suffix":
            return "sfx";
            break;
        case "prefix":
            return "pfx";
            break;
        case "interjection":
            return "int";
            break;
        default:
            return letters;
            break;
    }
}

//scroll to word row in table and highlight
function addFocus(index) {
    //remove focus
    if (document.querySelectorAll(".focused").length > 0) {
        document.querySelectorAll(".focused")[0].classList.remove("focused");
    }

    window.location.hash = "row_" + index;
    document.querySelector("#row_" + index).classList.add("focused");

    removeHash();
}

//removes hash from url so same word can be targeted consecutive times
function removeHash() {
    window.history.replaceState(null, null, ' ');
}

//remove highlight from row
function removeFocus(x) {
    this.classList.remove("focused");
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
        for (i = 0; i < dict.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (dict[i].Word.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + dict[i].Word.substr(0, val.length) + "</strong>";
                b.innerHTML += dict[i].Word.substr(val.length);

                //display the part of speech after the word
                b.innerHTML += (" (" + dict[i].PartOfSpeech + ")");

                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + dict[i].Word + "'>";

                //create a data attribute to hold the index of the word so it can be referenced later when selected
                b.setAttribute('data-id', dict[i].Id);

                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    //clear the input field
                    inp.value = "";

                    //scroll along page to selected word
                    addFocus(this.getAttribute('data-id'));

                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
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