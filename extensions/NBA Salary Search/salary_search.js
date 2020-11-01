// globals
let fullDom
let searchName

// send ajax request on load
document.addEventListener("DOMContentLoaded", function(){ getAjaxObject(); })

function getAjaxObject() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.basketball-reference.com/contracts/players.html", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            
            let resp = xhr.responseText;
            resp = resp.trim();
            
            const parser = new DOMParser();
            fullDom = parser.parseFromString(resp, 'text/html');
            fullDom = fullDom.querySelector('table#player-contracts'); // reduce DOM
			
            // build datalist on load
            buildDatalist(fullDom);
            }
        }
    xhr.send();
}

// build player datalist
function buildDatalist(fullDom) {
    let playerDatalist = document.getElementById('playerDatalist'); // from document
    let tableDiv = fullDom.querySelector('table#player-contracts tbody'); // from AJAX object; HTMLTableElement
    
    for (let i = 0, row; row = tableDiv.rows[i]; i++) {
        // validate we are on a player node
        // td attribute data-stat="player"
        if (row.cells[1].attributes["data-stat"].value != "player") { 
            continue; 
        }

        // get player name string
        let playerName = tableDiv.rows[i].cells[1].firstChild.text // <a> node; no simple query selector
        let option = document.createElement('option');
        option.setAttribute('value', playerName);
        playerDatalist.appendChild(option);
    }
}

// submit button
let submit = document.getElementById('submit');
submit.onclick = function() {
    
    // set serach string. not necessarily from the datalist.
    searchName = document.getElementById('searchText').value;

    // loop for players matching a given string, return annual salaries
    parseFullDom(fullDom, searchName);
}

// submit with Enter
let searchText = document.getElementById('searchText');
searchText.addEventListener("keyup", function(event) {
	if (event.key === "Enter") {
		document.getElementById('submit').click();
		document.getElementById('submit').focus();
	}
})

function parseFullDom(fullDom, searchName) {
    let tableHead = fullDom.querySelector('table#player-contracts thead'); // HTMLTableSelectionElement
    let tableDiv = fullDom.querySelector('table#player-contracts tbody'); // HTMLTableElement

    let leagueYears = getHeaderYears(tableHead);
    let annualSalaries = new Array();
    let optionsData = new Array();
    
    for (let i = 0, row; row = tableDiv.rows[i]; i++) {
        // validate we are on a player node
        // td attribute data-stat="player"
        if (row.cells[1].attributes["data-stat"].value != "player") { 
            continue; 
        }

        // get player name string
        let playerName = tableDiv.rows[i].cells[1].firstChild.text // <a> node     
        
        searchName = searchName.toUpperCase();
        if (playerName) {playerName = playerName.toUpperCase();}
        
        if (playerName == searchName) {
            annualSalaries = getSalaries(tableDiv.rows[i], optionsData);
            break;
        }
    }
    buildTable(searchName, leagueYears, annualSalaries, optionsData);
}

function buildTable(searchName, leagueYears, annualSalaries, optionsData) {
    // reference: https://www.valentinog.com/blog/html-table/
    
    let table = document.getElementById('tableDom');
    let optionsNote = document.getElementById('options-note');
    
    // remove table if one exists
    if (table.childElementCount > 0) {
        table.removeChild(table.firstElementChild);
    }
    
    // create new thead
    let th = table.createTHead();
    
    // build rows
    let nameRow = th.insertRow();
    var leagueYearRow = th.insertRow();
    var annualSalariesRow = th.insertRow();
    
    // player name header
    var thName = document.createElement('th');
    let text = document.createTextNode(searchName);
    thName.appendChild(text);
    nameRow.appendChild(thName);
    
    annualSalaries.forEach(annualSalariesData);
    function annualSalariesData(item, index) {
        // only print cells and headers for non-null years    
        if (item) {
            // league year headers
            let th = document.createElement('th');
            let thText = document.createTextNode(leagueYears[index]);
            th.appendChild(thText);
            
            // account for player-options and team-options
            if (optionsData[index].includes("salary-pl")) {
                th.className = 'salary-pl'; // asterisk added with css
                let optionsText = document.createTextNode('*player option');
                if (optionsNote.firstChild) {optionsNote.removeChild(optionsNote.firstChild);}
                optionsNote.appendChild(optionsText);
                optionsNote.style.display = 'inline';
            }
            else if (optionsData[index].includes("salary-tm")) {
                th.className = 'salary-tm'; // asterisk added with css
                let optionsText = document.createTextNode('*team option');
                if (optionsNote.firstChild) {optionsNote.removeChild(optionsNote.firstChild);}
                optionsNote.appendChild(optionsText);
                optionsNote.style.display = 'inline';
            }
            else if (optionsData[index].includes("salary-et")) {
                th.className = 'salary-et'; // asterisk added with css
                let optionsText = document.createTextNode('*early termination option');
                if (optionsNote.firstChild) {optionsNote.removeChild(optionsNote.firstChild);}
                optionsNote.appendChild(optionsText);
                optionsNote.style.display = 'inline';
            }
            else {
                optionsNote.style.display = 'none';    
            }
            
            // leage year header row
            leagueYearRow.appendChild(th);
            thName.setAttribute('colspan', index+1);
            
            // annual salary cells
            let td = document.createElement('td');
            let tdText = document.createTextNode(item);
            td.appendChild(tdText);
            annualSalariesRow.appendChild(td);
        }
    }
    // error handling
    if (annualSalaries.length == 0) {
        let td = document.createElement('td');
        td.setAttribute('id',"nodata");
        let tdText = document.createTextNode("(no data)")
        td.appendChild(tdText);
        annualSalariesRow.appendChild(td);
    }
    
    return table 
}

function getSalaries(tr, optionsData) {
    let salaryArray = new Array(); 
    
    let td = tr.firstElementChild;
    
    // use regular expression to match y1
    let pattern = /[y]{1}\d{1}/
    
    // loop through the td siblings and get salaries for the six league years
    for (let i = 0; i < tr.childElementCount; i++) {
        td = td.nextElementSibling;
        if (td == null) {continue;}
        if (pattern.test(td.attributes['data-stat'].value)) {
                optionsData.push(td.className); // the td class indicates player or team options
                salaryArray.push(td.textContent);
            }    
    }
    
    return salaryArray
}

function getHeaderYears(tableHead) {
    // HTMLTableSelectionElement
    
    let years = new Array();
    
    let tr = tableHead.rows[1] // get second row of two-row header
    
    // use regular expression to match y1
    let pattern = /[y]{1}\d{1}/
            
    // loop through the tr children and look for the six league years
    for (let i = 0; i < tr.childElementCount; i++) {
        let th = tr.children[i];
        if (th == null) {continue;}
        // check the data-stat of the child element
        if (pattern.test(th.attributes['data-stat'].value)) {
                years.push(th.textContent);
            }    
    }
    
    return years
}