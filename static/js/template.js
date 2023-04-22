
var openBtn = document.getElementById('open');
openBtn.addEventListener('click', function () {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function (e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function () {
            var contents = reader.result;
            document.getElementById('text').value = contents;
        }
        reader.readAsText(file);
    }
    input.click();
});

var saveBtn = document.getElementById('download');
saveBtn.addEventListener('click', function () {
    var content = document.getElementById('summary').value,
        blob = new Blob([content], { type: 'text/plain' });

    // var writer = new FileWriter();

    // writer.onwriteend = function () {
    //     console.log("Text saved to file");
    // }

    // writer.onerror = function (e) {
    //     console.log("Error saving text to file:", e);
    // }

    // writer.write(blob, "result.txt");

    saveAs(blob, "result.txt");
});

var summarizeBtn = document.getElementById('run');
var run = 0;
var intervalId = 0;

const progressBarContainer = document.querySelector('.progress-bar__container');
const progressBar = document.querySelector('.progress-bar');
const progressBarText = document.querySelector('.progress-bar__text');

const progressBarStates = [];

let progress = 0, total = 0;


summarizeBtn.onclick = function () {
    var data = {
        summarization: document.getElementById('text').value
    };

    document.getElementById('summary').value = "";

    $.ajax({
        type: "POST",
        url: "/summarize",
        //contentType: "application/json",
        data: data,
        success: function (result) {
            document.getElementById('summary').value = result.summary;
            console.log('Success');
        },
        error: function (xhr, status, error) {
            // Handle errors here
            console.log('Error:', error);
        }
    })


    fetch('/progress_state')
        .then(response => response.json())
        .then(data => {
            progress = data.progress;
            total = data.total;
            for (var i = 0; i <= total; i++) {
                progressBarStates[i] = Math.floor(100 * i) / total;
            }

            progressBarContainer.style.boxShadow = '0 0 5px #e76f51';
            gsap.to(progressBar, { x: `${(progress * 1.0 / total) * 100}%`, duration: 0, backgroundColor: '#e76f51' });
        });

    intervalId = setInterval(updateProgress, 3000);

    run = 1
}

function updateProgress() {

    if (run == 1) {
        fetch('/progress_state')
            .then(response => response.json())
            .then(data => {
                progress = data.progress;
                console.log(progress);
                total = data.total;

                // Update the progress bar using GSAP animation library
                gsap.to(progressBar, { x: `${(progress * 1.0 / total) * 100}%`, duration: 1 });
                // If the progress is complete, show a completion message
                if (progress == total) {
                    progressBarText.textContent = 'Summarization Completed!';
                    progressBarContainer.style.boxShadow = '0 0 5px #4895ef';
                    gsap.to(progressBar, { backgroundColor: '#4895ef', duration: 1 });
                    run = 0;
                    clearInterval(intervalId);
                }
            });
    }
}
