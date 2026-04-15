
import { Application } from "https://esm.sh/@splinetool/runtime";

const canvas = document.getElementById('canvas3d');

const spline = new Application(canvas);
spline.load("https://draft.spline.design/2dqEETH3l8dNrvfS/scene.splinecode").then(() => {
  console.log(spline.getAllObjects())
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const start = -14.11
const end = -66.11



const getMS = (time) => {
    const times = time.split(":", 3).map(Number)
    let seconds = 0;
    seconds += times[0] * 60 * 60;
    seconds += times[1] * 60;
    seconds += times[2];
    seconds *= 1000;


    return seconds;
}

const MS_ToF = (ms) => {
    let s = ms / 1000;
    let hours = Math.floor(s / 3600);
    let minutes = Math.floor((s % 3600) / 60)
    let seconds = Math.floor(s % 60)

    return ([hours, minutes, seconds].map(String).map(s => s.padStart(2, '0')).join(":"))
}

const Timer = (ms, signal) => {
    // start time is this exact time
    const startTime = performance.now();
    // gets the document element
    const TimeView = document.getElementById("TimeView")

    // returns a new promise
    return new Promise ((resolve, reject) => {
        // if timer is stopped
        if (signal?.aborted) {
            return reject({message : "Something went wrong", time : 0})
        }

        let elapsedTime = 0;
        // update time every second
        TimeView.innerText = MS_ToF(Math.floor(ms - elapsedTime))
        const updater = setInterval(() => {
            elapsedTime += 1000;
            TimeView.innerText = MS_ToF(Math.floor(ms - elapsedTime))
        }, 1000)

        //start to empty bottle
        emptyBottle("liquid" ,end, start, ms)

        //when time is done, time is completed
        const timer = setTimeout(() => {
            clearInterval(updater)
            resolve({message : "Time completed", time : ms})
        }, ms)

        // if timer is stopoped, stop countdown and updated
        signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            clearInterval(updater)
            const endTime = performance.now()
            reject({message: "Timer stopped early!", time : Math.floor(endTime - startTime)}, {once : true})
        })

    })
}

const startTimer = (time) => {
    // turn time to ms
    const ms = getMS(time);

    // controller to abort timer
    const controller = new AbortController();

    // promise based off the timer
    const prom = Timer(ms, controller.signal)
    return {controller: controller, promise : prom}
}


document.getElementById("testButton").addEventListener("click", async () => {
    
    spline.setVariable('liquid', start)
    spline.setVariable('start', 'True');
    await sleep(2000);
    // set time to the input
    const time = document.getElementById("timeInput").value
    console.log(time)
    let timer = startTimer(time)
    const abort = document.getElementById("abortButton")

    abort.addEventListener("click", () => {
        timer.controller.abort()
    }, {once : true})

    timer.promise.then(resolve => timerDone(resolve.message)).catch((err) => {
        console.log(err.message)
        console.log ("Elapsed time: " + MS_ToF(err.time))
    }).finally(() => {

    })
})

const emptyBottle = (variable, final, intial, ms) => {
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

const timerDone = async (message) => {
    console.log(message)
    await sleep(1000);
    spline.setVariable('start', 'False');
}