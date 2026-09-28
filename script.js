// =========================
// LOGIN SYSTEM
// =========================

function loginUser() {

    const cuId = document.getElementById("cuId").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    const validCuIdPattern =
        /^CU2026(0*[1-9][0-9]{0,2}|[1-2][0-9]{3}|3[0-4][0-9]{2}|350)$/;

    const validStudentPassword = "Eco@123";

    // ADMIN LOGIN DETAILS
    const validAdminId = "ADMIN2026";
    const validAdminPassword = "Admin@123";


    // =========================
    // EMPTY FIELD CHECK
    // =========================

    if (cuId === "" || password === "") {

        message.textContent =
            "Please enter ID and password.";

        message.style.color = "red";
        return;
    }


    // =========================
    // ADMIN LOGIN
    // =========================

    if (cuId === validAdminId &&
        password === validAdminPassword) {

        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("adminId", validAdminId);

        message.textContent =
            "✅ Admin login successful!";

        message.style.color = "green";


        setTimeout(function () {

            window.location.href =
                "admin-home.html";

        }, 500);

        return;
    }


    // =========================
    // STUDENT LOGIN
    // =========================

    if (validCuIdPattern.test(cuId) &&
        password === validStudentPassword) {

        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userRole", "student");
        localStorage.setItem("studentCuId", cuId);

        message.textContent =
            "✅ Student login successful!";

        message.style.color = "green";


        setTimeout(function () {

            window.location.href =
                "home.html";

        }, 500);

        return;
    }


    // =========================
    // INVALID LOGIN
    // =========================

    message.textContent =
        "❌ Invalid ID or password.";

    message.style.color = "red";
}


// =========================
// SHOW LOGGED-IN STUDENT
// =========================

const studentWelcome =
    document.getElementById("studentWelcome");

if (studentWelcome) {

    const cuId =
        localStorage.getItem("studentCuId");

    if (cuId) {

        studentWelcome.textContent =
            "👤 Logged in as: " + cuId;
    }
}


// =========================
// WASTE REPORT DATA
// =========================

let totalReports =
    Number(localStorage.getItem("totalReports")) || 0;

let categoryCounts =
    JSON.parse(localStorage.getItem("categoryCounts")) || {};

let plasticReports =
    Number(localStorage.getItem("plasticReports")) || 0;

let reports =
    JSON.parse(localStorage.getItem("reports")) || [];


// =========================
// DASHBOARD COUNTERS
// =========================

if (document.getElementById("totalReports")) {

    document.getElementById("totalReports").textContent =
        totalReports;
}

if (document.getElementById("plasticReports")) {

    document.getElementById("plasticReports").textContent =
        plasticReports;
}

if (document.getElementById("recycledReports")) {

    document.getElementById("recycledReports").textContent =
        categoryCounts["E-Waste"] || 0;
}


// =========================
// TODAY'S DATE
// =========================

function getToday() {

    const today = new Date();

    return today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
}


// =========================
// COMPLETE CHALLENGE FROM REPORT
// =========================

function completeChallengeFromReport(studentCuId) {

    if (!studentCuId || studentCuId === "Unknown") {
        return;
    }


    const pointsKey =
        "ecoPoints_" + studentCuId;

    const dayKey =
        "challengeDay_" + studentCuId;

    const finishedKey =
        "challengeFinished_" + studentCuId;

    const lastDateKey =
        "challengeLastDate_" + studentCuId;


    let points =
        Number(localStorage.getItem(pointsKey)) || 0;

    let currentDay =
        Number(localStorage.getItem(dayKey)) || 1;

    let challengeFinished =
        localStorage.getItem(finishedKey) === "true";

    const lastCompletedDate =
        localStorage.getItem(lastDateKey) || "";

    const today =
        getToday();


    // If challenge is already finished,
    // don't change anything.

    if (challengeFinished) {
        return;
    }


    // Prevent multiple reports from
    // completing multiple challenge days
    // on the same day.

    if (lastCompletedDate === today) {
        return;
    }


    // Save today's challenge completion.

    localStorage.setItem(
        lastDateKey,
        today
    );


    // =========================
    // DAY 1 TO DAY 6
    // =========================

    if (currentDay < 7) {

        currentDay++;

        localStorage.setItem(
            dayKey,
            currentDay
        );

        return;
    }


    // =========================
    // DAY 7 COMPLETED
    // =========================

    points += 50;

    challengeFinished = true;

    localStorage.setItem(
        pointsKey,
        points
    );

    localStorage.setItem(
        dayKey,
        7
    );

    localStorage.setItem(
        finishedKey,
        "true"
    );
}


// =========================
// SUBMIT WASTE REPORT
// =========================

function submitReport() {

    const wasteType =
        document.getElementById("wasteType").value;

    const location =
        document.getElementById("location").value;

    const description =
        document.getElementById("description").value;

    const photoInput =
        document.getElementById("wastePhoto");

    const message =
        document.getElementById("reportMessage");

    const studentCuId =
        localStorage.getItem("studentCuId") || "Unknown";


    if (wasteType === "" || location === "") {

        message.textContent =
            "Please select waste type and location.";

        message.style.color = "red";
        return;
    }


    // =========================
    // PHOTO SIZE CHECK
    // =========================

    if (photoInput && photoInput.files.length > 0) {

        const photoFile =
            photoInput.files[0];

        if (photoFile.size > 2 * 1024 * 1024) {

            message.textContent =
                "❌ Photo size should be less than 2 MB.";

            message.style.color = "red";
            return;
        }
    }


    // =========================
    // SAVE PHOTO
    // =========================

    if (photoInput && photoInput.files.length > 0) {

        const photoFile =
            photoInput.files[0];

        const reader =
            new FileReader();

        reader.onload = function () {

            saveReport(
                reader.result,
                wasteType,
                location,
                description,
                studentCuId,
                message
            );
        };

        reader.readAsDataURL(photoFile);

    } else {

        saveReport(
            "",
            wasteType,
            location,
            description,
            studentCuId,
            message
        );
    }
}


// =========================
// SAVE WASTE REPORT
// =========================

function saveReport(
    photo,
    wasteType,
    location,
    description,
    studentCuId,
    message
) {

    totalReports++;

    categoryCounts[wasteType] =
        (categoryCounts[wasteType] || 0) + 1;

    const reportDateTime =
        new Date().toLocaleString();


    reports.push({

        cuId: studentCuId,
        wasteType: wasteType,
        location: location,
        description: description,
        photo: photo,
        dateTime: reportDateTime,
        status: "Pending"
    });


    localStorage.setItem(
        "totalReports",
        totalReports
    );

    localStorage.setItem(
        "categoryCounts",
        JSON.stringify(categoryCounts)
    );

    localStorage.setItem(
        "reports",
        JSON.stringify(reports)
    );


    if (wasteType === "Plastic") {

        plasticReports++;

        localStorage.setItem(
            "plasticReports",
            plasticReports
        );
    }


    // =========================
    // COMPLETE TODAY'S CHALLENGE
    // =========================

    completeChallengeFromReport(studentCuId);


    // =========================
    // UPDATE DASHBOARD
    // =========================

    if (document.getElementById("totalReports")) {

        document.getElementById("totalReports").textContent =
            totalReports;
    }

    if (document.getElementById("plasticReports")) {

        document.getElementById("plasticReports").textContent =
            plasticReports;
    }

    if (document.getElementById("recycledReports")) {

        document.getElementById("recycledReports").textContent =
            categoryCounts["E-Waste"] || 0;
    }


    if (document.getElementById("recentReports")) {

        displayReports();
    }

    if (document.getElementById("adminReports")) {

        displayAdminReports();
    }


    message.textContent =
        "✅ Waste report submitted successfully! Today's challenge is completed.";

    message.style.color = "green";


    document.getElementById("description").value = "";

    if (document.getElementById("wastePhoto")) {

        document.getElementById("wastePhoto").value = "";
    }
}


// =========================
// DASHBOARD CATEGORY BARS
// =========================

function updateCategoryBars() {

    const max =
        Math.max(...Object.values(categoryCounts), 1);

    const plasticBar =
        document.querySelector(".plastic-bar");

    const paperBar =
        document.querySelector(".paper-bar");

    const organicBar =
        document.querySelector(".organic-bar");

    const ewasteBar =
        document.querySelector(".ewaste-bar");


    if (plasticBar) {

        plasticBar.style.width =
            ((categoryCounts["Plastic"] || 0) / max * 100) + "%";
    }

    if (paperBar) {

        paperBar.style.width =
            ((categoryCounts["Paper"] || 0) / max * 100) + "%";
    }

    if (organicBar) {

        organicBar.style.width =
            ((categoryCounts["Organic"] || 0) / max * 100) + "%";
    }

    if (ewasteBar) {

        ewasteBar.style.width =
            ((categoryCounts["E-Waste"] || 0) / max * 100) + "%";
    }
}


if (document.querySelector(".plastic-bar")) {

    updateCategoryBars();
}


// =========================
// WASTE CLASSIFIER
// =========================

function classifyWaste() {

    const item =
        document.getElementById("classifierInput").value;

    const result =
        document.getElementById("classifierResult");


    if (item === "") {

        result.textContent =
            "Your result will appear here.";

    } else if (item === "plastic") {

        result.textContent =
            "♻️ Plastic → Recyclable Bin";

    } else if (item === "paper") {

        result.textContent =
            "📄 Paper → Paper Recycling Bin";

    } else if (item === "glass") {

        result.textContent =
            "🍾 Glass → Glass Recycling Bin";

    } else if (item === "metal") {

        result.textContent =
            "🥫 Metal → Metal Recycling Bin";

    } else if (item === "ewaste") {

        result.textContent =
            "💻 E-Waste → E-Waste Collection";
    }
}


// =========================
// RECENT REPORTS
// =========================
// =========================
// RECENT REPORTS
// STUDENT SEES ONLY THEIR OWN REPORTS
// =========================

function displayReports() {

    const container =
        document.getElementById("recentReports");

    if (!container) {
        return;
    }

    container.innerHTML =
        "<h3>Recent Reports</h3>";

    // Get the currently logged-in student's CU ID
    const loggedInCuId =
        localStorage.getItem("studentCuId");

    // Show only reports belonging to this student
    const studentReports =
        reports.filter(report =>
            report.cuId === loggedInCuId
        );

    if (studentReports.length === 0) {

        container.innerHTML +=
            "<p>No reports yet.</p>";

        return;
    }

    // Show only the latest 5 reports of this student
    studentReports.slice(-5).reverse().forEach(report => {

        const item =
            document.createElement("div");

        item.className =
            "report-item";


        const title =
            document.createElement("strong");

        title.textContent =
            report.wasteType +
            " — " +
            report.location;


        const description =
            document.createElement("p");

        description.textContent =
            report.description ||
            "No description provided.";


        const student =
            document.createElement("p");

        student.textContent =
            "👤 CU ID: " +
            (report.cuId || "Unknown");


        const date =
            document.createElement("p");

        date.textContent =
            "🕒 " +
            (report.dateTime || "Unknown");


        const status =
            document.createElement("p");

        status.textContent =
            "📌 Status: " +
            (report.status || "Pending");


        item.appendChild(title);
        item.appendChild(description);
        item.appendChild(student);
        item.appendChild(date);
        item.appendChild(status);


        container.appendChild(item);
    });
}


// =========================
// ADMIN REPORTS
// =========================

function displayAdminReports() {

    const container =
        document.getElementById("adminReports");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (reports.length === 0) {

        container.innerHTML =
            "<p>No waste reports available.</p>";

        return;
    }


    reports.slice().reverse().forEach(report => {

        const reportIndex =
            reports.indexOf(report);


        const item =
            document.createElement("div");

        item.className =
            "admin-report-card";


        const title =
            document.createElement("h3");

        title.textContent =
            "♻️ " + report.wasteType;


        const student =
            document.createElement("p");

        student.textContent =
            "👤 CU ID: " +
            (report.cuId || "Unknown");


        const location =
            document.createElement("p");

        location.textContent =
            "📍 Location: " +
            report.location;


        const description =
            document.createElement("p");

        description.textContent =
            "📝 Details: " +
            (report.description ||
            "No description provided.");


        const date =
            document.createElement("p");

        date.textContent =
            "🕒 Date & Time: " +
            (report.dateTime || "Unknown");


        const statusText =
            document.createElement("p");

        statusText.textContent =
            "📌 Status: " +
            (report.status || "Pending");


        // =========================
        // SHOW PHOTO IN ADMIN
        // =========================

        if (report.photo) {

            const photoLabel =
                document.createElement("p");

            photoLabel.textContent =
                "📷 Waste Photo:";


            const photo =
                document.createElement("img");

            photo.src =
                report.photo;

            photo.alt =
                "Reported waste";

            photo.style.width =
                "100%";

            photo.style.maxWidth =
                "300px";

            photo.style.height =
                "200px";

            photo.style.objectFit =
                "cover";

            photo.style.borderRadius =
                "10px";

            photo.style.marginTop =
                "8px";

            item.appendChild(photoLabel);
            item.appendChild(photo);
        }


        const statusSelect =
            document.createElement("select");


        statusSelect.innerHTML = `
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
        `;


        statusSelect.value =
            report.status || "Pending";


        statusSelect.addEventListener(
            "change",
            function () {

                updateReportStatus(
                    reportIndex,
                    statusSelect.value,
                    statusText
                );
            }
        );


        item.appendChild(title);
        item.appendChild(student);
        item.appendChild(location);
        item.appendChild(description);
        item.appendChild(date);
        item.appendChild(statusText);
        item.appendChild(statusSelect);


        container.appendChild(item);
    });
}


// =========================
// UPDATE ADMIN REPORT STATUS
// =========================

function updateReportStatus(
    reportIndex,
    newStatus,
    statusText
) {

    if (!reports[reportIndex]) {
        return;
    }


    reports[reportIndex].status =
        newStatus;


    localStorage.setItem(
        "reports",
        JSON.stringify(reports)
    );


    statusText.textContent =
        "📌 Status: " + newStatus;


    displayReports();
}


// =========================
// SHOW REPORTS ON PAGE LOAD
// =========================

displayReports();
displayAdminReports();


// =========================
// CLEAR ALL TEST REPORTS
// =========================

function clearAllReports() {

    const confirmReset =
        confirm(
            "Are you sure you want to clear all EcoTrack test reports?"
        );

    if (!confirmReset) {
        return;
    }


    localStorage.removeItem("totalReports");
    localStorage.removeItem("categoryCounts");
    localStorage.removeItem("plasticReports");
    localStorage.removeItem("reports");


    totalReports = 0;
    categoryCounts = {};
    plasticReports = 0;
    reports = [];


    const total =
        document.getElementById("totalReports");

    const plastic =
        document.getElementById("plasticReports");

    const ewaste =
        document.getElementById("recycledReports");


    if (total) {
        total.textContent = "0";
    }

    if (plastic) {
        plastic.textContent = "0";
    }

    if (ewaste) {
        ewaste.textContent = "0";
    }


    const recent =
        document.getElementById("recentReports");

    if (recent) {

        recent.innerHTML =
            "<h3>Recent Reports</h3><p>No reports yet.</p>";
    }


    const admin =
        document.getElementById("adminReports");

    if (admin) {

        admin.innerHTML =
            "<p>No waste reports available.</p>";
    }


    if (document.querySelector(".plastic-bar")) {
        updateCategoryBars();
    }


    alert("✅ All test reports have been cleared!");
}


// =========================
// SHOW / HIDE PASSWORD
// =========================

function togglePassword() {

    const password =
        document.getElementById("password");

    const eye =
        document.querySelector(".eye-btn");


    if (password.type === "password") {

        password.type = "text";
        eye.textContent = "🙈";

    } else {

        password.type = "password";
        eye.textContent = "👁";
    }
}


// =========================
// ADMIN LOGIN
// =========================

function adminLogin() {

    const adminId =
        document.getElementById("adminId").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const message =
        document.getElementById("adminLoginMessage");

    const validAdminId = "ADMIN2026";
    const validPassword = "Admin@123";


    if (adminId === validAdminId &&
        password === validPassword) {

        message.textContent =
            "✅ Login successful!";

        message.style.color = "green";


        setTimeout(function () {

            window.location.href =
                "admin-home.html";

        }, 500);

    } else {

        message.textContent =
            "❌ Invalid Admin ID or password.";

        message.style.color = "red";
    }
}


// =========================
// SHOW / HIDE ADMIN PASSWORD
// =========================

function toggleAdminPassword() {

    const password =
        document.getElementById("adminPassword");

    const eye =
        document.querySelector(".eye-btn");


    if (password.type === "password") {

        password.type = "text";
        eye.textContent = "🙈";

    } else {

        password.type = "password";
        eye.textContent = "👁";
    }
}