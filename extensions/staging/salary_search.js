// pqa, error handling
// css: width, styles (b54213)
// icons
// github

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
        let playerName = tableDiv.rows[i].cells[1].firstChild.text // <a> node
        let option = document.createElement('option');
        option.setAttribute('value', playerName);
        playerDatalist.appendChild(option);
    }
}

// submit button
let submit = document.getElementById('submit');
submit.onclick = function() {
    
    // validate that something from the datalist was selected
    // or, just return a decent error message if its not a player (this)
    searchName = document.getElementById('searchText').value;

    // loop for players matching a given string, return annual salaries
    parseFullDom(fullDom, searchName);
}

function parseFullDom(fullDom, searchName) {
    let tableHead = fullDom.querySelector('table#player-contracts thead'); // HTMLTableSelectionElement
    let tableDiv = fullDom.querySelector('table#player-contracts tbody'); // HTMLTableElement

    let leagueYears = getHeaderYears(tableHead);
    let annualSalaries = new Array();
    
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
        
        // if player name string matches...
        if (playerName == searchName) {
            // console.log(playerName);
            annualSalaries = getSalaries(tableDiv.rows[i]);
        }
    }
    buildTable(searchName, leagueYears, annualSalaries);
}

function buildTable(searchName, leagueYears, annualSalaries) {
    // reference: https://www.valentinog.com/blog/html-table/
    
    let table = document.getElementById('tableDom');
    
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
            leagueYearRow.appendChild(th);
            
            // annual salary cells
            let td = document.createElement('td');
            let tdText = document.createTextNode(item);
            td.appendChild(tdText);
            annualSalariesRow.appendChild(td);
            thName.setAttribute('colspan', index+1);
        }
    }
    
    return table 
}

function getSalaries(tr) {
    let salaryArray = new Array();
    
    let td = tr.firstElementChild;
    
    // use regular expression to match y1
    let pattern = /[y]{1}\d{1}/
    
    // loop through the td siblings and get salaries for the six league years
    for (let i = 0; i < tr.childElementCount; i++) {
        td = td.nextElementSibling;
        if (td == null) {continue;} // pqa
        if (pattern.test(td.attributes['data-stat'].value)) {
                salaryArray.push(td.textContent);
            }    
    }
    
    return salaryArray
}

function getHeaderYears(tableHead) {
    // HTMLTableSelectionElement
    
    let years = new Array();
    
    let tr = tableHead.rows[1] // get second row of two-row header
    let th = tr.firstElementChild;
    
    // use regular expression to match y1
    let pattern = /[y]{1}\d{1}/
        
    // check the data-stat of the first child element
    if (pattern.test(th.attributes['data-stat'].value)) {
        years.push(th.textContent);         
    }
    
    // loop through the th siblings and look for the six league years
    for (let i = 1; i < tr.childElementCount; i++) {
        th = th.nextElementSibling;
        if (th == null) {continue;} // pqa
        if (pattern.test(th.attributes['data-stat'].value)) {
                years.push(th.textContent);
            }    
    }
    
    return years
}