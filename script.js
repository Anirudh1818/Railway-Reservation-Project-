// Railway Reservation System - web version
// same logic as railway.c, data is stored in localStorage

let trains = [
    { no: 12301, name: "Rajdhani Express", from: "Kolkata", to: "Delhi", fare: 2450 },
    { no: 12951, name: "Mumbai Rajdhani", from: "Mumbai", to: "Delhi", fare: 2300 },
    { no: 12011, name: "Kalka Shatabdi", from: "Delhi", to: "Kalka", fare: 850 },
    { no: 12627, name: "Karnataka Express", from: "Bangalore", to: "Delhi", fare: 1900 },
    { no: 12723, name: "Telangana Express", from: "Hyderabad", to: "Delhi", fare: 1750 }
];

let SEATS = 30;
let tickets = [];
let lastPnr = 1000;


function loadData() {
    let data = localStorage.getItem("tickets");
    if (data != null) {
        tickets = JSON.parse(data);
    }
    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].pnr > lastPnr) {
            lastPnr = tickets[i].pnr;
        }
    }
}

function saveData() {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

function showSection(id) {
    let sections = document.getElementsByClassName("section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].style.display = "none";
    }
    document.getElementById(id).style.display = "block";

    if (id == "display") {
        displayAll();
    }
}

function findTrain(no) {
    for (let i = 0; i < trains.length; i++) {
        if (trains[i].no == no) {
            return i;
        }
    }
    return -1;
}

function showTrains() {
    let rows = "";
    for (let i = 0; i < trains.length; i++) {
        rows += "<tr><td>" + trains[i].no + "</td><td>" + trains[i].name + "</td><td>" + trains[i].from +
            "</td><td>" + trains[i].to + "</td><td>Rs " + trains[i].fare + "</td></tr>";
    }
    document.getElementById("trainTable").innerHTML = rows;

    // also fill the train dropdowns
    let options = "<option value=''>-- Select Train --</option>";
    for (let i = 0; i < trains.length; i++) {
        options += "<option value='" + trains[i].no + "'>" + trains[i].no + " - " + trains[i].name +
            " (" + trains[i].from + " to " + trains[i].to + ")</option>";
    }
    document.getElementById("bookTrain").innerHTML = options;
    document.getElementById("seatTrain").innerHTML = options;
}

// date input gives 2026-12-25, C program uses 25/12/2026
function formatDate(d) {
    let parts = d.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// first empty seat, -1 if train is full
function getSeat(tno, date) {
    let booked = [];
    for (let i = 0; i <= SEATS; i++) {
        booked[i] = 0;
    }
    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].trainNo == tno && tickets[i].date == date) {
            booked[tickets[i].seatNo] = 1;
        }
    }
    for (let i = 1; i <= SEATS; i++) {
        if (booked[i] == 0) {
            return i;
        }
    }
    return -1;
}

function ticketHTML(t) {
    let idx = findTrain(t.trainNo);
    let g = "Male";
    if (t.gender == "F") g = "Female";
    if (t.gender == "O") g = "Other";

    return "<div class='ticket'>" +
        "<p><b>PNR No:</b> " + t.pnr + "</p>" +
        "<p><b>Name:</b> " + t.name + "</p>" +
        "<p><b>Age/Gender:</b> " + t.age + " / " + g + "</p>" +
        "<p><b>Train:</b> " + t.trainNo + " - " + trains[idx].name + "</p>" +
        "<p><b>Route:</b> " + trains[idx].from + " to " + trains[idx].to + "</p>" +
        "<p><b>Date:</b> " + t.date + "</p>" +
        "<p><b>Seat No:</b> " + t.seatNo + "</p>" +
        "<p><b>Fare:</b> Rs " + t.fare + "</p>" +
        "</div>";
}

function bookTicket() {
    let tno = parseInt(document.getElementById("bookTrain").value);
    let d = document.getElementById("bookDate").value;
    let name = document.getElementById("pName").value.trim();
    let age = parseInt(document.getElementById("pAge").value);
    let gender = document.getElementById("pGender").value;
    let result = document.getElementById("bookResult");

    if (isNaN(tno) || d == "" || name == "" || isNaN(age)) {
        result.innerHTML = "<p class='error'>Please fill all the details!</p>";
        return;
    }
    if (age <= 0 || age > 120) {
        result.innerHTML = "<p class='error'>Invalid age!</p>";
        return;
    }

    name = name.replace(/,/g, " ");   // comma will break the txt file

    let date = formatDate(d);
    let seat = getSeat(tno, date);
    if (seat == -1) {
        result.innerHTML = "<p class='error'>Sorry, no seats left in this train on " + date + "</p>";
        return;
    }

    // fare calculation (same as C)
    let fare = trains[findTrain(tno)].fare;
    if (age < 5) {
        fare = 0;
    } else if (age < 12) {
        fare = Math.floor(fare / 2);
    } else if (age >= 60) {
        fare = fare - Math.floor(fare * 30 / 100);
    }

    lastPnr++;
    let t = {
        pnr: lastPnr,
        name: name,
        age: age,
        gender: gender,
        trainNo: tno,
        seatNo: seat,
        date: date,
        fare: fare
    };
    tickets.push(t);
    saveData();

    result.innerHTML = "<p class='success'>Ticket booked successfully!!</p>" + ticketHTML(t);

    // clear the form
    document.getElementById("pName").value = "";
    document.getElementById("pAge").value = "";
}

function cancelTicket() {
    let pnr = parseInt(document.getElementById("cancelPnr").value);
    let result = document.getElementById("cancelResult");
    let found = -1;

    if (isNaN(pnr)) {
        result.innerHTML = "<p class='error'>Please enter PNR number</p>";
        return;
    }

    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].pnr == pnr) {
            found = i;
            break;
        }
    }
    if (found == -1) {
        result.innerHTML = "<p class='error'>No ticket found with PNR " + pnr + "</p>";
        return;
    }

    if (confirm("Are you sure you want to cancel ticket of " + tickets[found].name + "?")) {
        let refund = tickets[found].fare - Math.floor(tickets[found].fare * 20 / 100);
        tickets.splice(found, 1);
        saveData();
        result.innerHTML = "<p class='success'>Ticket cancelled. Refund amount: Rs " + refund + "</p>";
        document.getElementById("cancelPnr").value = "";
    } else {
        result.innerHTML = "<p class='error'>Cancellation stopped.</p>";
    }
}

function displayAll() {
    let rows = "";
    let total = 0;

    if (tickets.length == 0) {
        document.getElementById("ticketTable").innerHTML = "<tr><td colspan='8'>No reservations yet.</td></tr>";
        document.getElementById("totalText").innerHTML = "";
        return;
    }

    for (let i = 0; i < tickets.length; i++) {
        let t = tickets[i];
        rows += "<tr><td>" + t.pnr + "</td><td>" + t.name + "</td><td>" + t.age + "</td><td>" + t.gender +
            "</td><td>" + t.trainNo + "</td><td>" + t.seatNo + "</td><td>" + t.date + "</td><td>Rs " + t.fare + "</td></tr>";
        total = total + t.fare;
    }
    document.getElementById("ticketTable").innerHTML = rows;
    document.getElementById("totalText").innerHTML = "<br><b>Total tickets:</b> " + tickets.length +
        " &nbsp; | &nbsp; <b>Total amount collected:</b> Rs " + total;
}

function searchTicket() {
    let pnr = parseInt(document.getElementById("searchPnr").value);
    let result = document.getElementById("searchResult");

    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].pnr == pnr) {
            result.innerHTML = ticketHTML(tickets[i]);
            return;
        }
    }
    result.innerHTML = "<p class='error'>No ticket found with this PNR!</p>";
}

function checkSeats() {
    let tno = parseInt(document.getElementById("seatTrain").value);
    let d = document.getElementById("seatDate").value;
    let result = document.getElementById("seatResult");

    if (isNaN(tno) || d == "") {
        result.innerHTML = "<p class='error'>Select train and date first</p>";
        return;
    }

    let date = formatDate(d);
    let booked = [];
    let count = 0;
    for (let i = 0; i <= SEATS; i++) {
        booked[i] = 0;
    }
    for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].trainNo == tno && tickets[i].date == date) {
            booked[tickets[i].seatNo] = 1;
            count++;
        }
    }

    let idx = findTrain(tno);
    let html = "<p class='success'><b>" + trains[idx].name + " (" + tno + ") on " + date + "</b></p>";
    html += "<p>Booked: " + count + " &nbsp; Available: " + (SEATS - count) + "</p>";
    html += "<div class='seat-grid'>";
    for (let i = 1; i <= SEATS; i++) {
        if (booked[i] == 1) {
            html += "<div class='seat booked'>" + i + "</div>";
        } else {
            html += "<div class='seat free'>" + i + "</div>";
        }
    }
    html += "</div><p class='note'>Green = available, Red = booked</p>";
    result.innerHTML = html;
}

// makes a bookings.txt in same format as the C program
function downloadFile() {
    let text = "";
    for (let i = 0; i < tickets.length; i++) {
        let t = tickets[i];
        text += t.pnr + "," + t.name + "," + t.age + "," + t.gender + "," + t.trainNo + "," +
            t.seatNo + "," + t.date + "," + t.fare + "\n";
    }
    let blob = new Blob([text], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bookings.txt";
    a.click();
}

// reads bookings.txt made by the C program
function importFile() {
    let file = document.getElementById("fileInput").files[0];
    if (!file) {
        alert("Choose the bookings.txt file first");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let lines = e.target.result.split("\n");
        tickets = [];
        lastPnr = 1000;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line == "") continue;

            let p = line.split(",");
            if (p.length != 8) continue;   // skip wrong lines

            let t = {
                pnr: parseInt(p[0]),
                name: p[1],
                age: parseInt(p[2]),
                gender: p[3],
                trainNo: parseInt(p[4]),
                seatNo: parseInt(p[5]),
                date: p[6],
                fare: parseInt(p[7])
            };
            if (findTrain(t.trainNo) == -1) continue;

            tickets.push(t);
            if (t.pnr > lastPnr) lastPnr = t.pnr;
        }
        saveData();
        displayAll();
        alert(tickets.length + " tickets loaded from file");
    };
    reader.readAsText(file);
}


// runs when page opens
loadData();
showTrains();
showSection("trains");
document.getElementById("bookDate").min = new Date().toISOString().split("T")[0];   // no past dates
