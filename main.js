//Spline, base varibales, and helper functions set up ---------------------------------------------------------//

// Spline set up
import { Application } from "https://esm.sh/@splinetool/runtime";

//document elements
const canvas = document.getElementById('canvas3d');
const dialog = document.getElementById('dialogBox');
const startButton = document.getElementById('startButton');
const XButtons = document.querySelectorAll(".X");
const TimeView = document.getElementById("TimeView");
let abort = document.getElementById("abortButton");
let pause = document.getElementById("pauseButton");
let active = false
let timeLeft;
let totalTime = 0;
InitDoc()

const spline = new Application(canvas);
spline.load("https://draft.spline.design/2dqEETH3l8dNrvfS/scene.splinecode").then(() => {

});

//variable and basic function set up
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const start = -14.11
const end = -66.11

// turn formated layout to ms
const getMS = (time) => {
    const times = [time.slice(0,1), time.slice(1, 3), time.slice(3)].map(Number)
    let seconds = 0;
    seconds += times[0] * 60 * 60;
    seconds += times[1] * 60;
    seconds += times[2];
    seconds *= 1000;

    return seconds;
}
//turn ms to layout
const MS_ToF = (ms, colon = true) => {
    let s = ms / 1000;
    let hours = Math.floor(s / 3600);
    let minutes = Math.floor((s % 3600) / 60)
    let seconds = Math.floor(s % 60)

    return colon ? (String(hours) + ":" + [minutes, seconds].map(String).map(s => s.padStart(2, '0')).join(":")) : (String(hours) + [minutes, seconds].map(String).map(s => s.padStart(2, '0')).join(""))
}
//timer promise
const Timer = (ms, signal, startingPoint = start) => {
    // start time is this exact time
    const startTime = performance.now();

    // returns a new promise
    return new Promise ((resolve, reject) => {
        // if timer is stopped
        if (signal?.aborted) {
            return reject({message : "Something went wrong", time : 0})
        }

        let elapsedTime = 0;
        // update time every second
        TimeView.innerText = MS_ToF(Math.floor(ms - elapsedTime))
        let updater = setInterval(() => {
            totalTime += 1000;
            elapsedTime += 1000;
            TimeView.innerText = MS_ToF(Math.floor(ms - elapsedTime))
        }, 1000)

        //start to empty bottle
        emptyBottle("liquid", end, startingPoint, ms)

        //when time is done, time is completed
        const timer = setTimeout(() => {
            clearInterval(updater)
            resolve({message : "Time completed", time : ms})
        }, ms)

        // if timer is stopoped, stop countdown and updated
        signal?.addEventListener("abort", () => {
            if (signal.reason === "end") {
                clearTimeout(timer);
                clearInterval(updater)
                timerActive(false)
                spline.setVariable('start', 'False');
                let position = spline.getVariable('liquid')
                finishBottle('liquid', end, position, 2000)
                const endTime = performance.now()
                reject({message: "Timer stopped early!", time : totalTime}, {once : true})
                totalTime = 0;
            } else if (signal.reason === "pause" && active === true) {
                if (active) {
                    active = false;
                    timeLeft = Math.floor(ms - elapsedTime)
                    let endposition = spline.getVariable('liquid')
                    clearTimeout(timer)
                    clearInterval(updater)
                    spline.setVariable('start', 'False');
                    pause.innerText = "resume";
                    pause.addEventListener("click", () => {
                        if (!active) {
                            active = true;
                            pause.innerText = "pause";
                            clearAbort();
                            Begin(MS_ToF(timeLeft, false), endposition)
                        }
                    }, {once : true})
                    clearAbort();
                    abort.addEventListener("click", cancelP, {once : true})

                    function clearAbort() {
                        let newElement = abort.cloneNode(true);
                        abort.replaceWith(newElement)
                        abort = newElement;
                    }

                    function cancelP() {
                        active = false;
                        spline.setVariable('start', 'False');
                        pause.innerText = "pause";
                        clearTimeout(timer);
                        clearInterval(updater)
                        finishBottle("liquid", end, endposition, 2000)
                        reject({message: "Timer stopped when paused!", time : totalTime}, {once : true})
                        totalTime = 0;
                        timerActive(false);
                    }
                }
            }
        })

    })
}


//startsTimer
const startTimer = (time, startPos) => {
    // turn time to ms
    const ms = getMS(time);


    // controller to abort timer
    const controller = new AbortController();

    // promise based off the timer
    const prom = Timer(ms, controller.signal, startPos)
    return {controller: controller, promise : prom}
}

//-------------------------------------------------------------------------------------------------------------//

//Timer functions -------------------------------------------------------------------------------------------------------------//

const Begin = async (time, startPosition = start) => {
    

    timerActive(true)
    TimeView.innerText = MS_ToF(getMS(time));
    spline.setVariable('liquid', startPosition)
    spline.setVariable('start', 'True');
    await sleep(2000);
    // set time to the input
    let timer = startTimer(time, startPosition)

    abort.addEventListener("click", () => {
        if (active) {
            timer.controller.abort("end")
        }
    }, {once : true})
    let newElement = pause.cloneNode(true);
    pause.replaceWith(newElement)
    pause = newElement;
    pause.addEventListener("click", () => {
        timer.controller.abort("pause")
    }, {once : true})


    timer.promise.then(resolve => timerDone(resolve.message)).catch((err) => {
        console.log(err.message)
        console.log ("Elapsed time: " + MS_ToF(err.time))
    }).finally(() => {

    })
}

//empties spline bottle
const emptyBottle = (variable, final, intial, ms) => {
    let startTime = null;

    function animate(time) {
        if (active) {
            if (!startTime) startTime = time
            const elasped = time - startTime;
            let progress = Math.min(elasped / ms, 1);

            const current = intial + (final - intial) * progress;

            spline.setVariables({ [variable] : current})

            if (progress < 1 && active) {
                requestAnimationFrame(animate);
            }
        }
    }

    if (active) {
        requestAnimationFrame(animate);
    }
}

//finish bottle when timer stopped early
const finishBottle = (variable, final, intial, ms) => {
    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time
        const elasped = time - startTime;
        let progress = Math.min(elasped / ms, 1);

        const current = intial + (final - intial) * progress;

        spline.setVariables({ [variable] : current})

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

        requestAnimationFrame(animate);
}
//when the timer is done
const timerDone = async (message) => {
    await sleep(1000);
    spline.setVariable('start', 'False');
    timerActive(false);
    
}


//Timer UI functions ----

//show timer dialog when started
startButton.addEventListener("click", () => {
    dialog.showModal();
})

//update UI when timer is active
function timerActive(on) {
    active = on;
    if (on) {
        document.querySelectorAll('.inactive').forEach(button => {
            button.style.display = "none";
        })
        document.querySelectorAll('.active').forEach(button => {
            button.style.display = "block";
        })
    } else {
        document.querySelectorAll('.inactive').forEach(button => {
            button.style.display = "block";
        })
        document.querySelectorAll('.active').forEach(button => {
            button.style.display = "none";
        })

        TimeView.innerText = "No Timer set"
    }
}

//-----------------------

//-----------------------------------------------------------------------------------------------------------------------------//

//Init Functions ------------------------------------------------------------------------------------------------//
function InitDoc() {
    XButtons.forEach(button => {
        button.addEventListener("click", () => {
            let parent = button.parentElement
            let dialog = parent.closest(".dialogs")
            dialog.close();
        })
    })


    document.querySelectorAll('.up-arrow').forEach(arrow => {
        arrow.addEventListener("click", () => {
            let parent = arrow.parentElement;
            let OldValue = parseInt(parent.querySelector('input').value);
            let newValue = OldValue + 1;
            newValue = newValue > 9 ? 0 : newValue;
            parent.querySelector('input').value = newValue
        })
    })
    document.querySelectorAll('.down-arrow').forEach(arrow => {
        arrow.addEventListener("click", () => {
            let parent = arrow.parentElement;
            let OldValue = parseInt(parent.querySelector('input').value);
            let newValue = OldValue - 1;
            newValue = newValue < 0 ? 9 : newValue;
            parent.querySelector('input').value = newValue
        })
    })

    //when time is confirmed
    document.getElementById('confirm').addEventListener("click", () => {
        let fText = ""
        document.getElementById('dialog').querySelectorAll('input').forEach(num => {
            fText += num.value
        })

        //makes sure the user actually entered something
        if (fText != "00000") {
            Begin(fText)
            dialog.close();
        }
    })
}

//---------------------------------------------------------------------------------------------------------------//